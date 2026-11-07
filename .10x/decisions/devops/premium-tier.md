# DevOps — premium-tier

## Deploy strategy
No new infra. Two deploys needed, same pattern as every deploy this session (explicit user confirmation first, since this sandbox's auto-mode classifier blocks production deploys without it):
1. `firebase deploy --only firestore` — ships the new `entitlements` rule.
2. `firebase deploy --only hosting` — ships the new routes/components.
Order matters: rules before hosting, so the new UI never queries a collection with no rule yet (would silently fail permission-denied rather than show a broken state, but no reason to risk the race).

## Rollback
- Hosting: `firebase hosting:clone <project>:<prev-version-id> <project>:live`, same as documented in `infra-foundations.md`.
- Firestore rule: the new `entitlements` block is purely additive (doesn't touch any existing `match` block) — reverting is a one-line removal + redeploy, no migration needed since the collection has no other consumers.

## Manual "freischalten" workflow (this iteration's actual delivery mechanism)
Since there's no payment backend yet, "granting premium" is an ops action, not a self-service one:
1. Firebase Console → Firestore Database → start collection `entitlements` (if first grant) → document ID = the user's Auth UID.
2. Fields: `isPremium: true` (boolean), optionally `plan: "monthly"` or `"lifetime"` (string), `grantedAt: <today>` (string or timestamp).
3. Done — `PremiumService`'s `onSnapshot` picks it up in realtime, no redeploy or user action needed.
To revoke: set `isPremium: false` or delete the document.
