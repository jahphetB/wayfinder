import { createLocationReading } from '@/domain/navigation/locationVerification'
import { selectBestRecentReading } from '@/domain/navigation/locationRefinement'
import type { LocationReading } from '@/domain/navigation/types'
import type {
  LocationProvider,
  LocationRequest,
} from '../contracts/LocationProvider'
import { LocationProviderError } from '../contracts/LocationProviderError'
import { locationLookupPolicy } from '../model/locationLookupPolicy'

export class RefinedBrowserLocationProvider implements LocationProvider {
  readonly mode = 'browser' as const

  constructor(
    private readonly geolocation:
      Pick<Geolocation, 'watchPosition' | 'clearWatch'> | undefined,
    private readonly secureContext: boolean,
  ) {}

  requestCurrentLocation(request: LocationRequest): Promise<LocationReading> {
    return new Promise((resolve, reject) => {
      if (!this.secureContext)
        return reject(new LocationProviderError('insecure-context'))
      const geolocation = this.geolocation
      if (!geolocation) return reject(new LocationProviderError('unsupported'))
      if (request.signal?.aborted)
        return reject(
          new DOMException('Location lookup cancelled', 'AbortError'),
        )

      let readings: LocationReading[] = []
      let watchId: number | undefined
      let settled = false
      let lastFailure: LocationProviderError = new LocationProviderError(
        'timeout',
      )
      const seen = new Set<string>()

      const finish = (error?: Error): void => {
        if (settled) return
        settled = true
        clearTimeout(deadline)
        request.signal?.removeEventListener('abort', cancel)
        if (watchId !== undefined) geolocation.clearWatch(watchId)
        const best = selectBestRecentReading(
          readings,
          Date.now(),
          locationLookupPolicy.maximumReadingAgeMilliseconds,
        )
        readings = []
        seen.clear()
        if (error) reject(error)
        else if (best) resolve(best)
        else reject(lastFailure)
      }
      const cancel = (): void =>
        finish(new DOMException('Location lookup cancelled', 'AbortError'))
      const deadline = setTimeout(
        finish,
        locationLookupPolicy.maximumWaitMilliseconds,
      )
      request.signal?.addEventListener('abort', cancel, { once: true })

      try {
        watchId = geolocation.watchPosition(
          (position) => {
            if (settled) return
            let reading: LocationReading
            try {
              reading = createLocationReading({
                coordinates: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                },
                accuracyMeters: position.coords.accuracy,
                capturedAtMilliseconds: position.timestamp,
              })
            } catch {
              lastFailure = new LocationProviderError('unavailable')
              return
            }
            const now = Date.now()
            if (
              !selectBestRecentReading(
                [reading],
                now,
                locationLookupPolicy.maximumReadingAgeMilliseconds,
              )
            )
              return
            const key = `${reading.capturedAtMilliseconds}:${reading.coordinates.latitude}:${reading.coordinates.longitude}:${reading.accuracyMeters}`
            if (seen.has(key)) return
            seen.add(key)
            readings = readings.filter((candidate) =>
              selectBestRecentReading(
                [candidate],
                now,
                locationLookupPolicy.maximumReadingAgeMilliseconds,
              ),
            )
            readings.push(reading)
            const best = selectBestRecentReading(
              readings,
              now,
              locationLookupPolicy.maximumReadingAgeMilliseconds,
            )!
            request.onProgress?.({
              accuracyMeters: best.accuracyMeters,
              readingCount: readings.length,
            })
            if (
              readings.length >= locationLookupPolicy.minimumDistinctReadings &&
              best.accuracyMeters <= locationLookupPolicy.targetAccuracyMeters
            )
              finish()
          },
          (error) => {
            if (settled) return
            lastFailure = new LocationProviderError(
              error.code === 1
                ? 'permission-denied'
                : error.code === 3
                  ? 'timeout'
                  : 'unavailable',
            )
            if (error.code === 1) finish(lastFailure)
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: locationLookupPolicy.maximumWaitMilliseconds,
          },
        )
        // Some test/platform implementations may invoke a callback before returning the ID.
        if (settled) geolocation.clearWatch(watchId)
      } catch {
        finish(new LocationProviderError('unavailable'))
      }
    })
  }
}
