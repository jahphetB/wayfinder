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
a tilted 3D perspective with project-owned calibration geometry.

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

The current version is focused on The College of Idaho in Caldwell, Idaho. It
uses three campus-named sample locations and a small walking graph. The location
and graph data live inside the project, so no routing server is required.
Searching filters those known locations. Pressing **Preview route** calculates a
shortest graph path, converts it to a route, and sends it to the map. The
locations, route lines, and
campus boundary are illustrative prototype data: they are not official walking,
accessibility, or emergency directions.

The College of Idaho walking graph and shortest-path calculation are now
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
so it is not presented as a current destination. This is intentionally a
narrow claim: no public source reviewed in Steps 11 or 12 proves the exact
walking edges, their distances, temporary closures, travel directions, or
accessibility. Those routing facts remain illustrative until an authorized
campus reviewer checks them.

MapLibre GL JS draws the interactive map. MapLibre is a rendering engine: it
turns map data into the pixels, labels, markers, and lines seen in the browser.
OpenStreetMap raster tiles provide the current street background. A raster tile
is a small map image; many tiles are placed together to form the visible map.

The 3D mode now combines MapLibre with an isolated Three.js custom layer.
Three.js is a browser 3D rendering library. The layer currently draws one gold
calibration building at a real campus coordinate. The shape, dimensions,
heading, and identity are illustrative; it exists to prove geographic anchoring
and cleanup before the project invests in real building assets. Two-dimensional
mode hides this geometry while preserving the route and map state.

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
8. `walkingRoutes.ts` asks `pathfinding.ts` for the shortest path, then asks
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
14. In 3D mode, `MapLibreGeoreferencedBuildingLayer.ts` reads MapLibre's current
    projection matrix and uses Three.js to draw the calibration building at its
    geographic anchor. In 2D mode, the adapter hides that building layer.

Keeping this path explicit is important for debugging. If suggestions are
wrong, inspect navigation data and model logic. If the route summary is right
but the map line is wrong, inspect the map adapter. If neither appears, inspect
the shared state in the hook and `App.tsx`.

## Project folder map

```text
YoteWayfinder/
├── .codex/                       Project-scoped agent integrations
├── docs/                         Human-readable project records
├── public/                       Static browser assets; currently empty
├── src/                          Application source code
│   ├── app/                      Screen assembly and global presentation
│   ├── composition/              Chooses concrete service implementations
│   ├── data/map/                 Owned 3D scene descriptions
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

| File                           | Importance and relationship to other files                                                                                                                                                                                  |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/ARCHITECTURE.md`         | This living handbook. It explains folders, files, data flow, change recipes, failure diagnosis, principles, and architectural decisions. Update it whenever a change alters boundaries or introduces an important new file. |
| `docs/ARCHITECTURE_DIAGRAM.md` | The comprehensive Mermaid dependency and data-flow diagram. It distinguishes implemented components from approved future components and must change with major architecture boundaries.                                     |
| `docs/PROGRESS.md`             | A chronological record of completed project steps and verified fixes. It answers “what has been accomplished?” while this handbook answers “how is it organized and why?”                                                   |
| `docs/AI_SKILLS.md`            | A branded inventory of AI capabilities, external technologies, and project-specific practices used during development. It makes AI-assisted work visible and auditable.                                                     |

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
| `src/vite-env.d.ts` | Teaches TypeScript about Vite and the optional `VITE_MAP_STYLE_URL` environment setting. Add future `VITE_...` settings here so their names and types are checked.                                           |

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

