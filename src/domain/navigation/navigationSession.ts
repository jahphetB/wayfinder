import { NavigationValidationError } from './factories'
import { verifyCheckpoint } from './locationVerification'
import type {
  CheckpointVerification,
  CheckpointVerificationPolicy,
  LocationReading,
  NavigationCheckpoint,
  NavigationSession,
  Route,
} from './types'

interface NavigationProgressResult {
  readonly session: NavigationSession
  readonly verification: CheckpointVerification
}

export function startNavigationSession(route: Route): NavigationSession {
  if (route.steps.length === 0 || !route.coordinates[0]) {
    throw new NavigationValidationError(
      'Navigation requires a route with at least one step',
    )
  }

  return Object.freeze({
    route,
    status: 'awaiting-start',
    currentStepIndex: 0,
  })
}

export function getExpectedNavigationCheckpoint(
  session: NavigationSession,
): NavigationCheckpoint | undefined {
  if (session.status === 'arrived') return undefined

  if (session.status === 'awaiting-start') {
    const originCoordinates = session.route.coordinates[0]
    if (!originCoordinates) {
      throw new NavigationValidationError(
        'Navigation route is missing origin coordinates',
      )
    }

    return Object.freeze({
      id: `${session.route.id}-origin`,
      kind: 'origin',
      coordinates: originCoordinates,
    })
  }

  const step = session.route.steps[session.currentStepIndex]
  if (!step) {
    throw new NavigationValidationError(
      'Navigation session references a missing route step',
    )
  }

  return step.checkpoint
}

export function verifyNavigationProgress(
  session: NavigationSession,
  reading: LocationReading,
  evaluatedAtMilliseconds: number,
  policy?: CheckpointVerificationPolicy,
): NavigationProgressResult {
  const checkpoint = getExpectedNavigationCheckpoint(session)
  if (!checkpoint) {
    throw new NavigationValidationError(
      'Arrived navigation cannot verify another checkpoint',
    )
  }

  const verification = verifyCheckpoint(
    checkpoint,
    reading,
    evaluatedAtMilliseconds,
    policy,
  )
  const nextSession =
    verification.status === 'confirmed'
      ? advanceConfirmedSession(session, verification)
      : createSession(
          session,
          session.status,
          session.currentStepIndex,
          verification,
        )

  return Object.freeze({ session: nextSession, verification })
}

export function moveNavigationBack(
  session: NavigationSession,
): NavigationSession {
  if (session.status === 'awaiting-start') return session

  if (session.status === 'arrived') {
    return Object.freeze({
      route: session.route,
      status: 'navigating',
      currentStepIndex: session.route.steps.length - 1,
    })
  }

  if (session.currentStepIndex === 0) {
    return Object.freeze({
      route: session.route,
      status: 'awaiting-start',
      currentStepIndex: 0,
    })
  }

  return Object.freeze({
    route: session.route,
    status: 'navigating',
    currentStepIndex: session.currentStepIndex - 1,
  })
}

function advanceConfirmedSession(
  session: NavigationSession,
  verification: CheckpointVerification,
): NavigationSession {
  if (session.status === 'awaiting-start') {
    return createSession(session, 'navigating', 0, verification)
  }

  const currentStep = session.route.steps[session.currentStepIndex]
  if (!currentStep) {
    throw new NavigationValidationError(
      'Navigation session references a missing route step',
    )
  }

  if (currentStep.checkpoint.kind === 'destination') {
    return createSession(
      session,
      'arrived',
      session.route.steps.length,
      verification,
    )
  }

  return createSession(
    session,
    'navigating',
    session.currentStepIndex + 1,
    verification,
  )
}

function createSession(
  currentSession: NavigationSession,
  status: NavigationSession['status'],
  currentStepIndex: number,
  lastVerification: CheckpointVerification,
): NavigationSession {
  return Object.freeze({
    route: currentSession.route,
    status,
    currentStepIndex,
    lastVerification,
  })
}
