# Current Handoff

**From:** Senior Engineer (session 3 code review)
**To:** User / next session

Fixed everything found in this pass (see `.10x/decisions/senior-engineer/_index.md`): a second missing-Firestore-rule bug (`trainingPlans`, same class as the earlier Friends bug), a leftover `getFirestore()` call, a debug `console.log`, a toast-id collision bug, and a missing spec file. Build + all 26 tests verified green. Not pushed to remote.

Still open from earlier sessions:
- CSP is live in `firebase.json` as `Content-Security-Policy-Report-Only` — needs a real deploy + live login/sync/avatar-upload test, then switch to enforcing (drop `-Report-Only` from the header key) once the browser console shows no violations.
- `npm audit` still has ~70 vulnerabilities, all requiring a major breaking `@angular-devkit/build-angular` upgrade, deliberately not forced.
- Not-yet-reviewed files listed at the bottom of `.10x/decisions/senior-engineer/_index.md`.

## History

### Discovery (all roles), 2026-11-06
Full-codebase review completed on request ("schau dir die App an und sag mir wo man was verbessern könnte"). No implementation was requested yet — findings presented in chat, organized by role lens (Security, Architecture/Data, DevOps, QA).

Highest-priority item found: `friends` and `userProfiles` Firestore collections are used by `FriendsService` but have no matching rule in `firestore.rules` — the catch-all `allow read, write: if false` blocks them. (Fixed in the next session.)
