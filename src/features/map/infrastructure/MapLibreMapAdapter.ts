import {
	Map as MapLibreMap,
	ScaleControl,
	setWorkerUrl,
	type CustomLayerInterface,
	type EaseToOptions,
	type MapOptions,
	type MapMouseEvent,
} from 'maplibre-gl'
import { mapPresentation } from '@/features/map/model/mapPresentation'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

import type { Coordinates, MapMode } from '@/domain/navigation/types'
import type { MapBuilding } from '@/features/map/contracts/MapBuilding'
import type {
	MapAdapter,
	MapAdapterCallbacks,
	MapBounds,
	MapContent,
	MapInitialView,
} from '@/features/map/contracts/MapAdapter'

export interface MapLibreMapInstance {
	stop(): unknown
	resize(): unknown
	zoomIn(options?: EaseToOptions): unknown
	zoomOut(options?: EaseToOptions): unknown
	addImage(id: string, image: ImageData): unknown
	easeTo(options: EaseToOptions): unknown
	on(event: 'load', listener: () => void): unknown
	on(event: 'resize', listener: () => void): unknown
	on(
		event: 'error',
		listener: (event: { error?: Error; tile?: unknown }) => void,
	): unknown
	on(event: 'webglcontextlost', listener: () => void): unknown
	on(event: 'click', listener: (event: MapMouseEvent) => void): unknown
	off(event: 'click', listener: (event: MapMouseEvent) => void): unknown
	queryRenderedFeatures(
		point: MapMouseEvent['point'],
		options: { layers: string[] },
	): readonly { readonly properties?: Record<string, unknown> }[]
	addSource(id: string, source: object): unknown
	getSource(id: string): unknown
	addLayer(layer: object): unknown
	getLayer(id: string): unknown
	fitBounds(
		bounds: [[number, number], [number, number]],
		options: object,
	): unknown
	remove(): void
}

export type MapLibreMapFactory = (options: MapOptions) => MapLibreMapInstance

export interface MapLibreMapAdapterOptions {
	readonly buildings?: readonly MapBuilding[]
	readonly style: NonNullable<MapOptions['style']>
	readonly createMap?: MapLibreMapFactory
	readonly campusLayer?: CustomLayerInterface & {
		setVisible(isVisible: boolean): void
	}
}

setWorkerUrl(workerUrl)

const defaultMapFactory: MapLibreMapFactory = (options) => {
	const map = new MapLibreMap({
		...options,
		attributionControl: { compact: false, customAttribution: [] },
		maplibreLogo: false,
	})
	map.addControl(
		new ScaleControl({ maxWidth: 100, unit: 'metric' }),
		'bottom-right',
	)
	return map
}

export class MapLibreMapAdapter implements MapAdapter {
	private map: MapLibreMapInstance | undefined

	private isReady = false

	private mode: MapMode = '3d'

	private content: MapContent = {
		origin: undefined,
		destination: undefined,
		route: undefined,
		navigationSession: undefined,
		drivingHandoff: undefined,
	}

	private cameraStateKey: string | undefined
	private renderedContent: MapContent | undefined
	private container: HTMLElement | undefined
	private viewportSize = { width: 0, height: 0 }
	private synchronizingSize = false

	private overviewBounds: MapBounds | undefined
	private buildingClickListener: ((event: MapMouseEvent) => void) | undefined

	private readonly createMap: MapLibreMapFactory

	constructor(private readonly options: MapLibreMapAdapterOptions) {
		this.createMap = options.createMap ?? defaultMapFactory
	}

