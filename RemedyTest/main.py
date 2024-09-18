

from pywinauto import Application
from pywinauto.findwindows import find_window

# Название родительского окна
parent_window_title = "BMC Remedy User - [Проблемный билет (Изменить)]"

# Дескриптор дочернего элемента
child_hwnd = 0x008C1686

# Подключаемся к приложению и находим родительское окно
app = Application().connect(title=parent_window_title)
parent_window = app.window(title=parent_window_title)

# Теперь пройдем по всем дочерним элементам родительского окна и найдем нужный по hwnd
found_child = None

for child in parent_window.descendants():
    if child.handle == child_hwnd:
        found_child = child
        break

if found_child:
    print(f"Дочерний элемент найден: {found_child}")
    
    # Получаем дочерние элементы внутри найденного дочернего элемента
    list_items = found_child.descendants()
    
    for item in list_items:
        print(f"Найден элемент: {item.window_text()} (HWND: {item.handle})")
        
        # Если это элемент списка, вы можете обработать его здесь
        # Например, проверить текст или взаимодействовать с ним
        if item.control_type() == "ListItem":  # или другой тип, если это не ListItem
            print(f"Элемент списка: {item.window_text()}")
else:
    print("Дочерний элемент не найден.")
