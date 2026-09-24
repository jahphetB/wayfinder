import { NavigationValidationError, createWalkingGraph } from './factories'
import { createLocationReading } from './locationVerification'
import {
  getExpectedNavigationCheckpoint,
  moveNavigationBack,
  startNavigationSession,
  verifyNavigationProgress,
} from './navigationSession'
import { findWalkingRoute } from './walkingRoutes'
import type { Coordinates, LocationReading } from './types'

describe('navigation session', () => {
  const evaluatedAtMilliseconds = 100_000
  const graph = createWalkingGraph({
    nodes: [
      { id: 'origin', coordinates: { latitude: 43.65, longitude: -116.68 } },
      { id: 'turn', coordinates: { latitude: 43.651, longitude: -116.679 } },
      {
        id: 'destination',
        coordinates: { latitude: 43.652, longitude: -116.678 },
      },
    ],
    edges: [
      {
        id: 'origin-to-turn',
        fromNodeId: 'origin',
        toNodeId: 'turn',
        distanceMeters: 100,
      },
      {
        id: 'turn-to-destination',
        fromNodeId: 'turn',
        toNodeId: 'destination',
        distanceMeters: 120,
      },
    ],
  })
  const route = findWalkingRoute(graph, 'origin', 'destination')
  const originCoordinates = route?.coordinates[0]
  const firstStep = route?.steps[0]
  const finalStep = route?.steps[1]

  if (!route || !originCoordinates || !firstStep || !finalStep) {
    throw new Error('Navigation-session test route fixture is incomplete')
  }

  function readingAt(
    coordinates: Coordinates,
    accuracyMeters = 1,
  ): LocationReading {
    return createLocationReading({
      coordinates,
      accuracyMeters,
      capturedAtMilliseconds: evaluatedAtMilliseconds,
    })
  }

  it('starts by expecting a one-shot location check at the route origin', () => {
    const session = startNavigationSession(route)

    expect(session).toMatchObject({
      status: 'awaiting-start',
      currentStepIndex: 0,
    })
    expect(getExpectedNavigationCheckpoint(session)).toEqual({
      id: 'origin-to-destination-origin',
      kind: 'origin',
      coordinates: { latitude: 43.65, longitude: -116.68 },
    })
  })

  it('does not advance after a mismatched starting location', () => {
    const session = startNavigationSession(route)
    const result = verifyNavigationProgress(
      session,
      readingAt({ latitude: 43.66, longitude: -116.68 }),
      evaluatedAtMilliseconds,
    )

    expect(result.verification.status).toBe('mismatched')
    expect(result.session).toMatchObject({
      status: 'awaiting-start',
      currentStepIndex: 0,
    })
    expect(result.session.lastVerification).not.toHaveProperty('coordinates')
  })

  it('advances only after confirmed origin, turn, and destination checks', () => {
    const initialSession = startNavigationSession(route)
    const started = verifyNavigationProgress(
      initialSession,
      readingAt(originCoordinates),
      evaluatedAtMilliseconds,
    )

    expect(started.session.status).toBe('navigating')
    expect(getExpectedNavigationCheckpoint(started.session)).toEqual(
      firstStep.checkpoint,
    )

    const firstTurn = verifyNavigationProgress(
      started.session,
      readingAt(firstStep.checkpoint.coordinates),
      evaluatedAtMilliseconds,
    )

    expect(firstTurn.session).toMatchObject({
      status: 'navigating',
      currentStepIndex: 1,
    })
    expect(getExpectedNavigationCheckpoint(firstTurn.session)).toEqual(
      finalStep.checkpoint,
    )

    const uncertainDestination = verifyNavigationProgress(
      firstTurn.session,
      readingAt(finalStep.checkpoint.coordinates, 25),
      evaluatedAtMilliseconds,
    )

    expect(uncertainDestination.verification.status).toBe('uncertain')
    expect(uncertainDestination.session.currentStepIndex).toBe(1)

    const arrived = verifyNavigationProgress(
      uncertainDestination.session,
      readingAt(finalStep.checkpoint.coordinates),
      evaluatedAtMilliseconds,
    )

    expect(arrived.session).toMatchObject({
      status: 'arrived',
      currentStepIndex: 2,
    })
    expect(getExpectedNavigationCheckpoint(arrived.session)).toBeUndefined()
    expect(() =>
      verifyNavigationProgress(
        arrived.session,
        readingAt(finalStep.checkpoint.coordinates),
        evaluatedAtMilliseconds,
      ),
    ).toThrow(NavigationValidationError)
  })

  it('moves back through route legs and from arrival without a location request', () => {
    const initialSession = startNavigationSession(route)
    const firstLeg = verifyNavigationProgress(
      initialSession,
      readingAt(originCoordinates),
      evaluatedAtMilliseconds,
    ).session
    const secondLeg = verifyNavigationProgress(
      firstLeg,
      readingAt(firstStep.checkpoint.coordinates),
      evaluatedAtMilliseconds,
    ).session
    const arrived = verifyNavigationProgress(
      secondLeg,
      readingAt(finalStep.checkpoint.coordinates),
      evaluatedAtMilliseconds,
    ).session

    expect(moveNavigationBack(arrived)).toMatchObject({
      status: 'navigating',
      currentStepIndex: 1,
    })
    expect(moveNavigationBack(secondLeg)).toMatchObject({
      status: 'navigating',
      currentStepIndex: 0,
    })
    expect(moveNavigationBack(firstLeg)).toMatchObject({
      status: 'awaiting-start',
      currentStepIndex: 0,
    })
    expect(moveNavigationBack(initialSession)).toBe(initialSession)
  })
})
