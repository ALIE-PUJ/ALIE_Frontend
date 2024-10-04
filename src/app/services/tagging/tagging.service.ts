import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaggingService {

  private apiUrl = environment.services.tagging.apiUrl; // Flask API URL

  constructor(private http: HttpClient) {}

  // Function to send data to Flask API
  tagMessage(auth_token: string, user_message: string, agent_message: string, sentiment_tag: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    const body = {
      auth_token: auth_token,
      user_message: user_message,
      agent_message: agent_message,
      sentiment_tag: sentiment_tag
    };

    console.log("Tagging requested. Tagging service body to send: ", body);

    return this.http.post<any>(this.apiUrl, body, { headers });
  }

}
