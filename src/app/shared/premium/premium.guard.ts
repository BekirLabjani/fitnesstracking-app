import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { PremiumService } from './premium.service';

export const premiumGuard: CanActivateFn = () => {
  const premium = inject(PremiumService);
  const router = inject(Router);

  return new Promise<boolean>(resolve => {
    premium.isPremium$.pipe(take(1)).subscribe(isPremium => {
      if (isPremium) {
        resolve(true);
      } else {
        router.navigate(['/upgrade']);
        resolve(false);
      }
    });
  });
};