	initialize(
		container: HTMLElement,
		initialView: MapInitialView,
		callbacks?: MapAdapterCallbacks,
	): void {
		if (this.map) {
			throw new Error('Map adapter has already been initialized')
		}

		this.mode = initialView.mode
		this.container = container
		this.viewportSize = {
			width: container.clientWidth,
			height: container.clientHeight,
		}
		this.overviewBounds = initialView.overviewBounds
		const maxBounds = initialView.maxBounds
			? { maxBounds: mapLibreBounds(initialView.maxBounds) }
			: {}

		this.map = this.createMap({
			pixelRatio: Math.min(
				globalThis.devicePixelRatio || 1,
				mapPresentation.rendering.maximumPixelRatio,
			),
			container,
			style: this.options.style,
			center: [initialView.center.longitude, initialView.center.latitude],
			zoom: initialView.zoom,
			...defaultCameraOptions(),
			...(initialView.bearing === undefined
				? {}
				: { bearing: initialView.bearing }),
			...maxBounds,
		})
		const map = this.map
		const safely = (action: () => void): void => {
			if (this.map !== map) return
			try {
				action()
			} catch (error) {
				callbacks?.onError?.(
					error instanceof Error ? error : new Error('Map rendering failed'),
				)
			}
		}
		map.on('load', () =>
			safely(() => {
				this.isReady = true
				this.syncCampusLayer()
				this.syncContent()
				this.initializeBuildingSelection(callbacks)
				if (
					!this.content.route &&
					!this.content.selectedLocation &&
					!this.content.drivingHandoff &&
					!this.content.origin &&
					!this.content.destination
				) {
					if (this.overviewBounds) this.fitOverview(0)
				}
				callbacks?.onReady?.()
			}),
		)
		map.on('error', (event) => {
			if (this.map !== map) return
			if (event.tile) {
				callbacks?.onWarning?.()
				return
			}
			callbacks?.onError?.(
				event.error ?? new Error('MapLibre could not load the map.'),
			)
		})
		map.on('webglcontextlost', () => {
			if (this.map === map)
				callbacks?.onError?.(new Error('WebGL graphics context was lost'))
		})
		map.on('resize', () =>
			safely(() => {
				this.recordViewportSize()
				if (this.synchronizingSize) return
				if (!this.isReady) return
				if (this.content.selectedLocation) {
					this.cameraStateKey = undefined
					this.syncContent()
					return
				}
				if (
					this.content.navigationSession &&
					this.content.navigationSession.status !== 'awaiting-start'
				) {
					this.focusNavigationSession(this.content.navigationSession, 0)
					return
				}
				if (
					!this.content.route &&
					!this.content.drivingHandoff &&
					!this.content.origin &&
					!this.content.destination
				) {
					this.fitOverview(0)
					return
				}
				this.cameraStateKey = undefined
				this.syncContent()
			}),
		)
	}

	setMode(mode: MapMode): void {
		this.requireMap()
		if (mode === this.mode) return
		this.mode = mode
		if (!this.isReady) return
		this.options.campusLayer?.setVisible(mode === '3d')
	}

	zoom(direction: 1 | -1): void {
		if (!this.isReady) return
		const map = this.requireMap()
		map.stop()
		const options = {
			duration: mapPresentation.camera.modeDurationMilliseconds,
		}
		if (direction === 1) map.zoomIn(options)
		else map.zoomOut(options)
	}
	setContent(content: MapContent): void {
		if (
			this.content.origin === content.origin &&
			this.content.selectedLocation === content.selectedLocation &&
			this.content.destination === content.destination &&
			this.content.route === content.route &&
			this.content.drivingHandoff === content.drivingHandoff &&
			this.content.navigationSession === content.navigationSession &&
			JSON.stringify(this.content.cameraInsets) ===
				JSON.stringify(content.cameraInsets)
		)
			return
		this.content = content
		if (this.isReady) {
			this.synchronizeViewportSize()
			this.syncContent()
		}
	}

	showUserLocation(
		coordinates: Coordinates | undefined,
		options: { readonly focus: boolean } = { focus: true },
	): void {
		const map = this.requireMap()
		if (!this.isReady) return
		const data = {
			type: 'FeatureCollection',
			features: coordinates
				? [
						{
							type: 'Feature',
							properties: {},
							geometry: {
								type: 'Point',
								coordinates: [coordinates.longitude, coordinates.latitude],
							},
						},
					]
				: [],
		}
		const source = map.getSource('yote-user-location')
		if (isGeoJsonSource(source)) source.setData(data)
		else if (coordinates) {
			map.addSource('yote-user-location', { type: 'geojson', data })
			map.addLayer({
				id: 'yote-user-location-halo',
				type: 'circle',
				source: 'yote-user-location',
				paint: {
					'circle-radius': mapPresentation.snapshot.haloRadiusPixels,
					'circle-color': '#ffffff',
					'circle-opacity': 0.85,
				},
			})
			map.addLayer({
				id: 'yote-user-location-dot',
				type: 'circle',
				source: 'yote-user-location',
				paint: {
					'circle-radius': mapPresentation.snapshot.radiusPixels,
					'circle-color': mapPresentation.snapshot.color,
					'circle-stroke-color': mapPresentation.snapshot.outline,
					'circle-stroke-width': 2,
				},
			})
		}
		if (coordinates && options.focus) {
			map.stop()
			map.easeTo({
				center: [coordinates.longitude, coordinates.latitude],
				zoom: mapPresentation.camera.locationZoom,
				duration: mapPresentation.camera.locationDurationMilliseconds,
				easing: mapPresentation.camera.easing,
			})
		}
	}

