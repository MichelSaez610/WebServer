import { Component, Injectable } from '@angular/core';
import {HttpClient, HttpClientModule} from "@angular/common/http";
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

@Component({
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: ``
})

export class ServiceService {

  private apiUrl = 'http://localhost:3080';

  constructor(private http: HttpClient) { }

  guardarDades(uid:any ,nom:any, primerCognom:any, segonCognom:any, dni:any, saldo:any, tipus:any, telefon:any) {
    let clientData = {
      uid: uid,
      name: nom,
      fSurname: primerCognom,
      sSurname: segonCognom,
      dni: dni,
      saldo: saldo,
      type: tipus,
      tel: telefon
    }

    this.http.post(`${this.apiUrl}/cambiar-dades`, clientData).subscribe()
  }

  resetUser(uid: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-user`, { uid });
  }

  getUserData(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/userData`);
  }
}
