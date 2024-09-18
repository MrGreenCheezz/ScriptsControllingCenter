
import datetime
import sched
import time 
import psycopg2
import requests
import asyncio
import websockets
import json


ExpireRows = []
ExpiredRows = []
HolidayRows = []


# Параметры подключения
conn = psycopg2.connect(
    dbname="postgres", 
    user="postgres", 
    password="Qw123456", 
    host="localhost"
)
# Создаем курсор для выполнения операций с базой данных




def FetchData():
    with conn:
        cursor = conn.cursor()
        global ExpiredRows, ExpireRows, HolidayRows
        cursor.execute("SELECT * FROM expire_im")
        tmpExpire = cursor.fetchall()

        cursor.execute("SELECT * FROM expired_im")
        tmpExpired = cursor.fetchall()

        cursor.execute("SELECT * FROM public.im as tmp, expire_im as ei WHERE tmp.id = ei.id_im")
        ExpireRows = cursor.fetchall()

        cursor.execute("SELECT * FROM public.im as tmp, expired_im as ei WHERE tmp.id = ei.id_im")
        ExpiredRows = cursor.fetchall()

        cursor.execute("SELECT * FROM public.im as tmp, after_hours_requests as ei WHERE tmp.id = ei.id_im")
        HolidayRows = cursor.fetchall()



def SendTelegramMessage(num):
    bot_token = "*" 
    chat_id = "-1002057022269"
    text_message = "Заявка номер" + " " + str(num)+ " истекает в течении часа!"
    response = requests.post(f'https://api.telegram.org/bot{bot_token}/sendMessage',
    data={'chat_id': chat_id, 'text': text_message, 'parse_mode': 'HTML'})


def ComputeData():
    currentWeekDay = datetime.datetime.today().weekday()
    todayDate = datetime.datetime.now()
    for row in ExpireRows:
        if((row[3] - row[1]) > datetime.timedelta(minutes=3) and (row[3] - row[1])  < datetime.timedelta(hours=3)):
            if((row[3] - datetime.datetime.today()) + datetime.timedelta(hours=3) <= datetime.timedelta(hours=1)):
                #Do alert and delete
                with conn:
                    cursor = conn.cursor()
                    cursor.execute("DELETE FROM expire_im WHERE id_im = %s", (row[0],))
                    conn.commit()
                    cursor.execute("SELECT num FROM im WHERE id = %s", (row[0],))
                    num = cursor.fetchone()
                    print(num)
                    url = 'http://localhost:3000/run?func=FindRowsWithElementDone&elementName=№elementText='
                    newResp = requests.get(url + str(num[0]))
                    if newResp.status_code == 200:
                        newData = newResp.json()
                        if newData:
                            if (isinstance(newData, dict) and newData) or (isinstance(newData, list) and newData):
                                SendTelegramMessage(num[0])           
        else:
            if((row[3] - datetime.datetime.today()) <= datetime.timedelta(hours=1)):
                #Do alert and delete
                with conn:
                    cursor = conn.cursor()
                    cursor.execute("DELETE FROM expire_im WHERE id_im = %s", (row[0],))
                    conn.commit()
                    cursor.execute("SELECT num FROM im WHERE id = %s", (row[0],))
                    num = cursor.fetchone()
                    print(num)
                    url = 'http://localhost:3000/run?func=FindRowsWithElementDone&elementName=№elementText='
                    newResp = requests.get(url + str(num[0]))
                    if newResp.status_code == 200:
                        newData = newResp.json()
                        if newData:
                            if (isinstance(newData, dict) and newData) or (isinstance(newData, list) and newData):
                                SendTelegramMessage(num[0])
    for row in ExpiredRows:
        if(row[3] + datetime.timedelta(hours=3)  - datetime.datetime.today() <= datetime.timedelta(hours=1)):
            #Do alert and delete
            with conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM expired_im WHERE id_im = %s", (row[0],))
                conn.commit()
                cursor.execute("SELECT num FROM im WHERE id = %s", (row[0],))
                num = cursor.fetchone()
                print(num)
                url = 'http://localhost:3000/run?func=FindRowsWithElementDone&elementName=№elementText='
                newResp = requests.get(url + str(num[0]))
                if newResp.status_code == 200:
                    newData = newResp.json()
                    if newData:
                        if (isinstance(newData, dict) and newData) or (isinstance(newData, list) and newData):
                            SendTelegramMessage(num[0],)
    for row in HolidayRows:
        if(currentWeekDay != 6 and currentWeekDay != 5):
            if(todayDate.hour >= 9 and todayDate.hour <= 10):
                with conn:
                    cursor = conn.cursor()
                    print(row[0])
                    print(row)
                    url = 'http://localhost:3000/run?func=FindRowsWithElementDone&elementName=№elementText='
                    cursor.execute("DELETE FROM after_hours_requests WHERE id_im = %s", (row[0],))
                    conn.commit()
                    cursor.execute("SELECT num FROM im WHERE id = %s", (row[0],))
                    num = cursor.fetchone()
                    newResp = requests.get(url + str(num[0]))
                    if newResp.status_code == 200:
                        newData = newResp.json()
                        if newData:
                            if (isinstance(newData, dict) and newData) or (isinstance(newData, list) and newData):
                                bot_token = "*" 
                                chat_id = "-1002057022269"
                                text_message = "Заявка номер" + " " + str(num[0])+ " пришла в нерабочее время!"
                                response = requests.post(f'https://api.telegram.org/bot{bot_token}/sendMessage',
                                data={'chat_id': chat_id, 'text': text_message, 'parse_mode': 'HTML'})
                            



            

# Закрытие курсора и соединения

scheduler = sched.scheduler(time.time, time.sleep)

# Определяем функцию для циклического вызова
def cyclic_call():
    # Вызываем функцию do_something()
    FetchData()
    ComputeData()
    # Планируем следующий вызов через 10 минут
    scheduler.enter(120, 1, cyclic_call)

# Планируем первый вызов функции через 10 минут
scheduler.enter(120, 1, cyclic_call)

# Запускаем цикл обработки событий
scheduler.run()