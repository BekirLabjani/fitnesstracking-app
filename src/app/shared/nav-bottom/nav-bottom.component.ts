import { Component, inject } from '@angular/core';
import { AddTrainingDialogComponent } from '../../feature/training/add-training/add-training-dialog/add-training-dialog.component';

import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { AddUnitDialogComponent } from '../../feature/training/add-training/add-unit-dialog/add-unit-dialog.component';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav-bottom',
  standalone: true,
  imports: [CommonModule,RouterLink, RouterLinkActive],
  templateUrl: './nav-bottom.component.html',
  styleUrl: './nav-bottom.component.scss',
})
export class NavBottomComponent {
  dialog = inject(MatDialog);
  pressTimer: any;
  isLongPress = false;
showAddMenu = false;
  isTrainingModalOpen = true;

  addTraining() {
    this.isTrainingModalOpen = true; // Fenster öffnen
  }

  closeTraining() {
    this.isTrainingModalOpen = false; // Fenster schließen
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddTrainingDialogComponent, {
      height: '500px',
      width: '600px',
    });
  }

  openAddMenu() {
    const dialogRef = this.dialog.open(AddUnitDialogComponent, {
      height: '500px',
      width: '600px',
    });
  }

  startPress(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.isLongPress = false;

    this.pressTimer = setTimeout(() => {
      this.isLongPress = true;
      this.showAddMenu = true;
    }, 500);
  }

  endPress(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    clearTimeout(this.pressTimer);

    if (!this.isLongPress) {
      this.openDialog();
    }
  }
  closeAddMenu() {
    this.showAddMenu = false;
  }
  openAddUnitDialog() {
    this.openAddMenu();
  }
  openTrainingPage(){

  }
}
