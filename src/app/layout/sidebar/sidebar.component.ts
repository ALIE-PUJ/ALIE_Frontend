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
  isCollapsed = false;

  // Inicializacion
  ngOnInit() {
    this.verificarAcceso()
  }


  // Funciones auxiliares

  // Comprimir o expandir la sidebar
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  // Control de acceso
  verificarAcceso(): void {
    // Recuperar el rol activo del usuario que inicio sesion, desde localStorage
    const storedActiveRole = localStorage.getItem('ActiveRole');
    this.userRole = storedActiveRole ? storedActiveRole : 'Student'; // Estudiante por defecto
    console.log("[SIDEBAR]: Active Role = ", this.userRole);
  }

}
