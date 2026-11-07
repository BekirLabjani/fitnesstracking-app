import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TEST_PROVIDERS } from '../../../../testing/test-providers';

import { TemplatesComponent } from './templates.component';

describe('TemplatesComponent', () => {
  let component: TemplatesComponent;
  let fixture: ComponentFixture<TemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplatesComponent],
      providers: [TEST_PROVIDERS]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('lists all workout templates', () => {
    expect(component.templates.length).toBeGreaterThan(0);
  });
});