| File                                  | Importance and relationship to other files                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/composition/createMapAdapter.ts` | Creates the concrete MapLibre adapter, its style, and the georeferenced Three.js building layer. By default it defines an OpenStreetMap raster basemap; `VITE_MAP_STYLE_URL` can replace that style without changing `MapView`. This is the dependency-injection boundary. Dependency injection means supplying a needed implementation from outside instead of constructing it throughout the application. |

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

| File                                          | Importance and relationship to other files                                                                                                                                                                                                                                                                                         |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/domain/navigation/types.ts`              | Defines shared meanings for locations, rendered routes, walking-graph nodes, edges, paths, restrictions, provenance, and releases. These provider-independent shapes are imported by data, navigation, and map code so every area agrees on the same meaning.                                                                      |
| `src/domain/navigation/factories.ts`          | Creates validated, immutable domain objects. It rejects impossible coordinates, empty identifiers, same-endpoint routes, incomplete geometry, invalid graph edges, unknown restriction values, invalid review dates, and unsubstantiated verified releases. Immutable means callers cannot accidentally alter accepted data later. |
| `src/domain/navigation/factories.test.ts`     | Proves important validation rules: coordinates are frozen, latitude ranges are enforced, routes cannot start and end at the same place, and graph edges cannot point to unknown nodes.                                                                                                                                             |
| `src/domain/navigation/pathfinding.ts`        | Contains the pure shortest-path calculation. It reads a `WalkingGraph`, skips closed edges, respects forward-only edges, and returns a `WalkingPath` without importing React, MapLibre, or mock-data files.                                                                                                                        |
| `src/domain/navigation/pathfinding.test.ts`   | Proves the algorithm chooses the shorter allowed path, supports permitted reverse travel, rejects forbidden reverse travel, avoids closures, and safely reports no path for unknown or unreachable nodes.                                                                                                                          |
| `src/domain/navigation/routeSteps.ts`         | Converts selected graph edges into travel-oriented geometry, classifies maneuvers from geographic bearings, writes short instructions, and places a turn or destination checkpoint at each step endpoint. It remains independent from React, MapLibre, and browser geolocation.                                                    |
| `src/domain/navigation/routeSteps.test.ts`    | Proves left and right turns, checkpoint order, instructions, and reverse travel through bidirectional geometry.                                                                                                                                                                                                                    |
| `src/domain/navigation/walkingRoutes.ts`      | Coordinates shortest-path selection, route-step creation, validation, and the prototype walking-duration estimate.                                                                                                                                                                                                                 |
| `src/domain/navigation/walkingRoutes.test.ts` | Proves path-to-route conversion preserves ordered detailed geometry, distance, duration, checkpoints, and unavailable-route behavior.                                                                                                                                                                                              |

## The `src/data` folder

The data folder supplies records used by the application. Today these are local
mock records, meaning realistic sample information stored in source code instead
of retrieved from a server. This makes the prototype reliable while the real
data source is still undecided.

The files construct records through domain factories. Sample data therefore
cannot quietly bypass the rules expected from future live data. When an API
replaces these files, its responses should be translated and validated at a
similar boundary.

### `src/data/map`

This subfolder describes project-owned visual scene content separately from
walking directions. The distinction is important: a building model can look
correct while an entrance or path remains unverified. Visual geometry must
never silently become routing authority.

| File                                  | Importance and relationship to other files                                                                                                                                                                                                               |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/data/map/collegeOfIdahoScene.ts` | Defines the current procedural calibration building and its geographic anchor. `createMapAdapter.ts` supplies it to the Three.js layer. Its explicit `illustrative` status prevents the spike from being mistaken for a measured campus-building record. |

### `src/data/navigation`

This subfolder is the safest place for many current content changes. A person
can add a location or route without editing React components or MapLibre code,
provided identifiers and coordinates remain consistent.

| File                                                     | Importance and relationship to other files                                                                                                                                                                                                                                           |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/data/navigation/collegeOfIdahoCampus.ts`            | Defines the campus name, address, initial map viewpoint, and panning boundary. `MapView.tsx` reads this file and passes it through the provider-neutral map contract. Its values deliberately remain separate from individual locations and routes.                                  |
| `src/data/navigation/collegeOfIdahoCampus.test.ts`       | Checks that the configured initial map center stays inside the configured campus boundary. It protects a simple but important data assumption.                                                                                                                                       |
| `src/data/navigation/collegeOfIdahoWalkingGraphData.ts`  | The one editable campus dataset. It keeps searchable labels, nodes, edges, detailed edge geometry, and source/review information together so a future verified-data provider changes one clear file instead of route, UI, and map code. The current path shapes remain illustrative. |
| `src/data/navigation/collegeOfIdahoWalkingGraph.ts`      | A small validated loader for the editable graph dataset. It sends the records through domain factories, then exports the safe graph that `useRoutePlanner.ts` supplies to `routePlanner.ts`.                                                                                         |
| `src/data/navigation/collegeOfIdahoWalkingGraph.test.ts` | Demonstrates the intended College of Idaho shortest path, confirms every searchable mock location is represented by a graph node, and verifies the graph is labeled illustrative.                                                                                                    |
| `src/data/navigation/mockLocations.ts`                   | Derives searchable locations and search-result records from the editable dataset. Every searchable location must also have a graph node; the module throws a clear error if that data rule is broken.                                                                                |

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

