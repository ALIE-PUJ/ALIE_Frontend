import { Component } from '@angular/core';
import { DefaultFooterComponent } from '../../layout/default-footer/default-footer.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [DefaultFooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

}
