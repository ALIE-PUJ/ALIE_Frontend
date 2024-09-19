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
  authToken = 'XXX';

  constructor(private fileService: FileService) {}

  ngOnInit(): void {
    this.loadFiles();
  }

  loadFiles(): void {
    this.fileService.getFiles(this.authToken).subscribe({
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

  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput.click();
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileService.uploadFile(file, this.selectedCategory, this.authToken).subscribe(response => {
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

  onDragOver(event: any) {
    event.preventDefault();
  }

  onFileDrop(event: any) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      this.fileService.uploadFile(file, this.selectedCategory, this.authToken).subscribe(response => {
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

  toggleOptions(file: any) {
    file.showOptions = !file.showOptions;
  }

  viewFile(file: any) {
    this.fileService.viewFile(file, this.authToken);
  }

  deleteFile(file: any) {
    this.fileService.deleteFile(file.name, this.authToken).subscribe({
      next: (response) => {
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
