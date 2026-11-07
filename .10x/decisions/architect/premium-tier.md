# Architect — premium-tier

**Components:**
- `entitlements/{userId}` (Firestore, new) — see ADR-001.
- `PremiumService` (`src/app/shared/premium/premium.service.ts`) — single source of truth for `isPremium$`, everything else depends on this, nothing reads `entitlements` directly.
- `premiumGuard` (`src/app/shared/premium/premium.guard.ts`) — route-level gate, mirrors `authGuard`.
- Three feature surfaces, each independent: Pro stats tab (inside existing `training.component.ts`), CSV export (inside existing `settings.component.ts`), templates (new route + component).
- `UpgradeComponent` at `/upgrade` — the one page every gated surface links to.

**Boundaries:** Feature components never read `entitlements` directly or duplicate the premium check logic — they all go through `PremiumService`. This keeps a future Stripe swap (replacing who *writes* `entitlements`) from touching any of the three feature components.

**Data flow:** `entitlements/{uid}` → `PremiumService.isPremium$` (onSnapshot, realtime) → consumed by `premiumGuard` (route entry) and by components directly (inline tab/section gating) via async pipe or subscription.

**Failure modes considered:**
- No `entitlements` doc exists (default/new user) → `PremiumService` must emit `false`, not error or hang. Implemented by treating `snap.exists() === false` as `isPremium: false`.
- User logs out mid-session → `onSnapshot` listener must be torn down (existing `ngOnDestroy` unsubscribe pattern used throughout the app, reused here).
