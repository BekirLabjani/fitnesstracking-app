# Current Handoff

**From:** DevOps/SRE (session 8 — premium-camera-tracking)
**To:** User

Two changes, both built and verified (45/45 tests, production build clean) but **not deployed yet**:

1. **PDF export replaced CSV export** in Settings (same location, just downloads a `.pdf` now instead of `.csv`).
2. **New Premium feature: camera rep counter** at `/training/camera-tracker` (linked from the Settings premium row and from the Pro stats tab). Hold the phone so the camera sees your whole upper body/arm side-on, it counts push-ups automatically and lets you save the count as a real training entry. Runs entirely on-device (`@mediapipe/tasks-vision`) — no video leaves the phone, only a one-time model/runtime download from Google's CDN on first use. See ADR-002 for why.

**Deployed** — `firebase deploy --only hosting` ran clean, live at https://fitnesstracker-d54a5.web.app.

Manual QA still needed on a real phone after deploy (can't script a real camera from here): see the 5-step checklist in `.10x/decisions/qa/premium-camera-tracking.md` — in particular, whether the push-up angle thresholds (90°/150°) actually match real reps, since they were tuned on paper, not against real camera footage.

## History

### DevOps/SRE (session 7 — premium-tier deploy)
Deployed `premium-tier`: `firestore` rules + `hosting` both live in production. User granted themselves premium (`entitlements/<uid> = {isPremium: true}`, email `Business.life.bekir@gmail.com`) via the Firebase Console before the deploy.

### DevOps/SRE (session 6 — premium-tier delivery)
Built and verified premium-tier (37/37 tests, production build clean), not yet deployed at that point. Deployed in session 7.

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
