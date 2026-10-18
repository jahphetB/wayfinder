import type { Coordinates, LocationReading } from '@/domain/navigation/types'

export interface LocationRequest {
  readonly expectedCoordinates: Coordinates
  /** Optional lookup controls; checkpoint providers retain their one-shot behavior. */
  readonly signal?: AbortSignal
  readonly onProgress?: (progress: {
    readonly accuracyMeters: number
    readonly readingCount: number
  }) => void
}

export interface LocationProvider {
  readonly mode?: 'browser' | 'prototype-simulation'
  requestCurrentLocation(request: LocationRequest): Promise<LocationReading>
}
