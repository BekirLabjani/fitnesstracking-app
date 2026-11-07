# Project Status

**Phase:** Nav/Burger Redesign + Full Profile Page — Deployed to Production
**Date:** 2026-11-07

## Task Progress
- [x] Discovery review (security, architecture, devops, QA)
- [x] Fix Firestore rules gap blocking Friends feature
- [x] Fix Firestore offline-persistence init-order bug
- [x] Register PWA service worker (was built but never activated)
- [x] Add missing Firestore composite indexes
- [x] Remove dead code (`feature/wight`)
- [x] Fix broken/never-run test suite (17/25 failing → 25/25 passing)
- [x] `npm audit fix` (99 → 70 vulnerabilities; rest need a major, breaking devkit bump — flagged, not forced)
- [x] Add CI pipeline (build + test on push/PR)
- [x] Add hosting security headers (Referrer-Policy, HSTS)
- [x] Verify production build (`ng build --configuration production`) succeeds
- [x] Verify full unit test suite passes (`ng test`, ChromeHeadless)
- [x] CSP added (report-only — needs live-login verification before enforcing)
- [x] Avatars migrated to Firebase Storage (was base64-in-Firestore)
- [x] Invite code hardened (random + uniqueness-checked, was UID prefix)
- [x] `storage.rules` added (Storage had none before)
- [x] Senior-engineer pass (session 3): fixed another missing Firestore rule (`trainingPlans` — same bug class as Friends, caught by a project-wide collection grep this time), DI consistency in `trainingsplan.component.ts`, removed debug `console.log`, fixed toast id collision, added missing `trainingsplan` spec
- [x] Free-tier features (session 4): progression suggestions in add-training dialog; custom exercises (new `customExercises` collection + service, wired into add dialog, strength/cardio pickers, dashboard, trainingsplan). Known gap: friends' custom exercises don't resolve to a name in the friend-comparison view (flagged, not fixed — needs a permission-model decision)
- [x] Infra foundations (session 5): Firebase Emulator Suite for local dev (was sharing live prod project with no isolation — fixed), GitHub Actions PR-preview deploys, GitHub Actions auto-deploy-to-prod on merge to `main` (gated by tests), GCP billing-alert instructions handed to user (manual, can't be done from repo). Needs `FIREBASE_SERVICE_ACCOUNT` GitHub secret + a push to `origin/main` before the new workflows actually run.

- [x] Premium tier (session 6): spec + ADR-001 (entitlement model: `entitlements/{userId}`, read-only from client) + full decision trail (CTO/PM/Architect/Staff-Engineer/EM/Senior-Engineer/QA/Security/DevOps/SRE). Built: `PremiumService`+`premiumGuard`, `/upgrade` pricing page, Pro stats tab (volume trend, muscle-group breakdown, per-exercise progress), CSV export in Settings, workout-templates library (`/trainingsplan/templates`). 37/37 tests passing (9 new), production build clean. **Deployed** (session 7): `firestore` rules + `hosting` both live in production. User manually granted themselves premium via `entitlements/<uid> = {isPremium: true}` in the Firebase Console before deploy.

- [x] Premium camera-tracking (session 8): PDF export replaced CSV export in Settings (`jspdf`/`jspdf-autotable`). New Premium feature `/training/camera-tracker` — on-device push-up rep counter using `@mediapipe/tasks-vision` pose landmarks (ADR-002), pure `PoseRepCounter` state machine, "Als Training speichern" writes a real `pushups` training entry. 45/45 tests passing (8 new), production build clean. **Deployed** (session 8): `hosting` live in production.

- [x] Nav/burger redesign + full profile page (session 9): fixed a real bug where `/profile` rendered the dashboard's bottom-sheet component with no `[open]` input (so it was invisible) — `/profile` now routes to a new `ProfilePageComponent` with body data (gender/age/height/weight), activity level, and a Mifflin-St Jeor calorie calculator (`calculateBmr`/`calculateTdee` in `shared/calorie/calorie-calculator.ts`) with a manual-override toggle. New `UserProfileService` (mirrors `PremiumService`'s `onSnapshot` pattern) backs both the new page and the training drawer's profile preview. Training page's burger drawer (`training-header`) rebuilt with theme-aware tokens (was hardcoded dark hex, ignored light mode), added a profile preview, Trainingsplan/Settings/Upgrade links, removed a duplicate Dashboard entry. Fixed a real wiring bug: the drawer's `(menuToggle)` output was never bound to `training.component.ts`'s `onMenuToggle()`, so the tab bar never actually hid while the drawer was open. 56/56 tests passing (11 new), production build clean. **Deployed** (session 9): `hosting` live in production.

## Notes
`node_modules` had never been installed in this project before this session, and the test suite had apparently never been run — all 25 specs were untouched Angular CLI scaffolds, 17 of them actually broken.
