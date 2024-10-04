import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = environment.services.files.submitUrl;
  private listFilesUrl = environment.services.files.listUrl;
  private deleteFileUrl = environment.services.files.deleteUrl;

  constructor(private http: HttpClient) {}

  uploadFile(file: File, category: string, auth_token: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('categoria', category);
    formData.append('auth_token', auth_token); 

    return this.http.post<any>(this.apiUrl, formData);
  }

  getFiles(auth_token: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers,
      params: {
        auth_token: auth_token 
      }
    };
    return this.http.get<any>(this.listFilesUrl, options);
  }

  deleteFile(fileName: string, auth_token: string): Observable<any> {
    const options = {
      params: {
        name: fileName,
        auth_token: auth_token 
      }
    };
    return this.http.delete<any>(this.deleteFileUrl, options);
  }

  viewFile(file: any, auth_token: string) {
    const fileUrl = `http://localhost:5000/files/view?name=${encodeURIComponent(file.name)}&auth_token=${auth_token}`; 
    window.open(fileUrl, '_blank');
  }
}
