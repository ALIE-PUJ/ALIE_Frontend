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

  uploadFile(file: File, category: string): Observable<any> {

    let submitUrl = this.apiUrl + '/submit';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('categoria', category);

    return this.http.post<any>(submitUrl, formData);
  }

  getFiles(): Observable<any> {

    let listFilesUrl = this.apiUrl + '/list';

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers,
      params: {
      }
    };
    return this.http.get<any>(listFilesUrl, options);
  }

  deleteFile(fileName: string): Observable<any> {

    let deleteFileUrl = this.apiUrl + '/delete';

    const options = {
      params: {
        name: fileName,
      }
    };
    return this.http.delete<any>(deleteFileUrl, options);
  }

  viewFile(file: any) {

    let viewFileUrl = this.apiUrl + '/view';

    // Use the viewFileUrl to open the file in a new tab
    const fileUrl = `${viewFileUrl}?name=${encodeURIComponent(file.name)}`;
    window.open(fileUrl, '_blank');
  }

}
