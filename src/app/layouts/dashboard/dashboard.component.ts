import { routes } from '../../app.routes';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../../shared/header/header.component";
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { NavBottomComponent } from '../../shared/nav-bottom/nav-bottom.component';
import { ProfileComponent } from "../profile/profile.component";


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, HeaderComponent, MatCardModule, MatButtonModule, NavBottomComponent, ProfileComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
isSheetOpen = false;

toggleProfileSheet() {
  this.isSheetOpen = !this.isSheetOpen;
}
}
