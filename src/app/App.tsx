import { lazy, Suspense, useState } from 'react'
import { NavigationPanel } from '@/features/navigation/components/NavigationPanel'
import { RouteWalkthrough } from '@/features/navigation/components/RouteWalkthrough'
import { RouteHeading } from '@/features/navigation/components/RouteHeading'
import {
	LocationSnapshotButton,
	LocationFeedback,
} from '@/features/navigation/components/LocationSnapshotControl'
import { useCampusGuide } from '@/features/navigation/hooks/useCampusGuide'
import { useLocationSnapshot } from '@/features/navigation/hooks/useLocationSnapshot'
import { createLocationLookupProvider } from '@/composition/createLocationProvider'
import type { LocationProvider } from '@/features/navigation/contracts/LocationProvider'
import { campusBuildingDetails } from '@/data/campus/buildingDetails'
import { BuildingDetailsDialog } from '@/features/buildings/components/BuildingDetailsDialog'
import { ErrorBoundary } from './components/ErrorBoundary'
import { FailureRecovery } from './components/FailureRecovery'
import { MapLoadingFallback } from './components/MapLoadingFallback'
import { SiteFooter } from './components/SiteFooter'
import { GuideHeader } from './components/GuideHeader'
import { PrivacyDialog } from './components/PrivacyDialog'
import { GuideIcon } from './components/GuideIcon'
import { useDesktopLayout } from './hooks/useDesktopLayout'

const MapView = lazy(async () => {
	const module = await import('@/features/map/components/MapView')
	return { default: module.MapView }
})
export function App({
	locationProvider,
}: {
	readonly locationProvider?: LocationProvider
}) {
	const [browserProvider] = useState(createLocationLookupProvider)
	const guide = useCampusGuide()
	const desktop = useDesktopLayout()
	const snapshot = useLocationSnapshot(
		locationProvider ?? browserProvider,
		String(guide.proposal?.revision ?? 'planning'),
	)
	const [mode, setMode] = useState<'2d' | '3d'>('2d')
	const [privacy, setPrivacy] = useState(false)
	const [buildingId, setBuildingId] = useState<string>()
	const building = campusBuildingDetails.find(
		(value) => value.id === buildingId,
	)
	const journey =
		guide.workspace.view === 'navigation' ? guide.workspace.journey : undefined
	const proposal = guide.proposal
	const route =
		proposal?.plan.status === 'route-ready' ? proposal.plan.route : undefined
	const handoff =
		proposal?.plan.status === 'driving-handoff'
			? proposal.plan.handoff
			: undefined
	const editing =
		guide.workspace.view === 'editing' ||
		(guide.workspace.view === 'preview' && Boolean(guide.workspace.previous))
	const view = journey ? 'navigation' : editing ? 'editing' : 'landing'
	function start() {
		if (guide.workspace.view !== 'preview' || !route) return
		guide.dispatch({ type: 'start' })
		void snapshot.request('walkthrough')
	}
	function next() {
		if (!journey || journey.session.status === 'completed') return
		guide.dispatch({ type: 'next' })
		void snapshot.request('walkthrough')
	}
	return (
		<main
			className="app-shell"
			id="wayfinder-app"
			data-view={view}
			data-default-map={!import.meta.env.VITE_MAP_STYLE_URL}
		>
			<GuideHeader
				journey={journey}
				desktop={desktop}
				onEdit={guide.edit}
				onPrivacy={() => setPrivacy(true)}
				onBuilding={setBuildingId}
			/>
			<section className="guide-sidebar" aria-label="Route planning workspace">
				{journey ? (
					<>
						<RouteHeading
							proposal={journey.proposal}
							summary
							onEdit={guide.edit}
						/>
						<RouteWalkthrough journey={journey} />
					</>
				) : (
					<NavigationPanel
						planner={guide.planner}
						workspace={guide.workspace}
						onCancel={guide.cancel}
						onStart={start}
						feedback={
							editing ? <LocationFeedback snapshot={snapshot} /> : undefined
						}
					/>
				)}
			</section>
			<section className="map-workspace" aria-label="Map workspace">
				<ErrorBoundary fallback={<FailureRecovery scope="map" />}>
					<Suspense fallback={<MapLoadingFallback />}>
						<MapView
							snapshot={snapshot}
							origin={proposal?.origin}
							destination={proposal?.destination}
							route={route}
							drivingHandoff={handoff}
							navigationSession={journey?.session}
							mode={mode}
							onModeChange={setMode}
							journey={journey}
							desktop={desktop}
							onBuildingSelect={setBuildingId}
						/>
					</Suspense>
				</ErrorBoundary>
			</section>
			<section className="guide-location" aria-label="Location snapshot">
				<LocationSnapshotButton snapshot={snapshot} />
				{!editing && <LocationFeedback snapshot={snapshot} />}
			</section>
			{journey && (
				<nav className="navigation-actions" aria-label="Walkthrough controls">
					<button
						className="secondary-action previous-step-action"
						type="button"
						onClick={() => guide.dispatch({ type: 'back' })}
					>
						<GuideIcon name="left" />
						Back
					</button>
					<button
						className="route-action next-step-action"
						type="button"
						disabled={journey.session.status === 'completed'}
						onClick={next}
					>
						{journey.session.status === 'completed' ? 'Complete' : 'Next'}
						<GuideIcon name="right" />
					</button>
				</nav>
			)}
			<SiteFooter
				onPrivacy={() => setPrivacy(true)}
				showMapCredit={
					Boolean(journey) && !desktop && !import.meta.env.VITE_MAP_STYLE_URL
				}
			/>
			{privacy && <PrivacyDialog onClose={() => setPrivacy(false)} />}
			{building && (
				<BuildingDetailsDialog
					building={building}
					onClose={() => setBuildingId(undefined)}
				/>
			)}
		</main>
	)
}
