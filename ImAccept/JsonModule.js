const fs = require('node:fs');

function PrepareLoginData() {
    if (fs.existsSync('./loginData.json')) {
        try {
           
            let file = fs.readFileSync('./loginData.json', 'utf-8');
            
            let loginData = JSON.parse(file);
            return loginData;
        } catch (err) {
            console.log('Error reading or parsing loginData.json:', err);
            return null; 
        }
    } else {
        const emptyJsonObj = {
            Im: {
                username: '',
                password: ''
            },
            Imap: {
                username: '',
                password: ''
            }
        };
        let jsonString = JSON.stringify(emptyJsonObj, null, 2); 
        try {
            
            fs.writeFileSync('./loginData.json', jsonString);
            return emptyJsonObj; 
        } catch (err) {
            console.log('Error writing loginData.json:', err);
            return null;
        }
    }
}

module.exports = {
    PrepareLoginData
};
