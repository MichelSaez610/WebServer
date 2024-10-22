import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServiceService } from '../services/service.service';

@Component({
  selector: 'app-afegir-client',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './afegir-client.component.html',
  styleUrl: './afegir-client.component.css'
})
export class AfegirClientComponent {
  receptionForm: FormGroup;


  constructor(private fb: FormBuilder, private service: ServiceService) {
    this.receptionForm = this.fb.group({
      uid: ['', Validators.required],
      nom: ['', Validators.required],
      primerCognom: ['', Validators.required],
      segonCognom: ['', Validators.required],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}[A-Z]$')]],
      saldo: ['', Validators.required],
      tipus: ['', Validators.required],
      telefon: ['', [Validators.required, Validators.pattern('^[0-9]*$')]]
    });
  }

  onSubmit() {
    if (this.receptionForm.valid) {
      console.log(this.receptionForm.value);
      this.service.guardarDades(
        this.receptionForm.value.uid,
        this.receptionForm.value.nom,
        this.receptionForm.value.primerCognom,
        this.receptionForm.value.segonCognom,
        this.receptionForm.value.dni,
        this.receptionForm.value.saldo,
        this.receptionForm.value.tipus,
        this.receptionForm.value.telefon,
      );
      this.receptionForm.reset();
    } else {
      const uidControl = this.receptionForm.get('uid');
      if (uidControl && (uidControl.errors?.['min'] || uidControl.errors?.['max'])) {
        alert('User ID must be between 1001 and 1050.');
      }
      console.log('Form is invalid');
    }
  }
}

