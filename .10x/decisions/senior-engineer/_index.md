---
Active features: premium-tier (session 6), fitness-tracker-hardening (code-quality pass, session 3)
---

## premium-tier (session 6)
See `premium-tier.md` for implementation-approach notes (entitlement infra, stats charts, template overwrite handling).

## fitness-tracker-hardening — code review findings (this session)

Reviewed the parts of the codebase not yet touched by the earlier
security/devops hardening passes (dashboard, training components,
trainingsplan, toast/theme services, login/signup). Found and fixed:

1. **`trainingPlans` Firestore collection had no security rule** — same
   root-cause class as the Friends-feature bug fixed in the previous
   session (catch-all `allow read, write: if false` silently blocks any
   collection nobody wrote a rule for). This one was missed then because
   that review only grepped the collections `FriendsService` touched,
   not every collection in the app. Fixed by grepping ALL
   `collection(this.db, '...')` / `doc(this.db, '...')` call sites
   project-wide — cross-cutting principle below.
2. `trainingsplan.component.ts` still called `getFirestore()` directly —
   missed in the earlier DI-consistency cleanup (that pass only checked
   files it already knew used Firestore from a prior grep, not a fresh
   one). Switched to `inject(Firestore)`, dropped two unused imports
   (`deleteField`, `updateDoc`) that were never called.
3. `training.component.ts`: dead `ngOnInit()` that only did
   `console.log('Nav activeTab:', ...)` — removed (visible in prod
   browser console on every navigation otherwise, and didn't implement
   `OnInit` either despite the lifecycle-hook name).
4. `toast.service.ts`: toast ids were `Date.now()` — two toasts fired
   within the same millisecond get the same id, so dismissing one
   dismisses both. Switched to a monotonic counter.
5. `trainingsplan.component.ts` had no `.spec.ts` at all — the only
   component in the codebase missing one. Added, following the existing
   `TEST_PROVIDERS` pattern.

## Cross-cutting principle for next time
When fixing a missing-Firestore-rule bug for collection X, don't just
check the collections the one broken feature touches — grep the whole
project for every `collection(this.db, '<name>')` / `doc(this.db,
'<name>')` literal and diff that against `firestore.rules`'s `match`
blocks. One command: `grep -rohE "(collection|doc)\(this\.db,\s*'[a-zA-Z]+'" src/app | grep -oE "'[a-zA-Z]+'" | sort -u`.
Same logic applies to `storage.rules` if more Storage paths get added
later.

## fitness-tracker-hardening — free-tier features (session 4)

User asked which of the brainstormed features are "not premium" and
picked two to build: progression suggestions and custom exercises.

- **Progression suggestions**: `add-training-dialog.component.ts` now
  fetches the last logged entry for the selected strength exercise
  (reusing `TrainingService.getStrengthTrainings()`, no new backend) and
  shows a "last time: Xkg × Y × Z" hint with a one-tap +2.5kg apply
  button.
- **Custom exercises**: new `customExercises` Firestore collection +
  `CustomExerciseService`. Wired into every exercise list in the app
  (add dialog, strength/cardio stats pickers, dashboard name resolution,
  trainingsplan), not just the creation point — a half-wired feature
  where a custom exercise works in one screen and shows a raw Firestore
  id in another would be worse than not building it.
- Added `resolveExerciseName(id, customExercises)` to
  `exercise.data.ts` as the single shared lookup (static EXERCISES
  first, custom-exercise fallback second) instead of duplicating that
  fallback per file.
- `exerciseId` typing moved from the closed `ExerciseId` union to plain
  `string` in every touched UI component — matches what
  `TrainingEntry.exerciseId` in `training.service.ts` was already typed
  as; a custom exercise's id is Firestore-generated, not a static-object
  key.
- **Known gap, not fixed**: `friends.service.ts`'s
  `getFriendBestLifts()` only resolves names via `EXERCISES`, so a
  friend's custom exercise shows its raw id instead of a name. Fixing
  this needs the Firestore rules to let a follower read the followed
  user's `customExercises`, which is a real permission-model decision,
  not a drive-by fix — flagged for a future session.

## Not reviewed yet this pass (candidates for next time)
- `training-cardio`, `training-stats`, `time-header`, `rest-timer`,
  `skeleton`, `training-nav-bar`, `training-header` components — read
  during the earlier sessions only incidentally, not line-by-line.
- `exercise.data.ts` / `data/training.ts` / `data/users.data.ts` — the
  static data modules, not yet reviewed for duplication or structure.
