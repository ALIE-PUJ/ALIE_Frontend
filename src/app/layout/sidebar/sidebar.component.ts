import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Import RouterModule
import { AuthService } from '../../services/authentication/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, RouterModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  // Sidebar Variables
  // Get user role from input. Can be Student or Admin
  @Input() userRole: string = 'Testing';
  @Input() userId: string = '12345';
  @Input() userName: string = 'XXX';
  @Input() userEmail: string = 'XXX@gmail.com';
  isCollapsed = false;

  constructor(private authService: AuthService, private router: Router) { }

  // Inicializacion
  ngOnInit() {
    this.verifyAccess()
    this.getUserData()
  }


  // Funciones auxiliares

  // Comprimir o expandir la sidebar
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  // Control de acceso
  verifyAccess(): void {
    if (typeof localStorage !== 'undefined') {
      // Recuperar el rol activo del usuario que inició sesión, desde localStorage
      const storedActiveRole = localStorage.getItem('ActiveRole');

      if (storedActiveRole) {
        this.userRole = storedActiveRole;
      } else if (environment.ui.enableNoLoginAccess) {
        this.userRole = 'Testing';
      } else {
        this.router.navigate(['/login']);
      }

      console.log("[SIDEBAR]: Active Role = ", this.userRole);
    } else {
      // Manejar el caso cuando localStorage no está disponible (por ejemplo, en el servidor)
      console.log("[SIDEBAR]: localStorage is not available.");

      if (environment.ui.enableNoLoginAccess) {
        this.userRole = 'Testing';
      }
    }
  }


  // Id y nombre de usuario
  getUserData(): void {
    if (typeof localStorage !== 'undefined') {
      // Recuperar el id activo del usuario que inició sesión, desde localStorage
      const storedActiveUserId = localStorage.getItem('ActiveUserId');
      this.userId = storedActiveUserId ? storedActiveUserId : '12345'; // ID por defecto
      console.log("[SIDEBAR]: Active User Id = ", this.userId);

      // Recuperar el nombre del usuario
      const storedActiveUserName = localStorage.getItem('ActiveUserName');
      this.userName = storedActiveUserName ? storedActiveUserName : 'Usuario XXX'; // Nombre por defecto
      console.log("[SIDEBAR]: Active User Name = ", this.userName);

      // Recuperar el correo electrónico del usuario
      const storedActiveUserEmail = localStorage.getItem('ActiveUserEmail');
      this.userEmail = storedActiveUserEmail ? storedActiveUserEmail : 'XXX@gmail.com'; // Correo por defecto
      console.log("[SIDEBAR]: Active User Email = ", this.userEmail);
    } else {
      // Manejar el caso cuando localStorage no está disponible (por ejemplo, en el servidor)
      console.log("[SIDEBAR]: localStorage is not available. Using default user data.");
      this.userId = '12345';
      this.userName = 'Usuario XXX';
      this.userEmail = 'XXX@gmail.com';
    }
  }

  handleLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
