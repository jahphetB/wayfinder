# Yote Wayfinder Working Agreement

## Delivery cadence

- Complete one user-approved meaningful step at a time, then stop for approval.
- After every step, explain completed work, verification, key files and their connections, and technical terms when first introduced.
- Recommend concise or detailed reporting and ask for the user's preference for the next step.
- Use two clearly labeled report parts: the completed-step report, then a brief
  next-step preview with its goal, plan, and model recommendation.
- Update `README.md`, `docs/PROGRESS.md`, and `docs/AI_SKILLS.md` with meaningful progress.
- Keep `docs/ARCHITECTURE.md` synchronized when a change affects project
  structure, cross-file data flow, troubleshooting, or an architectural decision.

## Scope and change control

- Do not add user-facing features outside the approved plan.
- Explain and obtain approval for changes to the plan, dependency choices, or step ordering.
- Keep code organized by responsibility: UI, domain, data, infrastructure, and composition stay separate.

## Git workflow

- Commit each meaningful completed change with a focused conventional-style message.
- Prefer several small, cohesive commits within a larger approved step when each
  unit can be independently verified and documented.
- Do not push commits until the user explicitly approves that push and a remote is configured.
- Keep build, lint, type-check, formatting, and relevant tests passing before committing.

## Engineering expectations

- Use strict TypeScript, descriptive naming, small modules, and explicit failure behavior.
- Favor React composition for UI and classes for stateful infrastructure only when encapsulation is useful.
- Keep map-provider dependencies behind typed contracts and compose implementations at the application boundary.
- Avoid speculative abstractions and duplicate logic.

## Current technical documentation

- Use the project-scoped Context7 MCP server for current third-party library and
  API documentation when it is available.
- Prefer official primary documentation when a library's own documentation is
  available, and record consequential source links in the architecture handbook.
- If Context7 is unavailable, continue with official documentation rather than
  blocking implementation or relying silently on model memory.
