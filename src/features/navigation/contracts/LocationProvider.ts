import type { Coordinates, LocationReading } from '@/domain/navigation/types'

export interface LocationRequest {
  readonly expectedCoordinates: Coordinates
}

export interface LocationProvider {
  readonly mode?: 'browser' | 'prototype-simulation'
  requestCurrentLocation(request: LocationRequest): Promise<LocationReading>
}
