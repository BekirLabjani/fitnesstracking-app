# QA — premium-camera-tracking

## Automated coverage
- `PoseRepCounter` (pure state machine, no camera/DOM): 5 specs — zero-start, full down→up cycle counts a rep, insufficient bend does not count a rep, low-visibility landmarks return `null` instead of a false reading, `reset()` clears state.
- `CameraTrackerComponent`: 3 specs — creation, initial idle/zero state, `stop()` returns to idle. Camera/MediaPipe plumbing itself is not unit-tested (would need a real camera + WASM runtime) — same pattern as not testing `getUserMedia` elsewhere in the app.
- 45/45 total suite passing after this feature (up from 37/37 at premium-tier).

## Manual QA still needed (not scriptable from here)
1. Open `/training/camera-tracker` as a Premium user on an actual phone, allow camera permission, confirm the live video + skeleton overlay render.
2. Do 3–5 real push-ups side-on to the camera, confirm the rep counter increments roughly in sync (exact threshold tuning — 90°/150° elbow angle — may need adjustment after watching real reps miscount).
3. Deny the camera permission once, confirm the German error message appears and the page doesn't crash or hang on "Wird gestartet…".
4. Confirm "Als Training speichern" writes a `pushups` strength entry visible in the Dashboard/Training history with the counted rep number.
5. As a non-Premium user, confirm the upsell card shows instead of the camera view, and the Settings/Pro-tab links route to `/upgrade` rather than exposing the camera.
