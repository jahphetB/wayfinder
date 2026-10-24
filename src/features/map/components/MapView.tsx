import { useEffect, useMemo, useRef, useState } from 'react'
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
import type { LocationSnapshot } from '@/features/navigation/hooks/useLocationSnapshot'
import { CurrentInstruction } from '@/features/navigation/components/CurrentInstruction'
import type { GuideJourney } from '@/features/navigation/model/guideWorkspace'
import { GuideIcon } from '@/app/components/GuideIcon'
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
	readonly journey?: GuideJourney | undefined
	readonly desktop?: boolean
	readonly onBuildingSelect?: ((id: string) => void) | undefined
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
	journey,
	desktop = true,
	onBuildingSelect,
}: MapViewProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const adapterRef = useRef<MapAdapter | undefined>(undefined)
	const initialMode = useRef(mode)
	const [mapStatus, setMapStatus] = useState<MapStatus>('loading')
	const [mapError, setMapError] = useState<string | undefined>()
	const [mapWarning, setMapWarning] = useState(false)
	const [retryVersion, setRetryVersion] = useState(0)
	const buildingCallback = useRef(onBuildingSelect)
	useEffect(() => {
		buildingCallback.current = onBuildingSelect
	}, [onBuildingSelect])
	const instructionRef = useRef<HTMLDivElement>(null)
	const [cardHeight, setCardHeight] = useState(112)
	useEffect(() => {
		const card = instructionRef.current
		if (!card || typeof ResizeObserver === 'undefined') return
		const observer = new ResizeObserver(() =>
			setCardHeight(card.getBoundingClientRect().height),
		)
		observer.observe(card)
		return () => observer.disconnect()
	}, [desktop, journey])
	const mobileNavigation = Boolean(journey) && !desktop
	const cameraInsets = useMemo(
		() =>
			mobileNavigation
				? { top: cardHeight + 24, bottom: 120, left: 24, right: 24 }
				: undefined,
		[mobileNavigation, cardHeight],
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
					bearing:
						initialMode.current === '2d'
							? 0
							: collegeOfIdahoCampus.initialBearing,
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
						if (active && !failed) buildingCallback.current?.(id)
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
			cameraInsets,
		})
	}, [
		origin,
		destination,
		route,
		drivingHandoff,
		navigationSession,
		retryVersion,
		cameraInsets,
	])

	useEffect(() => {
		adapterRef.current?.setMode(mode)
	}, [mode, retryVersion])

	useEffect(() => {
		const reading = snapshot.reading
		const coordinates =
			reading && classifyCampusLocation(reading) !== 'outside'
				? reading.coordinates
				: undefined
		if (mapStatus === 'ready')
			adapterRef.current?.showUserLocation(coordinates, {
				focus: snapshot.trigger === 'locate' && !route && !drivingHandoff,
			})
	}, [
		snapshot.reading,
		snapshot.trigger,
		mapStatus,
		retryVersion,
		route,
		drivingHandoff,
	])

	function retryMap(): void {
		setMapStatus('loading')
		setMapError(undefined)
		setMapWarning(false)
		setRetryVersion((version) => version + 1)
	}

	return (
		<section aria-label="Interactive map" className="map-view">
			<div className="map-viewport" id="map-viewport">
				<div className="map-canvas" ref={containerRef} />
			</div>
			{journey && !desktop && (
				<div ref={instructionRef} className="instruction-overlay">
					<CurrentInstruction journey={journey} />
				</div>
			)}
			<div
				className={
					journey ? 'map-controls map-controls--navigation' : 'map-controls'
				}
			>
				<div
					hidden={Boolean(journey) && !desktop}
					role="group"
					aria-label="Map display mode"
					className="map-mode-toggle"
				>
					{(['2d', '3d'] as const).map((value) => (
						<button
							key={value}
							aria-pressed={mode === value}
							disabled={mapStatus !== 'ready'}
							onClick={() => onModeChange(value)}
							type="button"
						>
							{value.toUpperCase()}
						</button>
					))}
				</div>
				{journey && (
					<div role="group" aria-label="Map zoom" className="map-zoom-controls">
						<button
							type="button"
							aria-label="Zoom in"
							disabled={mapStatus !== 'ready'}
							onClick={() => adapterRef.current?.zoom(1)}
						>
							<GuideIcon name="plus" />
						</button>
						<button
							type="button"
							aria-label="Zoom out"
							disabled={mapStatus !== 'ready'}
							onClick={() => adapterRef.current?.zoom(-1)}
						>
							<GuideIcon name="minus" />
						</button>
					</div>
				)}
			</div>
			{mapStatus === 'loading' && (
				<p className="map-status" role="status">
					Loading map…
				</p>
			)}
			{mapStatus === 'error' && (
				<div className="map-status map-status-error" role="alert">
					<p>Map unavailable: {mapError}</p>
					<button type="button" onClick={retryMap}>
						Try map again
					</button>
				</div>
			)}
			{mapWarning && mapStatus === 'ready' && (
				<div className="map-imagery-warning" role="status">
					<p>
						Some map imagery could not load. The background may be incomplete.
					</p>
					<button type="button" onClick={retryMap}>
						Retry map imagery
					</button>
				</div>
			)}
		</section>
	)
}