	destroy(): void {
		if (this.buildingClickListener)
			this.map?.off('click', this.buildingClickListener)
		this.buildingClickListener = undefined
		const map = this.map
		this.map = undefined
		this.isReady = false
		this.overviewBounds = undefined
		this.cameraStateKey = undefined
		this.renderedContent = undefined
		this.container = undefined
		map?.stop()
		map?.remove()
	}

	private requireMap(): MapLibreMapInstance {
		if (!this.map) {
			throw new Error('Map adapter must be initialized before use')
		}

		return this.map
	}

	private initializeBuildingSelection(callbacks?: MapAdapterCallbacks): void {
		const buildings = this.options.buildings
		if (!buildings?.length || !callbacks?.onBuildingSelect) return
		const map = this.requireMap()
		map.addSource('yote-building-details', {
			type: 'geojson',
			data: {
				type: 'FeatureCollection',
				features: buildings.map((building) => ({
					type: 'Feature',
					properties: { id: building.id },
					geometry: {
						type: 'Polygon',
						coordinates: [
							building.footprint.map(({ longitude, latitude }) => [
								longitude,
								latitude,
							]),
						],
					},
				})),
			},
		})
		map.addLayer({
			id: 'yote-building-details-fill',
			type: 'fill',
			source: 'yote-building-details',
			paint: {
				'fill-color': mapPresentation.buildingSelection.color,
				'fill-opacity': mapPresentation.buildingSelection.fillOpacity,
			},
		})
		map.addLayer({
			id: 'yote-building-details-outline',
			type: 'line',
			source: 'yote-building-details',
			paint: {
				'line-color': mapPresentation.buildingSelection.color,
				'line-width': mapPresentation.buildingSelection.outlineWidthPixels,
				'line-opacity': mapPresentation.buildingSelection.outlineOpacity,
			},
		})
		this.buildingClickListener = (event) => {
			const feature = map.queryRenderedFeatures(event.point, {
				layers: ['yote-building-details-fill'],
			})[0]
			const id: unknown = feature?.properties?.id
			if (
				typeof id === 'string' &&
				buildings.some((building) => building.id === id)
			)
				callbacks.onBuildingSelect?.(id)
		}
		map.on('click', this.buildingClickListener)
	}

