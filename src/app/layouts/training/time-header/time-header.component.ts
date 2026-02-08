import { Component, EventEmitter , Input,Output } from '@angular/core';

@Component({
  selector: 'app-time-header',
  standalone: true,
  imports: [],
  templateUrl: './time-header.component.html',
  styleUrl: './time-header.component.scss'
})
export class TimeHeaderComponent {
 @Input() selectedPeriod: 'today' | 'week' | 'month' | 'year' = 'today';

@Output() tabChange = new EventEmitter<'today' | 'week' | 'month' | 'year'>();


 selectTab(tab: 'today' | 'week' | 'month' | 'year'){
  this.tabChange.emit(tab); 
 }

}
