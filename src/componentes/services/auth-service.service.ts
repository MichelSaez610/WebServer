import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private apiUrl = 'http://localhost:3080/login';

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<any> {
    return this.http.post(this.apiUrl, credentials);
  }
}