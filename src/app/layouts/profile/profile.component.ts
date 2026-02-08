import { Component, Input, Output, EventEmitter  } from '@angular/core';
import { USERS, UserProfile } from '../../data/users.data';
import { HeaderComponent } from '../../shared/header/header.component';
import { NavBottomComponent } from '../../shared/nav-bottom/nav-bottom.component';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "./navbar/navbar.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [HeaderComponent, NavBottomComponent, CommonModule, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  user: UserProfile = USERS['uid_bekir_001'];

  getInitiales(name: string) {
    if (!name) return '';

    const init = name.trim().split(' '); // macht aus " Bekir Labjani " => ["Bekir" , "Labjani"]
    if (init.length === 1) {
      return init[0].charAt(0).toUpperCase();
    }
    return (init[0].charAt(0) + init[1].charAt(0)).toUpperCase();
  }
}
