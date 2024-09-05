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

  constructor() { }

  handleLogin() {
    const roleSelect = (document.getElementById('roleToggle') as HTMLSelectElement).value;
    
    if (roleSelect === 'Student') {
      this.loginAsStudent();
    } else if (roleSelect === 'Admin') {
      this.loginAsAdmin();
    }

    // Store user ID, independently of role. Must be fetch from the DB
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

}
