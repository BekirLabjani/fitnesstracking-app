# CTO — premium-tier

**Build vs buy:** Build. The gating logic and the three features are app-specific; no off-the-shelf product replaces them. Payment processing itself (deferred) would be "buy" (Stripe), not build.

**Strategic direction:** Ship the premium UX and feature set now, defer the actual payment rail. This de-risks the monetization decision — the user can validate interest (manually granting trial access to a few real users) before investing in Stripe/Cloud Functions integration, billing edge cases (failed payments, refunds, proration), and the associated support burden.

**Opportunity cost:** Low. All three features reuse existing data (`trainings`, `EXERCISES`) and existing dependencies (Chart.js already present) — no new paid services, no new infra beyond one new Firestore collection.

**Verdict:** Proceed with the feature build as scoped. Revisit Stripe integration as a separate, explicitly-approved project once there's a reason to believe real users will pay (the manual-flag model is the validation step for that).
