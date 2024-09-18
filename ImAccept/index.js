const ImapModule = require('./ImapModule');


try{
    ImapModule.StartImap();
}
 catch(error){
    console.log("Cannot launch Imap module, email problems)")
 }