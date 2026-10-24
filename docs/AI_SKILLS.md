# AI Skills Inventory

## October 24: shared camera and selection feedback

- **OpenAI / Playwright:** inspect real draft/header-selection pins and compare
  navigation screenshots across mode changes, without adding application fixtures.
- **Project-developed / role-preserving markers:** assign origin/destination roles
  before excluding missing coordinates; keep draft visualization independent of
  explicit route preview and manual progress.
- **Project-developed / orthogonal map mode:** separate library-layer visibility
  from camera intent so switching rendering mode cannot erase rotation or centring.

## October 24: compact controls and turn focus

- **OpenAI / Playwright:** exercise header search, route replacement and control
  hit-testing; measure footer position and horizontal overflow at mobile and
  desktop boundary widths. Browser emulation is not physical-device evidence.
- **External / Context7:** check MapLibre camera padding/offset behavior against
  installed types. Avoid unsupported newer options and clear persistent padding
  before close navigation framing.
- **Project-developed / display-only snapshot age:** isolate elapsed-time rendering
  from provider requests; test timer cleanup and absence of additional GPS calls.
- **Project-developed / non-overlapping form regions:** allow content-driven row
  height and establish explicit suggestion stacking instead of floating a lower
  action over route editing controls.

## Selected-reference redesign

- **OpenAI / Playwright:** state-by-state visual comparison, exact breakpoint and
  editing/recovery/location regression checks against the real built application.
- **OpenAI / OpenAI Docs:** task-specific model/effort selection for a coordinated
  visual and interaction redesign, not an application AI dependency.
- **External / Context7:** current MapLibre camera padding, attribution and control
  APIs, checked against installed types before integration changes.
- **Project-developed / transactional draft:** pure state transitions retain the
  active journey separately from proposed route changes, without a UI framework.
- **Project-developed / reference-state verification:** compare six real rendered
  states to the original board; test both sides of the exact 640-pixel boundary,
  map identity, overlay-aware camera padding and location-independent progression.
  Diagnostic location fixtures exist only in browser automation, not app code.
- **Project-developed / measured viewport synchronization:** update MapLibre's
  internal canvas dimensions before a content-driven fit only when the container
  actually changed; guard reentrant resize callbacks instead of resizing every turn.
- **Project-developed / advisory-gated delivery:** inspect CI's failing gate,
  update only affected compatible transitive packages, keep policy/audit thresholds
  intact, and verify the exact hosted source rather than equating deployment with
  successful quality checks.

This file records AI-related skills, tools, and project practices used during delivery. Brands distinguish their origin.

## October 23: pre-merge map layout

- **OpenAI / Playwright:** inspect rendered button dimensions, viewport/control
  separation, responsive placement, recovery, keyboard behavior and ordinary
  preview console/network requests. Emulated widths are not physical-device proof.
- **External / Context7 and Vercel documentation:** resolve optional toolbar
  injection at hosting configuration, not by weakening the app's CSP. Validate
  ordinary requests separately from automation-header suppression.
- **Project-developed / single responsive control tree:** CSS Grid repositions
  one walkthrough across desktop/mobile; common sizing keeps actions equal.
  Canvas, toolbar and information have separate layout space and responsibilities.

## October 23: manual-guide release package

- **Project-developed / enforced-policy verification:** test actual CSP in a
  fresh non-bypass context; isolate accessibility-tool injection in its own
  bypass context. An automation bypass must never be mistaken for a policy pass.
- **Project-developed / evidence-bounded release:** retain source and deployment
  IDs, distinguish desktop emulation from physical devices, and preserve useful
  geographic provenance without imposing a new full-survey launch gate.
- **OpenAI / OpenAI Docs:** official model-selection guidance supports the
  task-specific next-step model/effort recommendation. It is contributor tooling,
  not an AI feature, API call or runtime dependency in the campus guide.

- **OpenAI / Playwright:** baseline and revised startup/camera profiles, snapshot
  and manual-control journeys, permission/network failures, and accessibility checks.
- **OpenAI / security-best-practices:** focused browser protections and privacy
  handling for the existing React frontend; no reporting SDK or backend added.
