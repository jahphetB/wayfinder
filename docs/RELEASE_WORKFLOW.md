# Development and release workflow

This is the contributor procedure for changing, testing, publishing, and
recovering Yotes Wayfinder. It applies to application code, styles, geographic
data, dependencies, environment settings, and documentation. A release is a
tested version made available at the public production URL.

## Contents

- [Rules](#rules)
- [Tools and automated checks](#tools-and-automated-checks)
- [Configure repository enforcement](#configure-repository-enforcement)
- [1. Start an isolated change](#1-start-an-isolated-change)
- [2. Implement and verify](#2-implement-and-verify)
- [3. Publish a preview](#3-publish-a-preview)
- [4. Review the preview](#4-review-the-preview)
- [5. Release to production](#5-release-to-production)
- [6. Check production](#6-check-production)
- [Recover a broken release](#recover-a-broken-release)
- [Versions and release records](#versions-and-release-records)
- [Special cases](#special-cases)
- [Terms and references](#terms-and-references)

## Rules

1. Keep `main` as the production branch. Use a separate branch for each cohesive
   change; do not develop directly on `main`.
2. Commit small, verified changes with descriptive messages such as
   `fix(map): preserve route camera after mode switch`.
3. Open a pull request into `main`. Require passing checks and review of the
   latest preview before merging. A newer commit invalidates earlier test evidence
   for affected behavior.
4. Keep publication permissions explicit: approval to implement or make local
   commits does not authorize pushing, merging, or promoting a deployment.
5. Do not force-push, rewrite shared history, or commit secrets, `.env.local`,
   `node_modules`, or `dist`. Browser-visible `VITE_` values cannot hold secrets.
6. Record the tested commit, preview URL, and last working production deployment.
   Keep recovery possible before releasing.
7. A successful build is not proof that routes, GPS, or the interface work.
   Perform the relevant browser and physical-device checks below.

## Tools and automated checks

Use Node.js 22, the family specified in `.node-version`. GitHub Actions reads
this file; set the Vercel project's Node.js version to 22.x as well. The file
selects a major version, not an identical patch version on every machine.
Run `node --version` and `npm --version` when diagnosing environment differences.

`package-lock.json` records dependency versions. `npm ci` installs that recorded
set instead of updating it. After obtaining the source, run:

```powershell
npm ci
npm run check
git diff --check
```

`npm run check` runs formatting, lint, TypeScript, tests, and a production build,
stopping at the first failure. The individual commands remain available in
`package.json`. Fix failures rather than skipping checks to get a green result.

`.github/workflows/quality.yml` runs the same checks as separate named steps
after `npm ci` on pull requests targeting `main` and on pushes to `main`. It also
supports a manual run after the workflow is on the default branch. The job is
named **Quality checks**. Superseded runs are cancelled to avoid wasting runner
time. The workflow has read-only repository permissions and no deployment secrets.
Whitespace checks compare the proposed commits with their base revision; a manual
run checks the latest commit. Full Git history is fetched for those comparisons.
Actions are pinned to reviewed commit IDs; update their ID and version comment
together after checking the official release. npm's cache saves downloads, not
the installed `node_modules` folder.

The workflow checks source and build behavior on Linux. Local verification on
Windows does not prove that the hosted workflow has passed. It must run on GitHub
after publication. It does not perform real-device GPS testing or browser tests.

## Configure repository enforcement

These are repository/hosting settings, not settings a committed Markdown or YAML
file can enforce. Do not report them as enabled without checking the dashboards.

After publishing the workflow branch and opening its pull request, let
**Quality checks** run once so GitHub can offer it as a required status check.
In GitHub repository **Settings > Branches**, add a protection rule for `main`
(or an equivalent branch ruleset):

- Require a pull request before merging.
- Require the **Quality checks** status from GitHub Actions. The interface may
  show it under the workflow name **Quality**.
- Require the branch to be up to date before merging and require resolved review
  conversations. Check and review the resulting revision again after updating.
- Block force pushes and deletion; apply the rule to administrators/bypass users
  where the account settings permit.
- For a solo maintainer, do not require a second person's approving review unless
  that reviewer exists. The author cannot approve their own pull request. Record
  the owner's preview/release approval in the pull request instead.

Availability of protection features depends on GitHub plan and repository
visibility. Without enforcement, this remains a contributor procedure and users
with write access may bypass it. Vercel can build in parallel with Quality checks;
the workflow alone does not prevent production publication after a direct push.

In Vercel, verify the Git integration points to this repository, production branch
is `main`, root is the repository root, framework is Vite, build is `npm run build`,
and output is `dist`. Non-production branches should create Preview deployments.
Keep Preview and Production environment values deliberate and separately checked;
an environment difference can make an otherwise identical build behave differently.

## 1. Start an isolated change

Check the working directory and preserve any unfinished changes before switching
branches. `git status` should be clean for the following sequence:

```powershell
git status --short --branch
git switch main
git pull --ff-only origin main
git switch -c feat/building-details
```

`feat/building-details` is an example name; use `fix/...`, `chore/...`, or `docs/...`
as appropriate. `--ff-only` updates without creating an unexpected merge commit.
If it fails because histories differ, inspect the history instead of resetting.

## 2. Implement and verify

Keep the approved scope small. Add or update tests for changed logic and integration
boundaries; visual-only changes generally need browser checks rather than new tests
that merely repeat CSS values. Preserve UI, domain, data, and provider boundaries.

Run `npm run check` and `git diff --check`. For user-interface changes, also run
`npm run dev` and inspect the exact URL Vite prints. Check `npm run preview` when
behavior may differ in the production build. Update the relevant architecture,
progress, and contributor records with facts about implemented behavior.

Review `git diff` and stage only files belonging to the change:

```powershell
git diff
git add src/features/map/components/MapView.tsx
git diff --cached
git commit -m "feat(map): add building selection"
```

The path and message above are examples, not changes to run for every release.
Repeat for cohesive verified units. Do not blindly stage unrelated user edits.

## 3. Publish a preview

After push approval, publish the feature branch, not `main`:

```powershell
git push -u origin feat/building-details
```

On GitHub choose **Compare & pull request**, target `main`, and fill in the
repository's pull-request template. Open the Vercel Preview URL provided by the
integration and record its exact commit. A preview is a separate test website;
it does not replace the production site. GitHub Actions and Vercel have separate
statuses: require both a passing Quality job and a ready preview.

If a check fails, open its log, fix the cause on the same feature branch, verify,
commit, and push with authorization. Wait for the newest checks and re-test the
newest preview. Do not merge an older successful revision over newer failures.

## 4. Review the preview

Use desktop and a real phone where the change matters. A narrow desktop browser
window checks layout; it does not measure actual phone performance or GPS.

- Open a fresh tab, confirm the map loads, fields are initially empty, and the
  browser reports no unexpected console errors.
- Select library to Sterry Hall, preview a route, and verify distance, instructions,
  and route visibility. Check another affected pair for geographic changes.
- Switch 2D/3D and confirm the route remains. Start simulated navigation, use Next
  and Back, and complete the route. Verify unavailable-route behavior when relevant.
- Check Get your location on a phone with permission granted and denied. Confirm
  on-campus/off-campus/uncertain results where practical; simulation is not GPS evidence.
- Check search scrolling, keyboard focus, button reachability, readable labels,
  and no horizontal overflow on phone widths.
- For map changes, verify visible attribution, entrances, formal-path preference,
  and any affected stadium handoff. Do not claim verified access or accessibility
  from visual inspection alone.
- Check a tab opened before the update as well as a fresh tab. Current sessions
  can continue running older code; refreshing generally loads the newer app.

Record device/browser, tested revision, results, and known limitations in the pull
request. Mark inapplicable checks explicitly with a reason rather than claiming
they passed. Do not include users' precise coordinates in public reports.

## 5. Release to production

Before merging, confirm the latest checks and preview review pass, release approval
is recorded, and the previous working production URL and commit are saved in the
pull request. For functional releases, prepare the version record below on the
feature branch before its final checks; version edits trigger another review.

Use GitHub's **Squash and merge** to combine the branch into one identifiable
release change on `main`. Individual development commits remain in the pull-request
history. If GitHub requires an update first, merge the current `origin/main` into
the feature branch, resolve conflicts carefully, and repeat checks and review.
Do not force-push to resolve a conflict.

The connected Vercel project normally builds and publishes `main` automatically.
The Quality job also runs on `main`; monitor both. Do not manually promote the
feature preview as an alternate route around the agreed merge/check process.

## 6. Check production

Wait for Vercel to report **Ready** and GitHub's Quality job to pass for the merged
commit. Verify the deployment's commit in Vercel and open
`https://wayfinder-umber.vercel.app/` in a fresh tab. Repeat a short check of map
load, search, route preview, navigation controls, and the changed feature on desktop
and phone. A green deployment status does not confirm these interactions.

Record the production URL, deployed commit, verification results, and release
version in the pull request or GitHub release. A rollback target must be a known
working deployment, not simply the immediately preceding one.

After the merged version is verified, update the local checkout:

```powershell
git switch main
git pull --ff-only origin main
```

Because a squash merge creates a different commit, `git branch -d` may refuse to
delete the original local branch. Keeping it is safe; do not force-delete it without
first verifying that all its changes exist in `main`.

## Recover a broken release

For a serious user-facing regression, use Vercel's deployment dashboard to select
the recorded working production deployment and choose **Instant Rollback**, where
available for the account and eligible deployment. Confirm the chosen commit and
check the production URL after recovery. Preserve working deployments so they
remain recovery candidates. Rollback availability can vary by plan and deployment.

Vercel can pause automatic domain assignment after a rollback. Check its displayed
state before expecting the next merge to publish; explicitly restore normal
production promotion after the fix is verified. A dashboard rollback changes the
served build, not Git history or external service settings.

Then fix the source through a branch and pull request. Alternatively, use a new
commit that reverses the faulty squash-merge commit:

```powershell
git switch main
git pull --ff-only origin main
git switch -c fix/revert-release
git revert REPLACE_WITH_FAULTY_SQUASH_COMMIT
```

Replace the uppercase placeholder with the reviewed commit ID. Resolve any
conflicts, run the checks, publish the branch with authorization, and use the
normal review/release process. `git revert` adds history; it does not erase it.
If the dashboard cannot roll back, this corrective release is the fallback.

A static-build rollback restores that build's bundled campus data. It does not
restore provider accounts, remote APIs, changed secrets, or future databases.
Record and recover those separately if later architecture introduces them.

## Versions and release records

The package currently remains `0.0.0`; adding this procedure does not declare a
new public release. Before a deliberate functional release, choose its version
on the branch. For example, a first named prototype release could use:

```powershell
npm version 0.1.0 --no-git-tag-version
```

This updates `package.json` and `package-lock.json` without committing or tagging.
Review and commit both, re-run checks, then follow preview and production review.
For later versions use `npm version patch --no-git-tag-version` for fixes or
`npm version minor --no-git-tag-version` for additions. Pre-1.0 versions signal
an evolving prototype; explain changed behavior in release notes regardless of
the version number. Documentation-only changes do not require a version bump.

After production verification, create an annotated tag on the exact deployed
`main` commit and publish it only with approval:

```powershell
git tag -a v0.1.0 DEPLOYED_MAIN_COMMIT -m "Prototype release 0.1.0"
git push origin v0.1.0
```

Use the actual version and deployed commit, not the sample placeholders. Published
tags must not be moved to different commits. A GitHub release can attach concise
notes: user-visible changes, known limitations, verified commit, deployment URL,
and checks performed. This workflow does not publish npm packages or automatically
deploy tags.

## Special cases

**Campus-data updates:** preserve the source and digest, run the documented OSM
import, inspect changed entrances and network connections, test affected routes,
and release through the same branch/preview process. Keep uncertain access data
labelled. See [the collection guide](CAMPUS_DATA_COLLECTION.md).

**Dependencies and runtime:** change these separately from unrelated feature work.
Review the lockfile, action release IDs, Node version, and Vercel setting together.
Do not change them just to silence a build warning.

**Urgent fixes:** keep the branch, checks, preview, and recorded approval. Use a
small corrective change or restore production first. Urgency is not permission
to rewrite shared history or skip knowing which version is live.

**Open tabs and future backends:** this app currently has no service worker or
database migration process. Existing tabs may still run the previous JavaScript;
do not force reload during a walk. If persistent offline caching or a backend is
introduced, design compatible data/API changes and update this procedure first.

## Terms and references

- **Branch:** an independent line of work based on a saved source revision.
- **Pull request (PR):** a proposed branch change with review, checks, and history.
- **Continuous integration (CI):** automatic checks each time a proposed change is
  submitted or updated. It is not automatic proof of real-world correctness.
- **Preview / production:** the test deployment / public deployment used by visitors.
- **Commit / tag:** a saved source revision / a named reference to a revision.
- **Rollback / revert:** restore a served deployment / add a source commit that
  reverses an earlier change.

Sources: [GitHub Node.js CI](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs),
[protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches),
[Vercel Git deployments](https://vercel.com/docs/git), and
[Vercel Instant Rollback](https://vercel.com/docs/instant-rollback).
