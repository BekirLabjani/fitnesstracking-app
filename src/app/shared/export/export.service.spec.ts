import { TestBed } from '@angular/core/testing';
import { TEST_PROVIDERS } from '../../../testing/test-providers';

import { ExportService } from './export.service';
import { TrainingEntry } from '../../layouts/training/service/training.service';

describe('ExportService', () => {
  let service: ExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TEST_PROVIDERS] });
    service = TestBed.inject(ExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('triggers a CSV download without throwing for an empty list', () => {
    expect(() => service.exportTrainingsCsv([])).not.toThrow();
  });

  it('triggers a CSV download without throwing for populated entries', () => {
    const entries: TrainingEntry[] = [
      { userId: 'u1', type: 'strength', exerciseId: 'bench_press', date: '2026-01-01', weight: 80, reps: 8, sets: 3 },
      { userId: 'u1', type: 'body', date: '2026-01-02', bodyWeight: 82.5 },
    ];
    expect(() => service.exportTrainingsCsv(entries)).not.toThrow();
  });
});
