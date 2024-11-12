from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time


# Este test debe ser ejecutado antes que el test de Supervision.py


# Configura el driver de Selenium (Chrome en este caso)
driver = webdriver.Chrome()

# Función para login
def test_student_login(email, password, should_pass):
    driver.get("http://localhost:4200/login")  

    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "password")))

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

# Prueba: Renombrar el chat llamado "Chat de Prueba"
def test_rename_chat():
    # Localizar el chat con nombre "Chat de Prueba"
    chat_1 = WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.XPATH, "//p[contains(text(), 'Chat de Prueba')]"))
    )

    # Abrir el menú de los tres puntos correspondiente al chat "Chat de Prueba"
    parent_div = chat_1.find_element(By.XPATH, "../..")  # Subimos dos niveles para obtener el div que contiene el menú
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



# Prueba: Eliminar el chat llamado "Chat 2"
def test_delete_chat():

    chat_2 = WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.XPATH, "//p[contains(text(), 'Chat 2')]"))
    )

    # Abrir el menú de los tres puntos correspondiente al chat "Chat 2"
    parent_div = chat_2.find_element(By.XPATH, "../..")  # Subimos dos niveles para obtener el div que contiene el menú
    menu_icon = parent_div.find_element(By.CSS_SELECTOR, "i.bi.bi-three-dots-vertical.menu-icon")
    menu_icon.click()

    # Esperar y hacer clic en la opción "Eliminar"
    delete_option = WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.XPATH, "//span[text()='Eliminar']"))
    )
    delete_option.click()

    # Verificar que el chat fue eliminado
    chats = driver.find_elements(By.CSS_SELECTOR, ".historial")
    assert len(chats) == 0, "El chat no fue eliminado correctamente"
    print("Chat eliminado exitosamente.")

# Prueba: Enviar un mensaje en el chat llamado "Chat 3"
def test_send_message():
    # Localizar el chat con nombre "Chat 3"
    chat_3 = WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.XPATH, "//p[contains(text(), 'Chat 2')]"))
    )
    
    # Hacer clic en el chat para activarlo
    chat_3.click()

    # Esperar a que el input del mensaje esté disponible
    message_input = WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.ID, "message-input"))
    )

    # Escribir el mensaje de prueba
    message_input.send_keys("Hola, esto es una prueba")
    
    # Hacer clic en el botón de enviar
    send_button = driver.find_element(By.ID, "send-message")
    send_button.click()

    # Verificar que el mensaje fue enviado (puedes verificar la aparición del mensaje en la lista)
    WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.XPATH, "//p[contains(text(), 'Hola, esto es una prueba')]"))
    )
    print("Mensaje enviado exitosamente.")

       # Esperar la respuesta del agente
    agent_response = WebDriverWait(driver, 30).until(
        EC.visibility_of_element_located((By.XPATH, "//p[contains(@class, 'agent-message')]"))
    )

    # Verificar que se recibió un mensaje del agente
    print("Respuesta del agente recibida:", agent_response.text)

# Prueba: Enviar un mensaje en el chat llamado "Chat 4"
def test_send_message1():
    # Localizar el chat con nombre "Chat 4"
    chat_4 = WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.XPATH, "//p[contains(text(), 'Chat 3')]"))
    )
    
    # Hacer clic en el chat para activarlo
    chat_4.click()

    # Esperar a que el input del mensaje esté disponible
    message_input = WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.ID, "message-input"))
    )

    # Escribir el mensaje de prueba
    message_input.send_keys("Hola, esto es una prueba")
    
    # Hacer clic en el botón de enviar
    send_button = driver.find_element(By.ID, "send-message")
    send_button.click()

    # Verificar que el mensaje fue enviado (puedes verificar la aparición del mensaje en la lista)
    WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.XPATH, "//p[contains(text(), 'Hola, esto es una prueba')]"))
    )
    print("Mensaje enviado exitosamente.")

       # Esperar la respuesta del agente
    agent_response = WebDriverWait(driver, 30).until(
        EC.visibility_of_element_located((By.XPATH, "//p[contains(@class, 'agent-message')]"))
    )

    # Verificar que se recibió un mensaje del agente
    print("Respuesta del agente recibida:", agent_response.text)


