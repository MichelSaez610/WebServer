import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {RouterLink, RouterLinkActive, RouterModule, Router, NavigationEnd} from "@angular/router"

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  showNavbar = true;

  constructor(private router: Router) {}

  ngOnInit() {
    // Check the current route on initial load
    this.showNavbar = this.router.url !== '/';

    // Subscribe to route changes to hide or show the navbar
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showNavbar = event.url !== '/'; // Hide navbar on login page
      }
    });
  }
}
