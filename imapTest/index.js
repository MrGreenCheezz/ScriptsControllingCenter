const Imap = require('imap');
const iconv = require('iconv-lite');
const simpleParser = require('mailparser').simpleParser;
const notifier = require('node-notifier');
const { parse } = require('date-fns');
const username = 'borozentcev.a@telecom.kz';
const password = 'San4oP00kan4o@@@';

process.title = "imap-service";

// In-memory cache для хранения истории заявок
const requestCache = new Map();

function parseDate(dateStr) {
  const parts = dateStr.split(' ');
  const dateParts = parts[0].split('.');
  const time = parts[1];
  return new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${time}`);
}

const imap = new Imap({
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
  msg.on('body', (stream, info) => {
    let buffer = '';
    stream.on('data', (chunk) => buffer += chunk.toString('utf8'));
    stream.once('end', () => {
      const subject = Imap.parseHeader(buffer).subject[0];
      const pattern = /Вашей группе предложена заявка № IM-CL-(.*)/;
      const match = subject.match(pattern);

      if (match) {
        const requestNumber = match[1];
        simpleParser(buffer, async (err, mail) => {
          const descriptionPattern = /Краткое описание:\s*([\s\S]*?)<\/FONT>\s*<P><\/P>/gm;// /Краткое описание:(.*)/;
          const dateExpirePattern = /время решения: (\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2})/;
          
          const description = mail.text.match(descriptionPattern)?.[0]
            ?.trim()
            ?.replace(/(<\/FONT>|<\/div>|<\/P>|<P>)/g, '') || 'Описание отсутствует';
          
          const expireDate = mail.text.match(dateExpirePattern)?.[1] || 'Дата не определена';
          
          // Формируем сообщение
          let message = `Новая заявка #${requestNumber}\n`;
          message += `Описание: ${description}\n`;
          message += `Срок выполнения: ${expireDate}\n`;
          //message += `Ссылка: http://im.telecom.kz/inframanager/SD/Table`;

          // Добавляем информацию о предыдущих уведомлениях
          const cached = requestCache.get(requestNumber);
          if (cached) {
            message += `\n\nРанее получена: ${cached.lastNotification}`;
          }

          // Отправляем уведомление
          sendTelegramNotification(message);
          
          // Обновляем кэш
          requestCache.set(requestNumber, {
            lastNotification: new Date().toLocaleString(),
            expireDate: expireDate,
            description: description
          });
        });
      }
    });
  });
}

function sendTelegramNotification(text) {
  const token = '7739246980:AAEjpfIUk_sTUVSyoRXCWY4q5Q5GA08HyEw';
  const chatId = '-1002449107021';
  const message = encodeURIComponent(`Уведомление с IM:\n${text}`);

  notifier.notify({
    title: 'Новая заявка в ИМ',
    message: text.split('\n').slice(0, 3).join('\n')
  });
  console.log(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${message}`)
  fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${message}`)
    .catch(error => console.error('Ошибка отправки:', error));
}

// Остальная часть кода без изменений
imap.once('ready', () => {
  openInbox((err, box) => {
    if (err) throw err;
    imap.on('mail', (mails) => {
      if (mails < 15) {
        const b = imap.seq.fetch(`${box.messages.total - (mails - 1)}:*`, {
          bodies: '',
          struct: true
        });
        b.on('message', processMail);
        b.once('error', (err) => console.log('Fetch error:', err));
      }
    });
  });
});

imap.once('error', (err) => console.log(err));
imap.once('end', () => console.log('Connection ended'));
imap.connect();