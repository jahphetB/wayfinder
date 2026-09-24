# AI Skills Inventory

This file records AI-related skills, tools, and project practices used during delivery. Brands distinguish their origin.

## OpenAI

| Skill or capability            | Used in        | Purpose                                                                                                                        |
| ------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| OpenAI Docs skill              | Steps 1, 13-14 | Uses current official OpenAI guidance for model, skill, MCP, and Codex decisions.                                              |
| OpenAI Cookbook                | Step 13        | Supplied the documented Context7 MCP pattern for coding with current third-party library documentation.                        |
| OpenAI Playwright skill        | Steps 13-14    | Drives browser flows, screenshots, and console inspection without adding browser-test dependencies to the application.         |
| OpenAI security-best-practices | Step 13 setup  | Installed locally for focused secure implementation reviews in future approved steps; available in new sessions.               |
| OpenAI security-threat-model   | Step 13 setup  | Installed locally for structured threat modeling when the application gains GPS, storage, deployment, or other security scope. |
| Codex file and command tools   | Steps 1-13     | Inspect, implement, test, document, commit, and publish approved project changes.                                              |

### Local quick-reference installations

These first-party OpenAI skills are installed under the user's Codex skill
directory so future sessions can load their complete instructions without
downloading them again. They are development guidance, not application runtime
dependencies.

| Brand and skill                  | Local path                                            | When to use it                                                                                               |
| -------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| OpenAI / Playwright              | `%USERPROFILE%\.codex\skills\playwright`              | Browser interaction, screenshots, console checks, and end-to-end flow verification.                          |
| OpenAI / security-best-practices | `%USERPROFILE%\.codex\skills\security-best-practices` | A focused TypeScript security review when the user explicitly approves or requests one.                      |
| OpenAI / security-threat-model   | `%USERPROFILE%\.codex\skills\security-threat-model`   | A repository-grounded threat model when GPS, stored data, deployment, or another trust boundary warrants it. |

The OpenAI Cookbook and official OpenAI documentation remain linked online
because they change over time. Context7 is used to retrieve current third-party
library documentation rather than committing copies that would quickly become
stale.

## External technology

| Technology                     | Used in       | Purpose                                                                                                              |
| ------------------------------ | ------------- | -------------------------------------------------------------------------------------------------------------------- |
| Vite                           | Step 1        | Provides local development and production bundling.                                                                  |
| React                          | Step 1        | Provides component composition for the web interface.                                                                |
| MapLibre GL JS                 | Step 1 onward | Provides the eventual 2D/3D map renderer behind a provider-neutral contract.                                         |
| OpenStreetMap raster tiles     | Step 4 fix    | Provide a recognizable prototype street basemap through MapLibre's documented raster-source pattern.                 |
| College of Idaho campus map    | Step 6        | Informed campus naming and prototype map focus; it is not used as routing data.                                      |
| Vitest and Testing Library     | Step 1 onward | Verify behavior without manually testing every change.                                                               |
| College of Idaho campus map    | Steps 11-12   | Confirms published campus place names and the current Cruzen-Murray Library identity.                                |
| OpenStreetMap-derived map data | Steps 11-12   | Corroborates public building coordinates, including Cruzen-Murray Library.                                           |
| Google Maps                    | Step 12       | Directly checked the current library listing and identified that the former Terteling listing is permanently closed. |
| Three.js                       | Step 13       | Draws the owned procedural 3D calibration building inside MapLibre's shared WebGL context.                           |
| Context7 MCP                   | Step 13       | Supplies current third-party library documentation through a project-scoped, secret-free remote connection.          |
| Microsoft Edge headless mode   | Step 13       | Captured the real WebGL result for visual verification without adding a browser-test dependency to the application.  |

## Yote Wayfinder project practices

### Step 16 usage record

- **OPENAI / OpenAI Docs:** Checked official model-selection guidance for the
  next-step recommendation; use one agent and increase reasoning only when the
  observed task warrants it. This does not change the application's dependencies.

- **OPENAI / Playwright:** Used the installed browser-testing skill with an
  isolated session and emulated geolocation to check progress, uncertainty,
  arrival, map-mode preservation, mobile layout, and console output. No real
  user location was collected. Local screenshots remain ignored by Git.
- **EXTERNAL / Context7 + primary documentation:** Queried current React cleanup
  and state-reset documentation through Context7; consulted W3C Geolocation for
  permission, accuracy, freshness, and timeout behavior. No new skill download
  or dependency was necessary.
- **YOTE / Approved-step workflow:** Applied the existing project memory skill
  to preserve scope, isolated domain/provider boundaries, verification, focused
  commits, and explicit push approval.
