import { Component } from '@angular/core';
import { DefaultFooterComponent } from '../../layout/default-footer/default-footer.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [DefaultFooterComponent, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private selectedRole: string = 'Student';

  constructor() { }

  ngOnInit() {
    this.setInitialRole();
  }

  handleLogin() {
    if (this.selectedRole === 'Student') {
      this.loginAsStudent();
    } else if (this.selectedRole === 'Admin') {
      this.loginAsAdmin();
    }

    localStorage.setItem('ActiveUserId', '12345');
  }

  loginAsStudent() {
    localStorage.setItem('ActiveRole', 'Student');
    // Add your login logic for student here
    // alert('Logged in as Student');
  }

  loginAsAdmin() {
    localStorage.setItem('ActiveRole', 'Admin');
    // Add your login logic for admin here
    // alert('Logged in as Admin');
  }

  setInitialRole() {
    const roleButtons = document.querySelectorAll('.role-btn');
    roleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        roleButtons.forEach(button => button.classList.remove('active'));
        (btn as HTMLElement).classList.add('active');
        this.selectedRole = (btn as HTMLElement).id === 'studentBtn' ? 'Student' : 'Admin';
      });
    });
  }
}