- **External / Context7:** current MapLibre camera/reduced-motion/performance and
  hosting documentation. Installed source confirms version-specific behavior.
- **Project-developed / independent walkthrough and snapshot:** route illustration
  never waits for device location. Explicit button-triggered, scoped requests stop
  on completion/cancellation and cannot update another route.

## October 22: recovery and search accessibility

- **OpenAI / Playwright:** browser failure injection, keyboard flows, phone-width
  layouts, and automated accessibility diagnostics against the built application.
  The skill is development guidance, not a shipped runtime dependency.
- **External / Context7 and primary documentation:** React error boundaries/lazy
  imports, MapLibre error-event behavior, and the WAI-ARIA combobox pattern inform
  the implementation. The installed MapLibre source confirms tile-error metadata.
- **Project-developed / bounded recovery:** contain deferred-map rendering
  failures separately from the planner, label download/startup deadlines, ignore
  callbacks from discarded instances, and require deliberate recovery actions.
- **Project-developed / accessible search contract:** keep focus on the input,
  identify the actual active option, announce counts, and test Escape/Tab and
  no-match behavior without adding a UI framework.

This work adds no runtime dependencies, remote telemetry, or location persistence.

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
| Three.js                       | Step 13       | Proved an owned 3D layer inside MapLibre; the calibration scene was removed in Step 25 and the layer is dormant.     |
| Context7 MCP                   | Step 13       | Supplies current third-party library documentation through a project-scoped, secret-free remote connection.          |
| Microsoft Edge headless mode   | Step 13       | Captured the real WebGL result for visual verification without adding a browser-test dependency to the application.  |

## Yotes Wayfinder project practices

### October 21 maintenance usage record

- **OPENAI / Playwright skill:** Verified public production controls and
  phone-width layout in an isolated browser, including console inspection.
- **EXTERNAL / Context7 and official Vercel/Node documentation:** Distinguished
  build/runtime preferences, package engine overrides and optional platform cards.
- **EXTERNAL / npm and GitHub advisories:** Checked fresh registry results,
  affected versions, production-versus-development scope and fixed releases.
- **YOTE / Scoped dependency maintenance:** Updated vulnerable build/test tools
  and their locked dependencies without changing product behavior or bypassing
  preview/production approval boundaries. Cached audits are not live clearance.

### Release readiness assessment usage record

- **OPENAI / Security best practices skill:** Reviewed React/TypeScript data
  handling, public response headers and dependencies; recorded scoped findings
  with evidence, impact and remediation.
- **OPENAI / Playwright skill:** Exercised hosted mobile flows and injected
  module, graphics, tile and geolocation failures in isolated browser tabs.
- **OPENAI / OpenAI Docs skill:** Consulted official reasoning/model-selection
  guidance for the next work-package recommendation.
- **EXTERNAL / Lighthouse and axe-core:** Collected mobile lab timings and
  accessibility findings without adding runtime or project dependencies.
- **EXTERNAL / Context7, W3C, OWASP, Google SRE and provider documentation:**
  Checked WebGL2 behavior, accessibility/performance standards, operational
  targets, tile policies, billing units and recovery eligibility.
- **YOTE / Evidence-based release gates:** Distinguished prototype demonstration,
  independent navigation pilot and wider launch; recorded failing and unmeasured
  gates rather than treating a successful build as release approval.

### Map startup recovery usage record

- **YOTE / Lifecycle failure diagnosis:** Traced the reported exception through
  map construction and React effects; added a regression test for failed startup
  and kept the recovery message visible.

### Step 30 usage record

- **OPENAI / OpenAI Docs:** Consulted official model-selection documentation.
- **OPENAI / Playwright:** Verified one-time on/off-campus geolocation with
  simulated browser coordinates and checked the phone layout and console.
- **EXTERNAL / Context7 + MDN:** Checked MapLibre GeoJSON/camera patterns and
  browser geolocation's secure-context and permission behavior.
- **YOTE / Location-purpose isolation:** Kept the real map-locate request
  separate from simulated route checkpoints; classified boundary overlap as
  uncertain and prevented a late result from updating an unmounted map.

### Step 29 usage record

