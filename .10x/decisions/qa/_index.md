# QA — Cross-Cutting Notes

Active features: premium-tier (session 6)

## premium-tier
9 new specs, 37/37 total passing. See `premium-tier.md` and `.10x/reviews/2026-11-07-qa-report.md` for the manual end-to-end steps still needed post-deploy.

## Observations [DISCOVERED]
- 25 `.spec.ts` files exist (one per component/service, Angular CLI default scaffolds) — need to verify how many contain real assertions vs. the default "should create" stub.
- No e2e test setup (README still references the generic Angular CLI e2e instructions, no e2e package installed).
- No visible test run in CI since no CI exists — tests may not be run consistently before deploy.
