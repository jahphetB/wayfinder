import { createLocationReading } from '@/domain/navigation/locationVerification'
import type { LocationReading } from '@/domain/navigation/types'
import type {
  LocationProvider,
  LocationRequest,
} from '../contracts/LocationProvider'

export class PrototypeLocationProvider implements LocationProvider {
  readonly mode = 'prototype-simulation' as const
  private lastTimestamp = 0

  requestCurrentLocation({
    expectedCoordinates,
  }: LocationRequest): Promise<LocationReading> {
    this.lastTimestamp = Math.max(Date.now(), this.lastTimestamp + 1)
    return Promise.resolve(
      createLocationReading({
        coordinates: expectedCoordinates,
        accuracyMeters: 1,
        capturedAtMilliseconds: this.lastTimestamp,
      }),
    )
  }
}