	private recordViewportSize(): void {
		if (this.container)
			this.viewportSize = {
				width: this.container.clientWidth,
				height: this.container.clientHeight,
			}
	}
	private synchronizeViewportSize(): void {
		const container = this.container
		if (
			!container ||
			(this.viewportSize.width === container.clientWidth &&
				this.viewportSize.height === container.clientHeight)
		)
			return
		this.synchronizingSize = true
		try {
			this.requireMap().resize()
			this.recordViewportSize()
		} finally {
			this.synchronizingSize = false
		}
	}
	private syncContent(): void {
		const map = this.requireMap()
		const previous = this.renderedContent
		const routeChanged =
			!previous ||
			previous.route !== this.content.route ||
			previous.navigationSession?.status !==
				this.content.navigationSession?.status ||
			previous.navigationSession?.currentStepIndex !==
				this.content.navigationSession?.currentStepIndex
		const locationsChanged =
			!previous ||
			previous.selectedLocation !== this.content.selectedLocation ||
			previous.origin !== this.content.origin ||
			previous.destination !== this.content.destination ||
			previous.drivingHandoff !== this.content.drivingHandoff ||
			previous.navigationSession?.status !==
				this.content.navigationSession?.status
		const handoffChanged =
			!previous || previous.drivingHandoff !== this.content.drivingHandoff
		const routeData = {
			type: 'FeatureCollection',
			features:
				this.content.route?.steps.map((step, index) => ({
					type: 'Feature',
					properties: {
						state: routeLegState(this.content.navigationSession, index),
					},
					geometry: {
						type: 'LineString',
						coordinates: step.coordinates.map((point) => [
							point.longitude,
							point.latitude,
						]),
					},
				})) ?? [],
		}
		const handoffCoordinates = this.content.drivingHandoff?.coordinates
		const handoffData = {
			type: 'FeatureCollection',
			features: handoffCoordinates
				? [
						{
							type: 'Feature',
							properties: {},
							geometry: {
								type: 'LineString',
								coordinates: handoffCoordinates.map((point) => [
									point.longitude,
									point.latitude,
								]),
							},
						},
					]
				: [],
		}
		const locations = [this.content.origin, this.content.destination].filter(
			(location): location is NonNullable<MapContent['origin']> =>
				location !== undefined,
		)
		const markers = handoffCoordinates
			? [
					{ coordinates: handoffCoordinates[0], kind: 'handoff' },
					{ coordinates: handoffCoordinates.at(-1), kind: 'handoff' },
					{ coordinates: this.content.destination?.coordinates, kind: 'venue' },
				]
			: [
					{
						coordinates: this.content.origin?.coordinates,
						kind: this.content.navigationSession ? 'origin' : 'preview-origin',
					},
					{
						coordinates: this.content.destination?.coordinates,
						kind: 'destination',
					},
				]
		const locationData = {
			type: 'FeatureCollection',
			features: [
				...markers,
				{
					coordinates: this.content.selectedLocation?.coordinates,
					kind: 'selected',
				},
			].flatMap((marker) =>
				marker.coordinates
					? [
							{
								type: 'Feature',
								properties: {
									kind: marker.kind,
									pin:
										marker.kind === 'preview-origin' ||
										this.content.navigationSession
											? 'yote-orange-pin'
											: 'yote-purple-pin',
								},
								geometry: {
									type: 'Point',
									coordinates: [
										marker.coordinates.longitude,
										marker.coordinates.latitude,
									],
								},
							},
						]
					: [],
			),
		}
		const routeSource = map.getSource('yote-route')
		if (isGeoJsonSource(routeSource)) {
			if (routeChanged) routeSource.setData(routeData)
		} else map.addSource('yote-route', { type: 'geojson', data: routeData })
		const handoffSource = map.getSource('yote-driving-handoff')
		if (isGeoJsonSource(handoffSource)) {
			if (handoffChanged) handoffSource.setData(handoffData)
		} else
			map.addSource('yote-driving-handoff', {
				type: 'geojson',
				data: handoffData,
			})
		const locationSource = map.getSource('yote-locations')
		if (isGeoJsonSource(locationSource)) {
			if (locationsChanged) locationSource.setData(locationData)
		} else
			map.addSource('yote-locations', { type: 'geojson', data: locationData })
		if (!map.getLayer('yote-route-casing'))
			map.addLayer({
				id: 'yote-route-casing',
				type: 'line',
				source: 'yote-route',
				layout: { 'line-cap': 'round', 'line-join': 'round' },
				paint: { 'line-color': '#ffffff', 'line-width': 10 },
			})
		if (!map.getLayer('yote-driving-handoff'))
			map.addLayer({
				id: 'yote-driving-handoff',
				type: 'line',
				source: 'yote-driving-handoff',
				layout: { 'line-cap': 'round', 'line-join': 'round' },
				paint: {
					'line-color': mapPresentation.routeColors.handoff,
					'line-width': 6,
					'line-dasharray': [2, 1],
				},
			})
		if (!map.getLayer('yote-route-line'))
			map.addLayer({
				id: 'yote-route-line',
				type: 'line',
				filter: [
					'in',
					['get', 'state'],
					['literal', ['completed', 'upcoming']],
				],
				source: 'yote-route',
				layout: { 'line-cap': 'round', 'line-join': 'round' },
				paint: {
					'line-color': [
						'match',
						['get', 'state'],
						'completed',
						mapPresentation.routeColors.completed,
						'current',
						mapPresentation.routeColors.current,
						'upcoming',
						mapPresentation.routeColors.upcoming,
						mapPresentation.routeColors.preview,
					],
					'line-width': [
						'match',
						['get', 'state'],
						'current',
						8,
						'completed',
						5,
						6,
					],
					'line-opacity': [
						'match',
						['get', 'state'],
						'completed',
						0.72,
						'upcoming',
						0.82,
						1,
					],
				},
			})

		if (!map.getLayer('yote-route-dashed'))
			map.addLayer({
				id: 'yote-route-dashed',
				type: 'line',
				source: 'yote-route',
				filter: ['in', ['get', 'state'], ['literal', ['preview', 'current']]],
				layout: { 'line-cap': 'round', 'line-join': 'round' },
				paint: {
					'line-color': [
						'match',
						['get', 'state'],
						'current',
						mapPresentation.routeColors.current,
						mapPresentation.routeColors.preview,
					],
					'line-width': 5,
					'line-dasharray': [1.4, 1],
				},
			})
		if (!map.getLayer('yote-location-points'))
			map.addLayer({
				id: 'yote-location-points',
				type: 'circle',
				filter: ['==', ['get', 'kind'], 'origin'],
				source: 'yote-locations',
				paint: {
					'circle-radius': ['match', ['get', 'kind'], 'origin', 9, 0],
					'circle-color': '#16934c',
					'circle-stroke-color': '#fff',
					'circle-stroke-width': 3,
				},
			})

		if (!map.getLayer('yote-destination-pin')) {
			map.addImage('yote-orange-pin', createPinImage('#f28528'))
			map.addImage('yote-purple-pin', createPinImage('#593777'))
			map.addLayer({
				id: 'yote-destination-pin',
				type: 'symbol',
				source: 'yote-locations',
				filter: ['!=', ['get', 'kind'], 'origin'],
				layout: {
					'icon-image': ['get', 'pin'],
					'icon-size': 0.5,
					'icon-anchor': 'bottom',
					'icon-allow-overlap': true,
				},
			})
		}
		this.renderedContent = this.content
		const session = this.content.navigationSession
		const cameraProgress =
			session && session.status !== 'awaiting-start'
				? `${session.status}:${session.currentStepIndex}`
				: 'preview:-1'
		const cameraStateKey = this.content.selectedLocation
			? `selected:${this.content.selectedLocation.id}`
			: this.content.route
				? `${this.content.route.id}:${cameraProgress}:${JSON.stringify(this.content.cameraInsets)}`
				: handoffCoordinates
					? 'stadium-driving-handoff'
					: locations.length
						? JSON.stringify(locations.map((location) => location.coordinates))
						: undefined
		if (cameraStateKey === this.cameraStateKey) return
		this.cameraStateKey = cameraStateKey

		if (this.content.selectedLocation) {
			const point = this.content.selectedLocation.coordinates
			map.stop()
			map.fitBounds(
				[
					[point.longitude, point.latitude],
					[point.longitude, point.latitude],
				],
				previewCameraOptions(),
			)
		} else if (
			session?.status === 'navigating' ||
			session?.status === 'completed'
		) {
			this.focusNavigationSession(
				session,
				mapPresentation.camera.navigationDurationMilliseconds,
			)
		} else if (this.content.route) {
			const longitudes = this.content.route.coordinates.map(
				(point) => point.longitude,
			)
			const latitudes = this.content.route.coordinates.map(
				(point) => point.latitude,
			)
			map.stop()
			map.fitBounds(
				[
					[Math.min(...longitudes), Math.min(...latitudes)],
					[Math.max(...longitudes), Math.max(...latitudes)],
				],
				{
					...previewCameraOptions(),
					...(this.content.cameraInsets
						? { padding: this.content.cameraInsets }
						: {}),
				},
			)
		} else if (handoffCoordinates) {
			const longitudes = handoffCoordinates.map((point) => point.longitude)
			const latitudes = handoffCoordinates.map((point) => point.latitude)
			map.stop()
			map.fitBounds(
				[
					[Math.min(...longitudes), Math.min(...latitudes)],
					[Math.max(...longitudes), Math.max(...latitudes)],
				],
				previewCameraOptions(),
			)
		} else if (locations.length) {
			const longitudes = locations.map(
				(location) => location.coordinates.longitude,
			)
			const latitudes = locations.map(
				(location) => location.coordinates.latitude,
			)
			map.stop()
			map.fitBounds(
				[
					[Math.min(...longitudes), Math.min(...latitudes)],
					[Math.max(...longitudes), Math.max(...latitudes)],
				],
				previewCameraOptions(),
			)
		} else if (previous?.selectedLocation) {
			this.fitOverview(mapPresentation.camera.previewDurationMilliseconds)
		}
	}

