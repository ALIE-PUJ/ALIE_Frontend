import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { FileService } from '../../services/files/file.service';

@Component({
  selector: 'app-file-management',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule],
  templateUrl: './file-management.component.html',
  styleUrls: ['./file-management.component.scss']
})
export class FileManagementComponent implements OnInit {
  uploadedFiles: Array<{ name: string; category: string; showOptions: boolean }> = [];
  selectedCategory = 'Privado General';

  constructor(private fileService: FileService) {} // Inyecta el servicio

  ngOnInit(): void {
    this.loadFiles();
  }

  // Cargar archivos desde el servidor
  loadFiles(): void {
    this.fileService.getFiles().subscribe({
      next: (response) => {
        if (response.success) {
          this.uploadedFiles = response.files;
        } else {
          console.error('Error al obtener los archivos', response.message);
        }
      },
      error: (err) => {
        console.error('Error en la carga de archivos', err);
      }
    });
  }

  // Activar el input de archivos oculto
  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput.click();
  }

  // Manejar la selección de archivos
  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileService.uploadFile(file, this.selectedCategory).subscribe(response => {
        if (response.success) {
          this.uploadedFiles.push({ name: file.name, category: this.selectedCategory, showOptions: false });
        } else {
          alert('Error al subir el archivo');
        }
      }, error => {
        console.error('Error en la carga de archivos', error);
        alert('Error al subir el archivo');
      });
    }
  }

  // Manejar el evento de arrastrar sobre el área
  onDragOver(event: any) {
    event.preventDefault();
  }

  // Manejar la caída de archivos
  onFileDrop(event: any) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      this.fileService.uploadFile(file, this.selectedCategory).subscribe(response => {
        if (response.success) {
          this.uploadedFiles.push({ name: file.name, category: this.selectedCategory, showOptions: false });
        } else {
          alert('Error al subir el archivo');
        }
      }, error => {
        console.error('Error en la carga de archivos', error);
        alert('Error al subir el archivo');
      });
    }
  }

  // Alternar la visibilidad de opciones
  toggleOptions(file: any) {
    file.showOptions = !file.showOptions;
  }

  // Método para ver el archivo
  viewFile(file: any) {
    this.fileService.viewFile(file); // Llamar a la función del servicio
  }

  // Método para eliminar el archivo
  deleteFile(file: any) {
    this.fileService.deleteFile(file.name).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        if (response.success) {
          const index = this.uploadedFiles.findIndex(f => f.name === file.name);
          if (index > -1) {
            this.uploadedFiles.splice(index, 1);
          }
        } else {
          alert('Error al eliminar el archivo');
        }
      },
      error: (err) => {
        console.error('Error en la eliminación del archivo', err);
        alert('Error al eliminar el archivo');
      }
    });
  }
}
