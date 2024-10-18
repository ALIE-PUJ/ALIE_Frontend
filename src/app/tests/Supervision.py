from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Configura el driver de Selenium (Chrome en este caso)
driver = webdriver.Chrome()

# Función para login
def test_admin_login(email, password, should_pass):
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

def test_navegation_supervision():
    # Navegar a la sección de supervisión
    supervision_button = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//button[contains(., 'Supervision')]"))
    )
    supervision_button.click()

    # Esperar a que la URL cambie a /supervision
    WebDriverWait(driver, 10).until(EC.url_contains("/supervision"))
    print("Navegación a Supervisión exitosa.")

    # Verificar que la lista de chats de intervención es visible
    intervention_chats_header = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//h2[text()='Intervención']"))
    )
    assert intervention_chats_header.is_displayed(), "La sección de Chats de Intervención no está visible."

    # Verificar que al menos un chat de intervención esté presente
    intervention_chat_items = WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".chat-list .chat-item"))
    )
    assert len(intervention_chat_items) > 0, "No se encontraron chats de intervención."

    # Verificar que la lista de chats activos es visible
    active_chats_header = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//h2[text()='Chats Activos']"))
    )
    assert active_chats_header.is_displayed(), "La sección de Chats Activos no está visible."


    active_chat_items = WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.XPATH, "//h2[text()='Chats Activos']/following-sibling::div//p"))
    )
    assert len(active_chat_items) > 0, "No se encontraron chats activos."

    print("Supervisión: Chats de intervención y activos visibles. Prueba de navegación exitosa.")


def test_intervention():

    chat_3 = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//p[contains(text(), 'Chat 3')]"))
    )
    chat_3.click()

    input_field = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='Escribe un mensaje para intervenir en la conversación...']"))
    )
    assert input_field.is_displayed(), "El campo de texto para intervención no está visible."

    input_field.send_keys("Hola, este es un mensaje de prueba en el chat 3.")
    

    send_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), '✈️')]"))
    )
    send_button.click()


    time.sleep(2)

    last_message = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//div[contains(@class, 'supervisor-message') and contains(text(), 'Hola, este es un mensaje de prueba en el chat 3.')]"))
    )
    assert last_message.is_displayed(), "El mensaje de intervención no fue enviado correctamente."

    print("Intervención en Chat 3 exitosa.")


# Ejecutar las pruebas
test_admin_login("luis.bravo@javeriana.edu.com", "123456", should_pass=True)
test_navegation_supervision()
test_intervention()
# Cerrar el navegador
driver.quit()
