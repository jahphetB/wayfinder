# Frontend security and privacy review

## Scope and current candidate

October 23, 2026; manual-campus-guide candidate `0.1.0-rc.1`.
This is a focused React/TypeScript, browser-policy and dependency review, not a
penetration test, guarantee of security or OWASP certification. The
[earlier review](history/SECURITY_PRE_GUIDE.md) preserves prior findings.
Candidate fixes do not protect production until the approved release is deployed.

## Browser protections implemented

`vercel.json` defines the response policy, and `vite.config.ts` applies those same
headers to local production preview. `browserSecurity.test.ts` checks the
intended constraints; fresh-browser runtime checks verify enforcement.

- Content Security Policy (CSP): scripts and workers only from this origin, no
  inline/eval scripts, no objects/frames, self-only base and form actions.
  Default map imagery/connections allow only the application's origin and
  `https://tile.openstreetmap.org`; images also allow data/blob URLs.
- MapLibre uses inline style attributes for positioning. The policy permits those
  attributes, not inline scripts or unrestricted remote stylesheets.
- `frame-ancestors 'none'` plus X-Frame-Options DENY prevent embedding the app.
- X-Content-Type-Options nosniff discourages treating responses as another type.
- Strict-origin-when-cross-origin referrer policy limits cross-site referrer
  detail while retaining the origin required by OSM's tile policy.
- Permissions Policy permits geolocation only for the app origin, and disables
  camera/microphone. It does not grant location permission automatically.

In a fresh non-bypass browser context, the map loads with no normal policy
violations; a deliberately inserted inline script is blocked. Normal manual
walkthrough and snapshot/error flows also work with the policy enforced.
Automated accessibility injection uses a separate tool-only CSP-bypass context;
deployed headers were not weakened to enable that tool.

The optional Vercel preview feedback toolbar is outside the application's
allowlist. Automated hosted checks suppress its injection with
`x-vercel-skip-toolbar: 1`; ordinary previews may report its blocked script.
Do not widen production script policy for optional preview tooling.
A new `VITE_MAP_STYLE_URL` or map vendor requires reviewing resource origins,
attribution, referrer behavior and privacy together.

## Dependencies and build

A fresh network-refreshed full npm audit reported zero known findings on
October 23. This is time-specific evidence, not proof that packages are flawless.
Earlier tooling findings were fixed by targeted Vite/Vitest/source-map-js updates;
this package adds no new major runtime dependency.

Quality CI runs `npm audit --audit-level=high --prefer-online` alongside existing
checks and declares a weekly schedule. The schedule starts when the workflow
reaches main; configuration alone is not proof of a completed scheduled scan.
Findings require severity/reachability and lockfile review, not force upgrades.

Production source maps remain off, package metadata remains UNLICENSED, original
ownership banners remain, and third-party notices are included in the build.
These ownership measures do not prevent copying browser-delivered code.
No secret was added, printed or used as a browser configuration value.

## Location privacy and error boundaries

Only Get my location, Start navigating and Next request a snapshot. The bounded
provider stops temporary collection on completion, cancellation, replacement,
route change, timeout or unmount. One hook ignores late/stale results.
Only the last reading is retained in tab memory; there is no application
location-history storage/upload, movement trail, analytics or remote error
collection. Reloading/closing clears application state.

The native footer disclosure describes this behavior and ordinary Vercel/tile
requests. Those services see web-request metadata, including IP and viewed map
area. Browser/OS location acquisition is outside this application's internal
control. Do not describe this as anonymous or zero-third-party-data processing.

Page/deferred-map error boundaries, separate bounded map-loading deadlines,
generic sanitized map messages and explicit retry/reload prevent known map
failures from blanking the whole application. Browser failure injection covers
module download failure, graphics loss, partial tile failure and unsupported
WebGL2. Unsupported graphics still require a supported browser/device; this
release does not add a fallback renderer.

## Boundaries and residual risks

- No user accounts, sessions, routing backend, database or uploaded content.
- React text rendering remains the default; no new raw HTML or eval path.
- A concrete unsafe route/access defect must be corrected or excluded; the
  accepted geographic baseline is not an independently certified survey.
- Community map tiles provide no reserved capacity or availability guarantee.
- Physical-device performance/GPS and manual screen-reader behavior are not
  established by fixtures or automated audits.
- No production rollback, destructive probe, public-service load test or account
  security-setting change was performed.
- Future telemetry, vendors, photos, backend or persistent data need a fresh review
  of consent, minimal data, retention, input handling and credentials.

References: [OWASP CSP guidance](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html),
[MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP),
[OSM tile policy](https://operations.osmfoundation.org/policies/tiles/),
[Vercel toolbar](https://vercel.com/docs/vercel-toolbar/managing-toolbar).
