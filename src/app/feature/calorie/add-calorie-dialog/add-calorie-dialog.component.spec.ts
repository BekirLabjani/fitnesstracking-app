import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { TEST_PROVIDERS } from '../../../../testing/test-providers';

import { AddCalorieDialogComponent } from './add-calorie-dialog.component';

describe('AddCalorieDialogComponent', () => {
  let component: AddCalorieDialogComponent;
  let fixture: ComponentFixture<AddCalorieDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCalorieDialogComponent],
      providers: [TEST_PROVIDERS, { provide: MatDialogRef, useValue: { close: () => {} } }],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCalorieDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rejects saving without a kcal value', async () => {
    component.kcal = null;
    await component.save();
    expect(component.error).toBeTruthy();
  });

  it('toggles the macros section', () => {
    expect(component.showMacros).toBeFalse();
    component.toggleMacros();
    expect(component.showMacros).toBeTrue();
  });
});
