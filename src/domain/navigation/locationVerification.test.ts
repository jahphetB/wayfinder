import { NavigationValidationError } from './factories'
import {
  calculateDistanceMeters,
  createLocationReading,
  defaultCheckpointVerificationPolicy,
  verifyCheckpoint,
} from './locationVerification'

describe('location verification', () => {
  const checkpoint = {
    id: 'route-checkpoint-1',
    coordinates: { latitude: 43.65, longitude: -116.68 },
  }
  const evaluatedAtMilliseconds = 100_000

  it('calculates geographic distance in meters', () => {
    const distanceMeters = calculateDistanceMeters(checkpoint.coordinates, {
      latitude: 43.651,
      longitude: -116.68,
    })

    expect(distanceMeters).toBeCloseTo(111.2, 0)
    expect(
      calculateDistanceMeters(
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 180 },
      ),
    ).toBeCloseTo(20_015_114, 0)
  })

  it('confirms only when the full accuracy circle fits inside the radius', () => {
    const reading = createLocationReading({
      coordinates: checkpoint.coordinates,
      accuracyMeters: 5,
      capturedAtMilliseconds: evaluatedAtMilliseconds,
    })

    expect(
      verifyCheckpoint(checkpoint, reading, evaluatedAtMilliseconds),
    ).toMatchObject({
      status: 'confirmed',
      checkpointId: checkpoint.id,
      distanceMeters: 0,
      accuracyMeters: 5,
    })
  })

  it('reports uncertainty when the accuracy circle overlaps the radius', () => {
    const reading = createLocationReading({
      coordinates: { latitude: 43.650135, longitude: -116.68 },
      accuracyMeters: 10,
      capturedAtMilliseconds: evaluatedAtMilliseconds,
    })

    expect(
      verifyCheckpoint(checkpoint, reading, evaluatedAtMilliseconds),
    ).toMatchObject({
      status: 'uncertain',
      reason: 'accuracy-overlaps-checkpoint',
      accuracyMeters: 10,
    })
  })

  it('reports a mismatch only when the accuracy circle is outside the radius', () => {
    const reading = createLocationReading({
      coordinates: { latitude: 43.651, longitude: -116.68 },
      accuracyMeters: 5,
      capturedAtMilliseconds: evaluatedAtMilliseconds,
    })

    expect(
      verifyCheckpoint(checkpoint, reading, evaluatedAtMilliseconds),
    ).toMatchObject({
      status: 'mismatched',
      reason: 'outside-checkpoint',
      accuracyMeters: 5,
    })
  })

  it('treats stale and future readings as uncertain', () => {
    const staleReading = createLocationReading({
      coordinates: checkpoint.coordinates,
      accuracyMeters: 5,
      capturedAtMilliseconds:
        evaluatedAtMilliseconds -
        defaultCheckpointVerificationPolicy.maximumReadingAgeMilliseconds -
        1,
    })
    const futureReading = createLocationReading({
      coordinates: checkpoint.coordinates,
      accuracyMeters: 5,
      capturedAtMilliseconds: evaluatedAtMilliseconds + 1,
    })

    expect(
      verifyCheckpoint(checkpoint, staleReading, evaluatedAtMilliseconds),
    ).toMatchObject({ status: 'uncertain', reason: 'stale-reading' })
    expect(
      verifyCheckpoint(checkpoint, futureReading, evaluatedAtMilliseconds),
    ).toMatchObject({ status: 'uncertain', reason: 'future-reading' })
  })

  it('rejects invalid accuracy and policy values', () => {
    expect(() =>
      createLocationReading({
        coordinates: checkpoint.coordinates,
        accuracyMeters: -1,
        capturedAtMilliseconds: evaluatedAtMilliseconds,
      }),
    ).toThrow(NavigationValidationError)

    expect(() =>
      verifyCheckpoint(
        checkpoint,
        createLocationReading({
          coordinates: checkpoint.coordinates,
          accuracyMeters: 1,
          capturedAtMilliseconds: evaluatedAtMilliseconds,
        }),
        evaluatedAtMilliseconds,
        { confirmationRadiusMeters: 0, maximumReadingAgeMilliseconds: 30_000 },
      ),
    ).toThrow(NavigationValidationError)
  })
})