### `src/features/navigation/model`

The model holds pure navigation calculations. Keeping these functions free of
React makes them suitable for focused tests and reuse.

| File                                            | Importance and relationship to other files                                                                                                                             |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/navigation/model/routePlanner.ts` | Filters location results and asks the domain walking-route function for a route between two locations. It maps absent paths into the existing unavailable-route state. |

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

| File                                                     | Importance and relationship to other files                                                                                                                                                            |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/navigation/components/NavigationPanel.tsx` | Renders both location fields, suggestions, swap button, preview action, and route summary. It receives the planner object instead of constructing a second one, preserving shared state with the map. |

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
Step 14 has since implemented route steps and checkpoints. One-shot browser
geolocation, a provider-independent location service, checkpoint navigation
state, and an authorized photogrammetry-to-optimized-model pipeline remain
dashed gray future components.

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

## Safe change recipes

These recipes identify normal starting points. Always run quality checks
afterward and inspect the browser for visual changes.

### Add a location

1. Open `src/data/navigation/collegeOfIdahoWalkingGraphData.ts`.
2. Add a searchable location label with a unique, machine-friendly ID, such as
   `science-building`.
3. Add a graph node with that same ID and its latitude and longitude.
4. `mockLocations.ts` will derive the validated searchable location from those
   records; do not add a second copy there.
5. Add verified connecting edges, including ordered walking geometry from the
   start node to the end node, if the location should have a calculated route.
6. Run checks and confirm the suggestion appears in both fields.

The factory rejects empty text or coordinates outside valid world ranges. Do
not bypass it by placing unvalidated plain objects into the application.

### Change the walking graph

1. Open `src/data/navigation/collegeOfIdahoWalkingGraphData.ts`.
2. Add or adjust nodes and edges in that dataset; the loader will validate them
   through `createWalkingGraph`.
3. Keep every edge endpoint ID equal to an existing node ID.
4. Keep the first geometry coordinate equal to the `fromNode` coordinate and the
   last equal to the `toNode` coordinate. Add intermediate points in walking
   order when the path bends.
5. Set `availability`, `direction`, and `accessibility` deliberately for every
   edge; use `unverified` when campus accessibility information is unknown.
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

### Change the 3D calibration building

1. Open `src/data/map/collegeOfIdahoScene.ts` for its anchor, heading,
   dimensions, or color.
2. Keep `verificationStatus` as `illustrative` unless the building record has
   approved geographic and dimensional evidence.
3. Do not use the model as evidence for an entrance or walkable connection;
   those facts belong in the walking graph.
4. Update the layer test if lifecycle behavior changes.
5. Run the production build and record a material bundle-size change.
6. Inspect both 3D and 2D modes in a real browser. Confirm the object is anchored
   while panning and hidden in 2D.

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

### The map works but the 3D building is missing

1. Confirm the 3D button is selected. The layer is deliberately hidden in 2D.
2. Check the browser console for WebGL or Three.js errors.
3. Confirm `createMapAdapter.ts` constructs
   `MapLibreGeoreferencedBuildingLayer` with `collegeOfIdahoScenePrototype`.
4. Confirm `MapLibreMapAdapter` adds the layer from its map-load callback.
5. Check that the anchor remains inside `collegeOfIdahoCampus.bounds` and the
   dimensions are positive meter values.
6. If the object moves away from its map position while panning, inspect the
   model transform and MapLibre projection-matrix use in the layer.
7. Toggle 2D and 3D. If the camera changes but visibility does not, inspect
   `setVisible` calls in `MapLibreMapAdapter.setMode`.