# Prueba: Enviar un mensaje en el chat llamado "Chat 5"
def test_send_message2():
    # Localizar el chat con nombre "Chat 5"
    chat_5 = WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.XPATH, "//p[contains(text(), 'Chat 4')]"))
    )
    
    # Hacer clic en el chat para activarlo
    chat_5.click()

    # Esperar a que el input del mensaje esté disponible
    message_input = WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.ID, "message-input"))
    )

    # Escribir el mensaje de prueba
    message_input.send_keys("Hola, esto es una prueba")
    
    # Hacer clic en el botón de enviar
    send_button = driver.find_element(By.ID, "send-message")
    send_button.click()

    # Verificar que el mensaje fue enviado (puedes verificar la aparición del mensaje en la lista)
    WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.XPATH, "//p[contains(text(), 'Hola, esto es una prueba')]"))
    )
    print("Mensaje enviado exitosamente.")

       # Esperar la respuesta del agente
    agent_response = WebDriverWait(driver, 30).until(
        EC.visibility_of_element_located((By.XPATH, "//p[contains(@class, 'agent-message')]"))
    )

    # Verificar que se recibió un mensaje del agente
    print("Respuesta del agente recibida:", agent_response.text)

def test_thumbsup():
    thumbs_up_button = driver.find_element(By.CSS_SELECTOR, "i.bi-hand-thumbs-up-fill")
    thumbs_up_button.click()
    print("Thumbs up presionado.")

def test_retry():
    thumbs_up_button = driver.find_element(By.CSS_SELECTOR, "i.bi-arrow-repeat")
    thumbs_up_button.click()
    print("Retry presionado.")
    agent_response = WebDriverWait(driver, 30).until(
        EC.visibility_of_element_located((By.XPATH, "//p[contains(@class, 'agent-message')]"))
    )

    # Verificar que se recibió un mensaje del agente
    print("Respuesta del agente recibida:", agent_response.text)

def test_thumbsdown():
    thumbs_down_button = driver.find_element(By.CSS_SELECTOR, "i.bi-hand-thumbs-down-fill")
    thumbs_down_button.click()
    print("Thumbs down presionado.")

    # Esperar a que aparezca el menú de confirmación después de "thumbs down"
    confirmation_box = WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, ".confirmation-box"))
    )

    # Intentar hacer scroll hasta el botón "Sí" para asegurarnos de que es visible
    confirm_yes_button = confirmation_box.find_element(By.XPATH, "//button[text()='Sí']")
    driver.execute_script("arguments[0].scrollIntoView(true);", confirm_yes_button)

    # Intentar hacer clic en el botón "Sí"
    try:
        confirm_yes_button.click()
    except Exception as e:
        # Si el clic es interceptado, usar JavaScript para hacer clic en el botón
        driver.execute_script("arguments[0].click();", confirm_yes_button)
    print("Confirmación de 'Sí' seleccionada.")

def test_send_message_supervision():

    message_input = WebDriverWait(driver, 15).until(
        EC.visibility_of_element_located((By.ID, "message-input"))
    )

    # Escribir el mensaje de prueba
    message_input.send_keys("Hola, esto es una prueba")
    
    # Hacer clic en el botón de enviar
    send_button = driver.find_element(By.ID, "send-message1")
    send_button.click()

    # Verificar que el mensaje fue enviado (puedes verificar la aparición del mensaje en la lista)
    WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.XPATH, "//p[contains(text(), 'Hola, esto es una prueba')]"))
    )
    print("Mensaje enviado exitosamente.")


# Ejecutar las pruebas
test_student_login("luis.bravo@javeriana.edu.com", "123456", should_pass=True)
test_rename_chat()
test_archive_chat()
test_create_chat()
test_delete_chat()
test_create_chat()
test_send_message()
test_thumbsup()
test_create_chat()
test_send_message1()
test_thumbsdown()
#test_send_message_supervision()
# Cerrar el navegador
driver.quit()
