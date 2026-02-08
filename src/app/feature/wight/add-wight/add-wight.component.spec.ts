import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWightComponent } from './add-wight.component';

describe('AddWightComponent', () => {
  let component: AddWightComponent;
  let fixture: ComponentFixture<AddWightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddWightComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddWightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
