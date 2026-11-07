# ADR-002: On-Device Pose Tracking for Camera Rep Counter

**Status:** Accepted
**Date:** 2026-11-07
**Feature:** premium-camera-tracking
**Author:** 10x-Team (Architect + Staff Engineer)

## Context
The user requested a Premium feature: hold the phone camera at an exercise (starting with push-ups) and have the app count reps automatically. This requires pose/landmark detection from live video. The app has no backend compute and no Cloud Functions; adding either just for this feature would be a large new operational surface for a single-owner app.

## Decision
Run pose detection entirely in the browser using `@mediapipe/tasks-vision` (Google's `PoseLandmarker`, WASM/GPU-accelerated). The camera stream never leaves the device — only the one-time static WASM runtime and model file are fetched from a CDN (jsdelivr) and Google's model storage, then cached by the browser. Rep counting itself is a small, pure, dependency-free state machine (`PoseRepCounter` in `src/app/shared/pose-tracking/pose-rep-counter.ts`) that takes landmark coordinates and tracks a down→up elbow-angle cycle — kept separate from the MediaPipe/camera plumbing so it's unit-testable without a real camera or WASM runtime.

Scope for this iteration: push-ups only (clear side-on elbow-angle signal). Gated the same way as the other Premium features: `premiumGuard` on the route (`/training/camera-tracker`) plus an upsell card for non-Premium users.

## Alternatives Considered
| Alternative | Pros | Cons | Why Not |
|-------------|------|------|---------|
| Cloud-based pose estimation (send frames to a backend ML API) | Potentially higher accuracy, offloads compute from the phone | Needs a backend, per-request cost, video frames leave the device (privacy), added latency | User explicitly asked for on-device-only processing when asked |
| TensorFlow.js + MoveNet | Also on-device, already a common choice | Marginally larger runtime for this use case, project has zero existing TF.js usage vs. MediaPipe's purpose-built, actively maintained Tasks Vision API | No concrete advantage here; MediaPipe's task API is simpler to integrate for a single pose stream |
| Bundle the WASM/model files locally instead of fetching from CDN | Works fully offline from first load, no third-party fetch | Multi-MB model/wasm payload added to the app's own hosting bundle and git history for a feature most users won't open every session | Lazy-loaded CDN fetch (cached after first use) fits an optional Premium feature better; revisit if offline use becomes a requirement |

## Consequences

### Positive
- No new backend, no new cost center, no server-side privacy exposure — consistent with the app's existing "no server-side secret, Firebase client config is public" posture (see DevOps `_index.md`).
- The rep-counting logic is pure and fully unit-tested (5 tests covering the state machine, visibility gating, and reset) without needing to mock a camera or MediaPipe in tests.
- Reuses the existing Premium gating pattern (`premiumGuard`, upsell card) — no new authorization concept introduced.

### Negative
- First use of this feature per device requires a one-time download of the MediaPipe WASM runtime + pose model (a few MB) from external CDNs — adds latency on first open and a runtime dependency on those CDNs staying available.
- Detection accuracy depends on phone placement/lighting; no server-side fallback if on-device detection is poor on a given device. Mitigated with on-screen guidance text telling the user how to position the camera.
- Only push-ups are supported in this iteration; other exercises (bicep curls, squats) would need their own joint/angle mapping in `PoseRepCounter` — straightforward to add but not built yet.

### Risks
- MediaPipe CDN URLs are version-pinned (`@mediapipe/tasks-vision@0.10.14`) in `camera-tracker.component.ts`; if Google changes the model storage path/retires that model, the feature breaks silently until noticed. Low risk at the app's current scale; worth a periodic manual check.
- Camera permission prompts can be denied by the user — handled via a try/catch that surfaces a German error message and resets state, not a hard crash.

## Dependencies
- `@mediapipe/tasks-vision` (new npm dependency, real `package.json` entry — unlike the throwaway favicon-generation packages from session 5, this one ships in the bundle, but only in the `camera-tracker` route's lazy chunk).
- Depends on ADR-001's entitlement model for the `premiumGuard` check.
