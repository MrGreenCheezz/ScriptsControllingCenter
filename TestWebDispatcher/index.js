const express = require('express');
const app = express();
const port = 3032;

// Функция для обработки текста с параметром destination = 'im'
function processTextIM(text) {
  // Здесь можно добавить необходимую обработку текста
  console.log('Processing text for IM:', text);
  return `IM Processed Text: ${text}`;
}

function sendTelegramNotificationIm(text) {
    const token = '*';
    const chatId = '-1002227538927';
    const currentTime = new Date();
    const message = `Уведомление с IM: ${currentTime.toLocaleString()}`; // Ваше сообщение
  
  
    const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message + ' ' + text)}`;
    
    fetch(url)
      .then(response => {
        if (!response.ok) {
          console.log('Ошибка отправки уведомления в Telegram');
        }
      })
      .catch(error => {
        console.error('Ошибка:', error);
      });
  }

  function sendTelegramNotificationRm(text) {
    const token = '*';
    const chatId = '-1002242378430';
    const currentTime = new Date();
    const message = `Уведомление с Remedy: ${currentTime.toLocaleString()}`; // Ваше сообщение
  
  
    const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message + ' ' + text)}`;
    
    fetch(url)
      .then(response => {
        if (!response.ok) {
          console.log('Ошибка отправки уведомления в Telegram');
        }
      })
      .catch(error => {
        console.error('Ошибка:', error);
      });
  }

// Функция для обработки текста с параметром destination = 'rm'
function processTextRM(text) {
  // Здесь можно добавить необходимую обработку текста
  console.log('Processing text for RM:', text);
  return `RM Processed Text: ${text}`;
}

app.get('/', (req, res) => {
  const { destination, text } = req.query;

  if (!destination || !text) {
    return res.status(400).send('Both destination and text parameters are required');
  }

  let result;
  switch (destination) {
    case 'im':
      result = sendTelegramNotificationIm(text);
      break;
    case 'rm':
      result = sendTelegramNotificationRm(text);
      break;
    default:
      return res.status(400).send('Invalid destination parameter');
  }

  res.send(result);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


