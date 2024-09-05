import { Component } from '@angular/core';
import { DefaultFooterComponent } from '../../layout/default-footer/default-footer.component';
import { RouterModule } from '@angular/router'; // Import RouterModule

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [DefaultFooterComponent, RouterModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {

}
