const puppeteer = require('puppeteer');




//const sleepNow = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

async function AcceptImWithIndex(index, username, password){
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
try{
    
        const  [page] = await browser.pages();
        
    
        await page.authenticate({
            username: username,
            password: password
        });
    
        await page.goto('http://10.8.4.73/inframanager/Account/Authenticate/', { waitUntil: 'domcontentloaded', timeout: 120000 });
    
        await page.waitForSelector('#regionListMode > div.b-content-table__left > span:nth-child(2)');

        //await page.click('#regionListMode > div.b-content-table__left > span:nth-child(2)');
        await page.click('#regionListMode > div.b-content-table__left > span:nth-child(2)')
        
        //await sleepNow(2000);
        
        await page.waitForSelector("#regionTable > div > div.tableContainer._gridLines > div.tableData > table > tbody > tr:nth-child(1)")
       

        const element = await page.evaluate((index) => {
            const span = Array.from(document.querySelectorAll('span')).find(el => el.textContent.includes(index));
            if (span) {
                let element = span.parentElement?.parentElement;  
                let tag = element.tagName.toLowerCase();
                let id = element.id ? `#${element.id}` : '';
                let classes = element.classList.length > 0 ? `.${[...element.classList].join('.')}` : '';
        
                let selector = tag + id + classes;
                return selector;
            }
            return null;
        },index);
        await page.click(element)

        
        await page.waitForSelector("#callForm_3 > div > div.b-requestDetail-left > div.b-requestDetail-menu.clearfix > div.workflow > div")
        await page.click("#callForm_3 > div > div.b-requestDetail-left > div.b-requestDetail-menu.clearfix > div.workflow > div")
        await page.waitForSelector("#callForm_3 > div > div.b-requestDetail-left > div.b-requestDetail-menu.clearfix > div.workflow > div > div.workflowControl-part > ul > li")
        await page.click("#callForm_3 > div > div.b-requestDetail-left > div.b-requestDetail-menu.clearfix > div.workflow > div > div.workflowControl-part > ul > li")
        await page.waitForSelector("#callForm_3 > div > div.b-requestDetail-left > div.b-requestDetail-menu.clearfix > div.workflow > div > div.menuBlock > span")
        await browser.close();
    }
    catch{
        console.log("Error on AcceptImWithIndex");
       await browser.close();
    }
}

module.exports = {
    AcceptImWithIndex
}