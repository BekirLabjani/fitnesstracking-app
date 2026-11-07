# SRE — premium-tier

## Operational impact
Minimal. No new infra, no new external dependency, no new scheduled job. The feature adds one Firestore collection with a single-document-per-user read pattern (`onSnapshot`) — same read-cost shape as the existing `userProfiles` listener already running per session.

## Monitoring
No new alerts needed. Existing Firebase Console usage/billing visibility (and the billing budget alert set up in session 5) already covers any cost impact from the extra `entitlements` reads.

## Runbook: "a user says they're premium but don't see the features"
1. Firebase Console → Firestore → `entitlements/<their-uid>` — confirm the document exists and `isPremium === true` (not a string `"true"` — must be boolean).
2. If missing/false: this is the grant workflow not having been done yet (see `devops/premium-tier.md`) — not a bug.
3. If `isPremium: true` and still not visible: ask the user to hard-refresh (rules out a stale `ngsw` service-worker cache serving an old build) — not an `entitlements`-specific issue, existing PWA caching behavior.

## Escalation path
Single-owner app — no on-call rotation exists or is needed at this scale.
