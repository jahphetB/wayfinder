# Yotes Wayfinder architecture

This diagram describes the implemented manual campus guide. A solid arrow means
data or control flows between modules; dotted arrows mark implementation or
verification relationships. It is not a proposal for live navigation.

## Application, data and privacy boundaries

```mermaid
flowchart TB
	User["Person chooses places and presses controls"]
	subgraph Browser["Browser tab: ephemeral state only"]
		Entry["index.html → main.tsx"]
		Recovery["ErrorBoundary / FailureRecovery<br/>page and deferred-map containment"]
		App["App.tsx<br/>composes saved journey, draft and one snapshot owner"]
		Workspace["useCampusGuide / guideWorkspace reducer<br/>planning → preview → navigation ↔ editing<br/>Cancel restores saved journey"]
		Panel["NavigationPanel / LocationSearch<br/>accessible search, route summary"]
		Planner["useRoutePlanner → routePlanner<br/>search, walking route or stadium handoff"]
		Walkthrough["RouteWalkthrough / CurrentInstruction<br/>desktop timeline / mobile instruction card<br/>one Back/Next dock"]
		Session["navigationSession.ts<br/>pure manual state transitions"]
		Snapshot["useLocationSnapshot<br/>single request owner, cancel and late-result guard"]
		SnapshotUI["LocationSnapshotControl<br/>Last checked, uncertainty, retained snapshot"]
		ProviderContract["LocationProvider<br/>one bounded result, cancellation and progress"]
		Provider["RefinedBrowserLocationProvider<br/>best recent reading, deadline and cleanup"]
		Policy["locationLookupPolicy / locationRefinement<br/>tunable limits and pure reading selection"]
		Footer["GuideHeader / SiteFooter / PrivacyDialog<br/>compact chrome, keyboard menu and native privacy modal"]
		MapView["MapView<br/>persistent canvas, measured mobile overlay<br/>reference mode/zoom controls and recovery"]
		MapContract["MapAdapter<br/>provider-independent display contract"]
		Composition["createMapAdapter / createLocationProvider<br/>concrete dependencies chosen here"]
		Adapter["MapLibreMapAdapter<br/>route layers, one snapshot, camera intents"]
		Presentation["mapPresentation.ts / theme.css<br/>camera, rendering, colors and UI settings"]
		Details["buildingDetails → BuildingDetailsDialog<br/>library, Sterry, cafeteria; photo placeholders"]
		Library["libraryPrototypeBuilding →<br/>MapLibreGeoreferencedBuildingLayer"]
		Renderer["MapLibre + Three.js<br/>shared WebGL2 canvas"]
	end
	subgraph Owned["Project-owned geographic data and routing"]
		XML["User-supplied OSM export<br/>retained provenance; not fetched at runtime"]
		Import["scripts/import_campus_osm.py<br/>filter and validate source geometry"]
		JSON["campusOsmNetwork.json<br/>versioned source snapshot"]
		Curated["collegeOfIdahoWalkingGraphData<br/>place IDs, names, entrances"]
		Build["buildCampusWalkingGraph / factories<br/>validate IDs and construct graph"]
		Graph["collegeOfIdahoWalkingGraph / mockLocations<br/>validated graph and search choices"]
		Route["walkingRoutes / pathfinding / routeSteps<br/>formal-first weighted Dijkstra, manual steps"]
		Handoff["stadiumDrivingHandoff<br/>separate illustrative road handoff"]
	end
	subgraph External["External browser and delivery services"]
		GPS["Browser / OS Geolocation API<br/>only during an explicit bounded request"]
		Tiles["OpenStreetMap raster tiles<br/>viewed-area requests; best effort"]
		Host["Vercel static hosting<br/>ordinary web requests"]
	end
	User --> Entry --> Recovery --> App
	App --> Workspace --> Planner
	Workspace --> Session
	App --> Panel
	Panel --> Planner --> Graph
	Planner --> Route
	Planner --> Handoff
	App --> Walkthrough
	Walkthrough -->|"Start / Next: immediate progression"| Session
	Session --> App
	Walkthrough -->|"Start / Next only"| Snapshot
	User -->|"Get my location only"| SnapshotUI
	SnapshotUI --> Snapshot
	App --> Snapshot
	Snapshot --> ProviderContract
	Composition -. constructs .-> Provider
	Provider -. implements .-> ProviderContract
	Provider --> Policy
	Provider -->|"temporary watcher cleared on finish / cancel / timeout"| GPS
	Snapshot -->|"replace last reading, never a trail"| SnapshotUI
	App --> MapView
	Snapshot -->|"point + time; never controls session"| MapView
	MapView --> MapContract
	Composition -. constructs .-> Adapter
	Adapter -. implements .-> MapContract
	MapView --> Details
	Adapter -->|"recognized building ID"| MapView
	Adapter -->|"cancel previous camera intent; update only changed sources"| Renderer
	Presentation --> Adapter
	Presentation --> Panel
	Adapter --> Library --> Renderer
	JSON --> Library
	Tiles --> Renderer
	Host --> Entry
	App --> Footer
	XML --> Import --> JSON
	JSON --> Build
	Curated --> Build --> Graph
	Graph --> Route
	JSON --> Handoff
	Route -->|"route geometry; no GPS requirement"| MapView
	Handoff --> MapView
```

The two independent lanes are essential. The illustrated session can advance
without location permission or physical movement. A real snapshot is requested
only by Get my location, Start navigating or Next. Back, page load, elapsed time
and mode changes never request location. One hook owns cancellation; late results
cannot overwrite a different route. The tab retains only the most recent reading,
with no application storage, history upload or analytics service.

The map draws results; it does not choose routes or verify arrival. The current
OSM-derived graph is the accepted baseline, with inferred connections and
unverified access honestly identified. Future exports enter through the importer
and tests, not through a replacement UI or backend. The library mesh is visual
only, with illustrative height; other realistic 3D work is not part of this release.

## Verification and release boundary

```mermaid
flowchart LR
	Change["Feature branch: focused commits"] --> Local["npm run check + fresh audit<br/>format / lint / types / 111 tests / build"]
	Local --> PR["GitHub pull request"]
	PR --> CI["Quality checks + dependency audit"]
	PR --> Preview["Vercel Preview<br/>exact tested source commit"]
	Headers["vercel.json<br/>CSP, framing, MIME, permissions, referrer"] --> Preview
	Headers --> LocalPreview["Vite production preview<br/>same headers for browser tests"]
	Preview --> Review["Browser flows, failures, accessibility<br/>physical-device checklist"]
	Review --> Approval{"Explicit production approval"}
	Approval -->|"approved reviewed merge only"| Main["main"]
	Main --> Production["Vercel Production"]
	Production --> Smoke["Verify live build and essential flows"]
	Smoke -. regression .-> Recovery["Known-good deployment rollback<br/>or reviewed corrective revert"]
	Recovery --> Review
```

A Content Security Policy (CSP) restricts which resources the browser may execute
or load. Scripts and workers are same-origin; MapLibre requires inline style
attributes for placement, not inline scripts. The production preview uses the same
header configuration as Vercel. A passing local build, a pushed commit, a ready
preview and a verified production release remain separate claims.

Update both diagrams whenever module ownership, third-party requests or the
release boundary changes. The detailed handbook is [ARCHITECTURE.md](ARCHITECTURE.md).
