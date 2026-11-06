# Current Handoff

**From:** Discovery (all roles)
**To:** User decision

Full-codebase review completed on request ("schau dir die App an und sag mir wo man was verbessern könnte"). No implementation was requested yet — findings presented in chat, organized by role lens (Security, Architecture/Data, DevOps, QA). Awaiting user's pick of what to actually fix; each fix should go through a mini-brainstorm before code changes per the HARD-GATE, scaled to task size (most of these are small-fix size).

Highest-priority item: `friends` and `userProfiles` Firestore collections are used by `FriendsService` but have no matching rule in `firestore.rules` — the catch-all `allow read, write: if false` blocks them, so the friends feature is almost certainly broken/silently failing in production.

## History
(none yet — first handoff)
