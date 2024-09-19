import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = 'http://localhost:5000/files/submit'; // Flask API URL
  private listFilesUrl = 'http://localhost:5000/files/list';
  private deleteFileUrl = 'http://localhost:5000/files/delete';

  constructor(private http: HttpClient) {}

  uploadFile(file: File, category: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('categoria', category);

    return this.http.post<any>(this.apiUrl, formData);
  }

  getFiles(): Observable<any> {
    return this.http.get<any>(this.listFilesUrl);
  }

  deleteFile(fileName: string): Observable<any> {
    const options = {
      params: {
        name: fileName
      }
    };
    return this.http.delete<any>(this.deleteFileUrl, options);
  }
  
  viewFile(file: any) {
    const fileUrl = `http://localhost:5000/files/view?name=${encodeURIComponent(file.name)}`;
    console.log("Abriendo archivo:", fileUrl);
    window.open(fileUrl, '_blank');
  }
  
  
}
