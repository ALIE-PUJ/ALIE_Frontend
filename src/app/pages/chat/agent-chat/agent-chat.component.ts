import { Component } from '@angular/core';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';

@Component({
  selector: 'app-agent-chat',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './agent-chat.component.html',
  styleUrl: './agent-chat.component.scss'
})
export class AgentChatComponent {

}
