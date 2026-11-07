# Senior Engineer — premium-tier (implementation approach)

## Task 1 — Entitlement infra
- `firestore.rules`: add `match /entitlements/{userId} { allow read: if request.auth != null && request.auth.uid == userId; allow write: if false; }` before the catch-all.
- `PremiumService`: same `onSnapshot` + manual `Observable` wrapper pattern as `TrainingService.queryTrainings` — but a single-doc `onSnapshot(doc(...))`, not a query. Must emit `false` synchronously on no-doc and on logged-out, never leave subscribers hanging.
- `premiumGuard`: `CanActivateFn`, mirrors `authGuard`'s `map`/`take(1)` structure but reads `PremiumService.isPremium$`.

## Task 3 — Premium stats
- Reuse `TrainingService.getAllTrainings()` (already fetches everything, no new Firestore query needed) + `CustomExerciseService.getMyCustomExercises()` for category resolution of custom exercises.
- Muscle-group chart: group `trainings` where `type==='strength'` by resolved category (`EXERCISES[id].category` or matching `CustomExercise.category`), sum `weight*reps*sets` per category.
- Reuse the existing `getWeekLabel()` logic pattern from `training-stats.component.ts` for the full-history volume trend (same ISO-week bucketing, just without the `.slice(-8)` cap).

## Task 5 — Templates
- Template application reuses the exact `setDoc(doc(this.db, 'trainingPlans', uid), plan, {merge:false})` shape from `trainingsplan.component.ts` — **note:** must use `merge: false` (full overwrite) here, unlike the existing per-day `merge: true` writes, since applying a template replaces the whole week intentionally. Confirm via toast before overwrite if a plan already exists (check `activePlan`/`plan` state is non-empty first).

## Edge cases considered
- New user, never flagged premium: `entitlements` doc doesn't exist → `PremiumService` must treat `snap.exists() === false` identically to `isPremium: false`, not throw.
- CSV export with zero trainings: must still produce a valid (header-only) CSV, not throw/produce `undefined`.
- Template apply when the selected day's `exercises` already has entries: confirm-before-overwrite (ToastService doesn't support confirm dialogs — use a simple `confirm()`-free pattern: a second "Wirklich überschreiben?" toast-triggered state, or reuse Angular Material's `MatDialog` already in the project if a cleaner confirm is needed. Decision: keep it simple, same ADR-accepted-risk spirit — a plain toast with an inline "Bestätigen" action button, avoiding a new MatDialog usage pattern for a low-stakes action the user can immediately undo by reapplying their old plan).
