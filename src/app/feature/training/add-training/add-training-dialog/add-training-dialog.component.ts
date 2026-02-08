import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import { EXERCISES , ExerciseId } from '../../../../data/exercise.data';


@Component({
  selector: 'app-add-training-dialog',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, CommonModule, MatSelectModule],
  templateUrl: './add-training-dialog.component.html',
  styleUrl: './add-training-dialog.component.scss'
})
export class AddTrainingDialogComponent {

  openDialog(){

  }


exerciseOptions = Object.entries(EXERCISES).map(([id, ex]) => ({
  id: id as ExerciseId,
  label: ex.name
}));

selectedExerciseId: ExerciseId | null = null;

addNewUnit(){
  
}
}
