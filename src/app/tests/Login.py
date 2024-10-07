from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import UnexpectedAlertPresentException
import time

#Prueba login estudiante
driver = webdriver.Chrome()

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

 
    time.sleep(3)  


    try:
        if should_pass:
            WebDriverWait(driver, 10).until(EC.url_contains("/chat"))
            assert "chat" in driver.current_url, "El login debería ser exitoso y redirigir al chat"
            print("Prueba con credenciales correctas exitosa para estudiante.")
        else:
            WebDriverWait(driver, 5).until(EC.alert_is_present())
            alert = driver.switch_to.alert
            assert "Error en la solicitud de login" in alert.text, "No se encontró el mensaje de error esperado"
            alert.accept()
            print("Prueba con credenciales incorrectas exitosa para estudiante.")
    except UnexpectedAlertPresentException as e:
        print("Prueba fallida para estudiante con credenciales incorrectas. Detalle del error:", str(e))

# Pruebas con contraseña incorrecta y correcta
test_student_login("pepito@javeriana.edu.com", "123", should_pass=False)
test_student_login("pepito@javeriana.edu.com", "123456", should_pass=True)

driver.quit()

#Prueba login admin
driver = webdriver.Chrome()

def test_admin_login(email, password, should_pass):
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


    time.sleep(3)  
    try:
        if should_pass:
            WebDriverWait(driver, 10).until(EC.url_contains("/chat"))
            assert "chat" in driver.current_url, "El login debería ser exitoso y redirigir al chat"
            print("Prueba con credenciales correctas exitosa para administrador.")
        else:
            WebDriverWait(driver, 5).until(EC.alert_is_present())
            alert = driver.switch_to.alert
            assert "Error en la solicitud de login" in alert.text, "No se encontró el mensaje de error esperado"
            alert.accept()  
            print("Prueba con credenciales incorrectas exitosa para administrador.")
    except UnexpectedAlertPresentException as e:
        print("Prueba fallida con credenciales incorrectas. Detalle del error:", str(e))


test_student_login("maria.avellaneda@javeriana.edu.com", "123", should_pass=False)
test_student_login("maria.avellaneda@javeriana.edu.com", "123456", should_pass=True)

driver.quit()

