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
