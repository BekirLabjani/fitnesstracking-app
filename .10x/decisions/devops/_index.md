# DevOps — Cross-Cutting Notes

Active features: premium-camera-tracking (session 8), premium-tier (session 6), infra-foundations (session 5)

## premium-camera-tracking (session 8)
Hosting-only deploy, no new rules. New npm dependency `@mediapipe/tasks-vision`, lazy-loaded so it only costs bundle size for users who open the camera-tracker route. See `premium-camera-tracking.md` and ADR-002.

## premium-tier (session 6)
No new infra. Deploy order: firestore rules then hosting. Manual premium-grant workflow documented in `premium-tier.md` (this is the actual delivery mechanism this iteration, since there's no payment backend yet).

## Observations [DISCOVERED] — status as of session 5
- ~~No CI/CD pipeline found~~ → `ci.yml` added (session 1-2): build +
  test on push/PR to `main`. Still true at discovery time, now stale.
- `node_modules`/service-worker version conflict → fixed session 1.
- `npm audit`: 99 → 70 vulnerabilities after `npm audit fix`; remaining
  70 are all dev-only `webpack-dev-server`/`webpack-dev-middleware`,
  require a breaking `@angular-devkit/build-angular` major bump,
  deliberately deferred (not forced).
- ~~Missing `Content-Security-Policy`, `Strict-Transport-Security`~~ →
  both added (session 2): HSTS enforcing, CSP shipped as
  `Content-Security-Policy-Report-Only` pending live-login verification
  before switching to enforcing.
- No `.env`/secret separation: still accurate, not a real gap — Firebase
  web config is meant to be public client-side, no server-side secret
  exists yet in this app.

## infra-foundations (session 5) — see `infra-foundations.md`
Added: Firebase Emulator Suite for local dev (dev/prod were sharing one
live Firebase project — biggest gap found), GitHub Actions PR-preview
deploys, GitHub Actions auto-deploy-to-prod on merge to `main`, and
handed the user manual instructions for a GCP Billing budget alert
(can't be done from the repo). Status: implemented and build/test
verified; both new workflows need a `FIREBASE_SERVICE_ACCOUNT` GitHub
secret added by the user before they can actually deploy.

## Cross-cutting principle
When a `[DISCOVERED]` note says something is missing, verify against
current code before relying on it — this file had gone stale (CSP/HSTS/
CI items were already fixed in later sessions but the note here still
said "missing"/"not found"). Update this file whenever a past
`[DISCOVERED]` item gets addressed, don't just add new entries on top.
