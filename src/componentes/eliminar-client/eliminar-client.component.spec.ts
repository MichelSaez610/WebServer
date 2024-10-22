import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliminarClientComponent } from './eliminar-client.component';

describe('EliminarClientComponent', () => {
  let component: EliminarClientComponent;
  let fixture: ComponentFixture<EliminarClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EliminarClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EliminarClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
