# Frontend security and privacy review

Reviewed October 18, 2026; source revision `8132dbc`. This is a focused static
React/TypeScript and public HTTP review supporting the
[release assessment](RELEASE_READINESS.md). It is not a penetration test or an
OWASP certification. Account settings, operating-system location providers and
third-party internal systems were not audited.

## Summary

No demonstrated critical or high-severity exploitable vulnerability was found
in the reviewed app paths. The locked dependency audit reported zero known
vulnerabilities on this date. Browser protections and operational dependency
monitoring have gaps. Zero reported advisories does not prove that software is
free from vulnerabilities.

The app uses normal React text rendering, same-origin compiled scripts, a locked
dependency tree, and no account/session backend. Searches found no raw HTML
injection, dynamic code execution, application Web Storage, location uploads, or
third-party application analytics. No secret values were printed or added to
this report. Future reporting or map vendors will need a fresh data-flow review.

## Medium severity

### SEC-01: Browser protections absent from the public app response

- Rule IDs: REACT-HEADERS-001, REACT-CSP-001.
- Location: `vercel.json:1–6`; `index.html`; live production `/` response.
- Evidence: the Vercel configuration defines only framework/build/output. The
  inspected HTTP 200 response included HTTPS/HSTS and HTML revalidation but
  lacked Content-Security-Policy, X-Content-Type-Options, X-Frame-Options,
  Referrer-Policy and Permissions-Policy. No equivalent meta policy was present.
- Impact: the browser has fewer defenses against unexpected script execution,
  framing/clickjacking, content-type confusion and inappropriate capability use.
  No working script-injection exploit was identified; this is a missing defense,
  not evidence that user data has been stolen.
- Fix: define tested response headers centrally. Constrain scripts, workers,
  styles, tile/style connections, framing and permitted capabilities to the
  app's actual requirements. Preserve geolocation for this origin and the origin
  referrer needed by OSM. Test a CSP in report-only mode before enforcement,
  reviewing any required style allowances without weakening script policy.
- Mitigation: retain safe React rendering, locked self-hosted JavaScript and
  existing narrow data inputs while protections are added.
- False-positive boundary: this was verified on the live response; a header
  present only on a different deployment would not protect this production URL.

## Low severity

### SEC-02: Dependency audit is manual rather than part of continuing checks

- Rule ID: REACT-SUPPLY-001.
- Location: `.github/workflows/quality.yml:1–66`; `package.json:12–21`.
- Evidence: the current CI runs locked install, formatting, lint, TypeScript,
  tests, build and whitespace checks. It does not run a dependency advisory
  audit or scheduled vulnerability scan. The one-time `npm audit --json` was
  clean; the VM's earlier reported advisory cannot be identified from its count.
- Impact: an advisory disclosed after release may go unnoticed even while
  Quality checks remain green.
- Fix: add an appropriate recurring advisory check and review process, with
  separate treatment for bundled production code and development tooling. Review
  fixes and the lockfile; do not run automatic force upgrades in production.
- Mitigation: run a fresh audit on every release candidate and triage the actual
  advisory, affected version and reachable behavior.
- False-positive boundary: private GitHub security/Dependabot settings were not
  inspected; they may provide additional scanning outside this workflow.

## Privacy and disclosure observations

Precise lookup readings are handled in
`RefinedBrowserLocationProvider.ts:31–115` and displayed through
`MapView.tsx:174`. The provider clears temporary candidate readings after
completion; the displayed point remains in application/map memory. No code was
found that sends it to an application backend or persists it across reloads.
Tile requests can still disclose the viewed geographic area to the map provider.
These facts must be reflected in the pilot's accessible privacy explanation.

`MapView.tsx:251` displays `mapError` directly. A tested tile failure included its
request URL in that message. URLs could contain a future public provider key or
sensitive parameters; sanitize them before display and reporting. The current
default tile URL contains no key, and no private-key leak was demonstrated.

Before adding error collection, validate a narrow event schema, remove precise
location/search/route data and URL queries, disable session replay, and inspect
the resulting vendor-side event. A privacy explanation alone does not replace
that verification. Proposed diagnostic gates and retention are in the release
assessment; no new data collection is enabled by this review.

## Verification and scope limits

- Full local quality check: 117 tests / 24 files and production build pass.
- Current full dependency audit: zero known advisories; no dependency changes made.
- Runtime header check: public production HTML, HTTP 200, no login redirect.
- Browser failure injection: location denial/unavailability/timeout recover;
  unsupported WebGL2 retains its message; a failed map-module download blanks
  the page. The latter is a high-priority availability defect, not a demonstrated
  confidentiality exploit.
- No destructive probes, load tests, credential attacks, production rollback,
  or changes to provider accounts were performed.

References: [OWASP ASVS](https://owasp.org/projects/asvs),
[OWASP CSP guidance](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html),
and [MDN CSP guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP).
