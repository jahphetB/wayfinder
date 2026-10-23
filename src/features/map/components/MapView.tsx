import { useEffect, useRef, useState } from 'react'
import type {
	Location,
	MapMode,
	NavigationSession,
	Route,
} from '@/domain/navigation/types'
import { createMapAdapter } from '@/composition/createMapAdapter'
import { collegeOfIdahoCampus } from '@/data/navigation/collegeOfIdahoCampus'
import { classifyCampusLocation } from '@/data/navigation/classifyCampusLocation'
import type { MapAdapter } from '@/features/map/contracts/MapAdapter'
import type { DrivingHandoff } from '@/data/navigation/stadiumDrivingHandoff'
import { campusBuildingDetails } from '@/data/campus/buildingDetails'
import { BuildingDetailsDialog } from '@/features/buildings/components/BuildingDetailsDialog'
import type { LocationSnapshot } from '@/features/navigation/hooks/useLocationSnapshot'
import { LocationSnapshotControl } from '@/features/navigation/components/LocationSnapshotControl'
import { recoverySettings } from '@/app/recoverySettings'

interface MapViewProps {
	readonly origin: Location | undefined
	readonly destination: Location | undefined
	readonly route: Route | undefined
	readonly navigationSession: NavigationSession | undefined
	readonly mode: MapMode
	readonly drivingHandoff: DrivingHandoff | undefined
	readonly onModeChange: (mode: MapMode) => void
	readonly snapshot: LocationSnapshot
}

type MapStatus = 'loading' | 'ready' | 'error'

