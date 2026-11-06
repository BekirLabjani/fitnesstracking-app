# QA — Cross-Cutting Notes

## Observations [DISCOVERED]
- 25 `.spec.ts` files exist (one per component/service, Angular CLI default scaffolds) — need to verify how many contain real assertions vs. the default "should create" stub.
- No e2e test setup (README still references the generic Angular CLI e2e instructions, no e2e package installed).
- No visible test run in CI since no CI exists — tests may not be run consistently before deploy.
