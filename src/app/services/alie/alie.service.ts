import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlieService {

  private apiUrl = environment.services.alie.apiUrl; // Flask API URL

  constructor(private http: HttpClient) {}

  // Function to send data to Flask API
  get_response_from_model(input: string, priority: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    const body = {
      input: input,
      priority: priority,
    };

    console.log("Message post sent. Body: ", body);

    return this.http.post<any>(this.apiUrl, body, { headers });
  }

}
