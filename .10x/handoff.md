# Current Handoff

**From:** DevOps Engineer (session 11 — ops-hardening / "perfect the app" pass)
**To:** User

You asked me to look at the app and say how to perfect it, then to do all
4 points I found. Done, but **one needs your action before it's actually
live**:

1. **The CI/CD pipeline had never run.** `main` was 25 commits ahead of
   `origin/main` since session 5 — every past "Deployed" was a local
   `firebase deploy`, never through GitHub Actions. I pushed it
   (`54b3417`, then `bbe4742` with the items below). Result: **CI passed**
   (build+test is sound), but **the production-deploy workflow failed**.
   I can't read why — the repo's Actions logs need a GitHub login, and
   there's no `gh` CLI in this environment. Most likely cause: the
   `FIREBASE_SERVICE_ACCOUNT` secret from session 5 was flagged as
   needed then and may never have actually been added.
   **→ Please open https://github.com/BekirLabjani/fitnesstracking-app/actions,
   open the failed "Deploy to Firebase Hosting (production)" run, expand
   the failing step, and tell me what it says** (or just add/regenerate
   the secret yourself: Firebase Console → Project Settings → Service
   accounts → Generate new private key → GitHub repo secret
   `FIREBASE_SERVICE_ACCOUNT`). Until then every future push will keep
   passing CI but failing to deploy — loudly, not silently.
2. **CSP switched from Report-Only to enforcing.** It ran unchanged
   across 5+ sessions with nothing flagged, and nothing new in this
   change needed a new allowed domain. I couldn't test a real login in a
   browser from here — once this deploys, please log in once for real
   and check the browser console for any CSP violation errors. One-line
   revert if something's blocked.
3. **Firestore indexes checked — already fine.** An old note said they
   were incomplete; re-checked every query in the codebase against
   `firestore.indexes.json` and they're all covered. No change needed,
   corrected the stale note so it doesn't get "fixed" again.
4. **Added crash/perf visibility**: uncaught errors now get logged to a
   new `errorLogs` collection (own-only, same pattern as `calorieLogs`)
   so you'd see a crash without a user telling you; added Firebase
   Performance Monitoring (prod-only). Deliberately did **not** add
   Firebase Analytics even though its ID is already in the config — it
   would've needed loosening the CSP right after enforcing it, plus a
   GDPR consent-banner question for an EU app with no banner. Said no on
   purpose, flagging in case you want it anyway.

Build clean, 72/72 tests passing (3 new). Full detail in
`.10x/decisions/devops/ops-hardening.md`.

## History

### DevOps/SRE (session 10 — RPE + calorie logging + friends leaderboard)
**To:** User

Deployed — `firebase deploy --only firestore,hosting` ran clean, live at https://fitnesstracker-d54a5.web.app.

Three features from the brainstorm you picked:
1. **RPE-Tracking** — when logging a strength set, an optional 1-10 RPE scale now appears; it shows as a small badge on the dashboard card if set.
2. **Kalorien-Logging** — new "🔥 Kalorien eintragen" option in the long-press add-menu (kcal + optional protein/carbs/fat + note). Dashboard now shows a progress bar of today's logged calories against your profile's calorie goal (the one you set up in session 9) — if no goal is set yet, it links to `/profile` instead.
3. **Freunde-Wochenvergleich** — in the profile bottom-sheet's "Freunde" panel, above the invite code, a leaderboard now shows this week's strength-training volume for you and each friend, ranked with medals for the top 3.

## History

### DevOps/SRE (session 9 — nav/burger redesign + full profile page)
**To:** User

Deployed — `firebase deploy --only hosting` ran clean, live at https://fitnesstracker-d54a5.web.app (no Firestore rule changes needed — reuses the existing `userProfiles` owner-write rule for the new fields).

Fixed: clicking "Profil" in the training page's burger menu used to navigate to `/profile`, which rendered a component built for a different use case (a slide-up sheet with a `[open]` input) with no input bound — so it rendered but stayed invisible. `/profile` now opens a real page: body data (gender/age/height/weight), how often you move, and a calorie target — either calculated from that data (Mifflin-St Jeor formula) or typed in directly if you already know it. Also rebuilt the training page's burger-menu drawer to use the app's actual theme colors instead of hardcoded hex, added a profile preview at the top and links to Trainingsplan/Settings/Premium, and fixed a wiring bug where opening the drawer never actually hid the tab bar underneath it.

## History

### DevOps/SRE (session 8 — premium-camera-tracking)
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
