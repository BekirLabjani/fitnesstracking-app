import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { PremiumService } from '../../shared/premium/premium.service';

@Component({
  selector: 'app-upgrade',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './upgrade.component.html',
  styleUrl: './upgrade.component.scss',
})
export class UpgradeComponent {
  private auth = inject(Auth);
  premium = inject(PremiumService);

  get requestMailtoHref(): string {
    const email = this.auth.currentUser?.email ?? '';
    const subject = encodeURIComponent('Premium-Freischaltung anfragen');
    const body = encodeURIComponent(
      `Hallo,\n\nich möchte gerne Premium freischalten.\nMeine E-Mail: ${email}\n\nDanke!`
    );
    return `mailto:?subject=${subject}&body=${body}`;
  }
}
