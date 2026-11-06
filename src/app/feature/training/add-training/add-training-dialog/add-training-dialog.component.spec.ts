import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { TEST_PROVIDERS } from '../../../../../testing/test-providers';

import { AddTrainingDialogComponent } from './add-training-dialog.component';

describe('AddTrainingDialogComponent', () => {
  let component: AddTrainingDialogComponent;
  let fixture: ComponentFixture<AddTrainingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTrainingDialogComponent],
      providers: [
        TEST_PROVIDERS,
        { provide: MatDialogRef, useValue: { close: () => {} } },
      ],
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
