import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-training-header',
  standalone: true,
  imports: [],
  templateUrl: './training-header.component.html',
  styleUrl: './training-header.component.scss'
})
export class TrainingHeaderComponent {
    // wenn es Close Sein soll 
    isMenuOpen = false;
    @Output() menuToggle = new EventEmitter<boolean>(); // ich sende den status des IsMenuOpen ( True/ False) 

  toggleMenu () {
      this.isMenuOpen = !this.isMenuOpen;
          this.menuToggle.emit(this.isMenuOpen);
      console.log(this.isMenuOpen);
      
  }

  openSettings(){
    this.isMenuOpen = false;
              this.menuToggle.emit(this.isMenuOpen);

  }
}
