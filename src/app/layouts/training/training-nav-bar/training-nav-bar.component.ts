import { Component,EventEmitter, Input,Output } from '@angular/core';

@Component({
  selector: 'app-training-nav-bar',
  standalone: true,
  imports: [],
  templateUrl: './training-nav-bar.component.html',
  styleUrl: './training-nav-bar.component.scss'
})
export class TrainingNavBarComponent {
@Input() activeTab!: 'strength' | 'cardio' | 'body' | 'stats' | 'pro';

@Output() tabChange = new EventEmitter<'strength' | 'cardio' | 'body' | 'stats' | 'pro'>();

selectTab(tab: 'strength' | 'cardio' | 'body' | 'stats' | 'pro') {
  this.tabChange.emit(tab);
}
}
