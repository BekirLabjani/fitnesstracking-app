# Staff Engineer — premium-tier

**Patterns to follow (existing codebase conventions, not introducing new ones):**
- Standalone components, lazy-loaded via `loadComponent` in `app.routes.ts` — matches every existing route.
- `inject()` for DI, not constructor injection — matches 100% of the existing codebase.
- `Subscription` fields + `ngOnDestroy` unsubscribe for every `onSnapshot`/Observable subscription — matches `dashboard.component.ts`, `trainingsplan.component.ts`, etc.
- `ToastService` for user feedback (e.g. "Vorlage übernommen") — matches `add-training-dialog.component.ts`.
- `resolveExerciseName(id, customExercises)` for any exercise display name — never a raw `EXERCISES[id]` lookup, since custom exercises must resolve too.
- Test files use the shared `TEST_PROVIDERS` array from `src/testing/test-providers.ts` — never a bespoke provider list.

**Cross-cutting concern flagged:** this is the first feature to introduce a second Firestore-document-per-user pattern (`entitlements` alongside `userProfiles`) specifically *because* of a write-permission split. Documented here so the next person doesn't "simplify" it back into `userProfiles` without re-reading ADR-001.

**Reuse confirmed, nothing new introduced:** Chart.js/`ng2-charts` (already a dependency, used in `training-stats.component.ts`), no new npm packages for any of the three features.
