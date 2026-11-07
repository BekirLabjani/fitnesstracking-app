# Security — premium-camera-tracking

## Camera permission
Uses the standard `navigator.mediaDevices.getUserMedia` browser permission prompt — the browser itself gates access, the app never silently starts the camera. Denial is caught and surfaced as a German error message; no crash, no retry loop.

## Data flow
Video frames are read from a local `<video>` element and passed directly into an in-browser WASM pose model (`@mediapipe/tasks-vision`). No frame or video data is sent to any server — the only network calls are the one-time, user-content-free fetch of the WASM runtime and model file from Google/jsdelivr CDNs. See ADR-002.

## Entitlement check
Reuses the existing `premiumGuard` + `entitlements/{userId}` model from ADR-001 — no new authorization surface. The route itself (`/training/camera-tracker`) has no server-enforced check beyond that guard (same accepted-risk posture as the rest of the Premium tier: a user who bypasses the client-side guard only gains access to a feature that operates on their own camera/their own training data, nothing cross-user).

## Saved data
`saveAsTraining()` writes through the existing `addStrengthTraining` path (same Firestore rule as every other manually-logged set) — the rep count is just a number typed in by the camera instead of by the user; no new write surface.