- **OPENAI / OpenAI Docs:** Consulted official model-selection documentation.
- **OPENAI / Playwright:** Used a real browser at desktop and phone widths to
  inspect the opening map, route-preview margins, 2D labels, and console.
- **EXTERNAL / Context7 + MapLibre primary source:** Checked fitBounds and
  pitch/bearing options before changing camera behavior.
- **YOTE / Camera-purpose separation:** Kept opening overview, route preview,
  and turn-following as distinct adapter-owned camera tasks. Added outline
  coverage tests so a later OSM import cannot silently omit a facility.

### Step 16 usage record

- **OPENAI / OpenAI Docs:** Consulted official model-selection documentation.

- **OPENAI / Playwright:** Used the installed browser-testing skill with an
  isolated session and emulated geolocation to check progress, uncertainty,
  arrival, map-mode preservation, mobile layout, and console output. No real
  user location was collected. Local screenshots remain ignored by Git.
- **EXTERNAL / Context7 + primary documentation:** Queried current React cleanup
  and state-reset documentation through Context7; consulted W3C Geolocation for
  permission, accuracy, freshness, and timeout behavior. No new skill download
  or dependency was necessary.
- **YOTE / Approved-step workflow:** Applied the existing project memory skill
  to preserve scope, isolated domain/provider boundaries, verification, and
  focused commits.
- **YOTE / One-shot request lifecycle:** Applied an immediate duplicate-request
  guard, late-result disposal, preview-keyed session reset, typed recovery
  failures, and timestamp-reuse rejection. This is a documented project practice,
  not a newly installed OpenAI skill.

### Practice inventory

#### Step 17 usage record

- **OPENAI / Playwright:** Verified the default simulator in a real browser from
  preview through arrival without granting location permission; checked the
  explicit demo notice, instructions, map continuity, and browser console.
- **YOTE / Replaceable test provider:** Developed a project-specific technique
  that supplies each expected checkpoint through the existing provider boundary.
  It enables interface testing from anywhere while preserving the real browser
  adapter for later field work.
- **YOTE / Environment-gated field mode:** Selected one typed Vite setting as the
  reversible switch between prototype simulation and physical location. This
  keeps test behavior visible and avoids scattered code edits.

#### Step 18 usage record

- **OPENAI / Playwright:** Compared before-and-after map captures, verified
  walkway alignment, route-leg colors, Back behavior, and camera changes in 2D
  and 3D, and confirmed a clean browser console.
- **EXTERNAL / Context7:** Used current MapLibre documentation for data-driven
  GeoJSON line styling and camera animation options.
- **EXTERNAL / OpenStreetMap Overpass:** Read current public footway geometry
  corresponding to the dotted basemap paths. It informs illustrative prototype
  shapes only and is not campus approval or a safety/accessibility source.
- **YOTE / Navigation presentation projection:** Developed a project-specific
  pattern that projects immutable domain session state into completed, current,
  and upcoming map legs without moving navigation rules into MapLibre.

#### Step 19 usage record

- **OPENAI / Playwright:** Used a real local browser to select Sterry Hall,
  preview its route, inspect the scenario control, verify wrong-location
  recovery, capture a screenshot, and confirm zero console errors or warnings.
- **EXTERNAL / Official campus map:** Confirmed the published building labels
  for Blatchley Hall, Simplot Dining Hall, and Sterry Hall.
- **EXTERNAL / OpenStreetMap Overpass:** Read public building centers and nearby
  footway shapes for those three prototype additions. This supports displayed
  geometry only; it does not verify entrances, access, distance, or safety.
- **YOTE / Optional prototype capability:** Developed a narrow controller that
  exposes simulator outcomes only to prototype UI. It preserves the ordinary
  location-provider contract and routes each synthetic reading through the same
  domain verification as a real reading.

#### Step 20 usage record

- **OPENAI / Playwright:** Inspected phone-sized screenshots, console output,
  the turn-advance viewport, and a keyboard-focused scenario change in a real
  local browser. This exposed the unwanted turn-update scroll and narrow
  selector overflow that component tests alone did not show.
