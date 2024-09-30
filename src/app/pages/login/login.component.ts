import { Component, Inject, inject } from '@angular/core';
import { DefaultFooterComponent } from '../../layout/default-footer/default-footer.component';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/authentication/auth.service';
import { DOCUMENT } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [DefaultFooterComponent, RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private selectedRole: string = 'Student';

  email = new FormControl('');
  password = new FormControl('');

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    // this.setInitialRole();
  }

  handleLogin() {
    if (this.email.value && this.password.value) {
      this.authService.login(this.email.value, this.password.value).subscribe((res) => {
        if (res['token'] && res['id_categoria'] === 1) {
          this.loginAsStudent();
        } else if (res['token'] && res['id_categoria'] === 2) {
          this.loginAsAdmin();
        } else {
          alert('Credenciales incorrectas');
        }
      });
      
    }
  }

  loginAsStudent() {
    localStorage.setItem('ActiveRole', 'Student');
    localStorage.setItem('ActiveUserId', '12345');
    this.router.navigate(['/chat']);
    // Add your login logic for student here
    // alert('Logged in as Student');
  }

  loginAsAdmin() {
    localStorage.setItem('ActiveRole', 'Admin');
    // Add your login logic for admin here
    // alert('Logged in as Admin');
  }

  /* setInitialRole() {
    const roleButtons = document.querySelectorAll('.role-btn');
    roleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        roleButtons.forEach(button => button.classList.remove('active'));
        (btn as HTMLElement).classList.add('active');
        this.selectedRole = (btn as HTMLElement).id === 'studentBtn' ? 'Student' : 'Admin';
      });
    });
  } */
}
