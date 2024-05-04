from scapy.all import *
import requests
from pywinauto import Application
from urllib.parse import quote
import time
import threading
from functools import wraps
from datetime import datetime
from sqlalchemy import Date, create_engine, Column, Integer, String, Sequence
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


Base = declarative_base()


class SUPB(Base):
    __tablename__ = 'supb'
    id = Column(Integer, Sequence('supb_id_seq'), primary_key=True)
    date = Column(Date)
    text = Column(String(250))
class CBR(Base):
    __tablename__ = 'cbr'
    id = Column(Integer, Sequence('cbr_id_seq'), primary_key=True)
    date = Column(Date)
    text = Column(String(250))
class RemedyUnfiltered(Base):
    __tablename__ = 'remedy_unfiltered'
    id = Column(Integer, Sequence('remedy_unfiltered_id_seq'), primary_key=True)
    date = Column(Date)
    text = Column(String(250))

engine = create_engine('postgresql+psycopg2://postgres:Qw123456@localhost/postgres')
Base.metadata.create_all(engine)


packetCounter = 1
function_in_progress = False

def rate_limited(interval):
    def decorator(func):
        @wraps(func)
        def wrapped(*args, **kwargs):
            if not hasattr(wrapped, '_last_call_time'):
                wrapped._last_call_time = 0
            elapsed = time.time() - wrapped._last_call_time
            wait_time = interval - elapsed
            if wait_time > 0:
                time.sleep(wait_time)
            result = func(*args, **kwargs)
            wrapped._last_call_time = time.time()
            return result
        return wrapped
    return decorator

def send_telegram_message():
    print("Отправка сообщения в Telegram...")
    try:
        app = Application(backend="uia").connect(title="BMC Remedy User")
        main_window = app.window(title="BMC Remedy User")
        static_text_by_aid = main_window.child_window(auto_id="2404", control_type="Text")
        message_text_by_aid = static_text_by_aid.window_text()
        dt_string = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        bot_token = "*****" 
        chat_id = "******"
        text_message = "Пришло уведомление Remedy. Дата: \n" +dt_string + "\n" + "\n" + "<em><b>" +message_text_by_aid + "</b></em>"
        response = requests.post(f'https://api.telegram.org/bot{bot_token}/sendMessage',
        data={'chat_id': chat_id, 'text': text_message, 'parse_mode': 'HTML'})

        if "ПБ" in message_text_by_aid:
            Session = sessionmaker(bind=engine)
            session = Session()
            tmp = SUPB(date=datetime.now(), text=message_text_by_aid)
            session.add(tmp)
            session.commit()
            session.close()
        elif "ЦБР" in message_text_by_aid:
            Session = sessionmaker(bind=engine)
            session = Session()
            tmp = CBR(date=datetime.now(), text=message_text_by_aid)
            session.add(tmp)
            session.commit()
            session.close()
        else:
            Session = sessionmaker(bind=engine)
            session = Session()
            tmp = RemedyUnfiltered(date=datetime.now(), text=message_text_by_aid)
            session.add(tmp)
            session.commit()
            session.close()
    
    except :
        print("Ошибка поиска окна.")
        dt_string = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        bot_token = "******" 
        chat_id = "*******"
        text_message = "Пришло уведомление Remedy. Дата: \n" + "<em><b>" + dt_string + "</b></em>\n"
        response = requests.post(f'https://api.telegram.org/bot{bot_token}/sendMessage',
        data={'chat_id': chat_id, 'text': text_message, 'parse_mode': 'MarkdownV2'})
        if 'message_text_by_aid' in locals():
            try:
                Session = sessionmaker(bind=engine)
                session = Session()
                tmp = RemedyUnfiltered(date=datetime.now(), text=message_text_by_aid)
                session.add(tmp)
                session.commit()
                session.close()
            except:
                print("Ошибка записи в базу данных.")
        else:
            try:
                Session = sessionmaker(bind=engine)
                session = Session()
                tmp = RemedyUnfiltered(date=datetime.now(), text="Ошибка поиска окна")
                session.add(tmp)
                session.commit()
                session.close()
            except:
                print("Ошибка записи в базу данных.")
    

    

def packet_callback(packet):
    if (packet[TCP].dport == 49677):
        if(packet[IP].src[0:7] != "10.8.26"):
            print(f"Перехвачен пакет: {packet.summary()}")
            global packetCounter       
            if packetCounter == 1:
                packetCounter = 0
                thread = threading.Thread(target=change_variable)
                thread.start()


def change_variable():
    global function_in_progress, packetCounter
    
    if function_in_progress:
        print("Функция уже запущена.")
        return

    function_in_progress = True
    print("Функция запущена.")
    

    time.sleep(5)
    
    packetCounter = 1
    print("Значение переменной изменено.")
    send_telegram_message()
    function_in_progress = False





sniff(filter="tcp and port 49677", prn=packet_callback, store=False)