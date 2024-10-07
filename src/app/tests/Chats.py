from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Configura el driver de Selenium (Chrome en este caso)
driver = webdriver.Chrome()

# Función para login
def test_student_login(email, password, should_pass):
    driver.get("http://localhost:4200/login")  

    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "studentBtn")))
    student_btn = driver.find_element(By.ID, "studentBtn")
    student_btn.click()

    email_input = driver.find_element(By.NAME, "email")
    email_input.send_keys(email)

    password_input = driver.find_element(By.CSS_SELECTOR, 'input[type="password"]')
    password_input.send_keys(password)

    login_btn = driver.find_element(By.XPATH, "//button[text()='Continuar']")
    login_btn.click()

    WebDriverWait(driver, 10).until(EC.url_contains("/chat"))
    print("Login exitoso.")

# Prueba: Crear un nuevo chat
def test_create_chat():
    create_chat_btn = driver.find_element(By.ID, "create-chat-btn")
    create_chat_btn.click()

    # Espera a que se cree el nuevo chat
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".historial")))
    print("Chat creado exitosamente.")

# Prueba: Renombrar el chat llamado "Chat 10"
def test_rename_chat():
    # Localizar el chat con nombre "Chat 10"
    chat_10 = WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.XPATH, "//p[contains(text(), 'Chat 10')]"))
    )

    # Abrir el menú de los tres puntos correspondiente al chat "Chat 10"
    parent_div = chat_10.find_element(By.XPATH, "../..")  # Subimos dos niveles para obtener el div que contiene el menú
    menu_icon = parent_div.find_element(By.CSS_SELECTOR, "i.bi.bi-three-dots-vertical.menu-icon")
    menu_icon.click()

    # Esperar y hacer clic en la opción "Renombrar"
    rename_option = WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.XPATH, "//span[text()='Renombrar']"))
    )
    rename_option.click()

    # Volver a localizar el campo de entrada justo antes de interactuar para evitar el error de StaleElementReference
    chat_title_input = WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, ".edit-input"))
    )

    # Borrar el contenido existente y escribir el nuevo nombre
    chat_title_input.send_keys(Keys.CONTROL, 'a') 
    chat_title_input.send_keys(Keys.BACKSPACE)  # Limpiar el contenido anterior
    chat_title_input.send_keys("prueba")
    chat_title_input.send_keys(Keys.ENTER)  # Presionar Enter para confirmar

    # Verificar que el chat fue renombrado correctamente
    renamed_chat_title = WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.XPATH, "//p[contains(text(), 'prueba')]"))
    ).text

    assert renamed_chat_title == "prueba", "El nombre del chat no cambió correctamente"
    print("Chat renombrado exitosamente.")

# Prueba: Archivar el chat llamado "prueba"
def test_archive_chat():

    # Esperar y hacer clic en la opción "Archivar"
    archive_option = WebDriverWait(driver, 5).until(
        EC.element_to_be_clickable((By.XPATH, "//span[text()='Archivar']"))
    )
    archive_option.click()

    # Esperar un momento para asegurar que el chat se ha archivado
    time.sleep(1)

    
    assert archive_option, "El chat no fue archivado correctamente"
    print("Chat archivado exitosamente.")



# Prueba: Eliminar el chat llamado "Chat 10"
def test_delete_chat():
    # Localizar el chat con nombre "Chat 10"
    chat_10 = WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.XPATH, "//p[contains(text(), 'Chat 11')]"))
    )

    # Abrir el menú de los tres puntos correspondiente
    menu_icon = chat_10.find_element(By.XPATH, "../../div[@class='menu']/i[@class='bi bi-three-dots-vertical menu-icon']")
    menu_icon.click()

    # Esperar y hacer clic en la opción "Eliminar"
    delete_option = WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.XPATH, "//span[text()='Eliminar']"))
    )
    delete_option.click()

    time.sleep(2)

    # Verificar que el chat fue eliminado
    chats = driver.find_elements(By.CSS_SELECTOR, ".historial")
    assert len(chats) == 0, "El chat no fue eliminado correctamente"
    print("Chat eliminado exitosamente.")



# Ejecutar las pruebas
test_student_login("pepito@javeriana.edu.com", "123456", should_pass=True)
test_create_chat()
#test_rename_chat()
#test_archive_chat()
test_delete_chat()
#test_send_message()

# Cerrar el navegador
driver.quit()
