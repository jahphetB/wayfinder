# Yote Wayfinder Architecture Diagram

This is the maintained visual map of the project. Solid arrows and green or
gold boxes represent implemented behavior. Dashed arrows and gray boxes show
the approved direction for later GPS checkpoint navigation; they are not yet
implemented. Update this diagram whenever a major module, data flow, external
dependency, or architectural boundary changes.

```mermaid
flowchart TB
    User([Person using Yote Wayfinder])

    subgraph Browser[Browser application]
        Index[index.html<br/>HTML host]
        Main[src/main.tsx<br/>React entry]
        App[src/app/App.tsx<br/>screen composition and map mode]

        subgraph NavigationUI[Navigation feature]
            Panel[NavigationPanel.tsx<br/>inputs, suggestions, route summary]
            PlannerHook[useRoutePlanner.ts<br/>shared planner state]
            PlannerModel[routePlanner.ts<br/>search and route outcomes]
        end

        subgraph NavigationDomain[Provider-independent navigation domain]
            WalkingRoutes[walkingRoutes.ts<br/>path-to-route conversion]
            Pathfinder[pathfinding.ts<br/>Dijkstra shortest path]
            DomainTypes[types.ts<br/>locations, routes, graph contracts]
            Factories[factories.ts<br/>validation and immutability]
        end

        subgraph MapFeature[Map feature]
            MapView[MapView.tsx<br/>React lifecycle and controls]
            MapContract[MapAdapter.ts<br/>provider-neutral contract]
            BuildingContract[GeoreferencedBuilding.ts<br/>owned building description]
            Adapter[MapLibreMapAdapter.ts<br/>map lifecycle and overlays]
            BuildingLayer[MapLibreGeoreferencedBuildingLayer.ts<br/>shared WebGL 3D layer]
        end

        subgraph Rendering[Rendering libraries]
            MapLibre[MapLibre GL JS<br/>projection, camera, basemap, overlays]
            Three[Three.js<br/>3D geometry, lights, materials]
            GPU[(WebGL / device GPU)]
        end
    end

    subgraph Composition[Application composition boundary]
        CreateAdapter[createMapAdapter.ts<br/>constructs concrete integrations]
    end

    subgraph OwnedData[Project-owned data]
        GraphData[collegeOfIdahoWalkingGraphData.ts<br/>editable graph and provenance]
        GraphLoader[collegeOfIdahoWalkingGraph.ts<br/>validated runtime release]
        Locations[mockLocations.ts<br/>searchable locations derived from graph]
        Campus[collegeOfIdahoCampus.ts<br/>center, bounds, initial zoom]
        Scene[collegeOfIdahoScene.ts<br/>illustrative 3D calibration building]
    end

    subgraph ExternalRuntime[Current external runtime dependency]
        OSM[OpenStreetMap raster tiles<br/>prototype basemap]
    end

    subgraph QualityAndKnowledge[Development quality and project knowledge]
        Tests[Vitest and Testing Library<br/>focused automated tests]
        Tooling[TypeScript, ESLint, Prettier, Vite<br/>strict checks and bundling]
        Handbook[README and docs<br/>architecture, progress, skills, decisions]
        Context7[Context7 MCP<br/>current library documentation]
        AgentRules[AGENTS.md<br/>approval and engineering rules]
    end

    subgraph ApprovedFuture[Approved future navigation architecture - not implemented]
        BrowserGPS[Browser Geolocation API<br/>one-shot location requests]
        LocationProvider[LocationProvider contract<br/>position, accuracy, timestamp]
        NavigationSession[NavigationSession<br/>current turn and verification state]
        RouteSteps[Route steps and checkpoints<br/>turn instructions]
        ModelPipeline[Authorized photos and photogrammetry<br/>optimized GLB and KTX2 assets]
    end

    User --> Index --> Main --> App
    App --> Panel
    App --> MapView
    Panel --> PlannerHook --> PlannerModel --> WalkingRoutes --> Pathfinder
    DomainTypes --> Factories
    Factories --> GraphLoader
    Pathfinder --> GraphLoader
    GraphData --> GraphLoader
    GraphData --> Locations --> PlannerHook
    WalkingRoutes --> MapView

    MapView --> MapContract --> CreateAdapter --> Adapter
    Campus --> MapView
    Scene --> CreateAdapter
    BuildingContract --> BuildingLayer
    CreateAdapter --> BuildingLayer
    Adapter --> MapLibre
    Adapter --> BuildingLayer
    BuildingLayer --> Three
    MapLibre --> GPU
    Three --> GPU
    OSM --> MapLibre

    Tests -. verify .-> NavigationDomain
    Tests -. verify .-> MapFeature
    Tooling -. checks and bundles .-> Browser
    Handbook -. explains .-> Browser
    AgentRules -. governs changes .-> QualityAndKnowledge
    Context7 -. current dependency docs .-> QualityAndKnowledge

    BrowserGPS -. planned .-> LocationProvider
    LocationProvider -. planned .-> NavigationSession
    NavigationSession -. planned .-> RouteSteps
    RouteSteps -. planned extension .-> WalkingRoutes
    NavigationSession -. planned display state .-> Panel
    ModelPipeline -. planned replacement assets .-> Scene

    classDef implemented fill:#dff3e7,stroke:#155f3a,color:#082f20,stroke-width:2px
    classDef integration fill:#fff0c2,stroke:#9b6500,color:#493000,stroke-width:2px
    classDef external fill:#e9f0ff,stroke:#315da8,color:#172f58,stroke-width:2px
    classDef future fill:#eeeeee,stroke:#777,color:#333,stroke-dasharray:6 4

    class Index,Main,App,Panel,PlannerHook,PlannerModel,WalkingRoutes,Pathfinder,DomainTypes,Factories,MapView,MapContract,BuildingContract,GraphData,GraphLoader,Locations,Campus,Scene implemented
    class CreateAdapter,Adapter,BuildingLayer,MapLibre,Three,GPU integration
    class OSM,Tests,Tooling,Handbook,Context7,AgentRules external
    class BrowserGPS,LocationProvider,NavigationSession,RouteSteps,ModelPipeline future
```

## How to read the diagram

- The navigation domain has no dependency on MapLibre or Three.js. It can be
  tested and changed without starting a map.
- `MapAdapter` is the boundary used by React. `createMapAdapter.ts` selects
  MapLibre and the Three.js building layer at the application edge.
- The walking graph is the routing authority. The 3D scene is visual content and
  cannot define an entrance or a safe walking path by itself.
- MapLibre and Three.js share the browser's WebGL graphics context. MapLibre owns
  the camera and geographic projection; Three.js draws the owned 3D geometry.
- Gray nodes describe the approved next architecture, not current behavior.
  Their dashed styling must remain until the corresponding implementation and
  tests are complete.

## Diagram maintenance checklist

Update this file in the same commit when a change:

1. Adds, removes, or renames a major runtime module.
2. Changes which module owns state or data.
3. Adds or removes a third-party runtime service.
4. Turns a gray future component into implemented behavior.
5. Changes the direction of an important dependency.
6. Introduces a new verification, documentation, or build system that affects
   the project workflow.
