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

# Función para navegar a la sección de Archivos
def test_navegation_files():
    files_button = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//button[contains(., 'Files')]"))
    )
    files_button.click()

    WebDriverWait(driver, 10).until(EC.url_contains("/fileManagement"))
    print("Navegación a Archivos exitosa.")

# Prueba para subir un archivo sin interactuar con la ventana emergente
def test_upload_first_file():
    upload_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Adjunta Archivos')]"))
    )
    upload_button.click()

    # Simular la selección de un archivo con el campo de tipo "file"
    file_input = driver.find_element(By.CSS_SELECTOR, "input[type='file']")
    
 
    # Obtener el directorio donde está ejecutándose este script
    current_directory = os.path.dirname(os.path.abspath(__file__))

    # Nombre del archivo PDF
    pdf_file_name = "Plan_Estudios_Nuevo.pdf"

    # Construir la ruta completa al archivo PDF
    pdf_file = os.path.join(current_directory, pdf_file_name)


    file_input.send_keys(pdf_file)

    time.sleep(2)

    uploaded_file = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, f"//p[contains(text(), '{os.path.basename(pdf_file)}')]"))
    )
    assert uploaded_file.is_displayed(), "El archivo no se ha subido correctamente."
    print(f"Archivo '{os.path.basename(pdf_file)}' subido exitosamente.")


# Prueba: Ver un archivo
def test_view_file(file_name):
    file_item = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, f"//p[contains(text(), '{file_name}')]"))
    )

    menu_icon = file_item.find_element(By.XPATH, "../div[@class='menu']/i[@class='bi bi-three-dots-vertical menu-icon']")
    menu_icon.click()

    view_option = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//span[contains(text(), 'Ver')]"))
    )

    original_window = driver.current_window_handle
    windows_before_click = driver.window_handles

    view_option.click()

    WebDriverWait(driver, 10).until(
        EC.new_window_is_opened(windows_before_click)
    )

    new_window = [window for window in driver.window_handles if window != original_window][0]
    driver.switch_to.window(new_window)

    time.sleep(5)

    print(f"Archivo '{file_name}' visto exitosamente.")

    driver.close()
    driver.switch_to.window(original_window)

    print(f"Pestaña cerrada y vuelto a la pestaña original.")


# Prueba: Eliminar un archivo
def test_delete_file(file_name):

  
    delete_option = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//span[contains(text(), 'Eliminar')]"))
    )
    delete_option.click()


    time.sleep(1)  
    print(f"Archivo '{file_name}' eliminado exitosamente.")

# Ejecutar la prueba
test_admin_login("maria.avellaneda@javeriana.edu.com", "123456", should_pass=True)
test_navegation_files()
test_upload_first_file()
test_view_file("Plan_Estudios_Nuevo.pdf")  
test_delete_file("Plan_Estudios_Nuevo.pdf")  

# Cerrar el navegador
driver.quit()
