import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

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


def test_logout():

    logout_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//a[contains(@class, 'btn-icon') and contains(., 'Logout')]"))
    )

    logout_button.click()
    WebDriverWait(driver, 10).until(
        EC.url_contains("/login")  
    )

    print("Logout exitoso y redirigido a la página de login.")



# Ejecutar la prueba
test_admin_login("maria.avellaneda@javeriana.edu.com", "123456", should_pass=True)
test_logout()


# Cerrar el navegador
driver.quit()
