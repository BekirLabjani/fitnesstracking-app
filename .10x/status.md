# Project Status

**Phase:** Hardening Complete
**Date:** 2026-11-06

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

## Notes
`node_modules` had never been installed in this project before this session, and the test suite had apparently never been run — all 25 specs were untouched Angular CLI scaffolds, 17 of them actually broken.
