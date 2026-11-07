# Engineering Manager — premium-tier

## Task breakdown (sequenced, no task > half a day)

1. Entitlement infra: `firestore.rules` + `PremiumService` + `premiumGuard`. **Blocks everything else** — all three features depend on `PremiumService`.
2. `UpgradeComponent` + `/upgrade` route. Depends on (1) for status display.
3. `PremiumStatsComponent` + Pro tab wiring in `training.component.ts`. Depends on (1).
4. `ExportService` + Settings export button. Depends on (1).
5. `workout-templates.data.ts` + `TemplatesComponent` + route + trainingsplan entry point. Depends on (1).
6. Specs for everything built in 1-5.
7. Build + test verification.
8. Deploy: firestore rules, then hosting (both need explicit user confirmation per the established deploy workflow this session).

Tasks 3, 4, 5 are independent of each other once (1) is done — no sequencing constraint between them beyond doing them one at a time for reviewability.

## Risks/unknowns identified
- None technical — every building block (Chart.js, Firestore patterns, guard patterns, toast patterns) already exists in the codebase. The only real unknown was the security-rule design, resolved in ADR-001 before this file was written.
