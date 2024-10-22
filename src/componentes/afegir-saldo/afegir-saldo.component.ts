import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-afegir-saldo',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './afegir-saldo.component.html',
  styleUrls: ['./afegir-saldo.component.css'],
})
export class AfegirSaldoComponent {
  saldoForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.saldoForm = this.fb.group({
      uid: [null, [Validators.required, Validators.min(1001), Validators.max(1050)]],
      saldo: [null, [Validators.required, Validators.min(0)]], // Ensure saldo is non-negative
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.saldoForm.valid) {
      const { uid, saldo } = this.saldoForm.value;
      const uidControl = this.saldoForm.get('uid');

      // Check if there are any validation errors on uid
      if (uidControl && (uidControl.errors?.['min'] || uidControl.errors?.['max'])) {
        alert('User ID must be between 1001 and 1050.');
        console.log('Form is invalid due to UID constraints');
        return; // Exit the function if the validation fails
      }

      this.updateSaldo(uid, saldo);
      this.saldoForm.reset();
    } else {
      console.log('Form is invalid');
    }
  }

  updateSaldo(uid: number, saldo: number) {
    const saldoData = { uid, saldo };
    this.http.post('http://localhost:3080/update-saldo', saldoData).subscribe(
      response => {
        console.log('Saldo updated successfully!', response);
      },
      error => {
        console.error('Error updating saldo', error);
      }
    );
  }
}
