import { lazy, Suspense, useState } from 'react'
import { NavigationPanel } from '@/features/navigation/components/NavigationPanel'
import { useRoutePlanner } from '@/features/navigation/hooks/useRoutePlanner'
import {
	createLocationLookupProvider,
	createLocationProvider,
} from '@/composition/createLocationProvider'
import type { LocationProvider } from '@/features/navigation/contracts/LocationProvider'
import type { NavigationSession } from '@/domain/navigation/types'
import { ErrorBoundary } from './components/ErrorBoundary'
import { FailureRecovery } from './components/FailureRecovery'
import { MapLoadingFallback } from './components/MapLoadingFallback'

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
	const [browserLocationProvider] = useState(createLocationLookupProvider)
	const planner = useRoutePlanner()
	const [mapMode, setMapMode] = useState<'2d' | '3d'>('3d')
	const [navigationSession, setNavigationSession] =
		useState<NavigationSession>()
	const activeLocationProvider = locationProvider ?? defaultLocationProvider
	const currentNavigationSession =
		navigationSession?.route === planner.plannedRoute
			? navigationSession
			: undefined
	return (
		<main className="app-shell">
			<header className="page-header">
				<div className="brand">
					<span aria-hidden="true" className="brand-mark" />
					Yotes Wayfinder
				</div>
				<span className="header-status">Prototype</span>
			</header>
			<section
				aria-label="Route planning workspace"
				className="wayfinder-layout"
			>
				<NavigationPanel
					planner={planner}
					locationProvider={activeLocationProvider}
					onNavigationSessionChange={setNavigationSession}
				/>
				<ErrorBoundary fallback={<FailureRecovery scope="map" />}>
					<Suspense fallback={<MapLoadingFallback />}>
						<MapView
							locationLookupProvider={browserLocationProvider}
							destination={planner.destination}
							mode={mapMode}
							onModeChange={setMapMode}
							origin={planner.origin}
							route={planner.plannedRoute}
							drivingHandoff={planner.drivingHandoff}
							navigationSession={currentNavigationSession}
						/>
					</Suspense>
				</ErrorBoundary>
			</section>
		</main>
	)
}
