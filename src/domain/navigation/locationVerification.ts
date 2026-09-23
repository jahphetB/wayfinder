import { NavigationValidationError, createCoordinates } from './factories'
import type {
  CheckpointVerification,
  CheckpointVerificationPolicy,
  Coordinates,
  LocationReading,
  NavigationCheckpoint,
} from './types'

const earthRadiusMeters = 6_371_008.8

export const defaultCheckpointVerificationPolicy = Object.freeze({
  confirmationRadiusMeters: 20,
  maximumReadingAgeMilliseconds: 30_000,
}) satisfies CheckpointVerificationPolicy

interface LocationReadingInput {
  readonly coordinates: Coordinates
  readonly accuracyMeters: number
  readonly capturedAtMilliseconds: number
}

export function createLocationReading(
  input: LocationReadingInput,
): LocationReading {
  assertNonNegative(input.accuracyMeters, 'Location accuracy')
  assertNonNegative(input.capturedAtMilliseconds, 'Location timestamp')

  return Object.freeze({
    coordinates: createCoordinates(input.coordinates),
    accuracyMeters: input.accuracyMeters,
    capturedAtMilliseconds: input.capturedAtMilliseconds,
  })
}

export function verifyCheckpoint(
  checkpoint: Pick<NavigationCheckpoint, 'id' | 'coordinates'>,
  reading: LocationReading,
  evaluatedAtMilliseconds: number,
  policy: CheckpointVerificationPolicy = defaultCheckpointVerificationPolicy,
): CheckpointVerification {
  const validatedReading = createLocationReading(reading)
  assertNonNegative(evaluatedAtMilliseconds, 'Evaluation timestamp')
  assertPositive(
    policy.confirmationRadiusMeters,
    'Checkpoint confirmation radius',
  )
  assertPositive(
    policy.maximumReadingAgeMilliseconds,
    'Maximum location-reading age',
  )

  const distanceMeters = calculateDistanceMeters(
    validatedReading.coordinates,
    checkpoint.coordinates,
  )
  const baseResult = {
    checkpointId: checkpoint.id,
    distanceMeters,
    accuracyMeters: validatedReading.accuracyMeters,
  }
  const readingAgeMilliseconds =
    evaluatedAtMilliseconds - validatedReading.capturedAtMilliseconds

  if (readingAgeMilliseconds < 0) {
    return Object.freeze({
      ...baseResult,
      status: 'uncertain',
      reason: 'future-reading',
    })
  }

  if (readingAgeMilliseconds > policy.maximumReadingAgeMilliseconds) {
    return Object.freeze({
      ...baseResult,
      status: 'uncertain',
      reason: 'stale-reading',
    })
  }

  const nearestPossibleDistanceMeters = Math.max(
    0,
    distanceMeters - validatedReading.accuracyMeters,
  )
  const farthestPossibleDistanceMeters =
    distanceMeters + validatedReading.accuracyMeters

  if (farthestPossibleDistanceMeters <= policy.confirmationRadiusMeters) {
    return Object.freeze({ ...baseResult, status: 'confirmed' })
  }

  if (nearestPossibleDistanceMeters > policy.confirmationRadiusMeters) {
    return Object.freeze({
      ...baseResult,
      status: 'mismatched',
      reason: 'outside-checkpoint',
    })
  }

  return Object.freeze({
    ...baseResult,
    status: 'uncertain',
    reason: 'accuracy-overlaps-checkpoint',
  })
}

export function calculateDistanceMeters(
  from: Coordinates,
  to: Coordinates,
): number {
  const fromLatitude = degreesToRadians(from.latitude)
  const toLatitude = degreesToRadians(to.latitude)
  const latitudeDifference = toLatitude - fromLatitude
  const longitudeDifference = degreesToRadians(to.longitude - from.longitude)

  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDifference / 2) ** 2
  const clampedHaversine = Math.min(1, Math.max(0, haversine))

  return (
    2 *
    earthRadiusMeters *
    Math.atan2(Math.sqrt(clampedHaversine), Math.sqrt(1 - clampedHaversine))
  )
}

function assertPositive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new NavigationValidationError(`${name} must be a positive number`)
  }
}

function assertNonNegative(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new NavigationValidationError(`${name} must be a non-negative number`)
  }
}

function degreesToRadians(value: number): number {
  return (value * Math.PI) / 180
}
