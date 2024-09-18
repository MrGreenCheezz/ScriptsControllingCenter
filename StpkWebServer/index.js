const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
const port = 3038;


function sendTelegramNotification(emptyId, additionalText) {
    //Токен бота и айди чата
    const token = '*';
    const chatId = '-1002060094413';
    const currentTime = new Date();
    //Сообщение которое отправляется в телеграм
    let message = '';

    message = `Уведомление с STPK : ${currentTime.toLocaleString()}` + '   \n' + "http://stpk.telecom/pages/single_damage/" + emptyId + '   \n' + additionalText; // Ваше сообщение


    fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${message}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка отправки уведомления в Telegram');
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

async function GetDataFromPage(id){
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto("http://stpk.telecom/pages/single_damage/" + id);
    await page.waitForSelector('#username');
    await page.type('#username', '*');
    await page.type('#password', '*');
    await page.click("#id1");
    await page.waitForNetworkIdle();
    let Ztext = await page.evaluate(() => {
        let tbody = document.getElementsByTagName('tbody');
        console.log(tbody);
        let tr = tbody[1].getElementsByTagName('tr')[2];
        console.log(tr);
        let td = tr.getElementsByTagName('td')[2];
        console.log(td);
        let text = td.innerText;
        return text;
    });

    sendTelegramNotification(id, Ztext);
    await browser.close();
}
// Middleware для парсинга JSON тела запроса
app.use(bodyParser.json());
app.use(cors());

app.post('/numbers', (req, res) => {
  const numbers = req.body;

  if (Array.isArray(numbers)) {
    GetDataFromPage(numbers[0]);
    res.status(200).send('Numbers received and logged');
  } else {
    res.status(400).send('Invalid input. Expected an array of numbers.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});