import { useEffect, useState } from 'react'
import { recoverySettings } from '@/app/recoverySettings'

export function MapLoadingFallback() {
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(
      () => setTimedOut(true),
      recoverySettings.mapModuleTimeoutMilliseconds,
    )
    return () => window.clearTimeout(timer)
  }, [])

  if (timedOut) throw new Error('Map module download timed out')

  return (
    <section aria-label="Interactive map" className="map-view">
      <p className="map-status" role="status">
        Loading map…
      </p>
    </section>
  )
}
