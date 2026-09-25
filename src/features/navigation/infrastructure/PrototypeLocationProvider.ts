import { createLocationReading } from '@/domain/navigation/locationVerification'
import type { LocationReading } from '@/domain/navigation/types'
import type {
  LocationProvider,
  LocationRequest,
} from '../contracts/LocationProvider'
import { LocationProviderError } from '../contracts/LocationProviderError'
import type {
  PrototypeLocationScenario,
  PrototypeLocationScenarioController,
} from '../contracts/PrototypeLocationScenario'

export class PrototypeLocationProvider
  implements LocationProvider, PrototypeLocationScenarioController
{
  readonly mode = 'prototype-simulation' as const
  scenario: PrototypeLocationScenario = 'expected'
  private lastTimestamp = 0

  setScenario(scenario: PrototypeLocationScenario): void {
    this.scenario = scenario
    this.lastTimestamp = 0
  }

  requestCurrentLocation({
    expectedCoordinates,
  }: LocationRequest): Promise<LocationReading> {
    if (this.scenario === 'unavailable') {
      return Promise.reject(new LocationProviderError('unavailable'))
    }

    const capturedAtMilliseconds = this.getCapturedAtMilliseconds()
    const accuracyMeters = this.scenario === 'uncertain-accuracy' ? 25 : 1
    const coordinates =
      this.scenario === 'mismatched'
        ? {
            latitude: Number((expectedCoordinates.latitude + 0.001).toFixed(6)),
            longitude: expectedCoordinates.longitude,
          }
        : expectedCoordinates

    return Promise.resolve(
      createLocationReading({
        coordinates,
        accuracyMeters,
        capturedAtMilliseconds,
      }),
    )
  }

  private getCapturedAtMilliseconds(): number {
    const now = Date.now()
    const candidate = this.scenario === 'stale' ? now - 31_000 : now
    this.lastTimestamp = Math.max(candidate, this.lastTimestamp + 1)
    return this.lastTimestamp
  }
}