	private focusNavigationSession(
		session: NonNullable<MapContent['navigationSession']>,
		duration: number,
	): void {
		const step =
			session.route.steps[
				Math.min(session.currentStepIndex, session.route.steps.length - 1)
			]
		const from = step?.coordinates[0],
			to = step?.coordinates[1]

		const center =
			session.status === 'completed' ? step?.coordinates.at(-1) : from
		if (!center) return
		this.requireMap().stop()
		this.requireMap().easeTo({
			center: [center.longitude, center.latitude],
			zoom: mapPresentation.camera.navigationZoom,
			// Clear persistent preview padding; offset only balances visible controls.
			padding: { top: 0, bottom: 0, left: 0, right: 0 },
			offset: this.content.cameraInsets
				? [
						(this.content.cameraInsets.left - this.content.cameraInsets.right) /
							2,
						(this.content.cameraInsets.top - this.content.cameraInsets.bottom) /
							2,
					]
				: [0, 0],
			bearing: from && to ? calculateBearing(from, to) : 0,
			pitch: mapPresentation.camera.pitch,
			duration,
			easing: mapPresentation.camera.easing,
		})
	}

	private syncCampusLayer(): void {
		const campusLayer = this.options.campusLayer
		if (!campusLayer) return

		const map = this.requireMap()
		campusLayer.setVisible(this.mode === '3d')
		if (!map.getLayer(campusLayer.id)) map.addLayer(campusLayer)
	}

