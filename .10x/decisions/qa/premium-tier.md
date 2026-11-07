# QA — premium-tier

## Test strategy
Unit specs follow the existing `TEST_PROVIDERS` pattern for every new service/component (`PremiumService`, `ExportService`, `UpgradeComponent`, `TrainingStatsProComponent`, `TemplatesComponent`). 9 new tests added, 37/37 total passing (was 28/28 before this feature).

## Manually verified
- `npm run build -- --configuration production`: succeeds, no new budget errors (two pre-existing SCSS budget warnings unrelated to this feature, unchanged).
- Logged-out state: `PremiumService.isPremium$` emits `false` synchronously (covered by spec), `premiumGuard` redirects to `/upgrade`.

## Edge cases covered
- No `entitlements` doc for a user → treated as not-premium, not an error (both in `PremiumService` code and its spec).
- CSV export with zero trainings → produces a header-only CSV, doesn't throw (covered by spec). Settings component additionally blocks the action with a toast if the list is empty, so a user never downloads a confusingly-empty file by accident.
- Template "Übernehmen" when a plan already exists → confirmation dialog before overwrite (manual code-review verified; not spec-covered since `confirm()` isn't mocked in the test environment — acceptable for a low-stakes, user-reversible action).

## Not yet manually tested end-to-end in a browser
The reviewer (Claude Code, sandboxed) cannot click through the running app. Before considering this feature fully verified, the user should:
1. Deploy `firestore.rules` and hosting.
2. In Firebase Console, set `entitlements/<own-uid> = { isPremium: true }`.
3. Confirm all three features render correctly (Pro tab charts, CSV download opens/contains real data, template apply writes to `trainingPlans` and shows on `/trainingsplan`).
4. Set `isPremium: false` (or delete the doc) and confirm all three surfaces fall back to their upsell/lock state instead of erroring.
