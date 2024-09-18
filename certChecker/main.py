import ssl
import socket
from datetime import datetime
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import schedule
import time
import openpyxl

current_hostname = ''
all_message_text = ''
# Config
smtp_server = 'mail.telecom.kz'
smtp_port = 587
smtp_user = 'borozentcev.a@telecom.kz'
smtp_password = '****'

target_email = 'borozentcev.a@telecom.kz'
emails = ['borozentcev.a@telecom.kz', 'Bitkolov.O@telecom.kz', 'Shalkhar.N@telecom.kz', 'Yakubov.A@telecom.kz']
day_diff = 40
# --------------------------------------------

# Настройка логирования
logging.basicConfig(filename='cert_info.log', level=logging.INFO, format='%(asctime)s %(message)s')

def get_ssl_certificate(hostname, port=443):
    context = ssl.create_default_context()
    context.set_ciphers("DEFAULT")
    conn = context.wrap_socket(socket.socket(socket.AF_INET), server_hostname=hostname)
    conn.settimeout(35.0)
    
    try:
        conn.connect((hostname, port))
        cert = conn.getpeercert()
        conn.close()
        return cert
    except socket.timeout as e:
        logging.error(f"###############\n Connection timeout to {hostname}:{port} - {e}")
    except Exception as e:
        logging.error(f"###############\n Could not connect to {hostname}:{port} - {e}")
        return None

def print_cert_info(cert, file, excel_data):
    if not cert:
        logging.info("No certificate found.")
        return
    global current_hostname
    subject = dict(x[0] for x in cert['subject'])
    issued_to = subject.get('commonName', 'Unknown')
    issued_by = dict(x[0] for x in cert['issuer']).get('commonName', 'Unknown')
    valid_from = cert['notBefore']
    valid_to = cert['notAfter']
    serial_number = cert['serialNumber']
    
    logging.info(f"Certificate for: {issued_to}")
    logging.info(f"Issued by: {issued_by}")
    logging.info(f"Valid from: {valid_from}")
    logging.info(f"Valid to: {valid_to}")
    logging.info(f"Serial number: {serial_number}")

    full_info = f"Certificate for: {issued_to}\nIssued by: {issued_by}\nValid from: {valid_from}\nValid to: {valid_to}\nSerial number: {serial_number}\n"
    
    file.write(f"Hostname: {current_hostname}\n")
    file.write(f"From: {valid_from}\n")
    file.write(f"To: {valid_to}\n")
    file.write("=======================================")
    
    excel_data.append([current_hostname, issued_to, issued_by, valid_from, valid_to, serial_number])

    current_date = datetime.now()
    valid_from_date = datetime.strptime(valid_from, "%b %d %H:%M:%S %Y %Z")
    valid_to_date = datetime.strptime(valid_to, "%b %d %H:%M:%S %Y %Z")
    date_dif = (valid_to_date - current_date).days
    logging.info('Date difference: %s', date_dif)

    if date_dif < day_diff:
        subject = f"Сертификат для {current_hostname} истекает через {date_dif} дней"
        body = f"Сертификат {issued_to} истекает через {date_dif} дней\n "
        addTextToMessage(body, subject, full_info)

    if valid_from_date <= current_date <= valid_to_date:
        subject = f"Сертификат {issued_to} истек."
        body = f"Сертификат {issued_to} истек.\n"  
        logging.info("The certificate is currently valid.")
    else:
        logging.info("The certificate is not valid.")
        
        addTextToMessage(body, subject, full_info)
        
    logging.info('******--------------------------------------*********')


def addTextToMessage(body, subject, custom_text):
    global all_message_text
    tmpbody = body + custom_text
    all_message_text += tmpbody
    all_message_text += '\n------------------------------------\n'
    

def SendEmail(subject, target_email):
    global all_message_text
    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = target_email
    msg['Subject'] = subject
    msg.attach(MIMEText(all_message_text, 'plain'))
    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, target_email, msg.as_string())
        #all_message_text = ""  # Очищаем текст после отправки письма
        server.quit()
        logging.info('******^-^-^-^^-^-^-^^-^-^-^^-^-^-^^-^-^-^^-^-^-^*********')
        logging.info("Mail sent successfully.")
    except Exception as e:
        logging.error('##########################################')
        logging.error(f"Mail error: {e}")

def add_to_excel(data):
    workbook = openpyxl.Workbook()
    sheet = workbook.active
    sheet.title = 'Certificates'
    headers = ['Hostname', 'Issued To', 'Issued By', 'Valid From', 'Valid To', 'Serial Number']
    sheet.append(headers)
    for row in data:
        sheet.append(row)
    workbook.save('certificates.xlsx')

def CheckCerts():
    excel_data = []
    with open("resultList.txt", "w") as Wfile:
        with open('list.txt', 'r') as file:
            global current_hostname
            # Проходим по каждой строке в файле
            for line in file:
                # Убираем символы новой строки в конце каждой строки
                line = line.strip()
                if ':' in line:
                    hostname, port = line.split(':')
                    current_hostname = hostname
                    port = int(port)
                else:
                    hostname = line
                    current_hostname = hostname
                    port = 443
                certificate = get_ssl_certificate(hostname, port)
                print_cert_info(certificate, Wfile, excel_data)
    add_to_excel(excel_data)
    for email in emails:
        SendEmail("Сертификаты", email)
    global all_message_text
    all_message_text = ""

schedule.every().day.at("12:15").do(CheckCerts)

while True:
    schedule.run_pending()
    time.sleep(1)
