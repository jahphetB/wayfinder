import { useEffect, useRef } from 'react'
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
  useEffect(() => {
    if (!containerRef.current) return
    const adapter = createMapAdapter()
    adapterRef.current = adapter
    adapter.initialize(containerRef.current, {
      center: { latitude: 43.666, longitude: -116.687 },
      zoom: 15,
      mode: initialMode.current,
    })
    return () => {
      adapter.destroy()
      adapterRef.current = undefined
    }
  }, [])
  useEffect(() => {
    adapterRef.current?.setContent({ origin, destination, route })
    if (route && window.matchMedia('(max-width: 760px)').matches) {
      containerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [origin, destination, route])
  useEffect(() => {
    adapterRef.current?.setMode(mode)
  }, [mode])
  return (
    <section aria-label="Interactive map" className="map-view">
      <div className="map-canvas" ref={containerRef} />
      <div aria-label="Map display mode" className="map-mode-toggle">
        <button
          aria-pressed={mode === '2d'}
          onClick={() => onModeChange('2d')}
          type="button"
        >
          2D
        </button>
        <button
          aria-pressed={mode === '3d'}
          onClick={() => onModeChange('3d')}
          type="button"
        >
          3D
        </button>
      </div>
      <p className="map-view-note">
        {route
          ? 'Route preview is shown on the map.'
          : 'Choose a route to show it on the map.'}
      </p>
    </section>
  )
}
