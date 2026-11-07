# SDE — premium-tier

## What was built
- `entitlements/{userId}` Firestore rule (read-only from client).
- `PremiumService` + `premiumGuard` (`src/app/shared/premium/`).
- `UpgradeComponent` at `/upgrade` — pricing display, mailto CTA, status display.
- `TrainingStatsProComponent` — new "Pro" tab in `/training`: volume trend (full history), muscle-group volume breakdown, per-exercise progress chart. Upsell card when not premium.
- `ExportService` — CSV export, wired into `/settings` (premium-gated, with an upsell row when locked).
- `WORKOUT_TEMPLATES` static data + `TemplatesComponent` at `/trainingsplan/templates` (premium-gated route), entry point added to `/trainingsplan` header.
- 9 new specs, all passing. Production build verified.

## Deviations from plan
None of substance. One small refinement during implementation not spelled out in the plan: the Settings page also got a standalone "⭐ Premium" row linking to `/upgrade` (not just the gated export row), so non-premium users have an obvious discovery path to the pricing page from Settings, not only from the Pro tab and Trainingsplan.

## Tech debt created
- `TemplatesComponent.applyTemplate` uses `confirm()` (native browser dialog) for the overwrite-protection prompt, rather than Angular Material's `MatDialog`. Deliberate — avoids introducing a new confirm-dialog pattern into the codebase for a single, low-stakes, user-reversible action. If a second feature needs a confirm dialog, that's the trigger to build a shared `ConfirmDialogComponent` instead of adding more `confirm()` calls.
- No admin UI for granting premium — Firebase Console only. Acceptable per PM scope (single-owner app, manual flag is explicitly the chosen model for this iteration).
