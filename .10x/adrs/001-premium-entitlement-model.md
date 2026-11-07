# ADR-001: Premium entitlement stored as a separate, client-unwritable Firestore collection

**Status:** Accepted
**Date:** 2026-11-07
**Feature:** premium-tier
**Author:** 10x-Team (Architect + Staff Engineer + Security)

## Context
The app needs a way to gate three new features (advanced stats, CSV export, workout templates) behind a "premium" status. The user explicitly chose to defer real payment processing (Stripe) and instead wants a manually-set flag they toggle themselves via the Firebase Console. The flag still has to live somewhere a Firestore security rule and an Angular service can read.

## Decision
Create a new collection `entitlements/{userId}` holding `{ isPremium, plan?, grantedAt?, note? }`. Firestore rule: `allow read: if request.auth.uid == userId; allow write: if false`. The document can only be created/edited through the Firebase Console (which uses the Admin SDK and bypasses security rules), never through the client app.

## Alternatives Considered
| Alternative | Pros | Cons | Why Not |
|---|---|---|---|
| Add `isPremium` field to `userProfiles/{userId}` | No new collection, one less rule block | `userProfiles` is owner-writable (`allow write: if request.auth.uid == userId`) — any logged-in user could set their own `isPremium: true` via the browser console or a crafted Firestore write, since nothing distinguishes that field from the rest of the document at the rules level | Privilege escalation vulnerability — rejected outright |
| Build Stripe + Cloud Functions now | Real, enforceable entitlement; matches the long-term goal | User explicitly deferred this; needs a Stripe account, webhook endpoint, Cloud Functions deploy, and Blaze-plan billing considerations beyond what was asked for this iteration | Scope the user didn't approve — would have ignored their answer in the brainstorming phase |
| Custom claims on the Firebase Auth token (`request.auth.token.premium`) | Enforceable in rules without a Firestore read, slightly cheaper | Requires a Cloud Function (`setCustomUserClaims` can only be called server-side with Admin SDK) — same "no backend yet" blocker as Stripe, and claims require the client to force-refresh its ID token after a change, adding UX complexity for no benefit at this stage | Same reason as above — needs server code that doesn't exist yet |

## Consequences

### Positive
- Zero privilege-escalation risk: the collection is entirely read-only from the client's perspective.
- The data shape (`isPremium`, `plan`, `grantedAt`) matches what a future Stripe webhook would write — switching to real payment later only replaces *who* writes the document, not the document shape, the security rule, or any app code that reads `PremiumService.isPremium$`.
- Simple mental model for the single owner: open Firebase Console → Firestore → `entitlements/<uid>` → set `isPremium: true`.

### Negative
- No self-service upgrade flow — every premium grant is a manual, synchronous action by the app owner. Does not scale past a handful of users, which is acceptable because this is explicitly a stepping stone, not the final monetization system.
- No way to *revoke* automatically on non-payment (there is no payment to track). Also acceptable under the same reasoning.

### Risks
- **Accepted risk — no server-side enforcement of feature usage.** Gating is UI-only (route guard + conditional rendering). A user who edits client state or calls app code directly (e.g. via browser devtools) could render the Pro UI locally without being flagged premium. Mitigation: none implemented, because none of the three gated features read another user's data or write to a collection whose rules depend on `isPremium` — a bypassed client only ever operates on the bypassing user's own already-accessible `trainings`/`customExercises`/`trainingPlans` data. This must be re-evaluated before any future feature that gates access to *other* users' data or server-billed resources (e.g. an AI-generated plan feature) is placed behind this same flag.

## Dependencies
- Depends on nothing new (reuses existing Auth/Firestore wiring).
- Constrains: a future Stripe integration must keep writing to the same `entitlements/{userId}` document shape to avoid a second migration across `PremiumService` and every gated component.
