import tkinter as tk
from ProcessClass import ControllingProcess  

ImapScriptPath = "./im_mail_checker/index.js"
RemedySciptPath = "./rm_sniffer/main.py"
AnnouncerScriptPath = "./expire_date_checker/main.py"

def update_ui():
    for i in range(len(blocks)):
        status_labels[i].config(text="Status: " + ("Active" if statuses[i] else "Not active"), fg=("green" if statuses[i] else "red"))
        start_buttons[i].config(state=("disabled" if statuses[i] else "normal"))
        stop_buttons[i].config(state=("normal" if statuses[i] else "disabled"))

def update_statuses():
    for i, block in enumerate(blocks):
        if ScriptsProccesses[block].is_running():
            statuses[i] = True
        else:
            statuses[i] = False
    update_ui()  

def start_process(block_num):
    ScriptsProccesses[blocks[block_num]].start()
    update_statuses()

def stop_process(block_num):
    ScriptsProccesses[blocks[block_num]].stop()
    update_statuses()

def periodic_check():
    update_statuses()
    root.after(2000, periodic_check) 

root = tk.Tk()
root.title("Script manager")

root.geometry("500x400")
root.resizable(False, False)

blocks = ["IM service", "Remedy service", "Announcer service"]
statuses = [False, False, False]

status_labels = []
start_buttons = []
stop_buttons = []

ScriptsProccesses = {
    "IM service": ControllingProcess(ImapScriptPath, "Node"), 
    "Remedy service": ControllingProcess(RemedySciptPath, "Python"), 
    "Announcer service": ControllingProcess(AnnouncerScriptPath, "Python")
}

for i, block in enumerate(blocks):
    frame = tk.Frame(root, borderwidth=2, relief="groove", pady=10)
    frame.pack(padx=20, pady=5, fill="both", expand=True)
    frame.columnconfigure(0, weight=1)
    
    label = tk.Label(frame, text=block, anchor="center")
    label.grid(row=0, column=0, columnspan=2)

    status_label = tk.Label(frame, text="",anchor="center")
    status_label.grid(row=1, column=0, columnspan=2, sticky="ew")
    status_labels.append(status_label)

    start_button = tk.Button(frame, text="Запустить", command=lambda i=i: start_process(i),anchor="center")
    start_button.grid(row=2, column=0, padx=5, sticky="w")
    start_buttons.append(start_button)

    stop_button = tk.Button(frame, text="Остановить", command=lambda i=i: stop_process(i),anchor="center")
    stop_button.grid(row=2, column=1, padx=5, sticky="e")
    stop_buttons.append(stop_button)

update_ui()
periodic_check()  

root.mainloop()
