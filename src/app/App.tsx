import { lazy, Suspense, useState } from 'react'
import { NavigationPanel } from '@/features/navigation/components/NavigationPanel'
import { RouteWalkthrough } from '@/features/navigation/components/RouteWalkthrough'
import { useRoutePlanner } from '@/features/navigation/hooks/useRoutePlanner'
import { useLocationSnapshot } from '@/features/navigation/hooks/useLocationSnapshot'
import { createLocationLookupProvider } from '@/composition/createLocationProvider'
import type { LocationProvider } from '@/features/navigation/contracts/LocationProvider'
import type { NavigationSession } from '@/domain/navigation/types'
import {
	advanceNavigationSession,
	moveNavigationBack,
	startNavigationSession,
} from '@/domain/navigation/navigationSession'
import { ErrorBoundary } from './components/ErrorBoundary'
import { FailureRecovery } from './components/FailureRecovery'
import { MapLoadingFallback } from './components/MapLoadingFallback'
import { SiteFooter } from './components/SiteFooter'

const MapView = lazy(async () => {
	const module = await import('@/features/map/components/MapView')
	return { default: module.MapView }
})

export function App({
	locationProvider,
}: {
	readonly locationProvider?: LocationProvider
}) {
	const [browserLocationProvider] = useState(createLocationLookupProvider)
	const planner = useRoutePlanner()
	const scope = JSON.stringify([
		planner.routeRevision,
		planner.originQuery,
		planner.destinationQuery,
	])
	const snapshot = useLocationSnapshot(
		locationProvider ?? browserLocationProvider,
		scope,
	)
	const [mapMode, setMapMode] = useState<'2d' | '3d'>('3d')
	const [navigationSession, setNavigationSession] =
		useState<NavigationSession>()
	const currentSession =
		navigationSession?.route === planner.plannedRoute
			? navigationSession
			: undefined

	function advanceWalkthrough(): void {
		const route = planner.plannedRoute
		if (!route) return
		setNavigationSession((current) =>
			advanceNavigationSession(
				current?.route === route ? current : startNavigationSession(route),
			),
		)
		void snapshot.request('walkthrough')
	}

	function goBack(): void {
		setNavigationSession((current) =>
			current && current.route === planner.plannedRoute
				? moveNavigationBack(current)
				: current,
		)
	}

	return (
		<>
			<main className="app-shell" id="wayfinder-app">
				<header className="page-header">
					<div className="brand">
						<span aria-hidden="true" className="brand-mark" />
						Yotes Wayfinder
					</div>
					<span className="header-status">Campus guide</span>
				</header>
				<section
					aria-label="Route planning workspace"
					className="wayfinder-layout"
				>
					<NavigationPanel
						planner={planner}
						navigationSession={currentSession}
						onStart={advanceWalkthrough}
					/>
					<section className="map-workspace" aria-label="Map workspace">
						<ErrorBoundary fallback={<FailureRecovery scope="map" />}>
							<Suspense fallback={<MapLoadingFallback />}>
								<MapView
									snapshot={snapshot}
									destination={planner.destination}
									mode={mapMode}
									onModeChange={setMapMode}
									origin={planner.origin}
									route={planner.plannedRoute}
									drivingHandoff={planner.drivingHandoff}
									navigationSession={currentSession}
								/>
							</Suspense>
						</ErrorBoundary>
					</section>
					{currentSession && (
						<RouteWalkthrough
							session={currentSession}
							onNext={advanceWalkthrough}
							onBack={goBack}
						/>
					)}
				</section>
			</main>
			<SiteFooter />
		</>
	)
}
