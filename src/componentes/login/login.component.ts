import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthServiceService } from '../services/auth-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: AuthServiceService, private router: Router) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      usuari: ['', Validators.required],
      contrasenya: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      console.log("Contraseña enviada al backend:", credentials.contrasenya);
  
      this.authService.login(credentials).subscribe(response => {
        console.log('Login exitoso', response);
        this.router.navigate(['/Usuaris']).then(success => {
          if (success) {
            console.log("Navegación exitosa");
          } else {
            console.log("Fallo en la navegación");
          }
        });
      }, error => {
        console.error('Error en login', error);
        this.errorMessage = 'Usuario o contraseña incorrectos. Por favor, inténtelo de nuevo.';
      });
    }
  }
}

