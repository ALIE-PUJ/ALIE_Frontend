import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Import RouterModule

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
  @Input() userRole: string = 'Admin';
  @Input() userId: string = '12345';
  @Input() userName: string = 'XXX';
  @Input() userEmail: string = 'XXX@gmail.com';
  isCollapsed = false;

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
    // Recuperar el rol activo del usuario que inicio sesion, desde localStorage
    const storedActiveRole = localStorage.getItem('ActiveRole');
    this.userRole = storedActiveRole ? storedActiveRole : 'Student'; // Estudiante por defecto
    console.log("[SIDEBAR]: Active Role = ", this.userRole);
  }

  // Id y nombre de usuario
  getUserData(): void {
    // Recuperar el id activo del usuario que inicio sesion, desde localStorage
    const storedActiveUserId = localStorage.getItem('ActiveUserId');
    this.userId = storedActiveUserId ? storedActiveUserId : '12345'; // Estudiante por defecto
    console.log("[SIDEBAR]: Active User Id = ", this.userId);

    // Get user name from DB
    const storedActiveUserName = localStorage.getItem('ActiveUserName');
    this.userName = storedActiveUserName ? storedActiveUserName : 'Usuario XXX'; // Estudiante por defecto
    console.log("[SIDEBAR]: Active User Name = ", this.userName);

    // Get user email from DB
    const storedActiveUserEmail = localStorage.getItem('ActiveUserEmail');
    this.userEmail = storedActiveUserEmail ? storedActiveUserEmail : 'XXX@gmail.com'; // Correo por defecto
    console.log("[SIDEBAR]: Active User Email = ", this.userEmail);
  }

}
