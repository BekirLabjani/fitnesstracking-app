import { Component } from '@angular/core';
import { TrainingNavBarComponent } from './training-nav-bar/training-nav-bar.component';
import { TrainingHeaderComponent } from './training-header/training-header.component';
import { NavBottomComponent } from '../../shared/nav-bottom/nav-bottom.component';
import { CommonModule } from '@angular/common';
import { TrainingStrengthComponent } from './training-strength/training-strength.component';
import { TrainingStatsComponent } from './training-stats/training-stats.component';
import { TrainingCardioComponent } from './training-cardio/training-cardio.component';
import { TrainingBodyComponent } from './training-body/training-body.component';

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [
    TrainingNavBarComponent,
    TrainingHeaderComponent,
    NavBottomComponent,
    CommonModule,
    TrainingStrengthComponent,
    TrainingStatsComponent,
    TrainingCardioComponent,
    TrainingBodyComponent,
  ],
  templateUrl: './training.component.html',
  styleUrl: './training.component.scss',
})
export class TrainingComponent {
  activeTab: 'strength' | 'cardio' | 'body' | 'stats' = 'strength';


  isMenuOpen = false;
  onMenuToggle(isOpen: boolean) {
    this.isMenuOpen = isOpen;
  }


onTabChange(tab: 'strength' | 'cardio' | 'body' | 'stats') {
  this.activeTab = tab;
}

ngOnInit() {
  console.log('Nav activeTab:', this.activeTab);
}


}
