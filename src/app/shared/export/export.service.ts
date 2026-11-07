import { Injectable } from '@angular/core';
import { TrainingEntry } from '../../layouts/training/service/training.service';
import { resolveExerciseName } from '../../data/exercise.data';
import { CustomExercise } from '../../data/custom-exercise.service';

const COLUMNS = ['date', 'type', 'exercise', 'weight', 'reps', 'sets', 'duration', 'distance', 'bodyWeight', 'notes'];

@Injectable({ providedIn: 'root' })
export class ExportService {
  exportTrainingsCsv(entries: TrainingEntry[], customExercises: CustomExercise[] = []) {
    const rows = entries.map(e => [
      e.date,
      e.type,
      e.type === 'body' ? '' : resolveExerciseName(e.exerciseId ?? '', customExercises),
      e.weight ?? '',
      e.reps ?? '',
      e.sets ?? '',
      e.duration ?? '',
      e.distance ?? '',
      e.bodyWeight ?? '',
      e.notes ?? '',
    ]);
    const csv = [COLUMNS, ...rows]
      .map(row => row.map(cell => this.escapeCsvCell(String(cell))).join(','))
      .join('\r\n');

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trainingsdaten-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private escapeCsvCell(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
  }
}
