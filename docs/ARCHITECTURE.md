# Yote Wayfinder Architecture Handbook

This is the living handbook for Yote Wayfinder. It explains what the project
does, how its pieces fit together, where common changes belong, and how to
investigate problems. It is written so that a reader does not need a software
engineering background to understand the overall system.

The handbook describes the application as it exists today. It is intentionally
updated as the project grows instead of trying to predict every future feature.
Whenever an architectural decision changes how multiple parts of the project
work together, that decision should be recorded here.

## Table of contents

1. [Start here](#start-here)
2. [What the application does today](#what-the-application-does-today)
3. [The architecture in one picture](#the-architecture-in-one-picture)
4. [How a route preview moves through the system](#how-a-route-preview-moves-through-the-system)
5. [Project folder map](#project-folder-map)
6. [Root files](#root-files)
7. [The `docs` folder](#the-docs-folder)
   7a. [The `scripts` folder](#the-scripts-folder)
8. [The `public` folder](#the-public-folder)
9. [The `src` folder](#the-src-folder)
10. [The `src/app` folder](#the-srcapp-folder)
11. [The `src/composition` folder](#the-srccomposition-folder)
12. [The `src/domain` folder](#the-srcdomain-folder)
13. [The `src/data` folder](#the-srcdata-folder)
14. [The `src/features` folder](#the-srcfeatures-folder)
15. [The navigation feature](#the-navigation-feature)
16. [The map feature](#the-map-feature)
17. [The `src/test` folder](#the-srctest-folder)
18. [Generated and tool-owned folders](#generated-and-tool-owned-folders)
19. [Implementation step guides](#implementation-step-guides)
20. [Safe change recipes](#safe-change-recipes)
21. [Troubleshooting guide](#troubleshooting-guide)
22. [Architectural decision log](#architectural-decision-log)
23. [Engineering principles in plain language](#engineering-principles-in-plain-language)
24. [Glossary](#glossary)
25. [How to maintain this handbook](#how-to-maintain-this-handbook)

## Start here

Yote Wayfinder is a browser-based route-planning prototype. A person chooses a
starting place and a destination, previews a calculated walking route, and sees
that route on an interactive map. The map can be viewed from a flat 2D angle or
a tilted 3D perspective. No building block is currently rendered.

The project is deliberately divided into areas with different responsibilities.
This is similar to organizing a business so that accounting, customer service,
and operations do not all use the same desk. A map-rendering problem should not
require changing the meaning of a route, and adding a new location should not
require rewriting the map library.

If you only need to make a small content change, begin with
[`src/data/navigation`](../src/data/navigation). If you need to change the
screen, begin with [`src/features`](../src/features) and
[`src/app/styles.css`](../src/app/styles.css). If the map itself is failing,
begin with [`src/features/map`](../src/features/map),
[`src/composition/createMapAdapter.ts`](../src/composition/createMapAdapter.ts),
and the [map troubleshooting section](#the-map-is-blank-or-invisible).

Before accepting any change, run the quality commands documented in
[`README.md`](../README.md). These checks act like several independent
inspectors: formatting checks consistency, linting catches suspicious code,
TypeScript checks data contracts, tests check important behavior, and the build
checks whether the browser-ready application can be produced.

## What the application does today

Previewed routes also offer explicit **Start navigation** and **Next Turn**
location checks, instructions, retry messages, and arrival. See the
[Step 16 guide](#step-16-browser-location-and-checkpoint-navigation) for the
complete browser-location flow and its prototype limitations.

The current version is focused on The College of Idaho in Caldwell, Idaho. It
offers 50 searchable places on a local walking graph imported from the user's
newer OSM export. No routing server is required. Searching filters those known
locations. Pressing **Preview route** calculates a path and sends it to the map.
The observed geometry improves the drawing, but connections, permissions,
accessibility, and safe physical use are not campus-approved. The graph release
remains illustrative, not official walking or emergency directions.
The search fields start empty. The map opens tilted over the library toward
Sterry Hall. Selecting Simplot Stadium gives a separate, explicitly provisional
driving handoff from a mapped campus driveway; it does not run walking
checkpoints or calculate a car route from the selected origin.

The campus walking graph and route calculation are
connected to the route-preview feature. The map receives the same provider-
independent `Route` shape as before, so this change does not alter MapLibre
integration.

Each graph edge also records whether it is available, bidirectional or
forward-only, and its accessibility status. Current College of Idaho values are
deliberately marked accessibility-unverified. The path calculation ignores
closed edges and will not travel backward across a forward-only edge.

The graph is packaged with a release record that identifies its source,
review date, and verification status. This release is currently marked
illustrative, not campus-approved. The project will reject a future release that
claims verified data without naming the person or organization that verified it.

The visible labels for Morrison Quadrangle & Clock Tower and Cruzen-Murray
Library are supported by current College and public-map sources. A Google Maps
check showed the former N.L. Terteling Library listing as permanently closed,
so it is labeled as a former building, not presented as the current library. This is intentionally a
narrow claim: no public source reviewed in Steps 11 or 12 proves the exact
walking edges, their distances, temporary closures, travel directions, or
accessibility. Those routing facts remain illustrative until an authorized
campus reviewer checks them.

MapLibre GL JS draws the interactive map. MapLibre is a rendering engine: it
turns map data into the pixels, labels, markers, and lines seen in the browser.
OpenStreetMap raster tiles provide the current street background. A raster tile
is a small map image; many tiles are placed together to form the visible map.

The 3D button currently tilts the MapLibre camera. The former gold calibration
block has been removed because it appeared over Hendren Hall without matching
that building. The isolated Three.js layer remains in source code but is not
attached to the current map. Three.js is a browser 3D rendering library that
may be used for future, reviewed building models. Switching to 2D preserves
the route and map state.

## The architecture in one picture

The maintained [comprehensive Mermaid architecture diagram](ARCHITECTURE_DIAGRAM.md)
shows the implemented runtime, project-owned data, external dependencies,
quality systems, and approved future GPS and photogrammetry boundaries. Mermaid
is a text format that GitHub turns into a navigable diagram; because the source
is text, it can be reviewed and updated alongside code.

The diagram uses solid connections for implemented behavior and dashed gray
connections for approved work that has not been built. This distinction keeps
the target architecture visible without suggesting that checkpoint navigation
or photogrammetry already works.

The arrows show dependency direction: a file higher in the picture may call or
use a file below it. The lower-level files do not need to know how the whole
screen is arranged. This one-way relationship reduces accidental coupling.
Coupling means that two pieces are so dependent on each other that changing one
unexpectedly breaks the other.

The most important boundary is the `MapAdapter` contract. The rest of the app
asks for general actions such as “initialize the map,” “show this content,” or
“switch to 2D.” Only the MapLibre adapter knows the MapLibre-specific commands.
That makes it possible to replace the map provider later without rewriting the
navigation interface.

## How a route preview moves through the system

1. `main.tsx` starts React and renders `App.tsx` into the page.
2. `App.tsx` creates one route-planner state object by calling
   `useRoutePlanner()`.
3. `App.tsx` gives that same state object to `NavigationPanel.tsx` and gives its
   selected locations and planned route to `MapView.tsx`.
4. When a person types, `NavigationPanel.tsx` reports the new text to
   `useRoutePlanner.ts`.
5. `useRoutePlanner.ts` calls pure search logic in `routePlanner.ts`. A pure
   function is a calculation that does not secretly change outside state.
6. When the person selects a location, the hook stores the full validated
   `Location` object, not only the visible label.
7. When **Preview route** is pressed, the hook asks `routePlanner.ts` to request
   a route from the walking graph for the selected location identifiers.
8. `walkingRoutes.ts` asks `pathfinding.ts` for a formal-first path, then asks
   `routeSteps.ts` to orient each selected edge's geometry in travel order and
   derive maneuvers, instructions, and checkpoints.
9. The route factory validates that the steps form one continuous path and
   derives the flattened coordinates used by the map and the estimated duration.
10. React notices the new route and gives it to `MapView.tsx`.
11. `MapView.tsx` calls the provider-neutral `MapAdapter` methods.
12. `MapLibreMapAdapter.ts` converts the route and locations into GeoJSON.
    GeoJSON is a common text-based format for geographic shapes and points.
13. MapLibre draws the route line and location circles, then moves the camera so
    the route fits inside the visible map.
14. In 3D mode, MapLibre tilts the map camera. No building mesh is currently
    attached; the dormant Three.js layer remains isolated for future models.

Keeping this path explicit is important for debugging. If suggestions are
wrong, inspect navigation data and model logic. If the route summary is right
but the map line is wrong, inspect the map adapter. If neither appears, inspect
the shared state in the hook and `App.tsx`.

## Project folder map

```text
YoteWayfinder/
├── .codex/                       Project-scoped agent integrations
├── docs/                         Human-readable project records
├── scripts/                      Reproducible source-data imports
├── public/                       Static browser assets; currently empty
├── src/                          Application source code
│   ├── app/                      Screen assembly and global presentation
│   ├── composition/              Chooses concrete service implementations
│   ├── data/navigation/          Local route and campus content
│   ├── domain/navigation/        Business meaning and validation
│   ├── features/
│   │   ├── map/                  Interactive-map capability
│   │   └── navigation/           Route-planning capability
│   └── test/                     Shared automated-test setup
├── dist/                         Generated production output
├── node_modules/                 Installed third-party packages
└── configuration and guide files Project-wide instructions and tooling
```

The tree is organized primarily by business capability and responsibility. A
new route-planning behavior should normally be placed inside the navigation
feature, while a new map-provider behavior should remain inside the map
feature. General business definitions that both features need belong in the
domain layer.

Generated folders appear in the tree because they are important when running
the project, but they are not source code. They should be recreated by tools
instead of edited manually.

### The `.codex` folder

The `.codex` folder contains project-scoped configuration for Codex. Its
`config.toml` registers the remote Context7 MCP server without storing an API
key. MCP, or Model Context Protocol, is a standard way for an AI development
tool to request information or actions from another tool. Context7 supplies
current third-party library documentation; it does not run inside the finished
Wayfinder website.

Codex loads project-scoped configuration only for a trusted project and may
require a new session after the configuration changes. A personal Context7 key
may provide higher limits, but it belongs in user-level configuration or a
secure environment setting and must never be committed here.

## Root files

The project root is the control desk for the repository. Files here tell tools
how to install, validate, build, and start the application. The root should not
become a collection of unrelated application code; product behavior belongs
under `src` and durable project explanations belong under `docs`.

A non-technical maintainer will interact most often with `README.md` for setup,
`package.json` for available commands, and this handbook for understanding the
system. Tool configuration files usually need changes only when the project
adopts a new compiler rule, testing behavior, or build requirement.

| File                 | Why it exists and when to change it                                                                                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.gitignore`         | Tells Git which machine-generated or personal files must not be committed. Add entries when a tool creates local output that should never be shared.                                               |
| `.prettierignore`    | Tells Prettier which files it should not format. Generated output and the dependency lockfile are excluded because other tools own their formatting.                                               |
| `.prettierrc.json`   | Defines the automatic writing style: no semicolons, single quotes, and trailing commas. Change it only through an agreed project-wide style decision.                                              |
| `AGENTS.md`          | Records the collaboration agreement for AI coding agents, including approval, verification, documentation, Git, and architecture rules. It affects how work is performed, not the running website. |
| `README.md`          | The short front door to the project. It explains purpose, progress, setup, checks, architecture, and publishing. It links to detailed documents instead of duplicating them.                       |
| `package.json`       | Names the project, lists third-party packages, and defines commands such as `npm run dev`, `npm run test`, and `npm run build`. Add a package only when the application genuinely needs it.        |
| `package-lock.json`  | Records exact installed dependency versions so different computers receive consistent packages. It is generated by npm and should not be hand-edited.                                              |
| `index.html`         | Supplies the small HTML shell loaded first by the browser. It provides the page title, description, root element, and link to `src/main.tsx`.                                                      |
| `vite.config.ts`     | Configures Vite, Vitest, the `@/` import shortcut, production source maps, test environment, and MapLibre optimization exception. Map bundling or test-startup problems may lead here.             |
| `eslint.config.js`   | Configures linting rules for TypeScript, React hooks, and React refresh. Linting looks for unsafe or suspicious patterns that formatting alone cannot detect.                                      |
| `tsconfig.json`      | Connects the browser and tool TypeScript configurations into one project. It is mostly an index rather than the detailed rule set.                                                                 |
| `tsconfig.app.json`  | Applies strict TypeScript rules to browser code under `src`. These rules prevent mistakes involving missing values, unused code, and incorrect data shapes.                                        |
| `tsconfig.node.json` | Applies TypeScript rules to Node-based configuration files such as `vite.config.ts` and `eslint.config.js`.                                                                                        |

## The `docs` folder

The `docs` folder is the project’s institutional memory. Source code can show
what the computer does, but it often cannot explain why a choice was made,
which alternatives were rejected, or how a non-technical contributor should
approach a change. Those explanations belong here.

Documentation must stay connected to reality. When implementation changes make
a statement here incorrect, updating the relevant document is part of the code
change, not a later optional task.

| File                             | Importance and relationship to other files                                                                                                                                                                                  |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/ARCHITECTURE.md`           | This living handbook. It explains folders, files, data flow, change recipes, failure diagnosis, principles, and architectural decisions. Update it whenever a change alters boundaries or introduces an important new file. |
| `docs/ARCHITECTURE_DIAGRAM.md`   | The comprehensive Mermaid dependency and data-flow diagram. It distinguishes implemented components from approved future components and must change with major architecture boundaries.                                     |
| `docs/PROGRESS.md`               | A chronological record of completed project steps and verified fixes. It answers “what has been accomplished?” while this handbook answers “how is it organized and why?”                                                   |
| `docs/AI_SKILLS.md`              | A branded inventory of AI capabilities, external technologies, and project-specific practices used during development. It makes AI-assisted work visible and auditable.                                                     |
| `docs/OSM_EXPORT_REVIEW.md`      | Records source digests, coverage, omissions, and attribution for old and current OSM exports. It separates observed geometry from verified access.                                                                          |
| `docs/CAMPUS_DATA_COLLECTION.md` | Guides future field correction and measured-data intake. It is not the runtime route dataset.                                                                                                                               |
| `docs/PROJECT_MEMORY.md`         | Durable resume context: current source, major decisions, limitations, verification commands, and next approval boundary. Read it when resuming an interrupted step.                                                         |

## The `scripts` folder

This folder contains repeatable preparation tools, not code that runs on a
visitor's phone. `import_campus_osm.py` reads a user-approved OSM XML export,
selects the usable connected walking network, and writes
`src/data/navigation/campusOsmNetwork.json`. It uses Python's standard library
only. The source stays outside the website; the compact result is committed
and can be reviewed as a normal data change.

Do not edit the output JSON by hand. Preserve the source export, review its
fingerprint and changed objects, run the script, then check graph tests and
visible routes. The separate builder in `src/data/navigation` interprets the
JSON for the application. Keeping import and runtime graph-building apart
means future source changes do not require a rewrite of the map renderer.

## The `public` folder

`public` is reserved for static files that should be copied directly into the
built website without being processed as source code. Examples might include a
favicon, a downloadable PDF, or an image whose filename must remain unchanged.
The folder is currently empty.

Most images imported by React or CSS should normally live near the source code
that uses them so Vite can optimize and fingerprint them. Use `public` only when
direct, unchanged browser access is intentional. A fingerprint is a generated
filename fragment that helps browsers recognize when an asset has changed.

## The `src` folder

`src` contains the application’s human-written runtime source. Vite begins at
`main.tsx`, follows imports to the rest of the files, and bundles the needed
code for the browser. Keeping runtime code under one top-level folder makes it
clear what belongs to the application rather than its build tools.

The subfolders divide responsibilities. `domain` defines valid navigation
concepts, `data` supplies current sample records, `features` implements user
capabilities, `composition` chooses concrete external integrations, `app`
assembles the screen, and `test` configures shared test behavior.

| File                | Importance and relationship to other files                                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/main.tsx`      | The browser entry point. It finds the HTML root, starts React in strict mode, imports MapLibre CSS before application CSS, and renders `App`. If nothing appears, this is one of the first files to inspect. |
| `src/vite-env.d.ts` | Teaches TypeScript about the optional `VITE_MAP_STYLE_URL` and typed `VITE_LOCATION_MODE` settings. Add future `VITE_...` settings here so their names and types are checked.                                |

## The `src/app` folder

The `app` folder assembles the top-level experience. It decides which major
features appear together and which state must be shared between them. It should
remain a coordinator, not become the place where search algorithms or
MapLibre-specific commands accumulate.

The application currently creates one route planner in `App.tsx`. Both the
navigation panel and map receive information from that same source. This is a
single source of truth: one authoritative copy of state prevents two parts of
the screen from disagreeing about the selected route.

| File                   | Importance and relationship to other files                                                                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/app/App.tsx`      | Composes the header, navigation panel, and map. It owns 2D/3D mode and passes route-planner state to both features. It lazy-loads `MapView`, so the large map code is requested separately.                  |
| `src/app/App.test.tsx` | Checks that the route-planning heading and map region are present. It replaces the real map with a test substitute because browser map rendering does not belong in this basic application test.             |
| `src/app/styles.css`   | Contains the global visual system and responsive layout. It also guarantees that the map host fills its panel. Change colors, spacing, typography, and layout here while checking desktop and mobile widths. |

## The `src/composition` folder

Composition is the point where a general contract is connected to a specific
tool. The application asks for a `MapAdapter`; `createMapAdapter.ts` decides
that the current implementation is `MapLibreMapAdapter`. This keeps provider
selection out of user-interface components.

Think of this folder as a hiring desk. The rest of the company describes the
job it needs performed, and the composition layer selects the vendor that will
perform it. Changing providers should primarily change this desk and the new
provider implementation, not every caller.

| File                                        | Importance and relationship to other files                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/composition/createMapAdapter.ts`       | Creates the concrete MapLibre adapter and its style. It no longer attaches a 3D building layer. By default it defines an OpenStreetMap raster basemap; `VITE_MAP_STYLE_URL` can replace that style without changing `MapView`. This is the dependency-injection boundary. Dependency injection means supplying a needed implementation from outside instead of constructing it throughout the application. |
| `src/composition/createLocationProvider.ts` | Selects the prototype simulator by default or the browser adapter when `VITE_LOCATION_MODE=browser`, keeping that choice outside components and domain rules.                                                                                                                                                                                                                                              |

## The `src/domain` folder

The domain folder describes what navigation information means independently of
React, MapLibre, or the current mock data. A `Location` has an identifier,
label, and coordinates. A `Route` connects two location identifiers and has
geometry, distance, estimated duration, and ordered route steps. Each step has a
maneuver, instruction, walking geometry, and expected checkpoint.

Because these definitions do not depend on screen or map libraries, they can be
used by future APIs, routing algorithms, administrative tools, and tests. This
is one of the most valuable long-term boundaries in the project.

### `src/domain/navigation`

This subfolder owns navigation vocabulary and validity. It should not import
from `data`, `features`, or MapLibre. Those outer areas depend on the domain,
not the other way around.

| File                                                 | Importance and relationship to other files                                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/domain/navigation/types.ts`                     | Defines shared meanings for locations, rendered routes, walking-graph nodes, edges, paths, restrictions, provenance, and releases. These provider-independent shapes are imported by data, navigation, and map code so every area agrees on the same meaning.                                                                                    |
| `src/domain/navigation/factories.ts`                 | Creates validated, immutable domain objects. It rejects impossible coordinates, empty identifiers, same-endpoint routes, incomplete geometry, invalid graph edges, unknown restriction values, invalid review dates, and unsubstantiated verified releases. Immutable means callers cannot accidentally alter accepted data later.               |
| `src/domain/navigation/factories.test.ts`            | Proves important validation rules: coordinates are frozen, latitude ranges are enforced, routes cannot start and end at the same place, and graph edges cannot point to unknown nodes.                                                                                                                                                           |
| `src/domain/navigation/pathfinding.ts`               | Contains the pure formal-first path calculation. It minimizes informal walking first, then length adjusted by a small main-footway preference. It still skips closed edges, respects forward-only edges, and reports actual physical length without importing React or MapLibre.                                                                 |
| `src/domain/navigation/pathfinding.test.ts`          | Proves the algorithm chooses the shorter allowed path, supports permitted reverse travel, rejects forbidden reverse travel, avoids closures, and safely reports no path for unknown or unreachable nodes.                                                                                                                                        |
| `src/domain/navigation/routeSteps.ts`                | Converts selected graph edges into travel-oriented geometry, classifies maneuvers from geographic bearings, writes short instructions, and places checkpoints. Two turns separated by at most 12 m can share an instruction and checkpoint; farther turns remain distinct. It remains independent from React, MapLibre, and browser geolocation. |
| `src/domain/navigation/routeSteps.test.ts`           | Proves left and right turns, checkpoint order, instructions, and reverse travel through bidirectional geometry.                                                                                                                                                                                                                                  |
| `src/domain/navigation/locationVerification.ts`      | Creates validated one-shot location readings, calculates geographic distance, and classifies checkpoint proximity with reported accuracy and reading age. It contains provisional policy values but does not request browser location.                                                                                                           |
| `src/domain/navigation/locationVerification.test.ts` | Proves meter distance, numerical edge cases, validation, confirmed/mismatched boundaries, overlapping accuracy, and stale or future readings.                                                                                                                                                                                                    |
| `src/domain/navigation/navigationSession.ts`         | Implements explicit awaiting-start, navigating, and arrived transitions. It chooses the expected origin or route-step checkpoint and advances only after confirmed verification without retaining raw reading coordinates.                                                                                                                       |
| `src/domain/navigation/navigationSession.test.ts`    | Proves origin validation, no progress after mismatch or uncertainty, ordered turn advancement, arrival, completed-session failure, and location-data minimization.                                                                                                                                                                               |
| `src/domain/navigation/walkingRoutes.ts`             | Coordinates shortest-path selection, route-step creation, validation, and the prototype walking-duration estimate.                                                                                                                                                                                                                               |
| `src/domain/navigation/walkingRoutes.test.ts`        | Proves path-to-route conversion preserves ordered detailed geometry, distance, duration, checkpoints, and unavailable-route behavior.                                                                                                                                                                                                            |

## The `src/data` folder

The data folder supplies records used by the application. Today these are local
mock records, meaning realistic sample information stored in source code instead
of retrieved from a server. This makes the prototype reliable while the real
data source is still undecided.

The files construct records through domain factories. Sample data therefore
cannot quietly bypass the rules expected from future live data. When an API
replaces these files, its responses should be translated and validated at a
similar boundary.

### `src/data/navigation`

This subfolder is the safest place for many current content changes. A person
can add a location or route without editing React components or MapLibre code,
provided identifiers and coordinates remain consistent.

| File                                                     | Importance and relationship to other files                                                                                                                                                                                                                                                                                                               |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/data/navigation/collegeOfIdahoCampus.ts`            | Defines the campus name, address, initial map viewpoint, and panning boundary. `MapView.tsx` reads this file and passes it through the provider-neutral map contract. Its north-south boundary now allows a tall map panel to zoom out enough to fit the current east-west routes. These values remain separate from individual locations and routes.    |
| `src/data/navigation/collegeOfIdahoCampus.test.ts`       | Checks that the configured initial map center stays inside the configured campus boundary. It protects a simple but important data assumption.                                                                                                                                                                                                           |
| `src/data/navigation/collegeOfIdahoWalkingGraphData.ts`  | Curates 50 searchable places from mapped entrances, building/parking/court outlines, and landmarks; records provenance. It no longer hand-copies walkway geometry. Outline-derived approach points and short unmapped links remain illustrative. The invented Campus Entrance is absent.                                                                 |
| `src/data/navigation/campusOsmNetwork.json`              | Generated, compact snapshot of the newer OSM export's connected walking network, selected road ways, sport/parking outlines, buildings, entrances, and points of interest. It is committed so local builds do not need the user's Downloads folder or a live OSM connection. Do not hand-edit it: rerun the importer and review the diff.                |
| `src/data/navigation/buildCampusWalkingGraph.ts`         | Converts imported path segments and curated locations into the existing graph contract. It validates referenced building, area, and described-entrance IDs; uses a mapped main court gate when one is supplied, otherwise chooses the nearest outline point; labels unmapped links as connectors; and keeps map-provider code out of route construction. |
| `src/data/navigation/buildCampusWalkingGraph.test.ts`    | Checks source-reference failures, projected connector behavior, and routing-network construction at the import boundary.                                                                                                                                                                                                                                 |
| `src/data/navigation/collegeOfIdahoWalkingGraph.ts`      | A small validated loader for the editable graph dataset. It sends the records through domain factories, then exports the safe graph that `useRoutePlanner.ts` supplies to `routePlanner.ts`.                                                                                                                                                             |
| `src/data/navigation/collegeOfIdahoWalkingGraph.test.ts` | Confirms all 50 places are connected, including the sports courts; Anderson and JAAC/pool entrances are distinct; the library-to-cafeteria route uses main rather than informal ways; drawn length matches reported length; and the release remains illustrative.                                                                                        |
| `src/data/navigation/mockLocations.ts`                   | Derives searchable locations and search-result records from the editable dataset. Every searchable location must also have a graph node; the module throws a clear error if that data rule is broken.                                                                                                                                                    |
| `src/data/navigation/stadiumDrivingHandoff.ts`           | Builds one narrow, provisional road preview from selected OSM road IDs. It validates connected road points and one-way travel, then supplies the planner and map with a separate handoff shape. It never claims a venue entrance or car GPS checkpoints.                                                                                                 |
| `src/data/navigation/stadiumDrivingHandoff.test.ts`      | Checks the mapped exit and parking-approach endpoints so an OSM refresh cannot silently move the handoff.                                                                                                                                                                                                                                                |

The source preparation guide is [`docs/CAMPUS_DATA_COLLECTION.md`](CAMPUS_DATA_COLLECTION.md).
It specifies authorized source formats, required measurement metadata, field
observation templates, and review checks. Use it before editing the graph or
future 3D scene data so that the source and confidence of each new measurement remain
traceable.

The [OSM export review](OSM_EXPORT_REVIEW.md) preserves both historical and
current source digests. The XML is not loaded by the browser. The current
importer converts its walkable connected component to a compact committed
JSON snapshot; the builder combines that with curated location references
and passes the result through the normal validation boundary.

## The `src/features` folder

A feature is a capability recognizable to a user or product owner. The current
features are navigation and map display. Each feature owns its interface and
behavior while depending on shared domain concepts.

Organizing by feature keeps related changes close together. It also discourages
an oversized general components folder where unrelated files become difficult
to find. Cross-feature communication happens through typed props, hooks, and
contracts rather than hidden global variables.

## The navigation feature

The navigation feature controls location queries, suggestions, selections,
route lookup, and the visible planning panel. It does not issue MapLibre
commands. Its output is provider-independent data that any map or text-only
interface could consume.

The feature separates calculation, state, and presentation. The model performs
calculations, the hook manages changing values over time, and the component
renders controls. This makes each area easier to test and reason about.

### `src/features/navigation/contracts`

Contracts describe capabilities the feature may use without choosing a browser
or service implementation. The browser adapter implements this contract without
importing the Geolocation API into domain calculations.

| File                                                             | Importance and relationship to other files                                                                                                                                       |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/navigation/contracts/LocationProvider.ts`          | Defines one asynchronous `requestCurrentLocation` operation returning the domain reading shape. The browser adapter constructs a validated reading.                              |
| `src/features/navigation/contracts/LocationProviderError.ts`     | Shares typed failure categories between the browser adapter, hook, and recovery interface.                                                                                       |
| `src/features/navigation/contracts/PrototypeLocationScenario.ts` | Defines the small prototype-only scenario capability. Its type guard lets App expose the simulator control without making the browser provider pretend to support test outcomes. |

### `src/features/navigation/infrastructure`

This folder isolates browser location access from route calculations and screen
presentation. `BrowserLocationProvider.ts` converts browser results to validated
readings; `PrototypeLocationProvider.ts` generates a reading at the expected
checkpoint without accessing a device. In Step 19, it also owns the selected
prototype result—expected, uncertain, wrong, stale, or unavailable. Their
adjacent tests verify both boundaries.
The [Step 16 file guide](#files-folders-and-connections) explains the physical
adapter, and the [Step 17 guide](#step-17-prototype-location-simulator) explains
simulation and its connections.

### `src/features/navigation/model`

The model holds pure navigation calculations. Keeping these functions free of
React makes them suitable for focused tests and reuse.

| File                                            | Importance and relationship to other files                                                                                                                                                                                      |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/navigation/model/routePlanner.ts` | Filters location results and asks the domain walking-route function for ordinary destinations. For Simplot Stadium alone, it returns a distinct driving-handoff state, so walking checkpoints cannot be used for a car preview. |

### `src/features/navigation/hooks`

A React hook is a reusable stateful function. The hook acts as the navigation
feature’s controller: components ask it to change queries, select locations,
swap endpoints, or plan a route.

| File                                               | Importance and relationship to other files                                                                                                                                                 |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/features/navigation/hooks/useRoutePlanner.ts` | Owns origin, destination, query text, suggestions, and planned route. It reads mock data, calls model functions, and returns a small public interface used by `App` and `NavigationPanel`. |

### `src/features/navigation/components`

Components are visible building blocks rendered by React. Navigation components
focus on what the person sees and does, delegating route logic to the hook and
model.

| File                                                     | Importance and relationship to other files                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/features/navigation/components/NavigationPanel.tsx` | Renders both location fields, suggestions, swap button, preview action, and route summary. It receives the planner object instead of constructing a second one, preserving shared state with the map. It also remounts checkpoint navigation when a prototype scenario changes, ensuring each demo starts cleanly. |

## The map feature

The map feature converts provider-independent navigation information into an
interactive visual map. It is divided into components, contracts, and
infrastructure. These distinguish what React needs, what the app may ask of a
map, and how MapLibre performs the work.

This boundary limits the effect of provider changes. UI code uses the contract,
while infrastructure code may use MapLibre-specific classes, worker files,
layers, sources, and camera commands.

### `src/features/map/components`

Map components connect the React lifecycle to the provider-neutral adapter.
Lifecycle means the sequence in which a component is created, updated, and
removed.

| File                                      | Importance and relationship to other files                                                                                                                                                                           |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/map/components/MapView.tsx` | Creates one adapter when its browser container becomes available, sends new locations and routes to it, changes camera mode, and destroys it during cleanup. It also renders the 2D/3D buttons and explanatory note. |

### `src/features/map/contracts`

A contract is a description of what a service must be able to do. It does not
say how the service performs those actions. Components depend on this contract
instead of a particular map provider.

| File                                                  | Importance and relationship to other files                                                                                                                                                                 |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/map/contracts/MapAdapter.ts`            | Defines initialization, content updates, mode changes, and cleanup. It also defines content and initial-view shapes. Any replacement provider must implement this interface.                               |
| `src/features/map/contracts/GeoreferencedBuilding.ts` | Defines a provider-independent building anchor, dimensions, heading, color, and verification status. It contains no MapLibre or Three.js types, so owned scene data is not locked to the current renderer. |

### `src/features/map/infrastructure`

Infrastructure contains code that talks to an external technical system. In
this project, MapLibre and Three.js are those systems. Provider-specific imports
and commands belong here rather than in navigation or general UI code.

| File                                                                         | Importance and relationship to other files                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/map/infrastructure/MapLibreMapAdapter.ts`                      | Implements `MapAdapter` with MapLibre. It configures the worker, creates the map, translates route content to GeoJSON, coordinates the 3D layer, changes camera mode, fits route bounds, and cleans up. A web worker is a separate browser execution context that prevents map work from blocking the interface. |
| `src/features/map/infrastructure/MapLibreMapAdapter.test.ts`                 | Uses substitutes to verify initialization, 2D/3D behavior, custom-layer visibility, cleanup, readiness, and explicit failure when controls are used too early.                                                                                                                                                   |
| `src/features/map/infrastructure/MapLibreGeoreferencedBuildingLayer.ts`      | Implements a MapLibre custom 3D layer with Three.js. It converts the building's latitude, longitude, altitude, heading, and meter dimensions into MapLibre coordinates; shares MapLibre's WebGL canvas; and disposes geometry, material, and renderer resources when removed.                                    |
| `src/features/map/infrastructure/MapLibreGeoreferencedBuildingLayer.test.ts` | Uses a renderer substitute to prove the layer shares the map canvas, renders only while visible, requests a repaint when its visibility changes, and disposes the renderer. Actual WebGL appearance still requires a real-browser check.                                                                         |

## The `src/test` folder

The test folder contains setup shared by automated tests. Central setup avoids
repeating the same testing imports and ensures all tests use consistent matchers
and browser simulation.

The current test environment is jsdom, a lightweight simulation of browser
documents used inside Node. It is suitable for component and logic tests but is
not a replacement for visually checking real WebGL map rendering in a browser.

| File                | Importance and relationship to other files                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/test/setup.ts` | Loads Testing Library’s DOM matchers for every Vitest test. These matchers allow readable checks such as “this heading is in the document.” |

## Generated and tool-owned folders

These folders are necessary, but their contents are not maintained like source
code. Editing them creates changes that are easily lost and hard to reproduce.

### `.git`

`.git` is Git’s internal database containing commits, branches, and repository
metadata. Use Git commands to interact with it. Never manually edit or delete
its contents during ordinary project work.

### `node_modules`

`node_modules` contains installed third-party packages. `npm install` recreates
it from `package.json` and `package-lock.json`. If it becomes corrupted, repair
the installation process instead of editing package files inside this folder.

### `dist`

`dist` contains the production website generated by `npm run build`. It can be
deleted and rebuilt. Hosting systems deploy this output, but human changes must
be made in `src` or configuration and then rebuilt.

## Implementation step guides

Each completed implementation step receives a focused guide here. These guides
are an easier starting point than reading the entire handbook when you only need
to understand one step.

### Step 5: Application states and polish

Step 5 makes the application explain what is happening instead of leaving a
person to infer it from a blank or unchanged screen. The route planner now
distinguishes an untouched form, an invalid typed location, a valid pair without
a walking route, and a route that is ready to show. The map likewise says when
it is loading and provides a clear recovery action if MapLibre reports an error.

Keyboard users can open location suggestions with the arrow keys, move through
them, choose one with Enter, and close the list with Escape. The active choice
is communicated through accessibility attributes so assistive technology can
announce it. Accessibility attributes are semantic information that helps screen
readers understand controls and their current state.

The main files for this step are `useRoutePlanner.ts` and `routePlanner.ts` for
route outcomes, `NavigationPanel.tsx` for messages and keyboard interaction,
`MapView.tsx` and `MapAdapter.ts` for map loading/error recovery,
`MapLibreMapAdapter.ts` for provider callbacks, and `styles.css` for visible
status treatment. The related tests are in `App.test.tsx`, `routePlanner.test.ts`,
and `MapLibreMapAdapter.test.ts`.

### Step 6: Testing, bundling, delivery, and College of Idaho focus

Step 6 finishes the agreed prototype delivery work and narrows its geographic
purpose to The College of Idaho. The map now opens at a campus-sized view and
cannot normally be panned far outside the campus boundary. A boundary is a
rectangle with southwest and northeast corners that limits the map camera. This
does not make the map authoritative: the campus locations and route lines remain
clearly labeled illustrative data until they are replaced by approved, verified
campus walking data.

`collegeOfIdahoCampus.ts` is the single place to change the campus name,
address, opening viewpoint, or allowed map area. `MapView.tsx` reads that
configuration and passes it through `MapAdapter.ts`; `MapLibreMapAdapter.ts`
translates it into MapLibre's `maxBounds` option. This keeps campus policy out
of the visual component and out of the provider-specific implementation.

The selected landmark names are informed by The College of Idaho's official
[campus map](https://collegeofidaho.edu/visit/campus-map/) and its
[campus-map PDF](https://collegeofidaho.edu/wp-content/uploads/2025/09/2021-2022-Campus-Map.pdf).
They are used only for prototype demonstration, not as a claim of official
route accuracy.

The production bundle was also inspected. A production bundle is the set of
optimized browser files produced by `npm run build`. MapLibre remains in the
already lazy-loaded map chunk, meaning it is downloaded separately from the
initial application interface. Additional code splitting would add complexity
without a material benefit for this small prototype, so it was intentionally
not added.

### Step 7: Routing foundation

Step 7 introduces the first reusable routing building block without changing
the current route-preview screen. A walking graph represents places as nodes and
walkable connections as edges. An edge includes its length in meters. The pure
`findShortestWalkingPath` function uses Dijkstra's algorithm: it repeatedly
explores the currently shortest known route until it reaches the destination.

The graph data in `collegeOfIdahoWalkingGraph.ts` is intentionally small and
illustrative. Its values are not official pedestrian, accessibility, or
emergency guidance. Before this graph drives the interface, a campus owner must
verify every node, connection, distance, direction, closure, and accessibility
restriction. Keeping that data separate from the algorithm means a verified
replacement can be introduced without rewriting the calculation.

`types.ts` defines the graph vocabulary, `factories.ts` validates and freezes
graph data, and `pathfinding.ts` performs the calculation. The campus graph is
in the data folder, while both domain and data tests prove the expected path.

### Step 8: Graph route integration

Step 8 connects the approved routing foundation to the existing planner without
changing the map boundary. `walkingRoutes.ts` converts the shortest graph path
into the established `Route` record that `MapView.tsx` already understands. This
is a transformation boundary: it turns one internal data shape into another
without making MapLibre or React aware of graph details.

The route duration is derived from a prototype walking-speed constant of 66
meters per minute and rounded up to a whole minute. It is an estimate, not an
accessibility or travel-time promise. `routePlanner.ts` preserves the existing
invalid-location, unavailable-route, and route-ready outcomes, while
`useRoutePlanner.ts` supplies the campus graph. The old `mockRoutes.ts` file was
removed because it duplicated calculated route geometry and could drift out of
sync with the graph.

Every searchable mock location must now have a node in the graph. The graph test
protects that rule. If a new location lacks a node or has no connected path, the
application reports an unavailable route instead of inventing directions.

### Step 9: Route constraints

Step 9 prepares the graph for real-world restrictions without claiming that the
current campus data has been verified. Every edge now has three explicit fields:
availability (`available` or `closed`), direction (`bidirectional` or
`forward-only`), and accessibility (`unverified`, `step-free`, or `stairs`).
The current College of Idaho graph uses only `available`, `bidirectional`, and
`unverified`; these values make the prototype's uncertainty visible in data.

The shortest-path calculation now filters edges before considering their
distance. A closed edge is never used, even when it would be shorter. A
forward-only edge is usable only from its `fromNodeId` to its `toNodeId`.
Accessibility status is deliberately modeled but not used to select paths yet,
because the interface has no approved accessibility-routing preference.

Tests prove two critical safety rules: the algorithm selects an open detour over
a closed shortcut, and it rejects reverse travel across a forward-only edge.
This lets a future verified data source express closures and restrictions without
rewriting the route algorithm.

### Step 10: Data verification workflow

Step 10 makes the trust level of route data explicit. A `WalkingGraphRelease`
contains the graph plus immutable provenance: a source description, review date,
verification status, and—only when verified—a named verifier. Provenance means
a record of where information came from and how it was checked.

The factory accepts `illustrative` data for prototype use, but it rejects a
release labeled `verified` when no verifier is named. It also rejects an invalid
calendar date. This does not prove route accuracy by itself; it prevents the
application from accidentally presenting unreviewed data as approved.

`collegeOfIdahoWalkingGraphRelease` records that the current topology comes
from project mock locations and is not campus-approved. Before changing it to
verified, a campus owner or authorized source must document the origin of every
node and edge, confirm its distance, direction, availability, and accessibility
status, identify the verifier, and update the review date. The UI continues to
work from the graph inside that release, so this governance improvement does not
change the map or the route experience.

### Step 11: Public-source corroboration

Step 11 makes a careful improvement to the information a person can see without
pretending that public maps are an authorized routing survey. The official
[College of Idaho campus map](https://collegeofidaho.edu/visit/campus-map/) and
its [downloadable map](https://collegeofidaho.edu/wp-content/uploads/2025/09/2021-2022-Campus-Map.pdf)
confirm the published label `Morrison Quadrangle & Clock Tower`. The map PDF
also contained N.L. Terteling Library, but that map is not sufficient evidence
that it is a current destination. Step 12 supersedes the prototype's former
Terteling marker after direct Google Maps and current College sources showed
that Cruzen-Murray Library is the current library and the Terteling listing is
permanently closed.

Only limited visible facts are supported by named public sources. A
corroborated fact is checked against a source beyond the project's own mock
record; it is not the same as a campus-approved operational instruction. The
graph therefore remains `illustrative`: its central waypoint, all edge geometry
and distances, availability, direction, and accessibility values still need
authorized review.

### Step 12: Validated data replacement

Step 12 both corrects the current library destination and makes later verified
data replacement deliberately small. The College's current
[Cruzen-Murray Library page](https://collegeofidaho.edu/library/) identifies
the library as part of The College of Idaho. Direct inspection of the public
[Google Maps listing](https://www.google.com/maps/search/?api=1&query=Cruzen-Murray+Library%2C+College+of+Idaho%2C+Caldwell%2C+ID)
also identifies it as a College library; the former
[N.L. Terteling Library listing](https://www.google.com/maps/search/?api=1&query=N.L.+Terteling+Library%2C+College+of+Idaho%2C+Caldwell%2C+ID)
is marked permanently closed. The independent
[OpenStreetMap-derived record](https://mapcarta.com/W603509923) supplies the
Cruzen-Murray coordinate `43.6545, -116.67654`.

`collegeOfIdahoWalkingGraphData.ts` is now the editable dataset: it contains
searchable labels, nodes, edges, and provenance together. `mockLocations.ts`
derives its location records and coordinates from this one dataset. The small
`collegeOfIdahoWalkingGraph.ts` loader passes that data through domain factories
before exporting it. A loader is code that turns stored information into safe
application data. This means an invalid future import fails at the existing
validation boundary instead of reaching Dijkstra pathfinding or the map.

When verified data is available, replace the contents of the dataset file,
including its provenance, rather than modifying the route planner, React hook,
or MapLibre adapter. The expected fields are already visible in the dataset:
node IDs and coordinates; edge endpoints, meters, direction, availability, and
accessibility; and the release source, review date, status, and verifier. Keep
the status `illustrative` unless the existing verification checklist can be
completed. This avoids a speculative import framework while giving future data
providers one clear, tested entry point.

### Step 13: Georeferenced 3D architecture spike

Historical note: this step's gold calibration block was removed in Step 25.
The provider-specific layer code remains dormant; see the Step 25 guide for
the current 3D behavior.

Step 13 proves the smallest uncertain part of the approved owned-map direction:
a Three.js object measured in meters can stay attached to a real campus latitude
and longitude while MapLibre moves, tilts, and rotates the camera. The result is
the gold block visible near the campus center in 3D mode. It is a procedural
model, meaning code creates its box geometry instead of downloading a model
file. It is not a representation of a particular College of Idaho building.

`GeoreferencedBuilding.ts` describes the object without importing a rendering
library. `collegeOfIdahoScene.ts` supplies the illustrative dimensions and
anchor. `createMapAdapter.ts` constructs the concrete Three.js layer and gives
it to `MapLibreMapAdapter`. The adapter adds the layer after MapLibre loads and
controls whether it is visible. This follows dependency inversion: general
application code describes a building, while the infrastructure layer decides
how Three.js and MapLibre draw it.

`MapLibreGeoreferencedBuildingLayer.ts` converts the WGS84 coordinate into a
MapLibre `MercatorCoordinate`, obtains the scale corresponding to one real-world
meter at that latitude, and combines translation, scale, and rotation matrices.
WGS84 is the geographic latitude-and-longitude system used by GPS. A matrix is
a compact mathematical description of movement, rotation, scale, and camera
projection in 3D space.

MapLibre and Three.js share one WebGL context. A WebGL context is the browser's
connection to graphics resources on the device's GPU. Sharing avoids a second
canvas and keeps both renderers on the same camera, but it requires explicit
state reset and cleanup. The layer therefore resets Three.js state before each
draw and disposes its geometry, material, and renderer when MapLibre removes it.
It does not request continuous repaints because the calibration building is
static; this avoids unnecessary battery and graphics work.

The layer is hidden when the user selects 2D and shown in 3D. The route remains
owned by the existing graph and MapLibre GeoJSON layers. The block cannot define
an entrance, walkway, or route. Later GLB assets will replace procedural geometry
only after an approved capture, optimization, and performance process. GLB is a
compact binary file format for delivering 3D models on the web.

The production build measured the cost of the experiment. The deferred map
chunk is 1,545.66 kB minified and 406.75 kB gzip, about 530 kB minified and
132 kB gzip larger than before Three.js. Gzip is compression used during web
delivery. This increase does not affect the initial application chunk because
`MapView` remains lazy-loaded, but it is a meaningful baseline. Future work
should load building assets separately, use compressed textures and geometry,
and test real phones before adding many buildings.

Automated tests verify the lifecycle and provider boundary. A headless Edge
browser capture verified that the actual WebGL block appears on the campus map
and the existing interface remains intact. The temporary screenshot and browser
profiles were deleted after inspection; generated verification artifacts are
not project source.

The approved target beyond this spike is shown in `ARCHITECTURE_DIAGRAM.md`.
Steps 14 and 15 have since implemented route steps, location verification, the
provider contract, and checkpoint session state. Browser geolocation, visible
navigation controls, and an authorized photogrammetry-to-optimized-model
pipeline remain dashed or gray future integrations.

### Step 14: Route geometry, instructions, and checkpoints

Step 14 adds the provider-independent information that future Next Turn
navigation will consume. A graph edge no longer means only “node A connects to
node B.” Every runtime edge now has geometry: an ordered list of geographic
points describing the shape of that walking leg. The factory supplies a direct
two-point line when an input omits geometry, but the editable campus dataset
contains explicit intermediate points so it demonstrates the intended
replacement format. Those points remain illustrative until they are replaced by
an authorized survey or another approved source.

After Dijkstra's algorithm selects edge identifiers, `routeSteps.ts` orients
each edge's geometry in the actual direction of travel. This matters because a
bidirectional edge is stored once but can be walked forward or backward. The
module examines the final segment of the incoming edge and the first segment of
the outgoing edge, calculates their geographic bearings, and classifies the
change as continue, turn left, turn right, or turn around. A bearing is a
direction around the compass measured in degrees. Changes smaller than 30
degrees are treated as continuing straight; changes of at least 150 degrees are
treated as turning around.

Each selected edge becomes one `RouteStep`. The step contains the edge ID,
maneuver, short instruction, distance, travel-oriented geometry, and one
checkpoint. A checkpoint is the expected geographic point at the end of a
walking leg. Intermediate endpoints are `turn` checkpoints and the final
endpoint is a `destination` checkpoint. This means a later navigation session
can verify the current step's checkpoint before advancing, without asking
MapLibre to decide what a route means.

The route factory is the consistency gate. It rejects an empty route, a first
step that does not depart, another depart in the middle, disconnected step
geometry, a checkpoint that differs from the end of its step, an early
destination checkpoint, or a total distance that differs from the sum of step
distances. It then derives the one flattened coordinate list that the existing
MapLibre adapter already renders. Deriving rather than duplicating this list
prevents turn instructions and the visible line from quietly disagreeing.

This step deliberately stops before interactive navigation. Route instructions
exist as domain data but are not shown in the current route summary. There is no
browser location request, GPS accuracy calculation, tolerance radius,
navigation-session state, or Next Turn button yet. Those responsibilities need
their own approved boundary and field-tested policy.

The design uses small pure functions rather than a class because route-step
generation keeps no state between calls. That is React- and provider-independent
functional domain logic, while OOP remains useful in the stateful MapLibre and
Three.js lifecycle adapters. The implementation therefore follows Single
Responsibility without forcing the same programming style into every module.

### Step 15: Location verification and navigation-session foundation

Step 15 implements the decision-making core for one-shot GPS navigation without
requesting a person's location. `LocationProvider.ts` is only a contract: it
states that a future implementation can request one current reading containing
coordinates, accuracy, and capture time. The browser Geolocation API is not
imported, and no permission prompt or automatic polling exists.

`locationVerification.ts` measures the distance between a reading and an
expected checkpoint with the Haversine formula. Haversine is a standard way to
calculate approximate great-circle distance between latitude/longitude points
on Earth. The implementation clamps its intermediate value to the valid range,
which prevents tiny floating-point errors from producing an invalid result at
extreme distances.

A GPS reading is not treated as one perfectly known point. Its reported
accuracy is modeled as a circle around the reported center. The prototype
checkpoint radius is 20 meters. A reading is `confirmed` only when the farthest
edge of its accuracy circle remains within 20 meters. It is `mismatched` only
when even the nearest edge is more than 20 meters away. When the accuracy circle
crosses the boundary, the result is `uncertain`. This conservative policy avoids
turning an imprecise signal into a false claim about where a person is.

Readings more than 30 seconds old are also uncertain, as are readings whose
timestamp appears to be in the future. Twenty meters and 30 seconds are
provisional engineering values, not verified campus safety tolerances. They
must be tested with real phones in different campus locations and conditions
before production use.

`navigationSession.ts` is a pure state machine. A state machine is a model with
named states and controlled transitions. A session starts as `awaiting-start`
and expects the route origin. A confirmed origin changes it to `navigating`.
Each confirmed turn advances exactly one route step, and a confirmed destination
changes the status to `arrived`. Uncertain or mismatched results record the
outcome but do not advance. An arrived session explicitly rejects another check.

The application must call verification deliberately; the session contains no
timer, watcher, or background loop. This preserves the approved interaction:
request once at navigation start, then request again only when the person
presses the future Next Turn control.

The session also applies data minimization. Data minimization means retaining
only what is needed for the feature. It records the result, calculated distance,
and reported accuracy but not the raw coordinates from the person's reading.
The immutable route remains present because it defines the next expected
checkpoint.

At the end of Step 15 this foundation was invisible in the browser. Step 16,
documented next, connects the adapter and interface while retaining these rules.

### Step 16: Browser location and checkpoint navigation

This step connects Step 15's tested decision-making rules to the browser and
the visible interface. Preview a route to reveal **Walk the route**. Press
**Start navigation** at the selected starting place. Only a confirmed origin
check reveals the first walking instruction. At each leg endpoint, **Next Turn**
requests another reading; a confirmed result advances one leg, and the final
confirmed checkpoint displays arrival. A checkpoint is an expected geographic
position, not a guarantee that an actual campus path is safe or correctly mapped.

The app does not request location merely because it opens, previews a route, or
switches map modes. It does not call `watchPosition`, which would subscribe to
repeated location updates. Instead, each deliberate button action calls
`getCurrentPosition`, the browser's one-reading operation. Browser location may
combine GPS, Wi-Fi, and other device signals; this is not guaranteed satellite
GPS. The app does not save raw readings to storage or send them to its own
server. The browser/operating system controls its underlying location service.

#### Files, folders, and connections

`src/features/navigation/infrastructure` is the new browser-facing folder.
Infrastructure means code that talks to a concrete outside facility rather
than deciding route rules. `BrowserLocationProvider.ts` implements the existing
`LocationProvider` contract. Its small class holds the supplied browser facility
and secure-context flag, converts browser callbacks into a Promise (a value that
will arrive later), and validates the resulting reading with the existing domain
factory. Its adjacent `.test.ts` file checks request settings, conversion, invalid
readings, and permission/error mapping without obtaining anyone's real location.

This separation makes replacing the source straightforward: implement the same
one-shot contract and select it in `src/composition/createLocationProvider.ts`.
Composition means assembling concrete parts at the application boundary. This
factory supplies the browser facility and checks `isSecureContext`; constructing
it does not request location. `App.tsx` creates a stable default provider and
also accepts a supplied provider for tests. Supplying a dependency from outside
is called dependency injection; the feature need not know where readings originate.

`src/features/navigation/contracts/LocationProviderError.ts` defines stable error
names shared by the browser implementation, hook, and interface. It is deliberately
separate from browser numeric error codes. Permission denial, unavailable location,
timeout, unsupported browsers, and insecure contexts therefore produce explicit
messages without leaking browser-specific behavior into domain rules.

`src/features/navigation/hooks/useCheckpointNavigation.ts` coordinates the
request and immutable session. A hook is a React function that manages changing
screen state. Immutable means an updated session replaces the old value rather
than altering it in place. The hook delegates geographic decisions to
`navigationSession.ts` and `locationVerification.ts`; it does not duplicate their
calculations. A synchronous busy guard and disabled button prevent overlapping
requests. It also rejects repeated or backward capture timestamps, preventing
one reading from confirming successive checkpoints.

`src/features/navigation/components/CheckpointNavigation.tsx` translates those
states into instructions, a progress count, a status announcement, and the
appropriate button. Its adjacent test file covers arrival, uncertainty,
mismatch, stale/reused readings, failures, retries, and a late result after route
replacement. `NavigationPanel.tsx` displays it only for a previewed route and
passes the injected provider. `styles.css` supplies the notice, instruction, and
disabled-button presentation. The existing map adapter remains unchanged.

`useRoutePlanner.ts` now increments a route revision on each preview. A revision
is a simple counter identifying this particular preview, even when the endpoints
are unchanged. `NavigationPanel` uses it as React's `key`, causing the old
navigation component to be removed and a fresh one created. Editing or swapping
locations also removes the session until another route is previewed. The hook's
cleanup ignores any result belonging to a removed component. This prevents a
slow reading from advancing a replacement route. `App.test.tsx` checks the
integration and reset behavior. Switching 2D/3D does not change the revision.

#### Failure behavior and practical troubleshooting

Uncertain or mismatched readings never advance the session. Neither do provider
errors. The planned route stays available on the map while the person retries.
Arrival removes the request button; there is no background tracking afterward.
Re-previewing the route starts a new session instead of resuming previous progress.

If permission is denied, change the browser's site permission and, if necessary,
the device's location setting before retrying. A normal HTTP address on another
device may not be a secure context: use HTTPS for phone testing. Localhost is
appropriate for local desktop testing. Do not disable browser security settings
to make the feature work. An embedded deployment can additionally be blocked by
the host's location-permission policy.

The request asks for high accuracy, disallows cached positions (`maximumAge: 0`),
and sets a 15-second acquisition timeout. High accuracy is a request, not a
promise. The timeout does not cover all time spent waiting for the person to
answer a permission prompt. Answer that prompt if the button remains pending.
Changing/re-previewing the route discards the old session; the browser API itself
has no cancellation handle, so cleanup ignores its eventual result.

The 20-meter checkpoint radius and 30-second reading-age policy remain unchanged
and provisional. Accuracy is a statistical estimate, not a guaranteed boundary;
passing this prototype's conservative check cannot prove physical safety. Dense
buildings, device clocks, and weak signals can cause uncertainty. Paths, checkpoint
positions, and distances still need campus review. Do not loosen the policy
simply to force an illustrative route to pass.

#### Verification and performance

Automated tests use fake readings; browser checks use emulated coordinates, not
the user's real location. These checks validate software behavior, not outdoor
GPS accuracy, real mobile hardware, or correctness of campus walking directions.
The production application chunk is 244.83 kB minified / 76.58 kB gzip, compared
with 237.86 / 74.39 kB before integration. Gzip is transfer compression. The
deferred map chunk remains 1,545.66 / 406.75 kB. No dependency was added, and no
new map renderer or continuous location workload was introduced.

Primary references: [W3C Geolocation](https://www.w3.org/TR/geolocation/),
[React cleanup](https://react.dev/learn/synchronizing-with-effects), and
[React state reset with keys](https://react.dev/learn/preserving-and-resetting-state).
Context7 supplied current React documentation for this implementation. Consult
the Step 16 progress entry for the final automated and browser check results.

### Step 17: Prototype location simulator

Step 17 postpones physical campus testing without removing the real-location
architecture. The application now selects `PrototypeLocationProvider` by default.
When Start navigation or Next Turn is pressed, the hook obtains the session's
expected checkpoint and passes its coordinates as request context. The simulator
returns a fresh, accurate reading at that checkpoint, after which the unchanged
domain verification and session state machine decide whether to advance.

Request context means information supplied to a provider for one operation. The
browser adapter deliberately ignores expected coordinates and reads the physical
device, while the simulator uses them to create deterministic prototype data.
Deterministic means the same route state produces the expected test outcome. The
simulator maintains increasing timestamps even when clicks occur in the same
millisecond, so the anti-reuse safeguard continues to work.

The visible blue notice is an important safety boundary: it says demo location is
active, the buttons simulate checkpoints, and the device location is not requested.
Status text also uses the word “simulate.” This prevents a seated test from being
mistaken for successful physical navigation. Routes, instructions, checkpoints,
distances, and the 3D calibration building remain illustrative.

To start future physical testing, add this root `.env.local` value and restart
Vite:

```text
VITE_LOCATION_MODE=browser
```

The absence of this setting—or `VITE_LOCATION_MODE=prototype`—selects simulation.
The setting is typed in `src/vite-env.d.ts`; a misspelled value is rejected by
TypeScript when used in source. `.env.local` is intentionally ignored by Git, so
one person's field-testing choice does not silently change everyone else's mode.
Always confirm that the blue notice has disappeared before collecting field data.

This design applies dependency inversion: high-level navigation depends on the
`LocationProvider` contract, not either concrete source. The factory at the
composition boundary is the only normal selection point. Automated tests cover
the simulator directly and exercise the complete interface through arrival.
Physical browser behavior remains covered separately with callback-based tests.

Browser verification on the default configuration completed the entire route
without a permission prompt and reported no console errors or warnings. It proves
the prototype interface flow, not real GPS accuracy or campus route correctness.
See the Step 17 progress entry for final check and bundle details.

### Step 18: Turn-focused map guidance

Historical note: the off-walkway Campus Entrance described below was removed
in Step 25. The current route begins at a selected campus place.

Step 18 makes prototype navigation state visible on the map. The route preview
still shows the full path. After navigation starts, each route step is emitted as
its own GeoJSON feature with a presentation state: completed, current, or
upcoming. GeoJSON is a standard structure for geographic shapes and their
properties. MapLibre uses those properties to draw completed legs gray, the
current leg wider and green, and upcoming legs orange. A white casing behind all
legs keeps them visible over the dotted red basemap paths.

The College of Idaho dataset no longer draws a straight line across the athletic
field. Its Campus Entrance coordinate remains off the dotted footway, so the
first segment is an explicit temporary connector to the nearest public mapped
footway. The remaining detailed geometry follows OpenStreetMap footway shapes
visible on the prototype basemap. This is an alignment improvement, not campus
verification: surface condition, legal access, closures, entrances, distances,
and accessibility remain illustrative and require field review.

Navigation session state now travels from `CheckpointNavigation.tsx` through
`NavigationPanel.tsx` to `App.tsx`, then into `MapView.tsx` and the provider-
neutral `MapContent`. This is a projection: the map receives enough domain state
to present progress but does not decide whether a checkpoint is confirmed. The
MapLibre adapter alone translates that state into provider-specific layers and
camera commands, preserving the existing dependency boundary.

At navigation start, the camera centers near the route origin, zooms to 18, and
uses the first leg's geographic bearing. Bearing is the compass direction from
one coordinate to another. After each confirmed turn, it moves to the beginning
of the new leg and rotates toward that leg. In 3D the pitch is 60 degrees; in 2D
it remains flat. An offset places the checkpoint slightly below center so more
of the path ahead remains visible. Arrival focuses the destination.

`moveNavigationBack` is provider-independent domain behavior. From an active
leg it selects the preceding leg; from arrival it returns to the final leg; from
the first leg it returns to pre-start state. It does not request location. The
component clears transient failures and reports the replaced immutable session,
which causes both instructions and camera presentation to update together.

Key connections:

- `collegeOfIdahoWalkingGraphData.ts` owns editable illustrative footway shapes
  and the temporary off-walkway connector.
- `navigationSession.ts` owns forward verification and backward transitions.
- `CheckpointNavigation.tsx` owns instructions, Back/Next controls, and the
  accessible leg-color legend.
- `App.tsx` shares one session between the navigation panel and map.
- `MapView.tsx` sends route and session content through the map contract.
- `MapLibreMapAdapter.ts` owns GeoJSON leg features, data-driven styling, bearing
  calculation, and camera animation.

Browser checks showed the updated route over the dotted footways, distinct leg
colors, Back returning to the prior instruction/camera, and camera changes in
both map modes without console errors. The Step 18 progress entry records the
automated checks and bundle sizes. Visual alignment still needs the project
owner's later on-campus review before any route can be called verified.

### Step 19: Prototype scenarios and limited destination expansion

Step 19 makes laptop testing more representative without pretending that a
seated person is walking the route. The blue prototype notice now includes a
**Demo checkpoint result** selector. It can return the expected checkpoint,
poor accuracy, a clearly wrong position, a stale reading, or an unavailable
location. Each choice exercises the existing verification and recovery paths;
it does not add a second navigation state machine or bypass the domain policy.
Changing the result restarts the current route simulation so the next reading is
valid for the selected case. This is necessary because a stale reading must be
older than the 30-second policy but cannot safely follow a newer reading in the
same session.

The scenario vocabulary and controller live in
`PrototypeLocationScenario.ts`, which is a narrow capability rather than part
of the general `LocationProvider` contract. A capability is a small optional
ability an object can offer. App uses a type guard—runtime code that confirms a
value has a particular capability—before passing this controller to the UI.
Real browser location mode therefore does not display or implement synthetic
results. `PrototypeLocationProvider.ts` remains the only stateful simulator;
the hook continues to request one reading and the domain remains the only place
that decides confirmed, uncertain, or mismatched progress.

The editable graph now exposes three additional searchable building labels:
Blatchley Hall, Simplot Dining Hall, and Sterry Hall. Their names are listed on
[the official campus map](https://collegeofidaho.edu/visit/campus-map/). Their
displayed centers and nearby footway shapes were checked against public
[OpenStreetMap data](https://www.openstreetmap.org/). The graph connects each one using
detailed illustrative geometry, including temporary connectors from a building
center to the nearest mapped footway. A building center is not necessarily an
entrance, so these paths must not be treated as approved physical directions.
This intentionally stops at three locations; no broad campus expansion, new map
provider, or claims of route verification are included in this step.

Key connections:

- `collegeOfIdahoWalkingGraphData.ts` owns the three labels, coordinates,
  illustrated footway geometry, and their provenance.
- `mockLocations.ts` derives autocomplete records from that dataset, so no UI
  location list requires manual updating.
- `PrototypeLocationProvider.ts` implements the optional scenario controller.
- `App.tsx` detects that capability and passes it through `NavigationPanel.tsx`.
- `CheckpointNavigation.tsx` renders the accessible selector and recovery
  message. As refined in Step 20, its hook resets the session after a scenario
  choice without replacing the focused selector; `NavigationPanel.tsx` still
  starts a new session when the planned route changes.

Focused tests cover every simulator outcome, scenario selection, reset signaling,
the added autocomplete result, and graph reachability for all three buildings.
Browser inspection verified a Sterry Hall preview and the wrong-location retry
flow without browser location permission. The default map and all added walking
directions remain illustrative prototype behavior.

### Step 20: Mobile navigation and demo usability

This step makes the existing route experience easier to test on a phone without
adding destinations or changing route calculation. Previously, every progress
update sent the mobile viewport down to the map. The map camera moved to the
new leg, but the new written instruction and Next/Back controls were above the
screen. `MapView.tsx` now has two separate effects: map content still refreshes
whenever the navigation session changes, while automatic scrolling runs only
when a new route is previewed. A user who advances a turn therefore keeps the
instruction in view. The initial preview still brings the map into view, and
that movement honors the operating system's reduced-motion preference.

Changing a demo checkpoint outcome formerly removed and recreated the entire
navigation component. This reset progress, but it also removed keyboard focus
from the selector. `useCheckpointNavigation.ts` now exposes a small explicit
reset operation for this testing action. `CheckpointNavigation.tsx` changes the
simulator outcome and invokes the reset; `NavigationPanel.tsx` retains only the
route revision as the component key. A component key tells React when a
component represents a genuinely new route and should start fresh. The outcome
selector remains mounted and focused, while a different route still gets a
new session. The selector is disabled during a pending one-shot request so an
in-flight reading cannot silently belong to a newly selected scenario.

The prototype recovery text now tells a seated tester how to continue the demo
after wrong, uncertain, stale, or unavailable synthetic readings. The real
browser-location messages remain separate and unchanged. At a 320 CSS-pixel
viewport, the scenario selector and panel no longer overflow horizontally;
the touch controls have at least a 44-pixel intended hit area, and keyboard
focus remains visibly outlined. These are usability improvements, not evidence
that any walkway or entrance is physically accurate.

Key files and connections:

- `src/features/map/components/MapView.tsx` sends the current immutable route
  and session to the provider adapter while controlling only when the browser
  scrolls to the map. Map drawing remains inside `MapLibreMapAdapter.ts`.
- `src/features/navigation/hooks/useCheckpointNavigation.ts` owns the session
  reset and pending-request guard. The visual component calls it but does not
  implement checkpoint rules.
- `src/features/navigation/components/CheckpointNavigation.tsx` owns the
  outcome selector and demo-specific explanatory text; the hook and the
  injected provider still decide actual progress.
- `src/features/navigation/components/NavigationPanel.tsx` remounts the
  navigation session only when `routeRevision` changes. `src/app/styles.css`
  handles narrow layout, target size, and visible focus without routing logic.
- The corresponding component tests in `src/app/App.test.tsx` and
  `CheckpointNavigation.test.tsx` protect route/session reset behavior.

#### Preparing accurate campus geometry later

The [campus geometry collection packet](CAMPUS_DATA_COLLECTION.md) gives a
repeatable way to provide authorized plans, measurements, coordinates, and
photos for Campus Entrance and the four currently available destinations. It
includes field and spreadsheet templates, a source review checklist, and the
places where approved route and building data belong. It deliberately limits
the request to this small prototype area.

Phone GPS can roughly anchor observations, but [GPS.gov notes](https://www.gps.gov/gps-accuracy)
that phone accuracy varies and worsens near buildings; it should not establish
a precise entrance or walkway width on its own. Building photographs can help
with appearance, but visual models do not establish a safe walking connection.
The [official campus map](https://collegeofidaho.edu/visit/campus-map/) helps
with place names and orientation, not measured geometry.

### Step 21: Campus geometry collection packet

Historical note: this section describes the original smaller collection
scope. The current packet covers corrections to the expanded destinations
and no longer includes an invented campus gate.

Step 21 prepares for data replacement; it does not change the application map
or its route data. [`docs/CAMPUS_DATA_COLLECTION.md`](CAMPUS_DATA_COLLECTION.md)
is the handoff sheet to use with authorized facilities records or, if they are
unavailable, a small user-collected survey for the current Campus Entrance,
library, and three halls. It explains which outlines, dimensions, pathway
centerlines, widths, junctions, entrance points, access notes, coordinates,
dates, and source permissions matter. A coordinate reference system describes
how mapped positions correspond to real places; it must accompany any numeric
coordinates received from a plan.

The packet also includes a spreadsheet-style observation template and a
review sequence. Unknown details remain unverified. Once the user provides a
batch, the graph dataset remains the source for walking connectivity and
provenance; separate map scene data remains the source for building geometry.
This keeps visual modeling from silently introducing entrances or paths.

### Step 22: OSM export audit and Blatchley entrance

The user supplied an OpenStreetMap XML export after Step 21. The
[export review](OSM_EXPORT_REVIEW.md) records the exact snapshot digest, object
counts, the four current building outlines, their tagged entrances, pedestrian
path coverage, and missing facts. XML here is a text format for map records:
point nodes, ordered path or outline ways, and named tags. It is source data,
not instructions for the project.

The first data batch moves only Blatchley Hall's searchable and routable graph
node to its mapped `entrance=main` node. The existing route already reaches a
footway vertex about 3.9 metres away; its final connector now ends at the
entrance rather than running through the building center. The rounded route
leg length changes from 290 to 275 metres. The XML does not connect that
entrance node to a pedestrian way, so the connector, distance, and access
assumptions remain illustrative. The other destinations and the 3D
calibration building are unchanged.

`collegeOfIdahoWalkingGraphData.ts` contains the new endpoint, leg length,
OSM object IDs, review date, and illustrative provenance. Its validated loader
and `mockLocations.ts` pass the same node into routing and search results; the
map receives the resulting route through the existing adapter. The focused
graph test checks the endpoint, length, and status. No map-provider code or
new runtime dependency was required. The app already displays OpenStreetMap
attribution for its basemap, and the export review links the ODbL source terms.

### Step 23: OSM-based 2D walking routes

Historical note: this section describes the earlier export and limited
destination set. Steps 24 and 25 supersede its source and scope.

The user clarified that accurate 2D walking routes take priority over widths,
building heights, accessibility, slopes, and further 3D work. Their OSM edits
were made from firsthand campus observation. We therefore used the supplied
export's ordered pedestrian-way points to replace the limited graph's old
straight route drawings. A graph is the application's connected list of places
and walkable links; a way in OSM is an ordered series of mapped points. We
kept the graph small: it covers only the existing nearby destinations and now
has junctions that make the mapped alternatives and turns explicit.

Simplot is one connected building with two separately selectable destinations.
The mapped main entrance near Blatchley is labeled **Simplot Dining Hall** for
the cafeteria; the other mapped main entrance is **Simplot Residence Hall**.
The library and Sterry destinations also end at their mapped entrance nodes.
The old Campus Entrance point is not on an exported pedestrian way, so its
first line still goes straight to the nearest mapped footway. Entrance nodes
are near, but not directly joined to, the footway network in the XML; their
short final segments are illustrative too. This is not a claim that those gaps
are safe, accessible, or physically open. The graph's provenance stays
`illustrative`, and accessibility stays `unverified`.

At Step 23, `collegeOfIdahoWalkingGraphData.ts` was the only route-geometry edit point.
`collegeOfIdahoWalkingGraph.ts` validates it, `mockLocations.ts` derives search
choices, and `walkingRoutes.ts` selects connected edges. `routeSteps.ts`
turns those edges into instructions and checkpoints; `MapView.tsx` forwards the
same route to `MapLibreMapAdapter.ts` to draw it. Thus one data correction
changes search, route distance, instructions, and the visible line together.
The focused graph test checks key entrance points, the chosen library path,
and consistency between drawn lengths and routing distances.

The app opens in 2D while this work is being reviewed. Existing 3D rendering
remains available but was not developed further. In browser testing, the
east-west residence route was clipped even though `fitBounds` centered it.
MapLibre's configured maximum pan boundary also imposes a minimum zoom: on
the tall, narrow desktop canvas, the old boundary prevented enough zoom-out.
`collegeOfIdahoCampus.ts` now provides a slightly taller campus-local boundary
so both route endpoints can fit. This is a camera configuration change, not a
change in any building or walkway coordinate. Test the current 2D routes in
the browser and tell us where the line leaves a real walkway before treating
them as field-ready directions. The adapter also re-fits a preview when MapLibre
reports a canvas resize, so a browser-width change or phone rotation does not
leave an already previewed route cut off.

### Step 24: Expanded OSM network and search

Historical note: Step 25 replaced this snapshot, widened the catalogue,
removed the Campus Entrance and 3D block, and changed route preference.

The user supplied a newer OSM export based on firsthand observations. It has
2,965 point nodes, 585 ways, and 5 relations. We imported the main connected
pedestrian component rather than hand-transcribing hundreds of path points.
The source file stays in the user's Downloads folder; the committed
`campusOsmNetwork.json` is a compact, reviewable derivative. The source SHA-256
digest and counts are in [the export review](OSM_EXPORT_REVIEW.md). A SHA-256
digest is a fingerprint: a changed source file gets a different digest.

The import script, `scripts/import_campus_osm.py`, filters for walkable linear
ways and records building outlines, entrance nodes, and points of interest.
It excludes explicitly private/no-access paths and area polygons from routing.
The graph builder then turns adjacent path points into graph edges, checks that
each curated building entrance belongs to its stated building, and joins
nearby off-path entrances with short, labeled prototype connectors. The
off-path Campus Entrance retains its longer illustrative connector. A
connector means a drawn link for which the source does not establish a usable
walkway; it is not evidence of safe access. If a destination is too far from
the path network, construction fails instead of silently inventing a route.

`collegeOfIdahoWalkingGraphData.ts` now curates 21 places using OSM object IDs
and a descriptive label. `buildCampusWalkingGraph.ts` supplies their graph
nodes and edges; `collegeOfIdahoWalkingGraph.ts` validates the release;
`mockLocations.ts` derives search results. All later route calculation and map
rendering still use the established provider-independent contracts. This is a
practical separation of concerns: source import, human curation, routing,
and drawing each have one job. A new export may change or remove OSM IDs, so
import, review its diff, update curated references, and rerun tests together.

`pathfinding.ts` uses the physical length of formal paths as route cost and a
1.12 multiplier for informal paths. This modest penalty makes a formal path
win when two routes are similar, but an informal route still wins when it is
materially shorter. The route summary displays unpenalized physical distance,
not the preference score. This is a deliberate compromise between the user's
request for short routes and a general preference for established walkways;
it is not a safety or legal-access guarantee. `routeSteps.ts` joins successive
straight graph segments so every OSM vertex does not become a new turn.

The destination list can exceed a phone's screen. `styles.css` limits the
suggestions box height and makes it vertically scrollable;
`NavigationPanel.tsx` brings the active keyboard suggestion into view. The
underlying search and selection logic is unchanged. Browser testing verified
all 21 entries, keyboard scrolling, route previews, phone layout, and a clean
console. Review new paths visually and send corrections before physical
navigation use. Heights, widths, slopes, accessibility, and detailed 3D work
remain deferred as requested.

### Step 25: Described destinations and formal route priority

The user supplied `map (1).osm`, a further observed OSM export with
descriptions on entrances, main footways, parking areas, and the clock-tower
landmark. The [current source audit](OSM_EXPORT_REVIEW.md#fourth-application-batch-descriptions-and-broader-destinations-step-25)
records its SHA-256 fingerprint, imported feature counts, and source
conflicts. The importer preserves descriptions that affect route selection
and destination identification; the original XML remains outside the app.

The catalogue now has 42 named campus places. The invented Campus Entrance
was deleted because the campus has no fixed gate. The initial preview is
Cruzen-Murray Library to Simplot cafeteria, making the requested route easy to
test. Anderson Residence Hall uses the door described as mostly used by
residents. The JAAC activities entrance and swimming-pool entrance are two
separate destinations. The activities entrance is on a mapped walkway but
not the building outline, so the builder validates its description rather
than pretending it is a building-outline node.

The additional destinations include four named apartments, ten described
parking areas, previously omitted named campus buildings, Simplot Stadium,
and landmarks. When a building has no tagged entrance, the builder chooses
the outline vertex closest to the walking network and marks the link as an
illustrative connector. This is an _approach point_, not an inferred door.
The former library building is labeled “former” to avoid claiming that it
still operates as the library. One Hayman parking way also carries conflicting
basketball-pitch tags; it is provisional pending the user's correction.

`pathfinding.ts` now compares candidate routes in two stages: least informal
walking first, then total length with a 10% discount in the internal score
for ways explicitly described as main footways. This is a _lexicographic
priority_: the first rule wins before the second is considered. It is an
intentional change from Step 24's small informal penalty, implementing the
user's stronger formal-path preference. Physical distance shown in the UI is
never discounted. For the library-to-cafeteria example, a regression test
requires main-footway use and no informal shortcut.

`routeSteps.ts` combines two turns only when the leg between them is at most
12 m. The merged instruction explicitly names both maneuvers and the short
distance between them; its single checkpoint comes after the combined leg.
Turns farther apart retain separate Next actions. This reduces unnecessary
button presses without concealing a turn. It does not change the underlying
path, map line, or location-verification policy.

`createMapAdapter.ts` no longer installs the Three.js calibration scene, and
`src/data/map/collegeOfIdahoScene.ts` was removed. The 3D button still tilts
MapLibre's camera; no 3D building is currently drawn. The generic custom-layer
implementation remains in source for later approved, measured models. Its
code is dormant and does not contribute to the current map bundle.

Focused tests cover source IDs, entrance separation, catalogue reachability,
formal-path selection, physical distance, and close versus far turns. Real
browser checks covered the library-to-cafeteria route, a parking route on a
phone-size viewport, the expanded dropdown, and the 3D view without the block.
The browser console had no errors or warnings. All destinations and
connectors remain prototype data until physically checked and approved.

### Step 26: Court search and stadium driving handoff

The same user-observed `map (1).osm` source now supplies sport-tagged court
outlines and a small, separately selected set of road ways. The import script
keeps the walkable graph unchanged while adding those source objects to
`campusOsmNetwork.json`; its source digest remains the same. The [fifth source
audit](OSM_EXPORT_REVIEW.md#fifth-application-batch-mapped-courts-and-stadium-handoff-step-26)
lists the OSM IDs and limitations. In `collegeOfIdahoWalkingGraphData.ts`,
eight court labels refer to exact sport/area IDs. `buildCampusWalkingGraph.ts`
checks that the sport matches before connecting the outline to a nearby
walkway. Tennis, pickleball, basketball, and beach volleyball are searchable
and receive walking previews. The numbers 1â€“3 or 1â€“2 distinguish otherwise
unnamed OSM court outlines; they are not verified signs or official names.
No ordinary volleyball court has a separate sport tag in this export.

The stadium is different. The walking graph remains a pedestrian system and
must not be relabeled as car directions. `stadiumDrivingHandoff.ts` selects
the nearer of two road-connected campus driveway points by straight-line
distance to a west-side stadium parking approach. It traces three mapped
road ways: southbound one-way Cleveland Boulevard, South 24th Avenue, and
the parking access. This is a **handoff**: a limited preview from a known
boundary point, not a calculated car route from the user's chosen start.
The final point is a parking approach, not a verified stadium door. Both
candidate driveways are tagged `access=private`, so the screen states that
permission and real-world turns must be checked. This remains illustrative.

`routePlanner.ts` returns a separate `driving-handoff` state only when the
selected destination is Simplot Stadium. `useRoutePlanner.ts` passes that
state to `App.tsx`; `NavigationPanel.tsx` shows its caveats and deliberately
does not mount `CheckpointNavigation.tsx`. `MapView.tsx` passes the limited
road geometry through the typed `MapAdapter` contract. Only
`MapLibreMapAdapter.ts` knows how to draw the dashed purple road line and
separate exit, parking-approach, and stadium-outline markers. This keeps
MapLibre and road presentation outside the walking algorithm. A future
verified driving graph would need its own permission, one-way, turn, and
destination-access checks, not a modification to walking checkpoints.

The map now opens in tilted 3D camera mode, centered at the mapped library
entrance with a roughly southward bearing toward Sterry Hall. The app still
does not render 3D building models. Both route fields begin empty, making a
place choice explicit. `CheckpointNavigation.tsx` renders the walking Start
button immediately after Preview route, before the longer instructions.
`styles.css` uses provisional purple `#412D5E` for the page and primary
controls. Public references attribute this value to an older College brand
book (see the [secondary team-color listing](https://www.cfc1869.com/team/College%20of%20Idaho/)
and [older College brand-book link](https://issuu.com/thecollegeofidaho/docs/cofi_brandbook_v17_high)),
but the original guide was not retrievable in this review; request the
current official style guide before calling the value brand-certified.

Focused tests cover sport-tag validation, all court routes, stadium state
separation, road endpoints, map rendering, empty inputs, initial mode, and
button order. The browser check examined the library opening, stadium
handoff, tennis route, mobile layout, and a fresh console with zero errors or
warnings. Court approach points,
driveway use, parking, and venue access still require field confirmation.

### Step 27: Court-gate correction and source validation

This step compared the eight court destinations, two stadium outlines, the
Hayman conflict, and the limited stadium road preview with the unchanged user
OSM export. It also checked the College's published campus map and athletics
driving directions. The [sixth source audit](OSM_EXPORT_REVIEW.md#sixth-application-batch-court-entrances-and-source-conflicts-step-27)
separates supported facts from those still needing the user's observation.
No broad route-network or driving behavior was changed.

One court has better location evidence: Beach Volleyball Court 2 contains an
OSM node marked as its main entrance. `collegeOfIdahoWalkingGraphData.ts` now
names that node, and `buildCampusWalkingGraph.ts` checks that it belongs to
the selected sports area and really is a main entrance before using it.
`buildCampusWalkingGraph.test.ts` checks the rule with a small sample network;
`collegeOfIdahoWalkingGraph.test.ts` checks the actual imported court. This
is a useful source-to-app connection: if a later OSM import removes or moves
the gate, the build fails clearly instead of silently switching back to a
different corner. The line from that gate to the nearest walking way remains
an inferred connector, not proof of a usable opening in a fence.

Seven other court outlines have no entrance tag. Their numbering, gates, and
walkway approaches still need on-site review. The Hayman area described as a
second parking lot is also tagged as a basketball pitch; the app has not
invented a second court from it or claimed the conflict resolved. Published
athletics directions support using Cleveland Boulevard and 24th Avenue to
reach Simplot Stadium, but do not authorize the private-tagged campus driveway
or verify the stadium parking aisle and venue door. The stadium handoff stays
a warning-labeled prototype. The [field collection packet](CAMPUS_DATA_COLLECTION.md)
now asks for those specific observations, rather than building height or 3D
detail while the 2D map is still being checked.

## Safe change recipes

These recipes identify normal starting points. Always run quality checks
afterward and inspect the browser for visual changes.

### Add a location

1. Check that the new place has a mapped entrance, building or parking outline,
   path node, or point-of-interest node in the current OSM snapshot. Confirm
   its name and physical location with the user. If not, obtain better source
   geometry before adding it.
2. Open `src/data/navigation/collegeOfIdahoWalkingGraphData.ts` and add a
   unique ID, label, source kind, and matching OSM object IDs.
3. `buildCampusWalkingGraph.ts` connects the record to the imported network;
   `mockLocations.ts` derives search choices. Do not duplicate coordinates or
   search records in React components.
4. Run tests and inspect the suggestion, route, connector, and entrance in 2D.

The factory rejects empty text or coordinates outside valid world ranges. Do
not bypass it by placing unvalidated plain objects into the application.

### Change the walking graph

1. Correct the observed path or entrance in an OSM export you have permission
   to use, preserving a copy and its date.
2. Run `python scripts/import_campus_osm.py path/to/map.osm`, then review the
   generated JSON diff and source digest in the export review.
3. Update curated OSM IDs in `collegeOfIdahoWalkingGraphData.ts` if the source
   changed. The loader validates the resulting graph through `createWalkingGraph`.
4. Let the importer and builder preserve OSM point order and matching edge
   endpoints. Their tests reject invalid references and geometry.
5. Keep unknown access and accessibility unverified. Do not infer a safe
   passage or one-way restriction from a drawn line alone.
6. Update the graph test with the route, geometry, checkpoints, and distance that
   should result.
7. Add a restriction test when using a closure or a forward-only edge.
8. Check the calculated route in both directions in the browser after pressing
   **Preview route**.
9. Obtain campus verification before treating the data as official.

An edge is treated as two-way only when its direction is `bidirectional` and is
considered only when its availability is `available`.

### Verify and release campus graph data

1. Collect the approved source for every affected campus path.
2. Verify node coordinates, edge distance, direction, availability, and
   accessibility status with an authorized campus reviewer.
3. Update `collegeOfIdahoWalkingGraphData.ts` and its release provenance
   together; do not alter the loader unless the domain contract changes.
4. Set `verificationStatus` to `verified`, provide `verifiedBy`, and use a real
   `reviewedOn` date in `YYYY-MM-DD` format.
5. Update focused tests for the changed path behavior.
6. Run the quality checks and inspect calculated routes in the browser.

Do not mark a release verified from an unreviewed screenshot, informal memory,
or an unconfirmed public map. Keep it illustrative until the required evidence
and named review exist.

### Corroborate a public location fact safely

1. Start with the College's current published map for the location's official
   name and campus context.
2. Find an independent public map record for a coordinate or building outline.
   Record the exact page and date checked in the Step guide and provenance text.
3. Change only the fact the sources support: for example, a label or one marker
   coordinate. Do not infer a walkable path, entrance, distance, closure, or
   accessibility property from a pin alone.
4. Keep the graph release `illustrative` unless the full verification checklist
   above is completed by an authorized campus reviewer.
5. Update the location and matching graph node together, add a focused test,
   then inspect the changed marker and label in the browser.

This small process prevents a helpful public-map correction from silently
turning into an unverified directions claim.

### Change checkpoint verification policy

1. Begin in `src/domain/navigation/locationVerification.ts` and identify whether
   the change affects radius, reading freshness, or classification boundaries.
2. Base a production change on documented campus field tests across representative
   devices and locations; do not tune it from one convenient reading.
3. Preserve the three outcomes. Poor accuracy that overlaps a boundary must stay
   uncertain rather than being forced into confirmed or mismatched.
4. Add boundary tests for the smallest accepted and rejected values and for stale
   readings.
5. Update ADR-025 and the Step 15 guide with the evidence and consequences.
6. Later, test the complete browser flow without introducing continuous tracking.

The current 20-meter radius and 30-second maximum age are prototype defaults.
They are not campus-approved guarantees and should remain visibly described as
provisional until field evidence supports a release decision.

### Change visible wording

- Header wording lives in `src/app/App.tsx`.
- Planner wording lives in `NavigationPanel.tsx`.
- Map note text and mode labels live in `MapView.tsx`.
- Browser tab title and page description live in `index.html`.

Update tests if they intentionally search for old wording. Preserve accessible
labels so keyboard and assistive-technology users understand the controls.

### Change colors, spacing, or responsive layout

Start in `src/app/styles.css`. Search for the component class, make the smallest
relevant change, and inspect a wide and narrow window. The current mobile
breakpoint is 760 pixels.

Be especially careful with `.map-view` and `.map-canvas`. MapLibre adds its own
classes to the same element. Application CSS must continue to give the map host
a nonzero width and height.

### Change the default map style

For a deployment-specific hosted style, set `VITE_MAP_STYLE_URL`. For a new
project default, update `defaultMapStyle` in
`src/composition/createMapAdapter.ts`.

Do not put provider URLs inside `MapView.tsx`. Keeping them in composition
preserves the adapter boundary. Confirm that any tile service permits expected
usage and provides required attribution.

### Add a future 3D building model

There is no current building block or scene data file. Do not recreate the
former Hendren-area placeholder as a content edit. A future model requires
separate approval and evidence for its identity, geographic anchor, and size.

1. Keep route and entrance facts in the walking graph; the visual model is
   never evidence of a usable path.
2. Supply reviewed scene data to the retained
   `MapLibreGeoreferencedBuildingLayer` only through `createMapAdapter.ts`.
3. Add layer lifecycle tests, measure bundle and device performance, and check
   both 2D and 3D in a real browser.

When replacing the procedural block with GLB assets, add a separately approved
asset-loading and performance step. Do not place a raw photogrammetry mesh in
the browser application without simplification, compression, and device tests.
Do not trace or digitize Google Maps content into project-owned geographic data
or 3D assets. Google Maps may help identify a question that needs checking, but
the correction must be independently confirmed through an authorized campus
source, an open-license source, or the project's own field survey before it is
recorded as verified data.

### Replace MapLibre in the future

1. Leave domain and navigation files unchanged.
2. Create another infrastructure implementation of `MapAdapter`.
3. Change `createMapAdapter.ts` to construct the new implementation.
4. Add focused tests for its lifecycle and content translation.
5. Remove MapLibre packages and Vite exceptions only after no imports remain.

If replacement requires changing many navigation components, the abstraction
has leaked. A leak means provider-specific knowledge escaped beyond its intended
boundary and should be moved back behind the contract.

## Troubleshooting guide

### Nothing appears in the browser

1. Read the URL printed by `npm run dev`; Vite may choose port 5174 if 5173 is
   occupied.
2. Check `index.html` for the `root` element and `src/main.tsx` script.
3. Check the browser console for an exception.
4. Confirm `main.tsx` found the root and rendered `App`.
5. Run `npm run typecheck` and `npm run build`.

### The map is blank or invisible

1. Inspect `.map-view`, `.map-canvas`, and `.maplibregl-canvas` in browser
   developer tools. Their computed width and height must be greater than zero.
2. Confirm MapLibre CSS is imported before application CSS in `main.tsx`.
3. Confirm `styles.css` targets `.map-view > .map-canvas`.
4. Check the console for worker or WebGL errors. WebGL is the browser graphics
   technology MapLibre uses to draw the map.
5. Check the Network panel for failed style, tile, or worker requests.
6. Confirm `setWorkerUrl` and the `?worker&url` import remain in
   `MapLibreMapAdapter.ts`.
7. Confirm `vite.config.ts` still excludes `maplibre-gl` from dependency
   optimization unless a tested upgrade makes the exception unnecessary.

The September 2026 invisible-map failure was caused by a zero-height map host:
MapLibre vendor CSS overrode application positioning. A second usability issue
came from a demonstration style that showed little street detail at campus zoom.

### A route preview is cut off at the edge

1. Confirm that the chosen place IDs in
   `collegeOfIdahoWalkingGraphData.ts` resolve to the expected imported source
   points and the first/last route coordinates match them.
2. Check whether the route itself extends outside the configured
   `collegeOfIdahoCampus.bounds`. The map's maximum pan boundary can also
   force a minimum zoom; this matters most on a tall, narrow map panel.
3. Check `MapLibreMapAdapter.syncContent`: it sends the entire route's
   coordinate bounds to `fitBounds` with padding. A centered route with clipped
   endpoints can indicate a camera constraint rather than missing geometry.
4. Verify on both a desktop and a phone-sized browser before widening bounds.
   Keep the view campus-local and do not alter route coordinates merely to
   compensate for a camera problem.
5. If clipping appears only after resizing, confirm the adapter's `resize`
   event re-fits the current preview rather than requiring a second click on
   **Preview route**.

### The 3D button tilts the map but no building appears

This is expected after Step 25: the inaccurate calibration block was removed.
`createMapAdapter.ts` does not supply a building layer. The retained generic
Three.js layer is dormant until a reviewed 3D-model step is approved. A blank
map or missing route is a separate map problem; use the sections above.

### The map appears but streets do not

1. Open the Network panel and filter for `tile.openstreetmap.org`.
2. Confirm tile requests succeed and internet access is available.
3. Check `defaultMapStyle` in `createMapAdapter.ts`.
4. If `VITE_MAP_STYLE_URL` is set, confirm it returns a valid MapLibre style.
5. Remember that the former demonstration style could appear mostly solid at
   high zoom even though rendering technically worked.

### Points appear but no route line appears

1. Confirm **Preview route** was pressed.
2. Confirm the route summary appears.
3. Confirm both selected location IDs exist as nodes in
   `collegeOfIdahoWalkingGraph.ts`.
4. Confirm connected edges lead between the selected nodes.
5. Confirm the graph route has at least two coordinates after conversion.
6. If the summary appears but the line does not, inspect `syncContent()` in
   `MapLibreMapAdapter.ts` and browser console errors.

### Search does not show a location

1. Confirm the location exists in `mockLocations.ts`.
2. Confirm it was created through `createLocation`.
3. Check that the label contains the typed text; matching is a case-insensitive
   substring search.
4. Inspect `filterLocationSearchResults` in `routePlanner.ts` if deliberately
   changing filtering rules.

### A quality command fails

- Formatting: run `npm run format`, review, then rerun `npm run format:check`.
- Linting: read the rule and location printed by `npm run lint`.
- Type checking: compare the supplied value with the interface in the error.
- Tests: read the first failed expectation and decide whether code or expected
  behavior intentionally changed.
- Build: resolve TypeScript errors first, then Vite bundling errors.

## Architectural decision log

Each decision has a stable number. “Accepted” means it is the current project
rule. A later decision may supersede an older one; keep the old entry for
historical context.

### ADR-001: React, TypeScript, and Vite foundation

- **Status:** Accepted
- **Decision:** Use React for interface composition, strict TypeScript for data
  contracts, and Vite for development and production bundling.
- **Reason:** This supports a small interactive app with fast local feedback and
  explicit compile-time checks.
- **Consequence:** Contributors need Node and npm, and browser code must satisfy
  strict rules before production builds pass.

### ADR-002: Organize by feature and responsibility

- **Status:** Accepted
- **Decision:** Separate app assembly, domain meaning, data, features,
  infrastructure, composition, and tests.
- **Reason:** A growing map project can otherwise concentrate routing, UI, and
  provider code in a few oversized files.
- **Consequence:** There are more small folders, but each has a predictable job.

### ADR-003: Keep navigation models provider-independent

- **Status:** Accepted
- **Decision:** `Location`, `Route`, `Coordinates`, and `MapMode` do not contain
  MapLibre types.
- **Reason:** Locations and routes are business concepts, not MapLibre concepts.
- **Consequence:** The adapter translates domain objects into GeoJSON, while
  future providers and routing services can reuse the domain.

### ADR-004: Validate and freeze local data

- **Status:** Accepted
- **Decision:** Create domain objects through validating factory functions.
- **Reason:** Problems should be rejected when data enters the system instead of
  producing confusing map failures later.
- **Consequence:** Invalid data stops startup clearly. Future external data needs
  a similarly explicit validation step.

### ADR-005: Isolate map providers behind `MapAdapter`

- **Status:** Accepted
- **Decision:** React map components depend on a contract; MapLibre lives in
  infrastructure and is selected in composition.
- **Reason:** Provider lifecycle and commands change independently from UI.
- **Consequence:** A translation layer exists, but provider replacement and
  focused tests become practical.

### ADR-006: Store navigation state in one hook

- **Status:** Accepted
- **Decision:** `useRoutePlanner` owns queries, selections, suggestions, and the
  route, and `App` shares that one instance with its children.
- **Reason:** The panel and map must agree about selected locations and route.
- **Consequence:** Components remain small, while the hook is the first place to
  inspect state-transition bugs.

### ADR-007: Lazy-load the map feature

- **Status:** Accepted
- **Decision:** `App.tsx` uses a dynamic import for `MapView`.
- **Reason:** MapLibre is much larger than the route-planning interface.
- **Consequence:** The map has a short loading boundary, and basic application
  tests substitute a lightweight map component.

### ADR-008: Configure the MapLibre worker explicitly for Vite

- **Status:** Accepted
- **Decision:** Import the worker with `?worker&url`, call `setWorkerUrl`, and
  exclude `maplibre-gl` from Vite dependency optimization.
- **Reason:** The default worker path became stale in Vite’s dependency cache.
- **Consequence:** Worker configuration is explicit. Revisit it when upgrading
  MapLibre or Vite.

### ADR-009: Load vendor map CSS before application overrides

- **Status:** Accepted
- **Decision:** Import MapLibre CSS before `styles.css`, and use a specific
  full-size rule for `.map-view > .map-canvas`.
- **Reason:** MapLibre CSS overrode host positioning, collapsed its height to
  zero, and made a correctly created canvas invisible.
- **Consequence:** Stylesheet order is architectural. Reorganization must
  preserve the map host’s computed size.

### ADR-010: Use OpenStreetMap raster tiles for the prototype basemap

- **Status:** Accepted for prototype use
- **Decision:** Define an inline OpenStreetMap raster style while allowing
  `VITE_MAP_STYLE_URL` to inject another hosted style.
- **Reason:** The former demo style showed little recognizable detail at campus
  zoom. The raster pattern works without a provider token.
- **Consequence:** The prototype depends on network access and OpenStreetMap tile
  availability and policy. Production should use a provider suited to its
  expected traffic.

### ADR-011: Model route outcomes and map lifecycle explicitly

- **Status:** Accepted
- **Decision:** Represent empty, invalid-location, unavailable-route, and
  route-ready states in navigation logic, and expose map ready/error callbacks
  through the map adapter contract.
- **Reason:** The application should tell people why a route or map is absent
  rather than relying on a blank area, disabled control, or hidden technical
  failure.
- **Consequence:** UI components can present clear accessible messages without
  knowing route lookup or MapLibre internals. New route providers must map their
  outcomes into the same user-facing states.

### ADR-012: Use an adapter-level map recovery state

- **Status:** Accepted
- **Decision:** Display a retryable map error state driven by adapter callbacks
  instead of adding a generic React error boundary for MapLibre failures.
- **Reason:** MapLibre problems usually occur asynchronously after React has
  already rendered, while error boundaries primarily catch rendering errors.
- **Consequence:** The map reports provider failures with useful recovery. A
  separate error boundary remains appropriate if a future React component has
  render-time failure risk.

### ADR-013: Keep the prototype geographically focused on The College of Idaho

- **Status:** Accepted
- **Decision:** Store the campus opening view and panning boundary in a
  dedicated data module, and use College of Idaho landmark names in the mock
  data.
- **Reason:** A campus wayfinding prototype should present a meaningful local
  context without coupling that policy to the map provider or interface.
- **Consequence:** Replacing the prototype area later requires a data/configuration
  change first. Official route verification remains a separate future task.

### ADR-014: Retain the current lazy-loaded map bundle

- **Status:** Accepted for the prototype
- **Decision:** Keep the existing MapView lazy-loading boundary and do not add
  more chunks after inspecting the production build.
- **Reason:** The large MapLibre dependency is already deferred until the map
  is needed; extra splitting has no demonstrated benefit yet.
- **Consequence:** Reassess after adding more routes, map layers, or an
  authenticated data provider, when bundle measurements may materially change.

### ADR-015: Keep pathfinding in the domain layer until data is verified

- **Status:** Superseded by ADR-016
- **Decision:** Add a provider-independent walking graph and shortest-path
  function before connecting it to React, MapLibre, or the existing preview UI.
- **Reason:** Route calculation should be testable independently, and the
  current campus topology is illustrative rather than verified.
- **Consequence:** The independent foundation made later UI integration smaller
  and safer. Verified source data and rules for accessibility, closures, and
  directionality remain required.

### ADR-016: Transform calculated paths into the existing route contract

- **Status:** Accepted for the prototype
- **Decision:** Convert `WalkingPath` data to the established `Route` shape in
  a domain module, then supply it through the existing route-planner state.
- **Reason:** The map already renders `Route` records, so reusing that contract
  avoids coupling map-provider code to the graph or duplicating rendering logic.
- **Consequence:** The visible prototype now uses calculated routes. Its walking
  speed and graph data are still illustrative and must be replaced or verified
  before production use.

### ADR-017: Represent path restrictions as graph-edge data

- **Status:** Accepted for the prototype
- **Decision:** Add validated direction, availability, and accessibility-status
  fields to each walking edge. Use availability and direction in pathfinding;
  retain accessibility status until a user-selected routing preference exists.
- **Reason:** Closures and one-way paths are routing facts, not UI details. The
  project must not imply accessibility knowledge that it has not verified.
- **Consequence:** Future verified data can safely restrict a calculated route.
  Adding accessible-route selection will require an explicit product decision,
  user interface, and tests.

### ADR-018: Require provenance before declaring route data verified

- **Status:** Accepted for the prototype
- **Decision:** Package walking graphs with a validated release record that
  contains a source description, review date, verification status, and a named
  verifier when verified.
- **Reason:** A route can be technically valid while its real-world path data is
  unreviewed. The application needs a clear distinction between illustrative
  prototype data and information approved by a responsible source.
- **Consequence:** Replacing illustrative data now has a documented checklist
  and a validation boundary. The project can remain honest about data quality
  without blocking prototype development.

### ADR-019: Separate public corroboration from operational route verification

- **Status:** Accepted for the prototype
- **Decision:** Use official and independent public maps to improve only facts
  they plainly support, while retaining the `illustrative` release status until
  an authorized campus reviewer confirms operational route data.
- **Reason:** Public map labels and a building coordinate are useful evidence,
  but they do not establish that a particular walking line is usable, current,
  accessible, or approved. Treating them as full routing verification would
  create a misleading safety claim.
- **Consequence:** The visible prototype can become more accurate in small,
  traceable ways now. Each route edge still requires its own authoritative
  review before release data can be marked verified.

### ADR-020: Keep replaceable graph records separate from their validated loader

- **Status:** Accepted for the prototype
- **Decision:** Store editable College of Idaho location and graph records in a
  dedicated dataset module, then construct the runtime release through the
  existing domain factories in a small loader module.
- **Reason:** A future verified source should be able to replace graph data in
  one place without learning the route planner, React state, or MapLibre. The
  existing factories already enforce the data rules, so a second import
  framework would add cost without present benefit.
- **Consequence:** Future data changes are localized and fail early when they
  violate a contract. A different file format or remote provider can later be
  translated into this same dataset shape without changing application behavior.

### ADR-021: Own campus 3D content while retaining MapLibre as renderer

- **Status:** Accepted as a future integration; the Step 13 calibration scene
  was removed in Step 25, and the layer is currently dormant.
- **Decision:** Keep MapLibre for geographic projection, camera behavior, map
  interaction, and overlays; render project-owned 3D campus content through an
  isolated Three.js custom layer that shares MapLibre's WebGL context.
- **Reason:** The project can own its geographic data, route calculation, and
  visual assets without recreating mature map projection, touch interaction,
  camera, and 2D-map behavior. The existing adapter already provides a safe
  integration boundary.
- **Consequence:** Activating Three.js adds a deferred bundle cost and requires
  explicit shared-context state management and resource disposal. The current
  build does not bundle the unattached layer. Visual models
  remain separate from authoritative entrances and walking-graph data. A later
  asset pipeline must optimize and benchmark every realistic model.

### ADR-022: Use one-shot GPS checkpoints for navigation

- **Status:** Accepted; domain foundation implemented, browser integration pending
- **Decision:** Request browser location when navigation starts and when the
  person presses a future Next Turn control. Evaluate the reported position and
  accuracy as confirmed, uncertain, or mismatched before advancing.
- **Reason:** This reduces continuous location collection and battery use while
  still checking progress at important route points.
- **Consequence:** Detailed geometry, route steps, a `LocationProvider` contract,
  accuracy-aware verification, and navigation-session state now exist. A browser
  provider, interface, permission/recovery behavior, and campus field testing
  are still required. Poor-accuracy readings remain uncertain rather than being
  treated as proof that the person is in the wrong place.

### ADR-023: Use current documentation through Context7 with official fallback

- **Status:** Accepted for development workflow
- **Decision:** Configure Context7 as a project-scoped MCP server and instruct
  coding agents to use it for current third-party library/API documentation when
  available, falling back to official primary documentation.
- **Reason:** Mapping and 3D library APIs change, while a committed server URL
  gives future sessions a consistent way to retrieve current documentation.
- **Consequence:** Context7 is a development dependency rather than a website
  runtime dependency. The repository stores no API key, and work must continue
  from official documentation if the remote service is unavailable.

### ADR-024: Derive route steps from graph-edge geometry

- **Status:** Accepted and implemented
- **Decision:** Store ordered geometry on validated walking edges, orient the
  selected geometry in travel direction, derive maneuvers from geographic
  bearings, and place a typed checkpoint at every route-step endpoint.
- **Reason:** Route calculation, the visible path, and future checkpoint
  navigation need one provider-independent source of truth. Deriving flattened
  map geometry from validated steps prevents parallel route representations from
  drifting apart.
- **Consequence:** Verified campus replacement data must include path shapes as
  well as connectivity. Generic instructions are deterministic but will need
  reviewed path or landmark names before they become polished campus directions.
  GPS verification and step advancement remain separate domain modules.

### ADR-025: Use conservative accuracy-aware checkpoint verification

- **Status:** Accepted and implemented as a prototype policy
- **Decision:** Model reported GPS accuracy as an uncertainty circle. Confirm a
  checkpoint only when that circle is fully inside the allowed radius, report a
  mismatch only when it is fully outside, and report uncertainty when it
  overlaps or the reading is not fresh.
- **Reason:** A phone's reported coordinate is an estimate. Comparing only its
  center to a radius would create false confirmation or false wrong-location
  warnings when reported accuracy is poor.
- **Consequence:** The current 20-meter radius and 30-second freshness limit are
  provisional and require field testing. The session advances only on confirmed
  results, stores no raw reading coordinates, and requires an explicit action
  for every verification. Browser permissions and UI recovery remain separate.

### ADR-026: Connect one-shot location through an injected browser boundary

- **Status:** Accepted and implemented in Step 16.
- **Context:** Step 15's provider-neutral session needs real browser interaction
  without coupling geographic rules to permissions or React.
- **Decision:** Construct a browser provider in composition, inject it into the
  navigation feature, and let a dedicated hook coordinate explicit user requests.
  Reset navigation with each route preview and ignore late results after removal.
- **Reason:** Domain tests remain deterministic, browser failure behavior is
  isolated, and changing providers does not require changing route calculations.
- **Consequences:** No continuous tracking, raw-coordinate persistence, new
  dependency, automatic rerouting, or new claim of campus-data verification.
  Browser permission prompts cannot be canceled by this API. Real-device field
  validation remains necessary before relying on these directions.

### ADR-027: Default to explicit checkpoint simulation until field testing

- **Status:** Accepted and implemented in Step 17.
- **Context:** The project owner needs to test the complete navigation interface
  from one campus location before physically visiting every checkpoint.
- **Decision:** Default composition to a visibly labeled simulator that returns
  the current expected checkpoint. Use `VITE_LOCATION_MODE=browser` as the only
  normal switch to physical one-shot location.
- **Reason:** This exercises the real UI, verification, and session transitions
  without movement or location permission, while keeping provider replacement
  centralized and reversible.
- **Consequences:** Demo completion cannot validate GPS, paths, distances, or
  safety. Field mode must be explicitly enabled and visibly confirmed later.

### ADR-028: Project navigation progress into map presentation

- **Status:** Accepted and implemented in Step 18.
- **Context:** The map must distinguish previous/current/future legs and follow
  turns without moving checkpoint decisions into provider-specific code.
- **Decision:** Keep immutable session transitions in the domain, share the
  session at App composition, and let the MapLibre adapter project each route
  step into styled GeoJSON plus a bearing-aware camera.
- **Reason:** Text instructions and the map remain synchronized while routing,
  verification, React, and MapLibre retain separate responsibilities.
- **Consequences:** Camera and colors can change independently of navigation
  rules. Public footway alignment remains replaceable illustrative data; the
  temporary origin connector must be reviewed or replaced during field work.

### ADR-029: Keep prototype outcome controls separate from location verification

- **Status:** Accepted and implemented in Step 19.
- **Context:** Seated development needs to display every checkpoint recovery
  state, but a default simulator that always succeeds cannot demonstrate them.
- **Decision:** Add an optional prototype-only scenario controller implemented
  solely by `PrototypeLocationProvider`. Keep selection in the UI, reset the
  simulation after a choice, and pass generated readings through the unchanged
  one-shot provider and domain-verification flow. Step 20 performs this reset
  in the navigation hook so the selector keeps keyboard focus.
- **Reason:** Test cases are visible and repeatable without inserting test-only
  branches into GPS policy, navigation-session rules, or the browser provider.
- **Consequences:** The physical browser mode cannot synthesize outcomes, and
  each scenario reset intentionally starts a new simulated journey. The five
  outcomes are prototype testing tools, not claims about real GPS behavior.

### ADR-030: Keep written turn guidance visible while the map updates

- **Status:** Accepted and implemented in Step 20.
- **Context:** On a phone, automatically scrolling to the map after every
  session update hid the new turn instruction and controls.
- **Decision:** Update map content on every relevant route/session change, but
  scroll to the map only when a newly previewed route appears. Respect reduced
  motion when scrolling.
- **Reason:** The camera and colored legs remain current without displacing the
  instruction needed for the next user action.
- **Consequences:** Preview still reveals the map; progressing or going Back
  keeps the text controls in view. Narrow-width layout and focus behavior are
  separately verified in browser and component checks.

### ADR-031: Make observed 2D path geometry the current routing source

- **Status:** Accepted and implemented in Step 23 for the limited prototype
  network, pending field review.
- **Context:** The original hand-drawn legs diverged from the user-observed
  pedestrian ways. Simplot has two main entrances serving different purposes.
- **Decision:** Store ordered OSM-export pedestrian-way coordinates and the
  user's entrance interpretation in the existing graph data file. Begin in 2D,
  retain 3D as an experimental view, and defer widths, heights, slopes, and
  accessibility claims. Mark unmatched entrance and origin links illustrative.
- **Reason:** Routing, step instructions, and the map now share the same small,
  reviewable walking network without introducing an OSM runtime dependency.
- **Consequences:** The visible line is better grounded in firsthand-edited
  map data, but is not yet a certified walking or accessible route. Later OSM
  exports and on-site corrections can replace coordinates in one file. The
  map's camera boundary must allow the widest current route to fit on narrow
  desktop map panels.

### ADR-032: Generate the 2D graph from a reviewed OSM snapshot

- **Status:** Source-import boundary remains accepted; the 12% routing policy
  was superseded by ADR-033 in Step 25.
- **Decision:** Keep the user-supplied XML outside the runtime. Import its main
  connected walking component into committed JSON with a small standard-library
  script. Curate searchable entrances separately and validate their OSM IDs at
  graph construction. Prefer formal ways with a modest 12% informal-way cost
  penalty, while reporting physical distance.
- **Reason:** Re-entering hundreds of points by hand is hard to audit and easy
  to misalign. Source IDs and a digest make later corrections traceable. A
  small preference meets the request for generally formal but short routes.
- **Consequence:** New exports must be reviewed, regenerated, tested, and
  visually checked as a unit. An apparent link or mapped entrance is not proof
  of actual access. The entire route release remains illustrative.

### ADR-033: Prefer formal walking paths before informal shortcuts

- **Status:** Accepted for the Step 25 prototype.
- **Decision:** Compare paths first by their total informal distance. Among
  paths with equal informal distance, minimize adjusted distance: described
  main footways count at 90% of their physical length for selection; other
  formal ways and connectors count at full length. Display actual physical
  distance to the user.
- **Reason:** The user asked that formal walkways always beat informal paths
  when both are available, including library-to-cafeteria directions, and
  asked for a further main-footway preference. Keeping the score separate from
  displayed distance prevents misleading route summaries.
- **Consequence:** A formal route may be physically longer than an informal
  shortcut. This priority is not a safety or accessibility certification;
  on-site corrections remain necessary.

### ADR-034: Separate known entrances from illustrative outline approaches

- **Status:** Accepted for the Step 25 prototype.
- **Decision:** Curate described entrance IDs explicitly for Anderson, Simplot,
  JAAC activities, and the swimming pool. For named buildings or parking
  areas without a mapped entrance, choose the outline vertex closest to the
  connected walking network and label the link illustrative. Remove the
  invented Campus Entrance. Keep the 3D calibration scene removed while
  retaining its generic integration boundary for later reviewed assets.
- **Reason:** A large searchable campus catalogue is useful now, but an
  outline is not a door and a visual block is not an accurate building. The
  available descriptions should be used precisely without claiming more than
  they prove.
- **Consequence:** The catalogue is broader, but some destinations are only
  provisional approach points. They require user review or source correction
  before physical navigation. 3D remains camera tilt without buildings.

### ADR-035: Combine only nearby successive turns

- **Status:** Accepted for prototype guidance in Step 25.
- **Decision:** Merge two turn legs only when the first is at most 12 m long.
  State both maneuvers and their separation in one instruction, with a single
  checkpoint after the combined leg.
- **Reason:** Every short OSM segment should not force an extra Next click,
  yet far-apart turns must remain independently checkable.
- **Consequence:** The full route geometry remains unchanged; only guidance
  and checkpoint grouping change. The 12 m rule is a prototype threshold for
  later field evaluation.

### ADR-036: Keep the stadium drive separate from walking navigation

- **Status:** Accepted as a limited prototype handoff in Step 26.
- **Decision:** For Simplot Stadium only, show mapped road geometry from the
  nearer of two candidate campus driveway exits by straight-line distance
  to a west-side stadium parking approach. Use a distinct planner state and
  dashed map layer; do not create a walking route, car checkpoint session,
  or claim a route from the selected starting place.
- **Reason:** The imported walking graph cannot validate car travel. A small
  visual handoff serves the request now without falsely presenting pedestrian
  paths or GPS checks as safe driving guidance.
- **Consequence:** The selected driveway is tagged private and may not be
  permitted. Road turns, venue entrance, and parking access need user review.
  Full driving navigation would require its own reviewed road graph and tests.

### ADR-037: Open with an explicit destination choice and 3D camera

- **Status:** Accepted as presentation behavior in Step 26.
- **Decision:** Start with empty route fields and a tilted 3D MapLibre camera
  centered on the library entrance, facing roughly toward Sterry Hall. Keep
  the 2D toggle and do not infer 3D building geometry. Use provisional purple
  `#412D5E` for the surrounding page until a current institutional style
  guide is supplied.
- **Reason:** The user wants the map immediately visible in its preferred
  orientation, without preselecting a route, and wants a campus-purple page.
- **Consequence:** Tests and documentation must no longer assume a prefilled
  library-to-cafeteria preview or a 2D initial map. Purple's exact brand status
  remains unverified.

### ADR-038: Prefer a mapped court gate over a guessed outline corner

- **Status:** Accepted for the prototype in Step 27.
- **Decision:** When a curated sports destination identifies an OSM main
  entrance on its own outline, use that node as the destination. Reject an
  entrance absent from the outline or not tagged main. Other court outlines
  continue to use a provisional nearest-outline point.
- **Reason:** The mapped gate is better evidence of where to approach the
  court than an automatically selected polygon corner. This small optional
  reference does not require a separate court-routing system.
- **Consequence:** Beach Volleyball Court 2 now points to its tagged gate.
  The connecting line, gate availability, court numbers, and the other seven
  court approaches remain unverified until field review.

## Engineering principles in plain language

### Single responsibility

Each module has one main reason to change. `mockLocations.ts` changes when
sample places change; `styles.css` changes when presentation changes;
`MapLibreMapAdapter.ts` changes when MapLibre behavior changes.

### Open/closed design

Important boundaries allow a new implementation without rewriting unrelated
code. `MapAdapter` lets the provider be extended or replaced while navigation
components remain closed to provider-specific edits.

### Dependency inversion

High-level product code depends on a small capability description, not a large
external library. `MapView` depends on `MapAdapter`; composition supplies
MapLibre. This is the “D” in SOLID, a group of maintainability principles.

### Composition over forced inheritance

React components combine smaller functions and hooks. A class is used for the
stateful MapLibre adapter because it retains and cleans up one map instance. The
project does not force class inheritance into UI code where functions are clearer.

### Explicit failure

Invalid data throws `NavigationValidationError`, missing required mock locations
throw a clear error, and adapter methods reject use before initialization. Clear
failures are easier to diagnose than silent corruption.

### Minimal useful abstraction

An abstraction is a simplified boundary hiding unnecessary detail. The project
creates one where a real boundary exists, such as the map provider, and avoids
speculative frameworks for features that have not been approved.

## Glossary

| Term                  | Plain-language meaning                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Adapter               | A translator that makes one system fit the interface expected by another.                                         |
| Accuracy area         | The area around a reported location where the device indicates the real position may be.                          |
| API                   | A defined way for one piece of software to communicate with another.                                              |
| Basemap               | The background geographic map beneath custom markers and route lines.                                             |
| Bearing               | A compass direction measured in degrees and calculated between two geographic points.                             |
| Build                 | Turning source files into optimized files suitable for hosting.                                                   |
| Bundle                | Browser-ready files assembled from source and dependencies.                                                       |
| Component             | A reusable visible part of a React interface.                                                                     |
| Checkpoint            | The expected geographic endpoint of a route step, later usable for progress verification.                         |
| Corroborated fact     | A limited fact checked beyond the project's own mock record; it is not automatically an approved instruction.     |
| Contract or interface | A checked description of operations or data another module must provide.                                          |
| Data minimization     | Keeping only the information needed for a feature and discarding unnecessary sensitive detail.                    |
| Dependency            | Code, data, or a service that another part requires.                                                              |
| Domain                | The business meaning of the application, such as locations and routes.                                            |
| Georeferencing        | Attaching data or a 3D object to a real location on Earth.                                                        |
| GeoJSON               | A standard JSON format for geographic points, lines, and areas.                                                   |
| GLB                   | A compact binary file containing a web-ready 3D model and related data.                                           |
| Haversine formula     | A calculation for approximate distance between two latitude/longitude points on Earth.                            |
| Hook                  | A React function that manages reusable state or lifecycle behavior.                                               |
| Infrastructure        | Code communicating with an external technical system or provider.                                                 |
| Lazy loading          | Delaying download or initialization until a feature is needed.                                                    |
| Matrix                | A mathematical structure used to combine 3D position, rotation, scale, and camera projection.                     |
| Maneuver              | The action beginning a walking leg, such as depart, continue, turn left, or turn right.                           |
| MCP                   | Model Context Protocol, a standard connection between an AI tool and an information or action service.            |
| Mock data             | Local sample information used before or instead of a live backend.                                                |
| Procedural model      | 3D geometry created by code instead of loaded from a model file.                                                  |
| Provider              | A library or service supplying a capability, such as map rendering or tiles.                                      |
| Raster tile           | A small map image combined with neighboring images to form a map.                                                 |
| State                 | Information that can change while the application is being used.                                                  |
| State machine         | A model that permits only defined transitions between named states.                                               |
| Three.js              | A browser 3D library retained behind a dormant map layer for future reviewed models; not used by the current map. |
| TypeScript            | JavaScript with compile-time checks for expected data shapes.                                                     |
| WGS84                 | The world latitude-and-longitude coordinate reference used by GPS.                                                |
| WebGL                 | Browser graphics technology used by MapLibre and Three.js for GPU drawing.                                        |
| WebGL context         | The browser-managed connection to graphics state and resources on a device's GPU.                                 |
| Web worker            | A separate browser execution context that avoids blocking the interface.                                          |

## How to maintain this handbook

Update this file in the same commit when a change:

- adds, removes, renames, or significantly repurposes a file or folder;
- changes data flow between major parts of the system;
- introduces or replaces an external provider;
- creates an important configuration or environment setting;
- fixes a failure whose cause would help a future maintainer;
- accepts, supersedes, or reverses an architectural decision;
- changes a safe recipe or troubleshooting procedure.

Do not rewrite the entire handbook for each step. Update the smallest sections
that became inaccurate, add a decision when its reason matters, and keep the
table of contents useful. Source code remains the final authority for current
behavior, so documentation and implementation should be reviewed together.
