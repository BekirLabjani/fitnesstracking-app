# Security — premium-tier

## Threat model
Primary new asset: the `isPremium` flag itself. Who can set it, who can read it, what happens if the client-side gate is bypassed.

## Findings
- **Checked — no self-upgrade path.** `entitlements/{userId}` rule is `allow read: if owner; allow write: if false`. Verified no code path in the app attempts to write to this collection (only `onSnapshot`/`getDoc` reads exist — grepped for `entitlements` write calls, found none). The only way to set `isPremium: true` is the Firebase Console (Admin SDK, bypasses rules), which only the project owner can access.
- **Accepted — client-side-only gating.** Documented explicitly in ADR-001. All three premium features operate exclusively on the requesting user's own already-readable data (own `trainings`, own `customExercises`, own `trainingPlans`). A user who bypasses the UI gate (e.g. via devtools) can at most view their own data in an extra chart or write a template to their own `trainingPlans` doc — both already fully permitted by existing, unrelated rules regardless of premium status. No cross-user data exposure, no privileged write, no billable backend resource consumed. This is explicitly not acceptable for a future feature that would gate access to *other users'* data or a paid API call — re-evaluate before reusing this pattern there.
- **Checked — CSV export doesn't leak anything beyond what the user already owns.** `ExportService` only receives data the calling component already fetched via existing, already-reviewed Firestore rules (`trainings` read, owner-only).
- **Checked — template application writes only to the caller's own `trainingPlans/{uid}` doc**, same security rule as the existing manual-add flow (`request.auth.uid == userId`), no new write surface.

## Verdict
No new vulnerabilities introduced. The one deliberate risk acceptance (UI-only premium gating) is documented in ADR-001 with an explicit scope boundary for when it stops being acceptable.
