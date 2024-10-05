import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = environment.services.files.apiUrl;
  
  constructor(private http: HttpClient) {}

  uploadFile(file: File, category: string, auth_token: string): Observable<any> {

    let submitUrl = this.apiUrl + '/submit';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('categoria', category);
    formData.append('auth_token', auth_token); 

    return this.http.post<any>(submitUrl, formData);
  }

  getFiles(auth_token: string): Observable<any> {

    let listFilesUrl = this.apiUrl + '/list';

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers,
      params: {
        auth_token: auth_token 
      }
    };
    return this.http.get<any>(listFilesUrl, options);
  }

  deleteFile(fileName: string, auth_token: string): Observable<any> {

    let deleteFileUrl = this.apiUrl + '/delete';

    const options = {
      params: {
        name: fileName,
        auth_token: auth_token 
      }
    };
    return this.http.delete<any>(deleteFileUrl, options);
  }

  viewFile(file: any, auth_token: string) {

    let viewFileUrl = this.apiUrl + '/view';

    // Use the viewFileUrl to open the file in a new tab
    const fileUrl = `${viewFileUrl}?name=${encodeURIComponent(file.name)}&auth_token=${auth_token}`;
    window.open(fileUrl, '_blank');
  }

}
