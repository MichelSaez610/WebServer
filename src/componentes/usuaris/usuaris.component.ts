import { Component, OnDestroy, OnInit } from '@angular/core';
import { ServiceService } from '../services/service.service';
import { NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-usuaris',
  standalone: true,
  imports: [CommonModule, NgFor],
  templateUrl: './usuaris.component.html',
  styleUrl: './usuaris.component.css'
})
export class UsuarisComponent implements OnInit, OnDestroy {
  public rows: any[] = [];
  private reloadTimeout: any; // Store the timeout ID

  constructor(private service: ServiceService, private http: HttpClient) {}

  ngOnInit(): void {
    this.reloadTimeout = setTimeout(() => {
      location.reload();
    }, 60000);

    this.service.getUserData().subscribe(
      (data) => {
        this.rows = data;
      },
      (error) => {
        console.error('Error loading user data', error);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.reloadTimeout) {
      clearTimeout(this.reloadTimeout); // Stop the timeout if the component is destroyed
    }
  }

  reloadTable() {
    location.reload();
  }
}
