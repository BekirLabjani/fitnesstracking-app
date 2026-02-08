import { CommonModule } from '@angular/common';
import { Component, Input ,Output, EventEmitter } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { USERS, UserProfile } from '../../data/users.data';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(private router: Router) {}
 isMenuOpen = false;
  // wenn es Close Sein soll
@Output() toggleProfile = new EventEmitter<void>();
  user: UserProfile = USERS['uid_bekir_001'];

openSheet() {
  this.toggleProfile.emit();
  
}
 getInitiales(name: string) {
    if (!name) return '';

    const init = name.trim().split(' '); // macht aus " Bekir Labjani " => ["Bekir" , "Labjani"]
    if (init.length === 1) {
      return init[0].charAt(0).toUpperCase();
    }
    return (init[0].charAt(0) + init[1].charAt(0)).toUpperCase();
  }
}
