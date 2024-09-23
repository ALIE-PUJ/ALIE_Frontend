import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private apiUrl = 'http://localhost:5000';  

  constructor(private http: HttpClient) {}

  guardarChat(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/chat/guardar`, payload);
  }


  getChat(memory_key: string, auth_token: string): Observable<any> {
    const payload = { auth_token, memory_key };
    return this.http.post(`${this.apiUrl}/chat/get`, payload);
  }


  listChatsByUser(user_id: string, auth_token: string): Observable<any> {
    const payload = { auth_token, user_id };
    return this.http.post(`${this.apiUrl}/chat/list`, payload);
  }


  listAllChats(auth_token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/chat/list_all`, { auth_token });
  }


  deleteChat(memory_key: string, auth_token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/chat/delete`, { memory_key, auth_token });
  }


getAgentResponse(memory_key: string, auth_token: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/chat/respuesta_agente`, { memory_key, auth_token });
}


obtenerRespuestaAgente(auth_token: string, memory_key: string): Observable<any> {
  return of({ mensaje: 'Gracias por tu mensaje, estamos revisando tu solicitud.' });
}


archiveChat(payload: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/chat/archive`, payload);
}
}
