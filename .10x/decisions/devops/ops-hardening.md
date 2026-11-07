# DevOps — ops-hardening (session 11)

User asked (via `/10x-team:devops-engineer`) to look at the app and say how
to perfect it. Discovery found one critical operational gap plus three
smaller items; user approved doing all 4.

## 1. Pipeline never actually run — fixed
`main` was 25 commits ahead of `origin/main`, unpushed since session 5.
`ci.yml`/`firebase-hosting-merge.yml` trigger on `push: main`, so neither
had ever run on real work — every "deployed" session before this one was
a local `firebase deploy`, bypassing CI/tests entirely.

- Pushed (`54b3417`). **Result:** CI (`build-and-test`) succeeded on GitHub
  Actions — build+test pipeline itself is sound.
  **Deploy workflow (`firebase-hosting-merge.yml`) failed** on the same
  commit (`build-and-deploy` job, 2m44s). Could not read the failing step
  from the public Actions page (logs need GitHub login) — most likely
  candidate is the `FIREBASE_SERVICE_ACCOUNT` secret from session 5 never
  actually being added, exactly as flagged at the time in
  `infra-foundations.md`, but not confirmed.
- **Open action for the user:** log into GitHub, open
  https://github.com/BekirLabjani/fitnesstracking-app/actions, find the
  failed `bbe4742` (or later) run of "Deploy to Firebase Hosting
  (production)", expand `build-and-deploy`, read the actual error. If it's
  the secret, add/regenerate it: Firebase Console → Project Settings →
  Service accounts → Generate new private key → paste as repo secret
  `FIREBASE_SERVICE_ACCOUNT` (or run `firebase init hosting:github`).
- Until that's fixed, CI will keep passing but auto-deploy will keep
  failing after every push — not silent, loud failure in Actions, but
  the user needs GitHub access to see and fix it (no `gh` CLI in this
  environment, repo is public-readable but logs require login).

## 2. CSP → enforcing
`firebase.json`: `Content-Security-Policy-Report-Only` → `Content-Security-Policy`.
Rationale: policy unchanged across 5+ production sessions with no reported
violation, and this session's additions (Performance Monitoring, error
logging) both report through `*.googleapis.com`, already allowed — no new
domain needed. Could not interactively verify via a real browser login in
this environment (no browser tool available this session) — ask the user
to do one real login/sync/avatar-upload pass after this deploys and watch
the browser console for CSP violation errors.
**Rollback:** one-line revert (`Content-Security-Policy` →
`Content-Security-Policy-Report-Only`) + redeploy hosting.

## 3. Firestore composite indexes — verified, no gap found
The architect's stale `[DISCOVERED]` note (session 6) said indexes were
"near-empty" (46 bytes). Re-checked against every query in the codebase
now (`grep` for `where(`/`query(` across `src/`): all multi-field queries
(`trainings`: userId+type, userId+type+exerciseId) are already covered by
the 2 composite indexes in `firestore.indexes.json`, including the
session-10 friends-leaderboard reads (`getFriendBestLifts`,
`weeklyStrengthVolume`) which reuse the same `userId+type` shape.
Every other collection (`calorieLogs`, `customExercises`, `userProfiles`,
`friends`) is queried with a single equality filter only — Firestore
auto-indexes those, no composite entry needed. **No file change made** —
flagging this so the stale note in `architect/_index.md` and this file get
updated instead of re-investigated next session.

## 4. Error visibility + performance monitoring — added
No prior crash/error visibility existed beyond "a user complains". Chose
tools already in the stack over a new vendor (Sentry etc. would need a new
external account this environment can't create, plus a GDPR
consent-banner question for an EU-facing app — avoided entirely):
- `GlobalErrorHandler` (`src/app/shared/error-handling/global-error-handler.ts`):
  Angular `ErrorHandler` override, logs uncaught errors to a new
  `errorLogs` Firestore collection (owner-only — same create-only,
  no-update/delete pattern as `calorieLogs`), only when a user is signed
  in (pre-login errors have no owner to scope to), never throws itself.
  3 new specs, all passing.
- Firebase Performance Monitoring (`providePerformance`), gated to
  `environment.production` only — dev/emulator traffic would be noise.
  Reports through `*.googleapis.com`, already CSP-allowed, no new
  dependency (ships in the already-installed `firebase`/`@angular/fire`
  packages).
- Deliberately did **not** add Firebase Analytics, even though
  `measurementId` is already present in `environment.ts` — Analytics
  typically loads `googletagmanager.com` (not in the CSP allowlist, would
  have required loosening the policy right after enforcing it) and raises
  a GDPR cookie-consent question for an EU-based app with no consent
  banner. Flagging as a deliberate scope cut, not an oversight.

## Verified before handoff
- `npm run build -- --configuration production`: clean, exit 0.
- `npm test -- --no-watch --no-progress --browsers=ChromeHeadless`:
  72/72 passing (3 new).
- Pushed as `bbe4742`; CI green on GitHub Actions for this commit range
  (confirmed via the public Actions page). Deploy result for `bbe4742`
  itself not yet checked (previous commit's deploy failed — see #1).

## Rollback
All 4 changes are independently revertible:
- CSP: one-line key revert (see #2).
- Error handler + Performance Monitoring: remove the two provider lines
  from `app.config.ts` + delete `errorLogs` rule block — purely additive,
  no other code depends on either.
- Pipeline: no code to roll back, it's the first real run.
