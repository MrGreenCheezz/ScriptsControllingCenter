const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

app.get('/run', async (req, res) => {
    const func = req.query.func;
    const elementName = req.query.elementName;
    const elementText = req.query.elementText;
    console.log(elementName)
    console.log(elementText)

    if (!func) {
        return res.status(400).send('Function name is required');
    }

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();

        await page.authenticate({
            username: 'cdn\\Borozentcev.A',
            password: 'San94iki1'
        });

        await page.goto('http://10.8.4.73/inframanager/Account/Authenticate/', { waitUntil: 'domcontentloaded', timeout: 120000 });

        await page.waitForSelector('#regionListMode > div.b-content-table__left > span:nth-child(1)');
        await page.waitForNetworkIdle();
        await page.click('#regionListMode > div.b-content-table__left > span:nth-child(2)');
        await page.waitForNetworkIdle();

        let result;
        switch (func) {
            case 'FindElementIndex':
                if (!elementName) {
                    return res.status(400).send('elementName is required for FindElementIndex');
                }
                result = await FindElementIndex(page, elementName);
                break;
            case 'FindRowsWithElement':
                if (!elementName || !elementText) {
                    return res.status(400).send('elementName and elementText are required for FindRowsWithElement');
                }
                const index = await FindElementIndex(page, elementName);
                result = await FindRowsWithElement(page, index, elementText);
                break;
            case 'GetIndex':
                    if (!elementName || !elementText) {
                        return res.status(400).send('elementName and elementText are required for FindRowsWithElementThatReady');
                    }
                    const lastindex = await FindElementIndex(page, elementName);
                    let rowIndex = await FindRowsWithElement(page, lastindex, elementText);
                    result = await FindRowSelectorWithIndex(page,rowIndex);
                    break;
            case 'GetTest':
                        if (!elementName || !elementText) {
                            return res.status(400).send('elementName and elementText are required for FindRowsWithElementThatReady');
                        }
                        let elemindex = await FindElementIndex(page, elementName);
                        let  newIndex = await FindRowsWithElement(page, elemindex, elementText);
                        let count = await FindRowsCount(page);
                        let str = '';
                        if(count > 1){
                            str = '#regionTable > div > div.tableContainer._gridLines > div.tableData > table > tbody > tr:nth-child' + '(' + (parseInt(newIndex) + 1) + ') > td:nth-child(3)';
                        }
                        else{
                            str = '#regionTable > div > div.tableContainer._gridLines > div.tableData > table > tbody > tr > td:nth-child(3)';
                        }
                        await page.click(str);
                        await page.waitForNetworkIdle();
                        let InnerElementText = await page.evaluate(() => {
                            return document.querySelector('#callForm_3 > div > div.b-requestDetail-left > div.fieldPair.b-requestDetail__title-header > div.editor.border.nowrap.im-big-header').innerText;
                          });
                          result = InnerElementText;
                          if(InnerElementText.includes('(Домены)') || InnerElementText.includes('(VPS)') || InnerElementText.includes('(PTR)')){
                            await page.click("#callForm_3 > div > div.b-requestDetail-left > div.b-requestDetail__mainParameters > div > div.horizontalContainer-rightPart > div.b-requestDetail__table > div > div:nth-child(9) > div > div.form-user-rightside > input")
                            await page.waitForSelector("#SDEditor_6 > div > div > div:nth-child(1)")
                            await page.type("#SDEditor_6 > div > div > div:nth-child(1) > input", "Ешмуханбет Жанибек Аманкелдиулы")
                            await page.waitForSelector("#e0bc1c42-4791-470b-9f8f-bdc8b7a7e96e_7");
                            await page.click("#e0bc1c42-4791-470b-9f8f-bdc8b7a7e96e_7");
                            await page.waitForNetworkIdle();
                            await page.click("body > div.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.ui-front.ui-draggable.ui-resizable.ui-dialog-buttons > div.ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix > div > button:nth-child(1)");
                            
                 
                            // #callForm_3 > div > div.b-requestDetail-left > div.b-requestDetail__mainParameters > div > div.horizontalContainer-rightPart > div.b-requestDetail__table > div > div:nth-child(9) > div > div.form-user-rightside > input
                            //#SDEditor_10 > div > div > div:nth-child(1) > input

                            // await page.type("#SDEditor_6 > div > div > div:nth-child(1) > input", "Ешмуханбет Жанибек")
                            // await page.waitForSelector("#e0bc1c42-4791-470b-9f8f-bdc8b7a7e96e_12");
                            // await page.click("#e0bc1c42-4791-470b-9f8f-bdc8b7a7e96e_12");
                            // await page.waitForSelector("#e0bc1c42-4791-470b-9f8f-bdc8b7a7e96e_7")
                            // await page.click("body > div.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.ui-front.ui-draggable.ui-resizable.ui-dialog-buttons > div.ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix > div > button:nth-child(2)")
                            
                          }
                          if(InnerElementText.includes('(Вирт. Хостинг)')){
                            await page.click("#callForm_3 > div > div.b-requestDetail-left > div.b-requestDetail__mainParameters > div > div.horizontalContainer-rightPart > div.b-requestDetail__table > div > div:nth-child(9) > div > div.form-user-rightside > input")
                            await page.waitForSelector("#SDEditor_6 > div > div > div:nth-child(1)")
                            await page.type("#SDEditor_6 > div > div > div:nth-child(1) > input", "Асанхан Бибарыс Ганиулы")
                            await page.waitForSelector("#ExecutorUserSearcher_7 > div > div > div:nth-child(5)");
                            await page.click("#ExecutorUserSearcher_7 > div > div > div:nth-child(5)");
                            await page.waitForNetworkIdle();
                            await page.click("body > div.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.ui-front.ui-draggable.ui-resizable.ui-dialog-buttons > div.ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix > div > button:nth-child(1)");
                          }
                        break;
            case 'FindRowsWithElementDone':
                if(!elementName || !elementText) {
                    return res.status(400).send('elementName and elementText are required for FindRowsWithElementDone');
                }
                await page.click('#regionListMode > div.b-content-table__left > span:nth-child(1)');
                await page.waitForNetworkIdle();
                const indexDone = await FindElementIndex(page, elementName);
                result = await FindRowsWithElement(page, indexDone, elementText);
                break;
            default:
                result = 'Unknown function';
        }

        await browser.close();
        res.send(result);
    } catch (error) {
        await browser.close();
        res.status(500).send(error.toString());
    }
    finally{
        await browser.close();
    }
});