- **OPENAI / OpenAI Docs:** Consulted official model-selection documentation.
- **EXTERNAL / GPS.gov:** Used official consumer GPS accuracy guidance to keep
  phone waypoint observations separate from measured footprints, entrance
  positions, and walkway widths.
- **YOTE / Preserve instruction focus:** Developed a project-specific rule:
  update map presentation on every turn, but scroll only for a new route. Reset
  demo navigation within the hook rather than remounting the focused control.

#### Step 21 usage record

- **YOTE / Measurement-first campus data intake:** Created a compact request and
  review packet that distinguishes building outlines and dimensions from
  routable walkway centerlines, entrances, and access observations. It records
  source, permission, date, units, coordinate reference, confidence, and photo
  references so future replacements can be reviewed and traced.
- **EXTERNAL / GPS.gov:** Retained the accuracy caveat for phone-based location
  observations when preparing the intake template.

#### Step 22 usage record

- **EXTERNAL / OpenStreetMap XML:** Inspected the user's export for complete
  building outlines, entrance points, pedestrian ways, source timestamps, and
  missing width or access tags. Recorded exact object IDs and the snapshot
  digest so an update can be reviewed later.
- **EXTERNAL / OpenStreetMap copyright and footway guidance:** Checked current
  attribution and walking-way connectivity guidance before using an OSM-tagged
  entrance as a prototype route endpoint.
- **YOTE / Small-batch source replacement:** Updated one existing destination
  point and its route leg while retaining the separate illustrative provenance
  and route validation boundary.

#### Step 23 usage record

- **EXTERNAL / OpenStreetMap XML:** Used the user-supplied, firsthand-observed
  pedestrian ways and tagged entrance nodes as source geometry. Kept unmapped
  gaps and access claims explicitly illustrative rather than treating a nearby
  point as a proven walking connection.
- **OPENAI / Playwright skill:** Tested the actual browser previews and console.
  Measuring route endpoint positions on the live map exposed a camera-boundary
  constraint that isolated domain tests could not reveal.
- **OPENAI / OpenAI Docs:** Consulted official model-selection documentation.
- **YOTE / Traceable 2D graph editing:** Kept editable source coordinates in
  one data file, derived routing/search/map output through existing contracts,
  and checked drawn polyline lengths against edge distances. This is a project
  practice developed here, not an external skill package.

#### Step 24 usage record

- **EXTERNAL / OpenStreetMap XML and ODbL:** Audited a newer export's paths,
  entrances, buildings, informal links, connectivity, source digest, and
  attribution. OSM geometry was treated as observed map data, not proof of
  physical access or accessibility.
- **OPENAI / Playwright skill:** Used a real browser to inspect desktop and
  phone route previews, suggestion-list dimensions, keyboard scrolling, and
  the JavaScript console. The skill guides runtime verification; it does not
  provide campus facts.
- **OPENAI / OpenAI Docs:** Consulted official model-selection documentation.
- **YOTE / Reproducible OSM import:** Developed a dependency-free importer that
  keeps source XML outside the app and commits a compact, traceable walking
  snapshot. A separate builder validates curated destination references.
- **YOTE / Preference-aware local routing:** Kept pathfinding local, applied a
  small informal-way selection penalty, reported physical distance, and
  combined straight source segments into useful turns. Focused tests protect
  the distinction between route score and shown length.
- **YOTE / Durable step memory:** Added `docs/PROJECT_MEMORY.md` so source
  identity, decisions, limitations, and verification commands
  survive context resets without copying the entire handbook.

#### Step 25 usage record

- **EXTERNAL / OpenStreetMap XML:** Audited every description in the newer
  user-observed export, including main footways, parking areas, Anderson,
  Simplot, JAAC/pool entrances, and the clock-tower landmark. Flagged the
  Hayman parking/basketball-tag conflict rather than presenting it as verified.
- **OPENAI / Playwright skill:** Inspected the real desktop and phone map,
  dropdown choices, two route previews, 3D without the block, and browser
  console. Screenshots were kept under ignored `output/playwright/`.
- **OPENAI / OpenAI Docs:** Consulted official model-selection documentation.
- **YOTE / Description-backed destination curation:** Kept named destinations
  separate from OSM path import, validated described entrance references, and
  labeled outline-derived approach points as illustrative.
