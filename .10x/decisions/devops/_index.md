# DevOps — Cross-Cutting Notes

## Observations [DISCOVERED]
- No CI/CD pipeline found (no `.github/workflows`, no other CI config). Deploys are presumably manual `ng build` + `firebase deploy`.
- `node_modules` was absent and `package.json` had `@angular/service-worker@^21.2.15` conflicting with the Angular 17 toolchain — fixed to `^17.0.0` this session; `npm install` and `ng serve` now succeed.
- `npm audit` reports 99 vulnerabilities (5 critical, 45 high) in the dependency tree — not yet triaged.
- `firebase.json` hosting config looks reasonable (SPA rewrite, cache headers, basic security headers `X-Frame-Options`/`X-Content-Type-Options`). Missing: `Content-Security-Policy`, `Strict-Transport-Security`.
- No `.env` / secret separation — Firebase web config is checked into `environment.ts` / `environment.prod.ts`, which is normal for Firebase client keys, but there is no visible separation for a future server-side key if one is ever added.
