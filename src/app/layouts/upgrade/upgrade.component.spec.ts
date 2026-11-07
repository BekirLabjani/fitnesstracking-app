import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TEST_PROVIDERS } from '../../../testing/test-providers';

import { UpgradeComponent } from './upgrade.component';

describe('UpgradeComponent', () => {
  let component: UpgradeComponent;
  let fixture: ComponentFixture<UpgradeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpgradeComponent],
      providers: [TEST_PROVIDERS]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpgradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
