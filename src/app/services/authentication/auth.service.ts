import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { User } from '../../model/User';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.services.auth.apiUrl;

  private user: User | null = null;
  private token: string | null = null;

  constructor(private http: HttpClient) { }

  login(email: string, password: string) {
    return this.http.post(
      `${this.apiUrl}/login`,
      {
        email,
        contrasena: password
      }
    ).pipe(
      map((res: any) => {
        this.token = res['token'];
        this.user = res['user'];

        if (this.token) {
          localStorage.setItem('token', this.token);
        }

        return res;
      })
    );
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
  }

  getUser() {
    return this.user;
  }
}
