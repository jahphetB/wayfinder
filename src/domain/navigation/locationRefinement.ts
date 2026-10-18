import type { LocationReading } from './types'

export function selectBestRecentReading(
  readings: readonly LocationReading[],
  nowMilliseconds: number,
  maximumAgeMilliseconds: number,
): LocationReading | undefined {
  return readings.reduce<LocationReading | undefined>((best, reading) => {
    const age = nowMilliseconds - reading.capturedAtMilliseconds
    if (age < 0 || age > maximumAgeMilliseconds) return best
    if (
      !best ||
      reading.accuracyMeters < best.accuracyMeters ||
      (reading.accuracyMeters === best.accuracyMeters &&
        reading.capturedAtMilliseconds > best.capturedAtMilliseconds)
    )
      return reading
    return best
  }, undefined)
}
