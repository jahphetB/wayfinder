import { createLocationReading } from '@/domain/navigation/locationVerification'
import type { LocationReading } from '@/domain/navigation/types'
import type { LocationProvider } from '../contracts/LocationProvider'
import { LocationProviderError } from '../contracts/LocationProviderError'

export class BrowserLocationProvider implements LocationProvider {
  constructor(
    private readonly geolocation:
      Pick<Geolocation, 'getCurrentPosition'> | undefined,
    private readonly secureContext: boolean,
  ) {}

  requestCurrentLocation(): Promise<LocationReading> {
    return new Promise((resolve, reject) => {
      if (!this.secureContext) {
        reject(new LocationProviderError('insecure-context'))
        return
      }
      if (!this.geolocation) {
        reject(new LocationProviderError('unsupported'))
        return
      }
      this.geolocation.getCurrentPosition(
        (position) => {
          try {
            resolve(
              createLocationReading({
                coordinates: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                },
                accuracyMeters: position.coords.accuracy,
                capturedAtMilliseconds: position.timestamp,
              }),
            )
          } catch {
            reject(new LocationProviderError('unavailable'))
          }
        },
        (error) =>
          reject(
            new LocationProviderError(
              error.code === 1
                ? 'permission-denied'
                : error.code === 3
                  ? 'timeout'
                  : 'unavailable',
            ),
          ),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 },
      )
    })
  }
}