	private fitOverview(duration: number): void {
		if (!this.overviewBounds) return
		this.requireMap().stop()
		this.requireMap().fitBounds(mapLibreBounds(this.overviewBounds), {
			padding: mapPresentation.camera.overviewPaddingPixels,
			maxZoom: mapPresentation.camera.overviewMaxZoom,
			bearing: 0,
			pitch: mapPresentation.camera.pitch,
			duration,
			easing: mapPresentation.camera.easing,
		})
	}
}

function mapLibreBounds(
	bounds: MapBounds,
): [[number, number], [number, number]] {
	return [
		[bounds.southwest.longitude, bounds.southwest.latitude],
		[bounds.northeast.longitude, bounds.northeast.latitude],
	]
}

function defaultCameraOptions(): EaseToOptions {
	return {
		bearing: mapPresentation.camera.initialBearing,
		pitch: mapPresentation.camera.pitch,
	}
}

function previewCameraOptions(): object {
	return {
		padding: mapPresentation.camera.previewPaddingPixels,
		maxZoom: mapPresentation.camera.previewMaxZoom,
		bearing: 0,
		pitch: mapPresentation.camera.pitch,
		duration: mapPresentation.camera.previewDurationMilliseconds,
		easing: mapPresentation.camera.easing,
	}
}

function routeLegState(
	session: MapContent['navigationSession'],
	stepIndex: number,
): 'preview' | 'completed' | 'current' | 'upcoming' {
	if (!session || session.status === 'awaiting-start') return 'preview'
	if (session.status === 'completed') return 'completed'
	if (stepIndex < session.currentStepIndex) return 'completed'
	if (stepIndex === session.currentStepIndex) return 'current'
	return 'upcoming'
}

function calculateBearing(
	from: { latitude: number; longitude: number },
	to: { latitude: number; longitude: number },
): number {
	const fromLatitude = degreesToRadians(from.latitude)
	const toLatitude = degreesToRadians(to.latitude)
	const longitudeDifference = degreesToRadians(to.longitude - from.longitude)
	const y = Math.sin(longitudeDifference) * Math.cos(toLatitude)
	const x =
		Math.cos(fromLatitude) * Math.sin(toLatitude) -
		Math.sin(fromLatitude) *
			Math.cos(toLatitude) *
			Math.cos(longitudeDifference)

	return (radiansToDegrees(Math.atan2(y, x)) + 360) % 360
}

const degreesToRadians = (value: number): number => (value * Math.PI) / 180
const radiansToDegrees = (value: number): number => (value * 180) / Math.PI

function isGeoJsonSource(
	value: unknown,
): value is { setData(data: object): void } {
	return typeof value === 'object' && value !== null && 'setData' in value
}

function createPinImage(color: string): ImageData {
	const canvas = document.createElement('canvas')
	canvas.width = 64
	canvas.height = 88
	const context = canvas.getContext('2d')
	if (!context)
		return {
			width: 64,
			height: 88,
			data: new Uint8ClampedArray(64 * 88 * 4),
			colorSpace: 'srgb',
		}
	context.beginPath()
	context.moveTo(32, 83)
	context.bezierCurveTo(27, 69, 8, 49, 8, 30)
	context.arc(32, 30, 24, Math.PI, 0)
	context.bezierCurveTo(56, 49, 37, 69, 32, 83)
	context.fillStyle = color
	context.fill()
	context.strokeStyle = '#fff'
	context.lineWidth = 5
	context.stroke()
	context.beginPath()
	context.arc(32, 30, 9, 0, Math.PI * 2)
	context.fillStyle = '#fff'
	context.fill()
	return context.getImageData(0, 0, 64, 88)
}
