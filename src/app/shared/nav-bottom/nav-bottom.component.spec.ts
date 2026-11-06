import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TEST_PROVIDERS } from '../../../testing/test-providers';

import { NavBottomComponent } from './nav-bottom.component';

describe('NavBottomComponent', () => {
  let component: NavBottomComponent;
  let fixture: ComponentFixture<NavBottomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavBottomComponent],
      providers: [TEST_PROVIDERS]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NavBottomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
