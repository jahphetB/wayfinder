# Development, release and recovery workflow

This procedure applies to code, styling, geographic data, dependencies and hosting
configuration. The product contract is [PRODUCT_PLAN.md](PRODUCT_PLAN.md); the
practical acceptance checks are [RELEASE_READINESS.md](RELEASE_READINESS.md).
Earlier GPS checkpoint and G01–G12 launch gates are superseded.

## Contents

- [Rules and environments](#rules-and-environments)
- [1. Isolate the change](#1-isolate-the-change)
- [2. Implement and verify](#2-implement-and-verify)
- [3. Publish and review preview](#3-publish-and-review-preview)
- [4. Approve and release](#4-approve-and-release)
- [5. Verify production](#5-verify-production)
- [Recover a failed release](#recover-a-failed-release)
- [Data, dependency and configuration changes](#data-dependency-and-configuration-changes)
- [Versions and evidence](#versions-and-evidence)

## Rules and environments

- Work on a feature branch. Keep `main` for reviewed production changes.
- Commit cohesive verified units; preview commits and pushes have standing approval.
  Announce work on preview and every change of target environment.
- A merge to `main` or production promotion needs explicit release approval.
  No force pushes, rewritten shared history or bypass of required checks.
- Visual changes use the original selected source in UI_REFERENCE_CONTRACT.md.
  Capture all six planner/editing/navigation desktop/mobile comparisons and test
  both sides of 640px, including fractional widths. Preserve manual progress and
  snapshot independence; UI_REFERENCE_VERIFICATION.md records this candidate.
- Record the reviewed source commit and preview URL, plus the known-good production
  deployment/commit before release. A newer commit requires affected checks again.
- Never commit secrets, `.env.local`, `node_modules` or `dist`.
  Browser-visible `VITE_` settings cannot contain secrets.
- Local configuration files do not prove dashboard enforcement. Check hosted
  status and branch rules separately; green deployment is not browser verification.

The public production URL is https://wayfinder-umber.vercel.app/.
The current feature preview is
https://wayfinder-git-feat-step-39-location-refinement-jahphet.vercel.app/.
Preview is a separate website, not a release to existing production visitors.

## 1. Isolate the change

Preserve unfinished work and inspect the current branch before switching. With a
clean working tree, start an appropriately named feature/fix/docs branch:

```powershell
git status --short --branch
git switch main
git pull --ff-only origin main
git switch -c fix/describe-the-change
```

If fast-forward fails, inspect history; do not reset away another contributor's work.

## 2. Implement and verify

Use Node.js 22.x as recorded in `.node-version` and package engines. Install the
recorded dependency tree with `npm ci`, not an uncontrolled dependency upgrade.

```powershell
npm ci
npm run check
npm audit --audit-level=high --prefer-online
git diff --check
```

`npm run check` runs formatting, linting, TypeScript, tests and a production
build. A network-refreshed audit is separate evidence: cached/offline zero findings
are not current advisory clearance. Review findings and targeted lockfile changes;
do not use `npm audit fix --force` to bypass compatibility analysis.

Keep UI, domain, data, infrastructure and composition separate. Add focused
regressions for changed behavior and update the handbook, diagrams, progress and
project memory when their facts change. Source indentation uses tabs. Theme and
camera settings belong in `theme.css` and `mapPresentation.ts`.

Review/stage only related files, then make a focused commit. Do not include
unrelated user edits just because they are present.

## 3. Publish and review preview

Push the feature branch and open/update its pull request into `main`.
GitHub's **Quality checks** and Vercel's preview build are separate statuses; both
must pass on the newest commit. Quality runs on pull requests and main pushes.
The candidate adds a high/critical advisory audit and a weekly scheduled run.
Scheduled execution starts only after that workflow reaches the default branch;
a committed schedule is not evidence that the hosted scan has run.

Open the preview in a fresh tab and record the actual deployed revision. For the
manual guide, check:

1. No location request on page load. Search is empty and the map loads.
2. Choose library to cafeteria or Sterry, Preview route, Start navigating, Next,
   Back and finish. Steps advance immediately even with pending/denied location.
   Completion says walkthrough complete, not physical arrival.
3. Only Get my location, Start navigating and Next acquire location. Each bounded
   lookup cleans up. Rapid Next replaces the prior lookup, route edits cancel it,
   and a late result cannot change another route. Back makes no request.
4. Check Last checked, contrasting green circle, denied/unavailable/stale feedback,
   retained older snapshot and off-campus/uncertain feedback. No trail or storage.
5. Check 2D/3D, deliberate camera changes, repeated controls and reduced motion.
   Snapshot updates must not interrupt an active walkthrough camera.
6. Check keyboard search (arrows/Enter/Escape/Tab), full-list scrolling, focus,
   building dialog, footer/privacy, readable labels and no narrow-screen overflow.
   Automated accessibility results do not replace screen-reader/device checks.
7. Check normal operation under the actual response headers. Vite's production
   preview uses `vercel.json` headers; the development server does not enforce
   them because its debug connection differs. Do not weaken script policy for tools.
8. Inspect unexpected console errors and failed app requests. Do not publish
   exact user coordinates or sensitive query strings in evidence.

Vercel's optional feedback toolbar is disabled for this project's Preview
environment. Verify a normal preview response does not include
`vercel.live/_next-live/feedback/feedback.js`, and check the browser without a
toolbar-suppression request header. Keep the existing CSP unchanged: allowing a
new script origin is not the remedy. Vercel's documented automation-only
`x-vercel-skip-toolbar` header can isolate tests when required elsewhere, but a
test using it does not prove ordinary visitors are free of injection warnings.
These toolbar settings do not change authentication protection or release approval.

### Failure/recovery regression checks

Use local production preview and browser interception, not load against public
tile servers. For map/recovery changes:

- Block `MapView-*.js`: planner remains editable, recovery offers Reload page.
  Remove the block before reload and confirm recovery. Reload intentionally clears
  transient route/snapshot state.
- Delay the module and map startup separately: each has its own 20-second deadline.
  Remove the fault and explicitly retry. Map-only retry preserves the selected route.
- Return fixture HTTP 503 responses for tiles: incomplete-imagery warning and retry,
  while controls remain available. Do not repeatedly hit the real service.
- Simulate unavailable WebGL2 and graphics-context loss: clear unsupported/error
  message, no page crash; supported-context retry restores route display.
- Deny location and leave it pending: manual progression still works, cancellation
  stops temporary acquisition, old snapshot is identified if retained.
- Re-test search with open/no-results/full-list states. Focus stays on the input;
  active-descendant IDs name direct listbox options; Tab exits without hidden stops.

For axe injection, use an isolated tool-only CSP-bypass context. Test the real
enforced policy separately in a fresh non-bypass context. Never weaken deployed
headers merely to make the audit script execute.

### Short physical-device check

Before broadening an invited rollout, check a supported real phone and the affected
school computer: initial load, preview/Next/Back/2D/3D responsiveness, permission
allow/deny, Last checked updates, readable controls and footer. Try reduced motion.
Record device/browser and observed problems. Physical walking is not required to
complete a walkthrough; GPS quality needs an actual-device check, not a fixture.

## 4. Approve and release

Record candidate version, tested preview commit, checks and known limitations in
the pull request. Confirm the previous working deployment is recoverable. Obtain
explicit approval for the exact release; announce the preview-to-production transition.

Use the reviewed pull request's **Squash and merge** into `main`. If required
checks or up-to-date rules block it, resolve through the feature branch and repeat
affected verification. Do not force-push or promote a preview as a shortcut.

The Vercel Git integration normally builds `main` automatically. Watch both the
main Quality run and Vercel deployment; no additional production promotion is
authorized merely because a feature branch was pushed.

## 5. Verify production

Wait for Ready and passing main checks. Verify the deployed commit, open the public
domain fresh, then smoke-test map, search, preview, manual controls and the changed
feature. Check the actual security headers and absence of authentication prompts.
Record version, source/deployment IDs, results and the recovery target.

Existing tabs may run older code until refreshed. There is no service worker,
forced reload, database migration or live configuration service in this release.
Never claim a fresh build has updated every already-open tab.

## Recover a failed release

For a serious regression, use the recorded known-good production deployment, not
simply the immediately preceding one. In Vercel, **Instant Rollback** can restore an
eligible prior deployment. Confirm its exact commit and repeat the essential live
checks. Dashboard eligibility/settings must be checked when used; this procedure
does not claim a hosted rollback rehearsal has occurred.

A rollback changes the served build, not Git history or external accounts. Vercel
may pause automatic domain assignment afterward; inspect its displayed state
before expecting a later merge to publish. Restore normal release behavior only
with a reviewed fix and approval.

If rollback is unavailable, prepare a corrective branch or a source revert:

```powershell
git switch main
git pull --ff-only origin main
git switch -c fix/revert-release
git revert REPLACE_WITH_REVIEWED_FAULTY_SQUASH_COMMIT
```

Resolve conflicts, verify, publish preview and obtain approval through the same
workflow. Revert adds a new reversal commit; it does not erase shared history.
A static rollback restores bundled campus data but not external service settings.

## Data, dependency and configuration changes

**Geographic data:** preserve source/digest, use the OSM importer, inspect generated
diffs and test affected graph connections/routes. The current dataset is accepted;
a future export or comprehensive survey is not a blanket software-release gate.
Keep inferred connectors and access limitations honest.

**Dependencies:** review advisory severity, reachable behavior and production versus
development packages. Make targeted updates with compatibility tests. Align Node
engines, lockfile, workflow and hosting settings where relevant.

**Map provider:** default imagery is best-effort OSM, not reserved capacity.
Do not load-test it. Before broad promotion, review observed traffic, usage policy,
attribution and cost limits. A changed tile/style host needs an explicit CSP
allowlist and privacy review; `VITE_MAP_STYLE_URL` does not bypass the policy.

**Headers/environment:** test the deployed policy and browser behavior, not just
JSON strings. Keep self-hosted scripts/workers and the narrow style-attribute
exception required by MapLibre. No paid service or telemetry is implied.

## Versions and evidence

The prepared candidate is `0.1.0-rc.1`; it is not a production release. A release
candidate is a named build proposed for review. Keep package and lockfile versions
aligned. A source SHA identifies exact code independently of the version label.

After an approved production release and live verification, an annotated immutable
tag may identify the deployed main commit. Use the actual version and commit;
never move published tags. No tag or npm package publication is automatic here.

Release evidence records: source SHA, version, preview and production URLs,
hosted statuses, local checks, browser/device conditions, injected failures,
limitations, explicit approval and known-good recovery target. Keep precise
locations and credentials out of public evidence.

References: [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches),
[Vercel Git deployments](https://vercel.com/docs/git),
[Instant Rollback](https://vercel.com/docs/instant-rollback), and
[Toolbar management](https://vercel.com/docs/vercel-toolbar/managing-toolbar).
