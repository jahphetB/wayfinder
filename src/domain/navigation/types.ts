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
  readonly distanceMeters: number
  readonly estimatedDurationMinutes: number
}

export interface WalkingGraphNode {
  readonly id: string
  readonly coordinates: Coordinates
}

export interface WalkingGraphEdge {
  readonly id: string
  readonly fromNodeId: string
  readonly toNodeId: string
  readonly distanceMeters: number
}

export interface WalkingGraph {
  readonly nodes: readonly WalkingGraphNode[]
  readonly edges: readonly WalkingGraphEdge[]
}

export interface WalkingPath {
  readonly nodeIds: readonly string[]
  readonly edgeIds: readonly string[]
  readonly distanceMeters: number
}