- **YOTE / Formal-first path policy:** Used a two-part route score so formal
  paths always beat informal shortcuts and main footways win close formal
  comparisons without changing displayed physical distance.
- **YOTE / Nearby-turn grouping:** Combined two maneuvers only across a short
  12 m leg, with both actions preserved in the spoken/visible instruction and
  tested separation for longer legs.

#### Step 26 usage record

- **EXTERNAL / OpenStreetMap XML:** Reused the same observed source to identify
  court sport tags and a restricted driveway-to-stadium road chain. No new
  external routing service or runtime dependency was added.
- **OPENAI / Playwright skill:** Checked desktop and phone presentation, empty
  fields, default 3D map, stadium handoff, tennis route, button placement,
  and browser console in a real browser.
- **OPENAI / OpenAI Docs:** Consulted official model-selection documentation.
- **YOTE / Mode-separated preview:** Kept the limited stadium road handoff out
  of walking routes and GPS checkpoints. The map adapter draws a distinct
  dashed line and the UI explains the unverified driveway and venue access.
- **YOTE / Source-tag validation:** Added sports destinations only when the
  curated sport and area IDs match the imported OSM tags. Court numbering
  remains visibly provisional.

#### Step 27 usage record

- **OPENAI / Playwright skill:** Previewed the corrected library-to-court
  route in a real browser, inspected the rendered map, and checked its console
  for errors and warnings.
- **OPENAI / OpenAI Docs:** Consulted official model-selection documentation.
- **EXTERNAL / User OSM export:** Checked each court outline for an entrance
  tag and identified one main beach-volleyball gate without changing the
  source snapshot or assuming access at other courts.
- **EXTERNAL / Official College map and athletics directions:** Corroborated
  named tennis facilities and the Cleveland/24th stadium road sequence,
  while leaving driveway permission, parking, and venue access unverified.
- **YOTE / Evidence-first destination point:** Prefer a validated mapped gate
  over an arbitrary outline corner; keep its inferred walkway connector
  explicitly provisional and test the source reference.

#### Step 28 usage record

- **EXTERNAL / Context7 MapLibre and Three.js documentation:** Checked the
  current custom-layer and footprint-extrusion patterns before activating the
  isolated 3D boundary. The project added no new package.
- **OPENAI / Playwright skill:** Compared the real-browser 3D library shape
  with the 2D basemap footprint and checked the console after switching modes.
- **OPENAI / OpenAI Docs:** Consulted official model-selection documentation.
- **YOTE / Visual-data separation:** Derived only a 3D visual outline from
  the OSM snapshot. Kept its guessed height illustrative and prevented scene
  content from becoming a navigation entrance or walking edge.
- **YOTE / Bundle-cost checkpoint:** Measured the added deferred Three.js
  payload before considering more buildings or realistic assets.

