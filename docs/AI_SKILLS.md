# AI Skills Inventory

This file records AI-related skills, tools, and project practices used during delivery. Brands distinguish their origin.

## OpenAI

| Skill or capability          | Used in         | Purpose                                                                         |
| ---------------------------- | --------------- | ------------------------------------------------------------------------------- |
| OpenAI Docs skill            | Step 1 planning | Selected a cost-conscious coding-model approach using official OpenAI guidance. |
| Codex file and command tools | Steps 1-2       | Created, inspected, tested, and documented the project in small approved steps. |

## External technology

| Technology                  | Used in       | Purpose                                                                                              |
| --------------------------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| Vite                        | Step 1        | Provides local development and production bundling.                                                  |
| React                       | Step 1        | Provides component composition for the web interface.                                                |
| MapLibre GL JS              | Step 1 onward | Provides the eventual 2D/3D map renderer behind a provider-neutral contract.                         |
| OpenStreetMap raster tiles  | Step 4 fix    | Provide a recognizable prototype street basemap through MapLibre's documented raster-source pattern. |
| College of Idaho campus map | Step 6        | Informed campus naming and prototype map focus; it is not used as routing data.                      |
| Vitest and Testing Library  | Step 1 onward | Verify behavior without manually testing every change.                                               |

## Yote Wayfinder project practices

| Practice                                        | Introduced in          | Purpose                                                                                                                             |
| ----------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Approval-gated delivery                         | Step 1                 | Keeps implementation within the agreed scope.                                                                                       |
| Maintainable frontend boundaries                | Step 2                 | Separates domain, data, UI, map infrastructure, and composition.                                                                    |
| Technical-term and file-connection explanations | Step 2                 | Makes the project easier to understand and maintain.                                                                                |
| Commit-before-push workflow                     | Step 2                 | Preserves a reviewable local history and requires approval before remote changes.                                                   |
| React composition and hook isolation            | Step 3                 | Keeps navigation visuals separate from selection and route-preview behavior.                                                        |
| Lazy-loaded map integration                     | Step 4                 | Defers the large MapLibre bundle until the interactive map component is needed.                                                     |
| MapLibre Vite worker configuration              | Step 4 fix             | Bundles MapLibre's required map-rendering worker for Vite development and builds.                                                   |
| Vite dependency optimization control            | Step 4 fix             | Prevents Vite from pre-bundling MapLibre with a stale worker path.                                                                  |
| Browser runtime and CSS layout diagnosis        | Step 4 fix             | Uses console, network, and computed DOM measurements to find invisible rendered content.                                            |
| Living architecture documentation               | Architecture milestone | Translates code boundaries, decisions, change recipes, and troubleshooting into a navigable handbook for non-technical maintainers. |
| Accessible interaction design                   | Step 5                 | Adds keyboard-operable autocomplete, semantic status messages, and clear recovery behavior.                                         |
| Campus-scope configuration                      | Step 6                 | Keeps the College of Idaho focus, initial view, and pan limits in one data module separate from map-provider code.                  |
| Evidence-based bundle review                    | Step 6                 | Retains existing lazy loading unless build output shows a material, user-facing need for more splitting.                            |
| Domain-level Dijkstra pathfinding               | Step 7                 | Calculates a shortest walking path from validated graph data without coupling the algorithm to React or MapLibre.                   |
| Two-part approval report                        | Step 7                 | Uses a completed-step report followed by a brief next-step preview for predictable approval decisions.                              |
| Graph-to-route transformation                   | Step 8                 | Converts a calculated path into the established provider-neutral route shape without changing map-provider code.                    |
