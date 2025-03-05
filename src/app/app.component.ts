import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "../componentes/header/header.component";
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'LoxoneWebServer';

  constructor(private titleService: Title) { }

  ngOnInit() {
    // Set the default title for all pages
    this.titleService.setTitle(this.title);
  }
}