| Practice                                        | Introduced in          | Purpose                                                                                                                                                    |
| ----------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Maintainable frontend boundaries                | Step 2                 | Separates domain, data, UI, map infrastructure, and composition.                                                                                           |
| Technical-term and file-connection explanations | Step 2                 | Makes the project easier to understand and maintain.                                                                                                       |
| React composition and hook isolation            | Step 3                 | Keeps navigation visuals separate from selection and route-preview behavior.                                                                               |
| Lazy-loaded map integration                     | Step 4                 | Defers the large MapLibre bundle until the interactive map component is needed.                                                                            |
| MapLibre Vite worker configuration              | Step 4 fix             | Bundles MapLibre's required map-rendering worker for Vite development and builds.                                                                          |
| Vite dependency optimization control            | Step 4 fix             | Prevents Vite from pre-bundling MapLibre with a stale worker path.                                                                                         |
| Browser runtime and CSS layout diagnosis        | Step 4 fix             | Uses console, network, and computed DOM measurements to find invisible rendered content.                                                                   |
| Living architecture documentation               | Architecture milestone | Translates code boundaries, decisions, change recipes, and troubleshooting into a navigable handbook for non-technical maintainers.                        |
| Accessible interaction design                   | Step 5                 | Adds keyboard-operable autocomplete, semantic status messages, and clear recovery behavior.                                                                |
| Campus-scope configuration                      | Step 6                 | Keeps the College of Idaho focus, initial view, and pan limits in one data module separate from map-provider code.                                         |
| Evidence-based bundle review                    | Step 6                 | Retains existing lazy loading unless build output shows a material, user-facing need for more splitting.                                                   |
| Domain-level Dijkstra pathfinding               | Step 7                 | Calculates a shortest walking path from validated graph data without coupling the algorithm to React or MapLibre.                                          |
| Graph-to-route transformation                   | Step 8                 | Converts a calculated path into the established provider-neutral route shape without changing map-provider code.                                           |
| Constraint-aware graph routing                  | Step 9                 | Models closures and one-way paths as validated data, then tests the shortest-path logic against those restrictions.                                        |
| Cohesive commit cadence                         | Step 9                 | Creates separate verified commits for independently complete code and documentation units within an approved step.                                         |
| Route-data provenance validation                | Step 10                | Records source, review date, and verification status so illustrative and verified graph data cannot be confused.                                           |
| Public-source evidence boundary                 | Step 11                | Uses official and independent public maps for limited location corroboration while preserving the illustrative label for unverified routing facts.         |
| Validated editable graph dataset                | Step 12                | Isolates replaceable campus data from its runtime loader so future verified data can enter without changing route, UI, or map code.                        |
| Georeferenced procedural 3D spike               | Step 13                | Proves that a meter-sized Three.js object can remain anchored to campus coordinates under MapLibre's camera and projection.                                |
| Shared-WebGL lifecycle isolation                | Step 13                | Keeps Three.js creation, rendering, visibility, and resource disposal inside one provider-specific layer.                                                  |
| Maintained Mermaid architecture map             | Step 13                | Shows implemented dependencies and clearly distinguishes approved future GPS and model-pipeline components.                                                |
| Current-documentation fallback rule             | Step 13                | Uses Context7 when available, official primary documentation as fallback, and avoids silently relying on stale model memory.                               |
| Bearing-based maneuver derivation               | Step 14                | Compares incoming and outgoing geographic bearings to classify straight, left, right, and turn-around instructions.                                        |
| Validated route-step pipeline                   | Step 14                | Keeps edge geometry, maneuvers, checkpoints, flattened map geometry, and total distance consistent through immutable domain validation.                    |
| Accuracy-aware checkpoint verification          | Step 15                | Treats reported location as an uncertainty area and avoids claiming confirmation or mismatch when it overlaps the checkpoint boundary.                     |
| Explicit navigation state machine               | Step 15                | Allows progress only through tested awaiting-start, navigating, and arrived transitions triggered by one-shot verification actions.                        |
| Location-data minimization                      | Step 15                | Retains a verification result, distance, and accuracy in session state without retaining the raw location reading.                                         |
| Mode-separated stadium handoff                  | Step 26                | Shows a limited car preview without misusing pedestrian routing or GPS checkpoints.                                                                        |
| Court source-tag validation                     | Step 26                | Makes each curated sports destination traceable to an OSM court outline and sport tag.                                                                     |
| Evidence-first court gate selection             | Step 27                | Uses an actual tagged gate when available and fails clearly if a later source import removes or changes it.                                                |
| Footprint-based visual prototype                | Step 28                | Anchors one simple 3D library shape to the mapped outline while leaving height and appearance explicitly illustrative.                                     |
| Deferred 3D bundle measurement                  | Step 28                | Records the real download increase before scaling to more models or mobile assets.                                                                         |
| Throttled mobile baseline                       | Step 31                | Measures the production build at a phone viewport with emulated network/CPU limits, and separates early page paint from later map asset and tile requests. |

#### Step 31 usage record

- **OPENAI / Playwright skill:** Measured three cold-cache Chromium runs at a
  phone viewport, inspected the map on scroll, and checked console and overflow.
- **OPENAI / OpenAI Docs:** Consulted official model-selection documentation.
- **YOTE / Evidence-before-optimization:** Recorded exact build and browser
  costs while preserving the approved one-library 3D prototype. A real device
  check and the user's design priorities should precede a bundle redesign.

