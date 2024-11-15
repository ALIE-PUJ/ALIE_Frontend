import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private apiUrl = environment.services.chat.apiUrl;

  constructor(private http: HttpClient) { }

  guardarChat(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/guardar`, payload);
  }

  getChat(memory_key: string): Observable<any> {
    const payload = { memory_key };
    return this.http.post(`${this.apiUrl}/get`, payload);
  }

  listChatsByUser(user_id: string): Observable<any> {
    const payload = { user_id };
    return this.http.post(`${this.apiUrl}/list`, payload);
  }

  listAllChats(): Observable<any> {
    return this.http.post(`${this.apiUrl}/list_all`, { });
  }

  actualizarEstadoIntervenido(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/update_intervention`, payload);
  }

  deleteChat(memory_key: string) {
    const payload = {
      memory_key: memory_key
    };

    return this.http.post(`${this.apiUrl}/delete`, payload);
  }

  getAgentResponse(memory_key: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/respuesta_agente`, { memory_key });
  }


  obtenerRespuestaAgente(memory_key: string): Observable<any> {
    return of({ mensaje: 'Gracias por tu mensaje, estamos revisando tu solicitud.' });
  }


  archiveChat(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/archive`, payload);
  }

  getInterventionChats(): Observable<any> {
    const payload = { };
    return this.http.post(`${this.apiUrl}/list_intervention`, payload);
  }

  getInterventionStatus(memory_key: string): Observable<any> {
    const payload = { memory_key };
    return this.http.post(`${this.apiUrl}/intervention_status`, payload);
  }
  
}
