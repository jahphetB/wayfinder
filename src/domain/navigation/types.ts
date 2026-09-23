export type MapMode = '2d' | '3d'

export interface Coordinates {
  readonly latitude: number
  readonly longitude: number
}

export interface Location {
  readonly id: string
  readonly label: string
  readonly coordinates: Coordinates
}

export interface LocationSearchResult {
  readonly location: Location
  readonly matchedText: string
}

export interface Route {
  readonly id: string
  readonly originLocationId: string
  readonly destinationLocationId: string
  readonly coordinates: readonly Coordinates[]
  readonly steps: readonly RouteStep[]
  readonly distanceMeters: number
  readonly estimatedDurationMinutes: number
}

export type RouteManeuver =
  'depart' | 'continue' | 'turn-left' | 'turn-right' | 'turn-around'

export type RouteCheckpointKind = 'turn' | 'destination'

export interface RouteCheckpoint {
  readonly id: string
  readonly kind: RouteCheckpointKind
  readonly coordinates: Coordinates
}

export interface RouteStep {
  readonly id: string
  readonly edgeId: string
  readonly maneuver: RouteManeuver
  readonly instruction: string
  readonly coordinates: readonly Coordinates[]
  readonly distanceMeters: number
  readonly checkpoint: RouteCheckpoint
}

export interface WalkingGraphNode {
  readonly id: string
  readonly coordinates: Coordinates
}

export type WalkingEdgeDirection = 'bidirectional' | 'forward-only'

export type WalkingEdgeAvailability = 'available' | 'closed'

export type WalkingEdgeAccessibility = 'unverified' | 'step-free' | 'stairs'

export interface WalkingGraphEdge {
  readonly id: string
  readonly fromNodeId: string
  readonly toNodeId: string
  readonly distanceMeters: number
  readonly geometry: readonly Coordinates[]
  readonly direction: WalkingEdgeDirection
  readonly availability: WalkingEdgeAvailability
  readonly accessibility: WalkingEdgeAccessibility
}

export interface WalkingGraph {
  readonly nodes: readonly WalkingGraphNode[]
  readonly edges: readonly WalkingGraphEdge[]
}

export type RouteDataVerificationStatus = 'illustrative' | 'verified'

export interface WalkingGraphProvenance {
  readonly sourceDescription: string
  readonly verificationStatus: RouteDataVerificationStatus
  readonly reviewedOn: string
  readonly verifiedBy?: string
}

export interface WalkingGraphRelease {
  readonly graph: WalkingGraph
  readonly provenance: WalkingGraphProvenance
}

export interface WalkingPath {
  readonly nodeIds: readonly string[]
  readonly edgeIds: readonly string[]
  readonly distanceMeters: number
}