#### Step 32 usage record

- **OPENAI / Playwright skill:** Checked the production UI at desktop and phone
  widths, previewed a route, confirmed the progress legend, and checked the
  browser console.
- **YOTE / Progressive disclosure:** Kept the route summary and navigation
  progress visible while removing developer-oriented demo controls from the
  ordinary user view.
- **YOTE / First-screen map access:** Reduced mobile planner height using
  responsive spacing and control sizing, then inspected the real production
  layout rather than relying only on CSS dimensions.

#### Step 33 usage record

- **EXTERNAL / Context7 and official Vercel/Vite documentation:** Checked the
  supported Vite deployment settings, output folder, and browser-visible
  environment-variable behavior before committing host configuration.
- **YOTE / Repository-owned deployment contract:** Kept the build and output
  settings in one reviewed `vercel.json`, preserving TypeScript checks on the
  hosted build without adding a server or unneeded routing rewrite.
- **YOTE / Local-versus-live verification boundary:** Recorded passing local
  checks separately from hosted builds and phone/browser verification.

#### Step 34 usage record

- **EXTERNAL / Official copyright and license sources:** Consulted the U.S.
  Copyright Office, GitHub's license guidance, npm metadata guidance, and
  OpenStreetMap licensing to distinguish original-work ownership from reuse
  permissions and third-party rights.
- **EXTERNAL / Context7 and Vite:** Checked current production source-map,
  copyright-banner, and built-in dependency license reporting options.
- **YOTE / Rights scoped to original work:** Recorded reserved rights without
  claiming upstream libraries or OSM data, and kept npm privacy distinct from
  GitHub repository privacy.
- **YOTE / Build artifact inspection:** Checked the generated deployment for
  missing source maps, an ownership banner, and nonempty dependency notices.

#### Step 35 usage record

- **OPENAI / Playwright skill:** Used browser snapshots and interactions to
  check the deployed prototype at desktop and phone viewport sizes.
- **YOTE / Public documentation:** Kept ownership terms and setup concise,
  with architecture and verified implementation history in their dedicated files.

#### Step 36 usage record

- **OPENAI / Playwright skill:** Browser verification of the compact navigation
  presentation at desktop and phone viewport sizes.
- **YOTE / Scoped presentation changes:** Updated responsive container styling
  and introductory copy without changing navigation behavior.

#### Step 37 usage record

- **OPENAI / OpenAI Docs skill:** Checked official model documentation for
  explicit model and reasoning recommendations.
- **EXTERNAL / Context7 and official GitHub/Vercel documentation:** Checked
  preview deployments, production promotion, branch protection, and recovery.
- **EXTERNAL / actionlint:** Validated workflow syntax with the official
  checksum-verified 1.7.12 Windows release in a temporary directory.
- **YOTE / Reviewable releases:** Kept automated source checks, browser preview
  evidence, production verification, and dashboard enforcement distinct.

#### Step 38 usage record

- **OPENAI / Playwright skill:** Compared desktop presentation before and after
  the stylesheet refactor and checked preserved control colors and layout.
- **YOTE / Explicit presentation settings:** Grouped CSS variables by purpose,
  separated stylesheet responsibilities, and labeled typed map-camera settings.

#### Step 38A usage record

- **EXTERNAL / Context7 and MapLibre documentation:** Used provider-owned GeoJSON
  fill selection and lifecycle events behind the existing adapter contract.
- **OPENAI / Playwright skill:** Checked actual footprint clicks for all three
  buildings, slide controls, dismissal, and the scrollable phone dialog.
- **YOTE / Content separate from rendering:** Kept building descriptions and image
  metadata independent of the adapter and React popup, with honest missing-photo
  states and no new dependencies.

#### Step 39 usage record

- **EXTERNAL / Browser geolocation documentation:** Checked temporary position
  subscriptions, watcher cleanup, and the meaning of reported accuracy.
- **OPENAI / Playwright skill:** Verified the public production merge without
  authentication and exercised refined lookup on the preview with browser fixtures.
- **YOTE / Bounded acquisition:** Separated short lookup refinement from checkpoint
  verification, kept selection pure, and tested cancellation and late-result guards.
