import {
	Map as MapLibreMap,
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

const defaultMapFactory: MapLibreMapFactory = (options) =>
	new MapLibreMap(options)

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
			...cameraForMode(initialView.mode),
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
				if (!this.content.route && !this.content.drivingHandoff) {
					if (this.overviewBounds) this.fitOverview(0)
					else if (this.mode !== initialView.mode) {
						map.easeTo({ ...cameraForMode(this.mode), duration: 0 })
					}
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
				if (!this.isReady) return
				if (
					this.content.navigationSession &&
					this.content.navigationSession.status !== 'awaiting-start'
				)
					return
				if (!this.content.route && !this.content.drivingHandoff) {
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
		const session = this.content.navigationSession
		if (session?.status === 'navigating' || session?.status === 'completed') {
			this.focusNavigationSession(
				session,
				mapPresentation.camera.modeDurationMilliseconds,
			)
		} else {
			if (this.content.route || this.content.drivingHandoff) {
				this.cameraStateKey = undefined
				this.syncContent()
			} else if (this.overviewBounds) {
				this.fitOverview(mapPresentation.camera.modeDurationMilliseconds)
			} else {
				this.requireMap().stop()
				this.requireMap().easeTo({
					...cameraForMode(mode),
					duration: mapPresentation.camera.modeDurationMilliseconds,
					easing: mapPresentation.camera.easing,
				})
			}
		}
	}

	setContent(content: MapContent): void {
		if (
			this.content.origin === content.origin &&
			this.content.destination === content.destination &&
			this.content.route === content.route &&
			this.content.drivingHandoff === content.drivingHandoff &&
			this.content.navigationSession === content.navigationSession
		)
			return
		this.content = content
		if (this.isReady) this.syncContent()
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
			previous.origin !== this.content.origin ||
			previous.destination !== this.content.destination ||
			previous.drivingHandoff !== this.content.drivingHandoff
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
			: locations.map(({ coordinates }) => ({ coordinates, kind: 'walking' }))
		const locationData = {
			type: 'FeatureCollection',
			features: markers.flatMap((marker) =>
				marker.coordinates
					? [
							{
								type: 'Feature',
								properties: { kind: marker.kind },
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
		if (!map.getLayer('yote-location-points'))
			map.addLayer({
				id: 'yote-location-points',
				type: 'circle',
				source: 'yote-locations',
				paint: {
					'circle-radius': 8,
					'circle-color': [
						'match',
						['get', 'kind'],
						'handoff',
						'#412d5e',
						'#ef694c',
					],
					'circle-stroke-color': '#fff',
					'circle-stroke-width': 3,
				},
			})
		this.renderedContent = this.content
		const session = this.content.navigationSession
		const cameraProgress =
			session && session.status !== 'awaiting-start'
				? `${session.status}:${session.currentStepIndex}`
				: 'preview:-1'
		const cameraStateKey = this.content.route
			? `${this.content.route.id}:${cameraProgress}`
			: handoffCoordinates
				? 'stadium-driving-handoff'
				: undefined
		if (cameraStateKey === this.cameraStateKey) return
		this.cameraStateKey = cameraStateKey

		if (session?.status === 'navigating' || session?.status === 'completed') {
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
				previewCameraOptions(this.mode),
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
				previewCameraOptions(this.mode),
			)
		}
	}

	private focusNavigationSession(
		session: NonNullable<MapContent['navigationSession']>,
		duration: number,
	): void {
		const route = session.route
		const step =
			session.status === 'completed'
				? route.steps.at(-1)
				: route.steps[session.currentStepIndex]
		if (!step) return

		const from =
			session.status === 'completed'
				? step.coordinates.at(-2)
				: step.coordinates[0]
		const to =
			session.status === 'completed'
				? step.coordinates.at(-1)
				: step.coordinates[1]
		const center =
			session.status === 'completed'
				? step.coordinates.at(-1)
				: step.coordinates[0]
		if (!from || !to || !center) return

		this.requireMap().stop()
		this.requireMap().easeTo({
			center: [center.longitude, center.latitude],
			zoom: mapPresentation.camera.navigationZoom,
			bearing: calculateBearing(from, to),
			pitch: pitchForMode(this.mode),
			offset: [0, mapPresentation.camera.navigationOffsetPixels],
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
			pitch:
				this.mode === '3d'
					? mapPresentation.camera.overviewPitch3d
					: mapPresentation.camera.pitch2d,
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

function cameraForMode(mode: MapMode): EaseToOptions {
	if (mode === '3d') {
		return {
			bearing: mapPresentation.camera.initialBearing3d,
			pitch: mapPresentation.camera.pitch3d,
		}
	}

	return { bearing: 0, pitch: pitchForMode(mode) }
}

function pitchForMode(mode: MapMode): number {
	return mode === '3d'
		? mapPresentation.camera.pitch3d
		: mapPresentation.camera.pitch2d
}

function previewCameraOptions(mode: MapMode): object {
	return {
		padding: mapPresentation.camera.previewPaddingPixels,
		maxZoom: mapPresentation.camera.previewMaxZoom,
		bearing: 0,
		pitch: pitchForMode(mode),
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
