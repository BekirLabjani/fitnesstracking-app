# Current Handoff

**From:** Engineering Manager / Senior Engineer (session 6 — premium-tier planning)
**To:** SDE (self, continuing this session)

Planning complete for `premium-tier`: spec at `.10x/specs/2026-11-07-premium-tier-design.md`, ADR-001 (entitlement model — `entitlements/{userId}` Firestore collection, read-only from the client, see ADR for the privilege-escalation reasoning that ruled out putting the flag in `userProfiles`), decisions written for CTO/PM/Architect/Staff-Engineer/EM/Senior-Engineer. Task order: (1) entitlement infra — rules + `PremiumService` + `premiumGuard`, (2) `/upgrade` page, (3) Pro stats tab, (4) CSV export, (5) workout templates, (6) specs, (7) build/test verification, (8) deploy (with user confirmation, same as this session's established pattern).

Next: implement task 1, which blocks 2-5.

## History

### DevOps Engineer (session 5 — infra foundations)
**To:** User

Implemented all 4 infra items the user approved: Firebase Emulator Suite
for local dev (dev no longer shares the live prod Firebase project),
GitHub Actions PR-preview deploys, GitHub Actions auto-deploy-to-prod on
merge to `main` (tests gate the deploy), and billing-alert setup
instructions (manual, GCP Console — can't be done from here). Full
details in `.10x/decisions/devops/infra-foundations.md`. Build
(`ng build --configuration production`) and full test suite (28/28)
verified green after the change.

**Action needed from the user before the new workflows do anything:**
1. Add a `FIREBASE_SERVICE_ACCOUNT` secret to the GitHub repo (Firebase
   Console → Project Settings → Service accounts → Generate new private
   key, paste the JSON as the secret value — or run
   `firebase init hosting:github` which sets this up automatically).
2. Push the local commits to `origin/main` — none of this runs on a
   local-only branch.
3. Set up the GCP Billing budget alert manually (Cloud Console → Billing
   → Budgets & alerts) — scoped to `fitnesstracker-d54a5`.

Still open from earlier sessions:
- CSP is live in `firebase.json` as `Content-Security-Policy-Report-Only` — needs a real deploy + live login/sync/avatar-upload test, then switch to enforcing (drop `-Report-Only` from the header key) once the browser console shows no violations.
- `npm audit` still has ~70 vulnerabilities, all requiring a major breaking `@angular-devkit/build-angular` upgrade, deliberately not forced.
- Not-yet-reviewed files listed at the bottom of `.10x/decisions/senior-engineer/_index.md`.

## History

### Senior Engineer (session 3 code review)
Fixed a second missing-Firestore-rule bug (`trainingPlans`, same class as the earlier Friends bug), a leftover `getFirestore()` call, a debug `console.log`, a toast-id collision bug, and a missing spec file. Build + all 26 tests verified green.

### Discovery (all roles), 2026-11-06
Full-codebase review completed on request ("schau dir die App an und sag mir wo man was verbessern könnte"). No implementation was requested yet — findings presented in chat, organized by role lens (Security, Architecture/Data, DevOps, QA).

Highest-priority item found: `friends` and `userProfiles` Firestore collections are used by `FriendsService` but have no matching rule in `firestore.rules` — the catch-all `allow read, write: if false` blocks them. (Fixed in the next session.)
