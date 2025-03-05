import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfegirSaldoComponent } from './afegir-saldo.component';

describe('AfegirSaldoComponent', () => {
  let component: AfegirSaldoComponent;
  let fixture: ComponentFixture<AfegirSaldoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfegirSaldoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfegirSaldoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
