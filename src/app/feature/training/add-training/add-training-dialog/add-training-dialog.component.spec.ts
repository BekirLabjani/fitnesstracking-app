import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTrainingDialogComponent } from './add-training-dialog.component';

describe('AddTrainingDialogComponent', () => {
  let component: AddTrainingDialogComponent;
  let fixture: ComponentFixture<AddTrainingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTrainingDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddTrainingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
