import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceService } from '../services/service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-eliminar-client',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './eliminar-client.component.html',
  styleUrl: './eliminar-client.component.css'
})
export class EliminarClientComponent {
  deleteForm: FormGroup;

  constructor(private fb: FormBuilder, private service: ServiceService) {
    this.deleteForm = this.fb.group({
      uid: [null, [Validators.required, Validators.min(1001), Validators.max(1050)]],
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.deleteForm.valid) {
      const uid = this.deleteForm.value.uid;
      const uidControl = this.deleteForm.get('uid');

      // Check if there are any validation errors on uid
      if (uidControl && (uidControl.errors?.['min'] || uidControl.errors?.['max'])) {
        alert('User ID must be between 1001 and 1050.');
        console.log('Form is invalid due to UID constraints');
        return; // Exit the function if the validation fails
      }

      this.service.resetUser(uid).subscribe(response => {
        console.log('User reset to default values', response);
      });
      this.deleteForm.reset();
    } else {
      console.log('Form is invalid');
    }
  }
}
