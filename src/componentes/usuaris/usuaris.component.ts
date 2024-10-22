import { Component } from '@angular/core';
import { ServiceService } from '../services/service.service';
import { NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuaris',
  standalone: true,
  imports: [CommonModule, NgFor],
  templateUrl: './usuaris.component.html',
  styleUrl: './usuaris.component.css'
})
export class UsuarisComponent {
  public rows: any[] = [];

  constructor(private service: ServiceService) {}

  ngOnInit(): void {
    this.service.getUserData().subscribe((data) => {
      this.rows = data;
    })
  }

}
