# Premium-Tier: Design Spec

**Feature slug:** `premium-tier`
**Date:** 2026-11-07
**Status:** Approved (via plan-mode review, see `.10x/adrs/001-premium-entitlement-model.md` for the architectural decision)

## Problem
The app has no monetization path. The user wants to identify and build the features people would actually pay for, without committing to a full payment integration (Stripe/Cloud Functions) yet.

## Scope (user-approved via AskUserQuestion)
Three premium features:
1. **Erweiterte Statistiken** — volume trend (full history, not just 8 weeks), muscle-group volume breakdown, per-exercise progress chart.
2. **Daten-Export (CSV)** — training history as a downloadable CSV file.
3. **Workout-Vorlagen-Bibliothek** — predefined training plan templates users can apply with one click.

Explicitly out of scope for this iteration:
- Real payment processing (Stripe). Premium status is a manually-set Firestore flag the app owner sets via the Firebase Console.
- PDF export (would add a new dependency; CSV only for now).
- Per-feature free-tier limits (e.g. capping custom exercises) — none of the existing free features get artificially restricted.

## Entitlement model
New `entitlements/{userId}` Firestore collection, deliberately separate from the client-writable `userProfiles` collection. See ADR-001 for the full reasoning and accepted risk (UI-only gating, no server enforcement, judged acceptable because none of the three features expose other users' data or consume billable backend resources).

## User-facing surfaces
- `/upgrade` — pricing page (monthly + lifetime, placeholder prices), shows current status, CTA is a `mailto:` placeholder (no real checkout yet).
- New "Pro" tab inside `/training` for advanced stats.
- Export button in `/settings`.
- "Vorlagen durchsuchen" entry point in `/trainingsplan`, new route `/trainingsplan/templates`.

All three gated via a shared `PremiumService.isPremium$` + a `premiumGuard` for full-page routes, inline upsell cards for in-page sections (the Pro tab).

## Out-of-scope follow-ups (documented, not built)
- Real Stripe integration (would replace the manual-flag write path with a Cloud Functions webhook writing the same `entitlements` doc shape — the rest of the app does not need to change).
- PDF export.
- Admin UI for granting premium (Firebase Console is sufficient for a single-owner app at this stage).
