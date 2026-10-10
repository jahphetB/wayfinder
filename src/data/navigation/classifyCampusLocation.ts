import {
  calculateDistanceMeters,
  createLocationReading,
} from '@/domain/navigation/locationVerification'
import type { Coordinates, LocationReading } from '@/domain/navigation/types'
import { collegeOfIdahoCampus } from './collegeOfIdahoCampus'

export type CampusLocationStatus = 'inside' | 'outside' | 'uncertain'

export function classifyCampusLocation(
  reading: LocationReading,
): CampusLocationStatus {
  const { coordinates, accuracyMeters } = createLocationReading(reading)
  const { southwest, northeast } = collegeOfIdahoCampus.overviewBounds
  const inside =
    coordinates.latitude >= southwest.latitude &&
    coordinates.latitude <= northeast.latitude &&
    coordinates.longitude >= southwest.longitude &&
    coordinates.longitude <= northeast.longitude

  if (inside) {
    const boundaryDistances = [
      { latitude: southwest.latitude, longitude: coordinates.longitude },
      { latitude: northeast.latitude, longitude: coordinates.longitude },
      { latitude: coordinates.latitude, longitude: southwest.longitude },
      { latitude: coordinates.latitude, longitude: northeast.longitude },
    ].map((point) => calculateDistanceMeters(coordinates, point))

    return Math.min(...boundaryDistances) > accuracyMeters
      ? 'inside'
      : 'uncertain'
  }

  const closestPoint: Coordinates = {
    latitude: Math.min(
      northeast.latitude,
      Math.max(southwest.latitude, coordinates.latitude),
    ),
    longitude: Math.min(
      northeast.longitude,
      Math.max(southwest.longitude, coordinates.longitude),
    ),
  }
  return calculateDistanceMeters(coordinates, closestPoint) > accuracyMeters
    ? 'outside'
    : 'uncertain'
}
