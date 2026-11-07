import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TrainingEntry } from '../../layouts/training/service/training.service';
import { resolveExerciseName } from '../../data/exercise.data';
import { CustomExercise } from '../../data/custom-exercise.service';

const COLUMNS = ['Datum', 'Art', 'Übung', 'Gewicht', 'Wdh.', 'Sätze', 'Dauer', 'Distanz', 'Körpergewicht', 'Notizen'];

@Injectable({ providedIn: 'root' })
export class ExportService {
  exportTrainingsPdf(entries: TrainingEntry[], customExercises: CustomExercise[] = []) {
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

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Trainingsdaten', 14, 16);
    doc.setFontSize(10);
    doc.text(`Erstellt am ${new Date().toLocaleDateString('de-DE')} · ${entries.length} Einträge`, 14, 22);

    autoTable(doc, {
      head: [COLUMNS],
      body: rows,
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`trainingsdaten-${new Date().toISOString().split('T')[0]}.pdf`);
  }
}
