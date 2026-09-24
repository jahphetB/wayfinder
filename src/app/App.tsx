import { lazy, Suspense, useState } from 'react'
import { NavigationPanel } from '@/features/navigation/components/NavigationPanel'
import { useRoutePlanner } from '@/features/navigation/hooks/useRoutePlanner'
import { createLocationProvider } from '@/composition/createLocationProvider'
import type { LocationProvider } from '@/features/navigation/contracts/LocationProvider'

const MapView = lazy(async () => {
  const module = await import('@/features/map/components/MapView')
  return { default: module.MapView }
})

export function App({
  locationProvider,
}: {
  readonly locationProvider?: LocationProvider
}) {
  const [defaultLocationProvider] = useState(createLocationProvider)
  const planner = useRoutePlanner()
  const [mapMode, setMapMode] = useState<'2d' | '3d'>('3d')
  return (
    <main className="app-shell">
      <header className="page-header">
        <div className="brand">
          <span aria-hidden="true" className="brand-mark" />
          Yote Wayfinder
        </div>
        <span className="header-status">Prototype</span>
      </header>
      <section
        aria-label="Route planning workspace"
        className="wayfinder-layout"
      >
        <NavigationPanel
          planner={planner}
          locationProvider={locationProvider ?? defaultLocationProvider}
        />
        <Suspense
          fallback={
            <section aria-label="Interactive map" className="map-view" />
          }
        >
          <MapView
            destination={planner.destination}
            mode={mapMode}
            onModeChange={setMapMode}
            origin={planner.origin}
            route={planner.plannedRoute}
          />
        </Suspense>
      </section>
    </main>
  )
}
