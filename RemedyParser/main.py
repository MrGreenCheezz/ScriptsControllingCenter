from pywinauto import Application
from pywinauto.findwindows import find_windows

# Функция для поиска окна по части названия
def find_window_by_partial_title(partial_title):
    windows = find_windows(title_re=partial_title)
    if windows:
        return windows[0]
    return None

# Пример использования
partial_title = "BMC"
window_handle = find_window_by_partial_title(partial_title)

if window_handle:
    app = Application().connect(handle=window_handle)
    window = app.window(handle=window_handle)
    print(f"Найдено окно: {window.window_text()}")
    print(f"Размеры окна: {window.rectangle()}")
else:
    print("Окно с указанной частью названия не найдено")
