import type { Route } from '@/domain/navigation/types'
import type { LocationProvider } from '../contracts/LocationProvider'
import type { LocationFailure } from '../contracts/LocationProviderError'
import { useCheckpointNavigation } from '../hooks/useCheckpointNavigation'

const failureMessages: Record<LocationFailure, string> = {
  'permission-denied':
    'Location access was denied. Allow location in your browser site settings, then try again.',
  unavailable:
    'A fresh location could not be obtained. Check your device location settings and try again.',
  timeout:
    'Finding your location took too long. Move somewhere with a clearer signal and try again.',
  unsupported:
    'This browser does not support location requests. You can still preview the route.',
  'insecure-context':
    'Location needs a secure connection. Open this site using HTTPS, or localhost for local testing.',
}

export function CheckpointNavigation({
  route,
  provider,
}: {
  readonly route: Route
  readonly provider: LocationProvider
}) {
  const { session, pending, failure, checkLocation } = useCheckpointNavigation(
    route,
    provider,
  )
  const step = route.steps[session.currentStepIndex]
  const verification = session.lastVerification
  const retry = Boolean(
    failure || (verification && verification.status !== 'confirmed'),
  )
  const arrived = session.status === 'arrived'
  const starting = session.status === 'awaiting-start'
  let message = starting
    ? 'Go to your selected starting place, then start navigation to check your location.'
    : 'When you reach the end of this walking leg, press Next Turn to check your location.'
  if (arrived)
    message = 'You have arrived. The destination location check passed.'
  else if (pending)
    message =
      'Checking your location… Respond to any browser permission prompt.'
  else if (failure) message = failureMessages[failure]
  else if (verification?.status === 'mismatched') {
    message =
      'You may be at the wrong location. Check the route and try again; your progress has not advanced.'
  } else if (verification?.status === 'uncertain') {
    message =
      verification.reason === 'accuracy-overlaps-checkpoint'
        ? 'Your location is not accurate enough to confirm this checkpoint. Wait for a clearer signal and try again.'
        : 'The location reading is not fresh enough to confirm this checkpoint. Try again.'
  }

  return (
    <section
      className="checkpoint-navigation"
      aria-label="Checkpoint navigation"
    >
      <h2>Walk the route</h2>
      <p className="prototype-notice">
        Prototype paths and checkpoints are illustrative and may not match
        campus walkways.
      </p>
      <p>
        Location is requested only when you press a navigation button. It is not
        continuously tracked or saved by this app.
      </p>
      {!starting && !arrived && step && (
        <div className="current-instruction">
          <h3>
            Step {session.currentStepIndex + 1} of {route.steps.length}
          </h3>
          <p>{step.instruction}</p>
        </div>
      )}
      <p role="status" aria-atomic="true">
        {message}
      </p>
      {!arrived && (
        <button
          type="button"
          className="route-action"
          disabled={pending}
          onClick={() => {
            void checkLocation()
          }}
        >
          {pending
            ? 'Checking location…'
            : retry
              ? 'Try location again'
              : starting
                ? 'Start navigation'
                : 'Next Turn'}
        </button>
      )}
    </section>
  )
}
