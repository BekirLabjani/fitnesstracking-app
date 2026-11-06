import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { doc, onSnapshot } from 'firebase/firestore';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private fireAuth = inject(Auth);
  private db = inject(Firestore);
  private unsub?: () => void;

  @Output() toggleProfile = new EventEmitter<void>();

  today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
  displayName = '';
  photoBase64 = '';

  ngOnInit() {
    const u = this.fireAuth.currentUser;
    this.displayName = u?.displayName ?? 'User';
    if (u) {
      this.unsub = onSnapshot(doc(this.db, 'userProfiles', u.uid), snap => {
        this.photoBase64 = snap.data()?.['photoBase64'] ?? '';
      });
    }
  }

  ngOnDestroy() { this.unsub?.(); }

  openSheet() { this.toggleProfile.emit(); }

  get initials(): string {
    return this.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
}