export function MapView({
	origin,
	destination,
	route,
	navigationSession,
	mode,
	drivingHandoff,
	onModeChange,
	snapshot,
}: MapViewProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const adapterRef = useRef<MapAdapter | undefined>(undefined)
	const initialMode = useRef(mode)
	const [mapStatus, setMapStatus] = useState<MapStatus>('loading')
	const [mapError, setMapError] = useState<string | undefined>()
	const [mapWarning, setMapWarning] = useState(false)
	const [retryVersion, setRetryVersion] = useState(0)
	const [selectedBuildingId, setSelectedBuildingId] = useState<string>()
	const selectedBuilding = campusBuildingDetails.find(
		({ id }) => id === selectedBuildingId,
	)

	useEffect(() => {
		if (!containerRef.current) return

		let adapter: MapAdapter | undefined
		let active = true
		let failed = false
		const timer = window.setTimeout(
			() => fail(new Error('Map initialization timed out')),
			recoverySettings.mapInitializationTimeoutMilliseconds,
		)

		function fail(error: unknown): void {
			if (!active || failed) return
			failed = true
			window.clearTimeout(timer)
			adapterRef.current = undefined
			adapter?.destroy()
			adapter = undefined
			const message =
				error instanceof Error && /context.*lost/i.test(error.message)
					? 'The map graphics were interrupted. Try the map again.'
					: error instanceof Error &&
						  /webgl|graphics context/i.test(error.message)
						? 'WebGL2 graphics are required. Enable graphics acceleration or try a browser and device that support WebGL2.'
						: 'The map could not finish loading. Check your connection and try again.'
			void Promise.resolve().then(() => {
				if (!active) return
				setMapError(message)
				setMapStatus('error')
			})
		}

		try {
			adapter = createMapAdapter()
			adapter.initialize(
				containerRef.current,
				{
					center: collegeOfIdahoCampus.center,
					zoom: collegeOfIdahoCampus.initialZoom,
					bearing: collegeOfIdahoCampus.initialBearing,
					mode: initialMode.current,
					maxBounds: collegeOfIdahoCampus.bounds,
					overviewBounds: collegeOfIdahoCampus.overviewBounds,
				},
				{
					onReady: () => {
						if (!active || failed) return
						window.clearTimeout(timer)
						setMapStatus('ready')
					},
					onBuildingSelect: (id) => {
						if (active && !failed) setSelectedBuildingId(id)
					},
					onWarning: () => {
						if (active && !failed) setMapWarning(true)
					},
					onError: fail,
				},
			)
			if (!failed) adapterRef.current = adapter
		} catch (error) {
			fail(error)
		}

		return () => {
			active = false
			window.clearTimeout(timer)
			adapter?.destroy()
			adapterRef.current = undefined
		}
	}, [retryVersion])

	useEffect(() => {
		adapterRef.current?.setContent({
			origin,
			destination,
			route,
			drivingHandoff,
			navigationSession,
		})
	}, [
		origin,
		destination,
		route,
		drivingHandoff,
		navigationSession,
		retryVersion,
	])

	useEffect(() => {
		if (
			(route || drivingHandoff) &&
			window.matchMedia('(max-width: 760px)').matches
		) {
			containerRef.current?.scrollIntoView({
				behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
					? 'auto'
					: 'smooth',
				block: 'start',
			})
		}
	}, [route, drivingHandoff])
	useEffect(() => {
		adapterRef.current?.setMode(mode)
	}, [mode, retryVersion])

	const walkthroughActive = Boolean(
		navigationSession && navigationSession.status !== 'awaiting-start',
	)
	useEffect(() => {
		const reading = snapshot.reading
		const coordinates =
			reading && classifyCampusLocation(reading) !== 'outside'
				? reading.coordinates
				: undefined
		if (mapStatus === 'ready')
			adapterRef.current?.showUserLocation(coordinates, {
				focus: snapshot.trigger === 'locate' && !walkthroughActive,
			})
	}, [
		snapshot.reading,
		snapshot.trigger,
		mapStatus,
		retryVersion,
		walkthroughActive,
	])

	function retryMap(): void {
		setMapStatus('loading')
		setMapError(undefined)
		setMapWarning(false)
		setRetryVersion((version) => version + 1)
	}

	return (
		<section aria-label="Interactive map" className="map-view">
			<div className="map-toolbar" id="map-toolbar">
				<LocationSnapshotControl snapshot={snapshot} />
				<div
					role="group"
					aria-label="Map display mode"
					className="map-mode-toggle"
				>
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
			</div>
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
			{mapWarning && mapStatus === 'ready' && (
				<div className="map-imagery-warning" role="status">
					<p>
						Some map imagery could not load. Route lines may still be visible,
						but the background may be incomplete.
					</p>
					<button type="button" onClick={retryMap}>
						Retry map imagery
					</button>
				</div>
			)}
			<div className="map-viewport" id="map-viewport">
				<div className="map-canvas" ref={containerRef} />
			</div>
			<div className="map-information">
				<p className="map-view-note">
					{mapStatus === 'error'
						? 'Fix the connection or graphics error, then try the map again.'
						: navigationSession?.status === 'completed'
							? 'Route walkthrough complete; physical arrival is not verified.'
							: navigationSession?.status === 'navigating'
								? 'The camera is following the current route leg.'
								: route
									? 'Route preview is shown on the map.'
									: drivingHandoff
										? 'Dashed purple line: prototype drive to parking approach. Orange: stadium outline; entrance unverified.'
										: 'Choose a route to show it on the map.'}
					{mode === '3d' &&
						mapStatus === 'ready' &&
						' Library 3D shape: mapped footprint, illustrative height.'}
				</p>
				{mapStatus === 'ready' && (
					<details className="building-shortcuts">
						<summary>Building details</summary>
						<div
							className="building-shortcut-actions"
							role="group"
							aria-label="Building details"
						>
							{campusBuildingDetails.map((building) => (
								<button
									key={building.id}
									type="button"
									onClick={() => setSelectedBuildingId(building.id)}
								>
									{building.label} details
								</button>
							))}
						</div>
					</details>
				)}
			</div>
			{selectedBuilding && (
				<BuildingDetailsDialog
					key={selectedBuilding.id}
					building={selectedBuilding}
					onClose={() => setSelectedBuildingId(undefined)}
				/>
			)}
		</section>
	)
}