If the map and routes work, begin diagnosis in the Three.js layer rather than
the navigation domain. That separation is intentional.

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

- **Status:** Accepted
- **Decision:** Keep MapLibre for geographic projection, camera behavior, map
  interaction, and overlays; render project-owned 3D campus content through an
  isolated Three.js custom layer that shares MapLibre's WebGL context.
- **Reason:** The project can own its geographic data, route calculation, and
  visual assets without recreating mature map projection, touch interaction,
  camera, and 2D-map behavior. The existing adapter already provides a safe
  integration boundary.
- **Consequence:** Three.js adds a measurable deferred bundle cost and requires
  explicit shared-context state management and resource disposal. Visual models
  remain separate from authoritative entrances and walking-graph data. A later
  asset pipeline must optimize and benchmark every realistic model.

### ADR-022: Use one-shot GPS checkpoints for future navigation

- **Status:** Accepted target; not implemented
- **Decision:** Request browser location when navigation starts and when the
  person presses a future Next Turn control. Evaluate the reported position and
  accuracy as confirmed, uncertain, or mismatched before advancing.
- **Reason:** This reduces continuous location collection and battery use while
  still checking progress at important route points.
- **Consequence:** Detailed edge geometry and route steps now exist. A future
  `LocationProvider`, navigation-session state machine, GPS tolerance policy,
  interface, and campus field testing are still required. Poor-accuracy readings
  must be reported as inconclusive rather than as proof that the person is in
  the wrong place.

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
  GPS tolerance and step advancement remain separate future policies.

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

| Term                  | Plain-language meaning                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------- |
| Adapter               | A translator that makes one system fit the interface expected by another.                                     |
| API                   | A defined way for one piece of software to communicate with another.                                          |
| Basemap               | The background geographic map beneath custom markers and route lines.                                         |
| Bearing               | A compass direction measured in degrees and calculated between two geographic points.                         |
| Build                 | Turning source files into optimized files suitable for hosting.                                               |
| Bundle                | Browser-ready files assembled from source and dependencies.                                                   |
| Component             | A reusable visible part of a React interface.                                                                 |
| Checkpoint            | The expected geographic endpoint of a route step, later usable for progress verification.                     |
| Corroborated fact     | A limited fact checked beyond the project's own mock record; it is not automatically an approved instruction. |
| Contract or interface | A checked description of operations or data another module must provide.                                      |
| Dependency            | Code, data, or a service that another part requires.                                                          |
| Domain                | The business meaning of the application, such as locations and routes.                                        |
| Georeferencing        | Attaching data or a 3D object to a real location on Earth.                                                    |
| GeoJSON               | A standard JSON format for geographic points, lines, and areas.                                               |
| GLB                   | A compact binary file containing a web-ready 3D model and related data.                                       |
| Hook                  | A React function that manages reusable state or lifecycle behavior.                                           |
| Infrastructure        | Code communicating with an external technical system or provider.                                             |
| Lazy loading          | Delaying download or initialization until a feature is needed.                                                |
| Matrix                | A mathematical structure used to combine 3D position, rotation, scale, and camera projection.                 |
| Maneuver              | The action beginning a walking leg, such as depart, continue, turn left, or turn right.                       |
| MCP                   | Model Context Protocol, a standard connection between an AI tool and an information or action service.        |
| Mock data             | Local sample information used before or instead of a live backend.                                            |
| Procedural model      | 3D geometry created by code instead of loaded from a model file.                                              |
| Provider              | A library or service supplying a capability, such as map rendering or tiles.                                  |
| Raster tile           | A small map image combined with neighboring images to form a map.                                             |
| State                 | Information that can change while the application is being used.                                              |
| Three.js              | The browser 3D library currently used to draw project-owned geometry inside MapLibre.                         |
| TypeScript            | JavaScript with compile-time checks for expected data shapes.                                                 |
| WGS84                 | The world latitude-and-longitude coordinate reference used by GPS.                                            |
| WebGL                 | Browser graphics technology used by MapLibre and Three.js for GPU drawing.                                    |
| WebGL context         | The browser-managed connection to graphics state and resources on a device's GPU.                             |
| Web worker            | A separate browser execution context that avoids blocking the interface.                                      |

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
