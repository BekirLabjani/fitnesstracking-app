# Security — Cross-Cutting Notes

## Active Features
- `premium-tier` (session 6) — new `entitlements/{userId}` collection, read-only from client, no self-upgrade path (verified by grep — no write calls exist). See `premium-tier.md` and ADR-001 for the rejected client-writable alternative and the accepted UI-only-gating risk.
- `friends-feature` — [DISCOVERED] Firestore rules gap, status: flagged

## Observations [DISCOVERED]
- Firestore rules (`firestore.rules`) define `users`, `trainings`, `weights`, then deny everything else. `FriendsService` reads/writes `friends` and `userProfiles` — neither has a rule, so they fall under `allow read, write: if false`. Feature is effectively non-functional or throwing permission-denied.
- `TrainingService` actually writes body-weight entries into the `trainings` collection (`type: 'body'`), not into the `weights` collection the rules define — the `weights` rule block is dead code, and there is no deployed collection it protects.
- Firebase web API key in `environment.ts` is expected to be public (client-side keys are not secrets) — not a finding by itself, but confirm Firebase App Check / reCAPTCHA is not silently assumed elsewhere.
- No rate limiting / abuse protection visible on `addFriend` (user-enumerable invite code lookup via `codePrefix` query) — low severity, but a tight 8-char uppercase substring of a UID is guessable at scale.
