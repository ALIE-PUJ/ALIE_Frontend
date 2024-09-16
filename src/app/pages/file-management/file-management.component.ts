import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';

@Component({
  selector: 'app-file-management',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule],
  templateUrl: './file-management.component.html',
  styleUrls: ['./file-management.component.scss']
})
export class FileManagementComponent {
  uploadedFiles: Array<{ name: string; category: string; showOptions: boolean }> = [];

  selectedCategory = 'Privado General';

  // Trigger the hidden file input
  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput.click();
  }

  // Handle file selection
  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFiles.push({ name: file.name, category: this.selectedCategory, showOptions: false });
    }
  }

  // Handle drag over event
  onDragOver(event: any) {
    event.preventDefault();
  }

  // Handle file drop
  onFileDrop(event: any) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      this.uploadedFiles.push({ name: file.name, category: this.selectedCategory, showOptions: false });
    }
  }

  // Toggle options visibility
  toggleOptions(file: any) {
    file.showOptions = !file.showOptions;
  }

  // File action methods
  viewFile(file: any) {
    // Placeholder logic to view the file (replace with your actual logic)
    alert(`Viewing file: ${file.name}`);
  }

  editFile(file: any) {
    // Placeholder logic to edit the file (replace with your actual logic)
    const newFileName = prompt(`Edit file name for: ${file.name}`, file.name);
    if (newFileName !== null && newFileName.trim() !== '') {
      file.name = newFileName;
    }
  }

  deleteFile(file: any) {
    const index = this.uploadedFiles.indexOf(file);
    if (index > -1) {
      this.uploadedFiles.splice(index, 1);
    }
  }
}
