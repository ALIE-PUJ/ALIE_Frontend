import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = process.env['ALIE_URL'] ?? 'http://localhost:2001';

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

        if (this.token) {
          localStorage.setItem('token', this.token);
        }

        return res;
      })
    );
  }
}
