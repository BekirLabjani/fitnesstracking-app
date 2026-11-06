import { Component, Input, Output, EventEmitter, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../auth/services/auth.service.service';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { doc, setDoc, deleteField, onSnapshot } from 'firebase/firestore';
import { Storage } from '@angular/fire/storage';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();

  private authService = inject(AuthServiceService);
  private fireAuth = inject(Auth);
  private router = inject(Router);
  private db = inject(Firestore);
  private storage = inject(Storage);
  private profileUnsub?: () => void;

  displayName = '';
  photoUrl = '';
  uploading = false;
  uploadError = '';

  ngOnInit() {
    const u = this.fireAuth.currentUser;
    this.displayName = u?.displayName ?? 'Unbekannt';
    if (u) {
      this.profileUnsub = onSnapshot(doc(this.db, 'userProfiles', u.uid), snap => {
        const data = snap.data();
        // photoBase64 is a legacy field from before avatars moved to Firebase
        // Storage — kept as a fallback so existing users don't lose their photo.
        this.photoUrl = data?.['photoUrl'] ?? data?.['photoBase64'] ?? '';
      });
    }
  }

  ngOnDestroy() { this.profileUnsub?.(); }

  onAvatarClick(input: HTMLInputElement) {
    this.uploadError = '';
    input.click();
  }

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.uploadError = 'Bild zu groß. Max. 5 MB.';
      return;
    }

    this.uploading = true;
    this.uploadError = '';

    try {
      const uid = this.fireAuth.currentUser?.uid;
      if (!uid) throw new Error('Nicht eingeloggt');

      const blob = await this.resizeImage(file, 200, 200);
      const avatarRef = ref(this.storage, `avatars/${uid}`);
      await uploadBytes(avatarRef, blob, { contentType: 'image/jpeg' });
      const url = await getDownloadURL(avatarRef);

      // Clear the legacy base64 field so old profiles stop carrying a large
      // image blob on every userProfiles read once they've re-uploaded.
      await setDoc(doc(this.db, 'userProfiles', uid), { photoUrl: url, photoBase64: deleteField() }, { merge: true });
      this.photoUrl = url;
    } catch {
      this.uploadError = 'Bild konnte nicht gespeichert werden.';
    } finally {
      this.uploading = false;
    }
  }

  private resizeImage(file: File, maxW: number, maxH: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const scale = Math.min(maxW / img.width, maxH / img.height);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        canvas.toBlob(
          blob => blob ? resolve(blob) : reject(new Error('toBlob failed')),
          'image/jpeg',
          0.85
        );
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  async onLogout() {
    await this.authService.signOut();
    this.close.emit();
    this.router.navigate(['/login']);
  }
}
