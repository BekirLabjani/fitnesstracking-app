# DevOps — premium-camera-tracking

## Deploy strategy
Hosting-only change — no new Firestore rules (reuses `authGuard`/`premiumGuard`, writes through the existing `addStrengthTraining` path which already has a rule). Single deploy: `firebase deploy --only hosting`.

## New runtime dependency
`@mediapipe/tasks-vision` ships in the bundle but only loaded via dynamic `import()` inside the `camera-tracker` route's lazy chunk — users who never open the feature never download it. At first use per device, the browser also fetches MediaPipe's WASM runtime + pose model from `cdn.jsdelivr.net` / `storage.googleapis.com` (cached after first load). See ADR-002 for the full rationale and the pinned version risk.

## Rollback
Purely additive route + component + one new npm dependency. Revert = redeploy the previous hosting version (`firebase hosting:clone <project>:<prev-version-id> <project>:live`), same as documented in `infra-foundations.md`. No data migration involved.
