# DevOps — infra-foundations (session 5)

User asked (via `/10x-team:devops-engineer`, scope clarified as infra not
product features) what infrastructure capabilities to add. Mapped current
state: dev and prod shared a single Firebase project
(`fitnesstracker-d54a5`) with zero isolation, no deploy automation beyond
manual `firebase deploy`, and no monitoring/budget visibility. Presented
4 options with trade-offs; user approved all 4, implemented in one pass.

## 1. Firebase Emulator Suite (dev/prod isolation)
- `firebase.json`: added `emulators` block — Auth :9099, Firestore :8080,
  Storage :9199, UI :4000, `singleProjectMode: true`.
- `src/environments/environment.ts` / `environment.prod.ts`: added
  `useEmulators` flag (`true` in dev, `false` in prod).
- `src/app/app.config.ts`: each `provideAuth`/`provideFirestore`/
  `provideStorage` factory now calls `connectAuthEmulator` /
  `connectFirestoreEmulator` / `connectStorageEmulator` against
  `127.0.0.1` when `environment.useEmulators` is true. Production build
  (`environment.prod.ts`) never does this — verified via
  `ng build --configuration production`.
- `package.json`: added `npm run emulators` (`firebase emulators:start
  --import=./.emulator-data --export-on-exit`) — local data persists
  between runs without touching production Firestore/Auth/Storage.
- `.gitignore`: added `/.emulator-data`.
- **Rollback:** fully additive, no prod-path change. If emulators cause
  local dev friction, set `useEmulators: false` in `environment.ts` to
  fall back to the old behavior (dev hitting the real project) instantly.

## 2. Google Cloud Billing budget alert
- Not a repo change — account-level GCP Console setting, requires the
  user's own billing-account access, which this environment has no
  credentials for. Instructions handed to the user directly in chat
  (Cloud Console → Billing → Budgets & alerts → new budget scoped to the
  `fitnesstracker-d54a5` project, alert thresholds at 50/90/100%).
- Flagged as still open — **not verified/confirmed done**, since it
  cannot be checked from the repo.

## 3. PR preview channels
- New `.github/workflows/firebase-hosting-pull-request.yml`: on PR to
  `main` (same-repo PRs only, guarded by
  `github.event.pull_request.head.repo.full_name == github.repository`
  so fork PRs can't exfiltrate the deploy secret), builds production and
  deploys via `FirebaseExtended/action-hosting-deploy@v0` to an ephemeral
  preview channel/URL.
- **Requires a one-time manual step from the user**: create a Firebase
  service account key and add it as the GitHub repo secret
  `FIREBASE_SERVICE_ACCOUNT` (Firebase Console → Project Settings →
  Service accounts → Generate new private key, or
  `firebase init hosting:github` which does this automatically). Without
  that secret, both new workflows below will fail at the deploy step —
  the build+test step still runs and reports failure clearly, no silent
  no-op.

## 4. Auto-deploy to production on merge
- New `.github/workflows/firebase-hosting-merge.yml`: on push to `main`,
  runs build + full unit test suite (reuses the same steps as `ci.yml`),
  then deploys Hosting to the live channel, then deploys
  `firestore.rules`/`storage.rules`/`firestore.indexes.json` via
  `firebase-tools deploy --only firestore,storage` (service-account auth
  via `GOOGLE_APPLICATION_CREDENTIALS`, written from the same
  `FIREBASE_SERVICE_ACCOUNT` secret — no second secret type needed).
- Deliberately sequenced tests-before-deploy so a broken `main` never
  reaches production automatically.
- **Risk / rollback:** Firebase Hosting keeps full deploy history;
  `firebase hosting:clone <project>:<prev-version-id> <project>:live`
  rolls back instantly from the CLI or Console if a bad deploy ships.
  Firestore/Storage rules deploys are not automatically rollback-able the
  same way (rules are not versioned the way Hosting is) — a bad rules
  change needs a revert commit + redeploy, same as before this change.

## Verified before handoff
- `npm run build -- --configuration production` succeeds, no emulator
  code reachable in the prod bundle path (`useEmulators: false` branches
  it out).
- `npm test -- --no-watch --no-progress --browsers=ChromeHeadless`:
  28/28 passing, unaffected by the emulator wiring (tests use
  `TEST_PROVIDERS`, never touch `app.config.ts`).

## Open / not done by this change
- Billing alert (#2) needs the user to act in Cloud Console — can't be
  verified from the repo.
- Both new GitHub workflows need the `FIREBASE_SERVICE_ACCOUNT` secret
  added before they can succeed — will fail loudly (not silently) until
  then.
- 12+ local commits (now more) still not pushed to `origin/main` —
  workflows won't even run until that happens.
