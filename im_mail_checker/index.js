const Imap = require('imap');
const iconv = require('iconv-lite');
const { Pool } = require('pg');
const simpleParser = require('mailparser').simpleParser;
const notifier = require('node-notifier');
const username = 'Borozentcev.A';
const password = 'San94iki';



process.title = "imap-service"

const pool = new Pool({
  user: '****',
  host: '****',
  database: '****',
  password: '****',
  port: 5432,
});

module.exports = pool;


async function AddToDB(date, text, expireTime, num) {
  const query = `
    INSERT INTO im (date, text, expire_time, num)
    VALUES ($1, $2, $3, $4);
  `;

  try {
    const res = await pool.query(query, [date, text, expireTime, num]);
    console.log(res.rows[0]);
  } catch (err) {
    console.error('Ошибка при добавлении данных в таблицу im:', err);
  }
}

async function CheckDB(number) {
  const query = `
    SELECT * FROM im WHERE num = $1 ORDER BY date DESC LIMIT 1;
  `;

  try {
    const res = await pool.query(query, [number]);
    console.log(res.rows[0]);
    if (res.rows[0] == null) {
      return 0;
    }
    else {
      return res.rows[0].date;
    }
  } catch (err) {
    console.error('Ошибка поиска записи.', err);
  }

}


const inspect = require('util').inspect;
let myInbox = { value: null };
let imap = new Imap({
  user: username,
  password: password,
  host: 'mail.telecom.kz',
  port: 993,
  tls: true
});

function openInbox(cb) {
  imap.openBox('INBOX', true, cb);
}

async function processMail(msg, seqno) {
  console.log('Message #%d', seqno);
  let prefix = '(#' + seqno + ') ';
  msg.on('body', function (stream, info) {
    let buffer = '';
    stream.on('data', function (chunk) {
      buffer += chunk.toString('utf8');
    });
    stream.once('end', function () {
      const subject = Imap.parseHeader(buffer).subject[0];
      const pattern = /Вашей группе предложена заявка № IM-CL-(.*)/;
      const match = subject.match(pattern);

      if (match) {
        const nextString = match[1];
        console.log('Next string after matching fragment:', nextString);
        // Write text from inside the mail to console
        simpleParser(buffer, async (err, mail) => {
          const descriptionPattern = /Краткое описание:(.*)/;
          const dateExpirePattern = /время решения: (\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2})/;
          //console.log(mail.text)
          let dateNew;
          const descriptionMatch = mail.text.match(descriptionPattern);
          const dateMatch = mail.text.match(dateExpirePattern);
          //console.log(mail.text)
          if (dateMatch) {
            console.log(dateMatch[1]);
          }
          if (descriptionMatch) {
            let description = descriptionMatch[1].trim().replace("</FONT>", "");
            description = description.replace("</div>", "");
            console.log('Краткое описание:', description);

            if (new Date(dateMatch[1]) < new Date()) {
              let tmp = await CheckDB(nextString);
              if (tmp != 0) {
                DoOnNewEmail(" Заявка с номером " + nextString + " и описанием: " + description + " \n" + "http://im.telecom.kz/inframanager/SD/Table" + " просрочена\n" + "\n Повторная заявка, ранее приходила:\n " + tmp);
              }
              else {
                DoOnNewEmail(" Заявка с номером " + nextString + " и описанием: " + description + " \n" + "http://im.telecom.kz/inframanager/SD/Table" + " просрочена");
              }
            }
            else {
              if (tmp != 0) {
                DoOnNewEmail(" Заявка с номером " + nextString + " и описанием: " + description + " \n" + "http://im.telecom.kz/inframanager/SD/Table" + "\n Повторная заявка, ранее приходила: \n" + tmp);
              } else {
                DoOnNewEmail(" Заявка с номером " + nextString + " и описанием: " + description + " \n" + "http://im.telecom.kz/inframanager/SD/Table");
              }
            }
            try {
              AddToDB(new Date().toLocaleString(), description, dateMatch[1], nextString);
            }
            catch (err) {
              console.log(err);
            }
          }

        });

      }
    });
  });
}

function DoOnNewEmail(text) {
  sendTelegramNotification(text);
}

function sendTelegramNotification(text) {
  const token = '*****';
  const chatId = '*******';
  const currentTime = new Date();
  const message = `Уведомление с IM: ${currentTime.toLocaleString()}`;

  notifier.notify({
    title: 'Пришла заявка в ИМ',
    message: message
  });

  fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${message + text}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Ошибка отправки уведомления в Telegram');
      }
    })
    .catch(error => {
      console.error('Ошибка:', error);
    });
}


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
