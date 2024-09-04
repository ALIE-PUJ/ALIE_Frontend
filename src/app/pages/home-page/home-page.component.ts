import { Component } from '@angular/core';
import { DefaultFooterComponent } from '../../layout/default-footer/default-footer.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [DefaultFooterComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {

}
