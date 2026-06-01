import { Component, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-training-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './training-header.component.html',
  styleUrl: './training-header.component.scss',
})
export class TrainingHeaderComponent {
  @Output() menuToggle = new EventEmitter<boolean>();

  isDrawerOpen = false;

  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
    this.menuToggle.emit(this.isDrawerOpen);
  }

  closeDrawer() {
    this.isDrawerOpen = false;
    this.menuToggle.emit(false);
  }
}
