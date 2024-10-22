import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfegirClientComponent } from './afegir-client.component';

describe('PaginaInicioComponent', () => {
  let component: AfegirClientComponent;
  let fixture: ComponentFixture<AfegirClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfegirClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfegirClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
