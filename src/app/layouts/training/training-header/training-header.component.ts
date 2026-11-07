import { Component, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { UserProfileService } from '../../../shared/services/user-profile.service';
import { PremiumService } from '../../../shared/premium/premium.service';

@Component({
  selector: 'app-training-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './training-header.component.html',
  styleUrl: './training-header.component.scss',
})
export class TrainingHeaderComponent implements OnInit, OnDestroy {
  @Output() menuToggle = new EventEmitter<boolean>();

  private auth = inject(Auth);
  private userProfileService = inject(UserProfileService);
  premium = inject(PremiumService);

  private sub?: Subscription;

  isDrawerOpen = false;
  displayName = '';
  photoUrl = '';

  ngOnInit() {
    this.displayName = this.auth.currentUser?.displayName ?? 'User';
    this.sub = this.userProfileService.profile$.subscribe(profile => {
      if (profile.displayName) this.displayName = profile.displayName;
      this.photoUrl = profile.photoUrl ?? '';
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  get initials(): string {
    return this.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
    this.menuToggle.emit(this.isDrawerOpen);
  }

  closeDrawer() {
    this.isDrawerOpen = false;
    this.menuToggle.emit(false);
  }
}
