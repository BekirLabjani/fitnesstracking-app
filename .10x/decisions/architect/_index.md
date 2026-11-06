# Architect — Cross-Cutting Notes

## Observations [DISCOVERED]
- Standalone Angular 17 components, lazy-loaded routes, `authGuard` on protected routes — solid modern baseline.
- `TrainingService` stores all training types (`strength`/`cardio`/`body`) in one `trainings` collection filtered by Firestore `where` clauses client-side; queries use compound `where(userId)+where(type)+where(exerciseId)` without visible composite indexes beyond the near-empty `firestore.indexes.json` (46 bytes) — likely to hit "missing index" errors as usage grows.
- `FriendsService` and `TrainingService` both call `getFirestore()` directly instead of sharing one initialized instance/pattern — `TrainingService` uses a manual `persistentLocalCache` singleton guard (`firestoreInitialized` flag), `FriendsService` does not use offline persistence at all. Inconsistent Firestore access pattern across services.
- Naming: `feature/wight/add-wight` (typo for "weight") is inconsistent with the rest of the codebase and the actual Firestore field name `bodyWeight`.
