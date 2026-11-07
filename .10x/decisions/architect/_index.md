# Architect — Cross-Cutting Notes

Active features: premium-tier (session 6)

## premium-tier
New `entitlements/{userId}` collection, deliberately separate from `userProfiles` for write-permission reasons (see ADR-001). `PremiumService` is the single read path — feature components never read `entitlements` directly. See `premium-tier.md`.

## Observations [DISCOVERED]
- Standalone Angular 17 components, lazy-loaded routes, `authGuard` on protected routes — solid modern baseline.
- ~~`TrainingService` stores all training types... without visible composite indexes beyond the near-empty `firestore.indexes.json`~~ → re-verified session 11 (devops): `firestore.indexes.json` already has both composite indexes this needs (`userId+type`, `userId+type+exerciseId`), added in some session between 6 and now. Every other collection (`calorieLogs`, `customExercises`, `userProfiles`, `friends`) uses single-field equality only, which Firestore auto-indexes — no gap currently exists. Re-check against `firestore.indexes.json` before relying on this being stale again.
- `FriendsService` and `TrainingService` both call `getFirestore()` directly instead of sharing one initialized instance/pattern — `TrainingService` uses a manual `persistentLocalCache` singleton guard (`firestoreInitialized` flag), `FriendsService` does not use offline persistence at all. Inconsistent Firestore access pattern across services.
- Naming: `feature/wight/add-wight` (typo for "weight") is inconsistent with the rest of the codebase and the actual Firestore field name `bodyWeight`.
