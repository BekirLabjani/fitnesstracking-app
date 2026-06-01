import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthServiceService } from '../../../auth/services/auth.service.service';
import { FriendsService, FriendConnection, FriendBestLift } from '../../../auth/services/friends.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private auth = inject(AuthServiceService);
  private friendsService = inject(FriendsService);
  private sub?: Subscription;

  // Panel-Steuerung
  activePanel: 'none' | 'editProfile' | 'security' | 'help' | 'friends' = 'none';

  // Profil bearbeiten
  newName = '';
  editSuccess = '';
  editError = '';

  // Sicherheit
  resetSent = false;
  securityError = '';

  // Freunde
  myCode = '';
  friendCode = '';
  friends: FriendConnection[] = [];
  selectedFriend: FriendConnection | null = null;
  friendLifts: FriendBestLift[] = [];
  friendError = '';
  friendSuccess = '';
  loadingLifts = false;

  ngOnInit() {
    this.myCode = this.friendsService.myInviteCode;
    this.sub = this.friendsService.getMyFriends().subscribe(f => this.friends = f);
    this.friendsService.saveMyProfile();
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  openPanel(panel: typeof this.activePanel) {
    this.activePanel = this.activePanel === panel ? 'none' : panel;
    this.editSuccess = this.editError = this.securityError = this.friendError = this.friendSuccess = '';
    if (panel === 'editProfile') {
      this.newName = this.auth.currentUser?.displayName ?? '';
    }
  }

  goToSettings() { this.router.navigate(['/settings']); }

  async saveName() {
    if (!this.newName.trim()) { this.editError = 'Name darf nicht leer sein.'; return; }
    try {
      await this.auth.updateDisplayName(this.newName.trim());
      await this.friendsService.saveMyProfile();
      this.editSuccess = 'Name erfolgreich geändert!';
      this.editError = '';
    } catch {
      this.editError = 'Fehler beim Speichern.';
    }
  }

  async sendReset() {
    const email = this.auth.currentUser?.email;
    if (!email) { this.securityError = 'Keine E-Mail-Adresse gefunden.'; return; }
    try {
      await this.auth.sendPasswordReset(email);
      this.resetSent = true;
    } catch {
      this.securityError = 'Fehler beim Senden.';
    }
  }

  copyCode() {
    navigator.clipboard.writeText(this.myCode);
    this.friendSuccess = 'Code kopiert!';
    setTimeout(() => this.friendSuccess = '', 2000);
  }

  async addFriend() {
    this.friendError = '';
    try {
      const name = await this.friendsService.addFriend(this.friendCode);
      this.friendSuccess = `${name} hinzugefügt!`;
      this.friendCode = '';
    } catch (e: any) {
      this.friendError = e.message;
    }
  }

  async showFriendLifts(friend: FriendConnection) {
    this.selectedFriend = friend;
    this.loadingLifts = true;
    this.friendLifts = await this.friendsService.getFriendBestLifts(friend.followedId);
    this.loadingLifts = false;
  }

  get myBestLifts(): { exerciseName: string; weight: number }[] {
    return this.friendLifts;
  }
}
