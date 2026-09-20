import { useEffect, useRef, useState } from 'react'
import type { Location, MapMode, Route } from '@/domain/navigation/types'
import { createMapAdapter } from '@/composition/createMapAdapter'
import type { MapAdapter } from '@/features/map/contracts/MapAdapter'

interface MapViewProps {
  readonly origin: Location | undefined
  readonly destination: Location | undefined
  readonly route: Route | undefined
  readonly mode: MapMode
  readonly onModeChange: (mode: MapMode) => void
}

type MapStatus = 'loading' | 'ready' | 'error'

export function MapView({
  origin,
  destination,
  route,
  mode,
  onModeChange,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const adapterRef = useRef<MapAdapter | undefined>(undefined)
  const initialMode = useRef(mode)
  const [mapStatus, setMapStatus] = useState<MapStatus>('loading')
  const [mapError, setMapError] = useState<string | undefined>()
  const [retryVersion, setRetryVersion] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return

    const adapter = createMapAdapter()
    adapterRef.current = adapter

    try {
      adapter.initialize(
        containerRef.current,
        {
          center: { latitude: 43.666, longitude: -116.687 },
          zoom: 15,
          mode: initialMode.current,
        },
        {
          onReady: () => setMapStatus('ready'),
          onError: (error) => {
            setMapError(error.message)
            setMapStatus('error')
          },
        },
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'The map could not start.'
      void Promise.resolve().then(() => {
        setMapError(message)
        setMapStatus('error')
      })
    }

    return () => {
      adapter.destroy()
      adapterRef.current = undefined
    }
  }, [retryVersion])

  useEffect(() => {
    adapterRef.current?.setContent({ origin, destination, route })
    if (route && window.matchMedia('(max-width: 760px)').matches) {
      containerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [origin, destination, route, retryVersion])
  useEffect(() => {
    adapterRef.current?.setMode(mode)
  }, [mode, retryVersion])

  function retryMap(): void {
    setMapStatus('loading')
    setMapError(undefined)
    setRetryVersion((version) => version + 1)
  }
  return (
    <section aria-label="Interactive map" className="map-view">
      <div className="map-canvas" ref={containerRef} />
      {mapStatus === 'loading' && (
        <p className="map-status" role="status">
          Loading map…
        </p>
      )}
      {mapStatus === 'error' && (
        <div className="map-status map-status-error" role="alert">
          <p>Map unavailable: {mapError}</p>
          <button onClick={retryMap} type="button">
            Try map again
          </button>
        </div>
      )}
      <div aria-label="Map display mode" className="map-mode-toggle">
        <button
          aria-pressed={mode === '2d'}
          disabled={mapStatus !== 'ready'}
          onClick={() => onModeChange('2d')}
          type="button"
        >
          2D
        </button>
        <button
          aria-pressed={mode === '3d'}
          disabled={mapStatus !== 'ready'}
          onClick={() => onModeChange('3d')}
          type="button"
        >
          3D
        </button>
      </div>
      <p className="map-view-note">
        {mapStatus === 'error'
          ? 'Fix the connection or graphics error, then try the map again.'
          : route
            ? 'Route preview is shown on the map.'
            : 'Choose a route to show it on the map.'}
      </p>
    </section>
  )
}
