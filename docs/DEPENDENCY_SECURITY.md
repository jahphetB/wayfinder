# Development dependency advisory resolution

## Summary

The minimatch advisory reported during release review is resolved in the locked
development dependency tree. A clean install, lint/type checks, tests, production
build and refreshed full npm audit validate the workaround. The audit reports
zero known vulnerabilities at the time of this release check; that is not a
general security certification or a promise about future advisories.

## SEC-001: Pattern amplification in minimatch

- **Rule:** REACT-SUPPLY-001, dependency and supply-chain hygiene.
- **Severity:** Moderate, as reported by the published advisory.
- **Original evidence:** ESLint 10.11.0, @eslint/config-array 0.23.5 and
  TypeScript-ESLint 8.70.0 resolved minimatch 10.2.6. The audit reported 12 affected
  development-tool packages through this one advisory.
- **Impact:** Attacker-controlled glob patterns could consume excessive CPU/memory
  during pattern preprocessing. The app does not accept user glob patterns and
  minimatch is absent from the production dependency tree; this was tooling
  exposure, not a demonstrated browser exploit.
- **Resolution:** The version-scoped `overrides` entry in `package.json:10` replaces
  affected minimatch versions with exact 11.0.1. `package-lock.json` records its
  integrity and resolved dependencies. No force-fix, toolchain downgrade, script
  policy change or audit-threshold reduction was used.

Upstream tool versions still requested minimatch 10.x during review, so a normal
compatible update did not eliminate this finding. The override is a documented
compatibility workaround, not a change to the application's map/navigation stack.
It can be removed when all parent packages resolve a patched release themselves.

## Verification boundary

`npm ci --ignore-scripts --no-audit` successfully recreated the locked install.
`npm ls minimatch --all` reports only 11.0.1; the production-only dependency tree
contains none. A network-refreshed `npm audit --audit-level=moderate --prefer-online`
reports zero vulnerabilities. `src/test/dependencyCompatibility.test.ts:5` checks
the exact patched version, named exports, braces, glob matching, dotfiles and
optimization-level options used by the lint/type-tooling boundary. Full project
checks exercise the actual ESLint/TypeScript integrations, not just the matcher.

This scoped review does not claim a penetration test or full third-party audit.

## Primary sources

- [Published advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249)
- [npm overrides](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#overrides)
- [npm audit behavior](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [Patched release](https://github.com/isaacs/minimatch/releases/tag/v11.0.1)
