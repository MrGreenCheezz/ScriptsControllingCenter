const Imap = require('imap');
const js = require('./JsonModule');
const PModule = require('./PuppeteerModule')
const simpleParser = require('mailparser').simpleParser;
const { parse, isBefore } = require('date-fns');


let GlobalUsername = ''
let GlobalPassword = ''
let ImUsername = ''
let ImPassword =''

let imap = new Imap({
    user: GlobalUsername,
    password: GlobalPassword,
    host: 'mail.telecom.kz',
    port: 993,
    tls: true
  });


  function openInbox(cb) {
    imap.openBox('INBOX', true, cb);
  }

  async function processMail(msg, seqno) {
    console.log('Message #%d', seqno);
    msg.on('body', function (stream, info) {
        let buffer = '';
        stream.on('data', function (chunk) {
          buffer += chunk.toString('utf8');
        });
        stream.once('end', function () {
          // Check if the subject matches the pattern
          const subject = Imap.parseHeader(buffer).subject[0];
          const pattern = /Вашей группе предложена заявка № IM-CL-(.*)/;
          const match = subject.match(pattern);
    
          if (match) {
            const nextString = match[1];
            console.log('Next string after matching fragment:', nextString);
           try{
            PModule.AcceptImWithIndex(parseInt(nextString), ImUsername, ImPassword);
           }
           catch{
            console.log("Error on AcceptImWithIndex");
           }
          }
        });
      });
  }


  function StartImap(){
   let loginData = js.PrepareLoginData();
   GlobalUsername = loginData.Imap.username;
   GlobalPassword = loginData.Imap.password;
   ImUsername = loginData.Im.username;
   ImPassword = loginData.Im.password;

   imap = new Imap({
    user: GlobalUsername,
    password: GlobalPassword,
    host: 'mail.telecom.kz',
    port: 993,
    tls: true
  });


  imap.once('ready', function () {
    openInbox(function (err, box) {
      if (err) throw err;
      imap.on('mail', (mails) => {
        if (mails < 15) {
          let b = imap.seq.fetch(box.messages.total - (mails - 1) + ':*', {
            bodies: '',
            struct: true
          });
          b.on('message', function (msg, seqno) {
            processMail(msg, seqno);
          });
          b.once('error', function (err) {
            console.log('Fetch error: ' + err);
          });
        }
      }
      )
  
  
    });
  });

  imap.once('error', function (err) {
    console.log(err);
  });
  
  imap.once('end', function () {
    console.log('Connection ended');
  });
  
  

   imap.connect();
  }
  
  
  module.exports = {
    StartImap
}


  
  //imap.connect();
  