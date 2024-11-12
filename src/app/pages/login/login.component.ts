import { Component, Inject, inject } from '@angular/core';
import { DefaultFooterComponent } from '../../layout/default-footer/default-footer.component';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/authentication/auth.service';
import { DOCUMENT } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [DefaultFooterComponent, RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private selectedRole: string = 'Student';

  email = new FormControl('');
  password = new FormControl('');
  showPassword: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {

  }

  handleLogin() {
    if (this.email.value && this.password.value) {
      this.authService.login(this.email.value, this.password.value).subscribe(
        (res) => {
          // Verifica si la respuesta tiene token y es de categoría válida
          if (res['token'] && res['user']['id_categoria'] === 1) {
            
            // Guardar datos del usuario en local storage
            let userName = res['user']['usuario'];
            let userId = res['user']['id_usuario'];
            let userEmail = res['user']['email'];
  
            localStorage.setItem('ActiveUserName', userName);
            localStorage.setItem('ActiveUserId', userId);
            localStorage.setItem('ActiveUserEmail', userEmail);
  
            this.loginAsStudent(); // Redirigir a la página de chat como estudiante
  
          } else if (res['token'] && res['user']['id_categoria'] === 2) {
  
            // Guardar datos del usuario en local storage
            let userName = res['user']['usuario'];
            let userId = res['user']['id_usuario'];
            let userEmail = res['user']['email'];
  
            localStorage.setItem('ActiveUserName', userName);
            localStorage.setItem('ActiveUserId', userId);
            localStorage.setItem('ActiveUserEmail', userEmail);
  
            this.loginAsAdmin(); // Redirigir a la página de chat como admin
  
          } else {
            // Si no es estudiante ni admin, mostrar alerta
            alert('Credenciales incorrectas');
            console.log("Credenciales incorrectas");
          }
        },
        (error) => {
          // Manejar error en la solicitud
          console.error('Error en la solicitud de login:', error);
          alert('Error en la solicitud de login. Por favor, verifica tus credenciales.');
        }
      );
    } else {
      alert('Por favor, llena todos los campos.');
    }
  }
  

  loginAsStudent() {
    localStorage.setItem('ActiveRole', 'Student');
    this.router.navigate(['/chat']);
    // Add your login logic for student here
    // alert('Logged in as Student');
  }

  loginAsAdmin() {
    localStorage.setItem('ActiveRole', 'Admin');
    this.router.navigate(['/chat']);
    // Add your login logic for admin here
    // alert('Logged in as Admin');
  }



  // Show and hide password
  // Toggle password visibility
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

}
