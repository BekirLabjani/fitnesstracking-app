# Security Review — premium-tier — 2026-11-07

No new vulnerabilities. `entitlements/{userId}` collection is read-only from the client (verified: no write call exists anywhere in `src/`), ruling out the self-upgrade privilege-escalation risk that an `isPremium` field on the client-writable `userProfiles` collection would have had (see ADR-001). One deliberate, documented risk acceptance: premium gating is UI-only, justified because none of the three features touch another user's data or a billable backend resource. Full detail in `.10x/decisions/security/premium-tier.md`.