async function FindElementIndex(page, elementName) {
    const elementIndex = await page.evaluate((nameToSearch) => {
        const regionTable = document.querySelector('#regionTable');
        if (!regionTable) return -1;

        const table = regionTable.querySelector('.table');
        if (!table) return -1;

        const thead = table.querySelector('thead');
        if (!thead) return -1;

        const tr = thead.querySelector('tr');
        if (!tr) return -1;

        const th = tr.querySelectorAll('th');
        if (!th) return -1;

        for (let i = 0; i < th.length; i++) {
            if (th[i].innerText.normalize('NFC') === nameToSearch.normalize('NFC')) {
                return i;
            }
        }
    }, elementName);
    return elementIndex;
}

async function FindRowsWithElement(page, elementIndex, elementText) {
    const rows = await page.evaluate((elementIndex, elementText) => {
        const regionTable = document.querySelector('.tableData');
        if (!regionTable) return -1;

        const table = regionTable.querySelector('.table');
        if (!table) return -1;

        const thead = table.querySelector('tbody');
        if (!thead) return -1;

        const tr = thead.querySelectorAll('tr');
        if (!tr) return -1;

        let rows = [];
        for (let i = 0; i < tr.length; i++) {
            if (tr[i].querySelectorAll('td')[elementIndex].querySelector('span').innerText.normalize('NFC') === elementText.normalize('NFC')) {
                rows.push(i);
            }
        }
        return rows;
    }, elementIndex, elementText);
    return rows;
}

async function FindRowSelectorWithIndex(page,elementindex){
    const res = await page.evaluate((elementindex)=>{
 
        const tableData = document.querySelector('.tableData');
        if(!tableData) return -1;
        const table = tableData.querySelector('.table');

        if(!table) return -1;
        const tbody = table.querySelector('tbody');

        if(!tbody) return -1;
        const tr = tbody.querySelectorAll('tr');
 
        if(!tr) return -1;

        return tr[elementindex];
    },elementindex);
    return res;
}

async function FindRowsCount(page) {
    const rows = await page.evaluate(() => {
        const regionTable = document.querySelector('.tableData');
        if (!regionTable) return -1;

        const table = regionTable.querySelector('.table');
        if (!table) return -1;

        const thead = table.querySelector('tbody');
        if (!thead) return -1;

        const tr = thead.querySelectorAll('tr');
        if (!tr) return -1;

        return tr.length;
    });
    return rows;
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