- **YOTE / One-shot request lifecycle:** Applied an immediate duplicate-request
  guard, late-result disposal, preview-keyed session reset, typed recovery
  failures, and timestamp-reuse rejection. This is a documented project practice,
  not a newly installed OpenAI skill.

### Practice inventory

| Practice                                        | Introduced in          | Purpose                                                                                                                                            |
| ----------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Approval-gated delivery                         | Step 1                 | Keeps implementation within the agreed scope.                                                                                                      |
| Maintainable frontend boundaries                | Step 2                 | Separates domain, data, UI, map infrastructure, and composition.                                                                                   |
| Technical-term and file-connection explanations | Step 2                 | Makes the project easier to understand and maintain.                                                                                               |
| Commit-before-push workflow                     | Step 2                 | Preserves a reviewable local history and requires approval before remote changes.                                                                  |
| React composition and hook isolation            | Step 3                 | Keeps navigation visuals separate from selection and route-preview behavior.                                                                       |
| Lazy-loaded map integration                     | Step 4                 | Defers the large MapLibre bundle until the interactive map component is needed.                                                                    |
| MapLibre Vite worker configuration              | Step 4 fix             | Bundles MapLibre's required map-rendering worker for Vite development and builds.                                                                  |
| Vite dependency optimization control            | Step 4 fix             | Prevents Vite from pre-bundling MapLibre with a stale worker path.                                                                                 |
| Browser runtime and CSS layout diagnosis        | Step 4 fix             | Uses console, network, and computed DOM measurements to find invisible rendered content.                                                           |
| Living architecture documentation               | Architecture milestone | Translates code boundaries, decisions, change recipes, and troubleshooting into a navigable handbook for non-technical maintainers.                |
| Accessible interaction design                   | Step 5                 | Adds keyboard-operable autocomplete, semantic status messages, and clear recovery behavior.                                                        |
| Campus-scope configuration                      | Step 6                 | Keeps the College of Idaho focus, initial view, and pan limits in one data module separate from map-provider code.                                 |
| Evidence-based bundle review                    | Step 6                 | Retains existing lazy loading unless build output shows a material, user-facing need for more splitting.                                           |
| Domain-level Dijkstra pathfinding               | Step 7                 | Calculates a shortest walking path from validated graph data without coupling the algorithm to React or MapLibre.                                  |
| Two-part approval report                        | Step 7                 | Uses a completed-step report followed by a brief next-step preview for predictable approval decisions.                                             |
| Graph-to-route transformation                   | Step 8                 | Converts a calculated path into the established provider-neutral route shape without changing map-provider code.                                   |
| Constraint-aware graph routing                  | Step 9                 | Models closures and one-way paths as validated data, then tests the shortest-path logic against those restrictions.                                |
| Cohesive commit cadence                         | Step 9                 | Creates separate verified commits for independently complete code and documentation units within an approved step.                                 |
| Route-data provenance validation                | Step 10                | Records source, review date, and verification status so illustrative and verified graph data cannot be confused.                                   |
| Public-source evidence boundary                 | Step 11                | Uses official and independent public maps for limited location corroboration while preserving the illustrative label for unverified routing facts. |
| Validated editable graph dataset                | Step 12                | Isolates replaceable campus data from its runtime loader so future verified data can enter without changing route, UI, or map code.                |
| Georeferenced procedural 3D spike               | Step 13                | Proves that a meter-sized Three.js object can remain anchored to campus coordinates under MapLibre's camera and projection.                        |
| Shared-WebGL lifecycle isolation                | Step 13                | Keeps Three.js creation, rendering, visibility, and resource disposal inside one provider-specific layer.                                          |
| Maintained Mermaid architecture map             | Step 13                | Shows implemented dependencies and clearly distinguishes approved future GPS and model-pipeline components.                                        |
| Current-documentation fallback rule             | Step 13                | Uses Context7 when available, official primary documentation as fallback, and avoids silently relying on stale model memory.                       |
| Bearing-based maneuver derivation               | Step 14                | Compares incoming and outgoing geographic bearings to classify straight, left, right, and turn-around instructions.                                |
| Validated route-step pipeline                   | Step 14                | Keeps edge geometry, maneuvers, checkpoints, flattened map geometry, and total distance consistent through immutable domain validation.            |
| Accuracy-aware checkpoint verification          | Step 15                | Treats reported location as an uncertainty area and avoids claiming confirmation or mismatch when it overlaps the checkpoint boundary.             |
| Explicit navigation state machine               | Step 15                | Allows progress only through tested awaiting-start, navigating, and arrived transitions triggered by one-shot verification actions.                |
| Location-data minimization                      | Step 15                | Retains a verification result, distance, and accuracy in session state without retaining the raw location reading.                                 |
