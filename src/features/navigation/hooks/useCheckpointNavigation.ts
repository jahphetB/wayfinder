import { useEffect, useRef, useState } from 'react'
import {
  startNavigationSession,
  verifyNavigationProgress,
} from '@/domain/navigation/navigationSession'
import type { Route } from '@/domain/navigation/types'
import type { LocationProvider } from '../contracts/LocationProvider'
import {
  LocationProviderError,
  type LocationFailure,
} from '../contracts/LocationProviderError'

// The owning component is remounted for every newly previewed route.
export function useCheckpointNavigation(
  route: Route,
  provider: LocationProvider,
) {
  const [session, setSession] = useState(() => startNavigationSession(route))
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState<LocationFailure>()
  const busy = useRef(false)
  const mounted = useRef(false)
  const lastReadingTimestamp = useRef(-1)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  async function checkLocation(): Promise<void> {
    if (busy.current || session.status === 'arrived') return
    busy.current = true
    setPending(true)
    setFailure(undefined)
    try {
      const reading = await provider.requestCurrentLocation()
      if (!mounted.current) return
      // A provider must not reuse one reading to confirm successive checkpoints.
      if (reading.capturedAtMilliseconds <= lastReadingTimestamp.current) {
        throw new LocationProviderError('unavailable')
      }
      const result = verifyNavigationProgress(session, reading, Date.now())
      lastReadingTimestamp.current = reading.capturedAtMilliseconds
      setSession(result.session)
    } catch (error) {
      if (mounted.current) {
        setFailure(
          error instanceof LocationProviderError ? error.code : 'unavailable',
        )
      }
    } finally {
      busy.current = false
      if (mounted.current) setPending(false)
    }
  }

  return { session, pending, failure, checkLocation }
}
