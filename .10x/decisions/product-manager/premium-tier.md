# Product Manager — premium-tier

**Scope (user-selected via AskUserQuestion):** Erweiterte Statistiken, Daten-Export (CSV), Workout-Vorlagen-Bibliothek. Explicitly NOT selected: artificial limits on existing free features (e.g. capping custom exercises) — the premium tier is pure value-add, not a crippled free tier.

**User stories:**
- As a committed user, I want to see my training volume and muscle-group balance over time, so I can tell if my program is working.
- As a data-minded user, I want to export my full training history, so I own my data outside the app.
- As a new or plateaued user, I want proven workout templates I can apply in one click, so I don't have to design a program from scratch.
- As any user, I want to see what premium costs and how to get it, even before real payment exists, so the product doesn't feel unfinished.

**Success criteria:** All three features are reachable, correctly gated (visible only with `entitlements/{uid}.isPremium === true`), and the free experience is unchanged for non-premium users (upsell cards, not blocked flows).

**Non-goals this iteration:** real checkout, subscription lifecycle (renewal/cancellation), PDF export, per-feature free-tier caps.
