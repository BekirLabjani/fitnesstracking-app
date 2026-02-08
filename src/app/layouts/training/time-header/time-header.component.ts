import { Component, EventEmitter , Input,Output } from '@angular/core';

@Component({
  selector: 'app-time-header',
  standalone: true,
  imports: [],
  templateUrl: './time-header.component.html',
  styleUrl: './time-header.component.scss'
})
export class TimeHeaderComponent {
 @Input() selectedPeriod: 'week' | 'month' | 'year' = 'week';

@Output() tabChange = new EventEmitter< 'week' | 'month' | 'year'>();


 selectTab(tab: 'week' | 'month' | 'year'){
  this.tabChange.emit(tab); 
 }

}
