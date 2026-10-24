import { vi } from 'vitest'
import { mapPresentation } from '@/features/map/model/mapPresentation'
import { collegeOfIdahoWalkingGraph } from '@/data/navigation/collegeOfIdahoWalkingGraph'
import { findWalkingRoute } from '@/domain/navigation/walkingRoutes'
import { stadiumDrivingHandoff } from '@/data/navigation/stadiumDrivingHandoff'
import type { NavigationSession } from '@/domain/navigation/types'

import type { MapLibreMapInstance } from './MapLibreMapAdapter'
import { MapLibreMapAdapter } from './MapLibreMapAdapter'

describe('MapLibreMapAdapter', () => {
	it('shows a separate user dot and gently focuses it without changing route content', () => {
		const on = vi.fn()
		let userLocationSourceExists = false
		const addSource = vi.fn((id: string, source: object) => {
			void source
			if (id === 'yote-user-location') userLocationSourceExists = true
		})
		const addLayer = vi.fn()
		const easeTo = vi.fn()
		const setData = vi.fn()
		const mapInstance: MapLibreMapInstance = {
			stop: vi.fn(),
			resize: vi.fn(),
			zoomIn: vi.fn(),
			zoomOut: vi.fn(),
			addImage: vi.fn(),
			easeTo,
			on,
			addSource,
			getSource: vi.fn((id: string) =>
				id === 'yote-user-location' && userLocationSourceExists
					? { setData }
					: undefined,
			),
			addLayer,
			getLayer: vi.fn(),
			fitBounds: vi.fn(),
			off: vi.fn(),
			queryRenderedFeatures: vi.fn(() => []),
			remove: vi.fn(),
		}
		const adapter = new MapLibreMapAdapter({
			style: 'https://example.test/style.json',
			createMap: vi.fn(() => mapInstance),
		})
		adapter.initialize(document.createElement('div'), {
			center: { latitude: 43.654, longitude: -116.676 },
			zoom: 16,
			mode: '3d',
		})
		const load = on.mock.calls.find(
			([event]) => event === 'load',
		)?.[1] as () => void
		load()
		addSource.mockClear()
		addLayer.mockClear()
		adapter.showUserLocation({ latitude: 43.6544, longitude: -116.6768 })

		const userSource = addSource.mock.calls.find(
			([id]) => id === 'yote-user-location',
		)?.[1] as
			| { data: { features: Array<{ geometry: { coordinates: number[] } }> } }
			| undefined
		expect(userSource?.data.features[0]?.geometry.coordinates).toEqual([
			-116.6768, 43.6544,
		])
		expect(addLayer).toHaveBeenCalledWith(
			expect.objectContaining({ id: 'yote-user-location-dot' }),
		)
		expect(easeTo).toHaveBeenLastCalledWith(
			expect.objectContaining({
				center: [-116.6768, 43.6544],
				zoom: 17,
			}),
		)
		adapter.showUserLocation(undefined)
		expect(setData).toHaveBeenLastCalledWith(
			expect.objectContaining({ features: [] }),
		)
		expect(addSource).toHaveBeenCalledTimes(1)
	})

	it('frames the campus overview and refits it after a mode change or resize', () => {
		const on = vi.fn()
		const fitBounds = vi.fn()
		const adapter = new MapLibreMapAdapter({
			style: 'https://example.test/style.json',
			createMap: vi.fn(() => ({
				stop: vi.fn(),
				resize: vi.fn(),
				zoomIn: vi.fn(),
				zoomOut: vi.fn(),
				addImage: vi.fn(),
				easeTo: vi.fn(),
				on,
				addSource: vi.fn(),
				getSource: vi.fn(),
				addLayer: vi.fn(),
				getLayer: vi.fn(),
				fitBounds,
				off: vi.fn(),
				queryRenderedFeatures: vi.fn(() => []),
				remove: vi.fn(),
			})),
		})
		const overviewBounds = {
			southwest: { latitude: 43.65065, longitude: -116.6807 },
			northeast: { latitude: 43.65565, longitude: -116.66985 },
		}

		adapter.initialize(document.createElement('div'), {
			center: { latitude: 43.6544, longitude: -116.6768 },
			zoom: 18,
			mode: '3d',
			overviewBounds,
		})
		const load = on.mock.calls.find(
			([event]) => event === 'load',
		)?.[1] as () => void
		const resize = on.mock.calls.find(
			([event]) => event === 'resize',
		)?.[1] as () => void
		load()
		expect(fitBounds).toHaveBeenLastCalledWith(
			[
				[-116.6807, 43.65065],
				[-116.66985, 43.65565],
			],
			expect.objectContaining({ padding: 24, pitch: 40, duration: 0 }),
		)

		adapter.setMode('2d')
		expect(fitBounds).toHaveBeenLastCalledWith(
			[
				[-116.6807, 43.65065],
				[-116.66985, 43.65565],
			],
			expect.objectContaining({ pitch: 0, duration: 1000 }),
		)
		resize()
		expect(fitBounds).toHaveBeenLastCalledWith(
			[
				[-116.6807, 43.65065],
				[-116.66985, 43.65565],
			],
			expect.objectContaining({ pitch: 0, duration: 0 }),
		)
	})

	it('creates a 3D map and changes to 2D mode through its provider boundary', () => {
		const on = vi.fn()
		const easeTo = vi.fn()
		const remove = vi.fn()
		const mapInstance: MapLibreMapInstance = {
			stop: vi.fn(),
			resize: vi.fn(),
			zoomIn: vi.fn(),
			zoomOut: vi.fn(),
			addImage: vi.fn(),
			easeTo,
			on,
			addSource: vi.fn(),
			getSource: vi.fn(),
			addLayer: vi.fn(),
			getLayer: vi.fn(),
			fitBounds: vi.fn(),
			off: vi.fn(),
			queryRenderedFeatures: vi.fn(() => []),
			remove,
		}
		const createMap = vi.fn(() => mapInstance)
		const adapter = new MapLibreMapAdapter({
			style: 'https://example.test/style.json',
			createMap,
		})
		const container = document.createElement('div')

		adapter.initialize(container, {
			center: { latitude: 43.6642, longitude: -116.6885 },
			zoom: 15,
			mode: '3d',
			maxBounds: {
				southwest: { latitude: 43.65, longitude: -116.69 },
				northeast: { latitude: 43.66, longitude: -116.68 },
			},
		})
		const load = on.mock.calls.find(
			([event]) => event === 'load',
		)?.[1] as () => void
		load()
		adapter.setMode('2d')
		adapter.destroy()

		expect(createMap).toHaveBeenCalledWith(
			expect.objectContaining({
				container,
				center: [-116.6885, 43.6642],
				zoom: 15,
				bearing: -20,
				pitch: 60,
				style: 'https://example.test/style.json',
				maxBounds: [
					[-116.69, 43.65],
					[-116.68, 43.66],
				],
			}),
		)
		expect(easeTo).toHaveBeenCalledWith({
			bearing: 0,
			duration: 1000,
			easing: mapPresentation.camera.easing,
			pitch: 0,
		})
		expect(remove).toHaveBeenCalledTimes(1)
	})

	it('fails clearly when map controls are used before initialization', () => {
		const adapter = new MapLibreMapAdapter({
			style: 'https://example.test/style.json',
			createMap: vi.fn(),
		})

		expect(() => adapter.setMode('3d')).toThrow(
			'Map adapter must be initialized before use',
		)
	})

	it('reports MapLibre readiness and errors through adapter callbacks', () => {
		const on = vi.fn()
		const mapInstance: MapLibreMapInstance = {
			stop: vi.fn(),
			resize: vi.fn(),
			zoomIn: vi.fn(),
			zoomOut: vi.fn(),
			addImage: vi.fn(),
			easeTo: vi.fn(),
			on,
			addSource: vi.fn(),
			getSource: vi.fn(),
			addLayer: vi.fn(),
			getLayer: vi.fn(),
			fitBounds: vi.fn(),
			off: vi.fn(),
			queryRenderedFeatures: vi.fn(() => []),
			remove: vi.fn(),
		}
		const onReady = vi.fn()
		const onError = vi.fn()
		const onWarning = vi.fn()
		const adapter = new MapLibreMapAdapter({
			style: 'https://example.test/style.json',
			createMap: vi.fn(() => mapInstance),
		})

		adapter.initialize(
			document.createElement('div'),
			{
				center: { latitude: 43.6642, longitude: -116.6885 },
				zoom: 15,
				mode: '3d',
			},
			{ onReady, onError, onWarning },
		)

		const loadListener = on.mock.calls.find(
			([event]) => event === 'load',
		)?.[1] as () => void
		const errorListener = on.mock.calls.find(
			([event]) => event === 'error',
		)?.[1] as (event: { error: Error; tile?: object }) => void

		loadListener()
		errorListener({ error: new Error('Tile request failed'), tile: {} })
		expect(onWarning).toHaveBeenCalledTimes(1)
		expect(onError).not.toHaveBeenCalled()
		const error = new Error('Style request failed')
		errorListener({ error })

		expect(onReady).toHaveBeenCalledTimes(1)
		expect(onError).toHaveBeenCalledWith(error)
		adapter.destroy()
		loadListener()
		errorListener({ error })
		expect(onReady).toHaveBeenCalledTimes(1)
		expect(onError).toHaveBeenCalledTimes(1)
	})

	it('contains asynchronous load errors and reports graphics context loss', () => {
		const on = vi.fn()
		const failure = new Error('Layer construction failed')
		const onError = vi.fn()
		const adapter = new MapLibreMapAdapter({
			style: 'https://example.test/style.json',
			createMap: () => ({
				stop: vi.fn(),
				resize: vi.fn(),
				zoomIn: vi.fn(),
				zoomOut: vi.fn(),
				addImage: vi.fn(),
				easeTo: vi.fn(),
				on,
				addSource: vi.fn(() => {
					throw failure
				}),
				getSource: vi.fn(),
				addLayer: vi.fn(),
				getLayer: vi.fn(),
				fitBounds: vi.fn(),
				off: vi.fn(),
				queryRenderedFeatures: () => [],
				remove: vi.fn(),
			}),
		})
		adapter.initialize(
			document.createElement('div'),
			{
				center: { latitude: 43.654, longitude: -116.676 },
				zoom: 16,
				mode: '3d',
			},
			{ onError },
		)
		const load = on.mock.calls.find(
			([event]) => event === 'load',
		)?.[1] as () => void
		expect(() => load()).not.toThrow()
		expect(onError).toHaveBeenCalledWith(failure)
		const lost = on.mock.calls.find(
			([event]) => event === 'webglcontextlost',
		)?.[1] as () => void
		lost()
		expect(onError).toHaveBeenLastCalledWith(
			expect.objectContaining({ message: 'WebGL graphics context was lost' }),
		)
		adapter.destroy()
		lost()
		expect(onError).toHaveBeenCalledTimes(2)
	})

	it('adds the campus layer after load and hides it in 2D mode', () => {
		const on = vi.fn()
		const addLayer = vi.fn()
		const setVisible = vi.fn()
		const campusLayer = {
			id: 'test-campus-layer',
			type: 'custom' as const,
			renderingMode: '3d' as const,
			render: vi.fn(),
			setVisible,
		}
		const mapInstance: MapLibreMapInstance = {
			stop: vi.fn(),
			resize: vi.fn(),
			zoomIn: vi.fn(),
			zoomOut: vi.fn(),
			addImage: vi.fn(),
			easeTo: vi.fn(),
			on,
			addSource: vi.fn(),
			getSource: vi.fn(),
			addLayer,
			getLayer: vi.fn(),
			fitBounds: vi.fn(),
			off: vi.fn(),
			queryRenderedFeatures: vi.fn(() => []),
			remove: vi.fn(),
		}
		const adapter = new MapLibreMapAdapter({
			style: 'https://example.test/style.json',
			createMap: vi.fn(() => mapInstance),
			campusLayer,
		})

		adapter.initialize(document.createElement('div'), {
			center: { latitude: 43.6526, longitude: -116.676 },
			zoom: 17,
			mode: '3d',
		})
		const loadListener = on.mock.calls.find(
			([event]) => event === 'load',
		)?.[1] as () => void

		loadListener()
		adapter.setMode('2d')

		expect(addLayer).toHaveBeenCalledWith(campusLayer)
		expect(setVisible).toHaveBeenNthCalledWith(1, true)
		expect(setVisible).toHaveBeenNthCalledWith(2, false)
	})

	it('styles route legs by progress and focuses the camera along the current leg', () => {
		const on = vi.fn()
		const stop = vi.fn()
		const easeTo = vi.fn()
		const addLayer = vi.fn()
		const fitNavigation = vi.fn()
		const synchronizeSize = vi.fn()
		let viewportHeight = 600
		const container = document.createElement('div')
		Object.defineProperties(container, {
			clientWidth: { get: () => 400 },
			clientHeight: { get: () => viewportHeight },
		})
		const zoomIn = vi.fn(),
			zoomOut = vi.fn()
		const setRouteData = vi.fn()
		const setLocationData = vi.fn()
		const mapInstance: MapLibreMapInstance = {
			stop,
			resize: synchronizeSize,
			zoomIn,
			zoomOut,
			addImage: vi.fn(),
			easeTo,
			on,
			addSource: vi.fn(),
			getSource: vi.fn((id: string) =>
				id === 'yote-route'
					? { setData: setRouteData }
					: { setData: setLocationData },
			),
			addLayer,
			getLayer: vi.fn(),
			fitBounds: fitNavigation,
			off: vi.fn(),
			queryRenderedFeatures: vi.fn(() => []),
			remove: vi.fn(),
		}
		const adapter = new MapLibreMapAdapter({
			style: 'https://example.test/style.json',
			createMap: vi.fn(() => mapInstance),
		})
		const route = findWalkingRoute(
			collegeOfIdahoWalkingGraph,
			'cruzen-murray-library',
			'simplot-dining-hall',
		)
		if (!route) throw new Error('Expected campus route fixture')
		const navigationSession = {
			route,
			status: 'navigating',
			currentStepIndex: 1,
		} satisfies NavigationSession

		adapter.initialize(container, {
			center: { latitude: 43.6526, longitude: -116.676 },
			zoom: 17,
			mode: '3d',
		})
		const loadListener = on.mock.calls.find(
			([event]) => event === 'load',
		)?.[1] as () => void
		loadListener()
		adapter.setContent({
			origin: undefined,
			destination: undefined,
			route,
			navigationSession,
		})

		const latestRouteData = setRouteData.mock.calls.at(-1)?.[0] as {
			features: Array<{ properties: { state: string } }>
		}
		expect(
			latestRouteData.features.map(({ properties }) => properties.state),
		).toEqual([
			'completed',
			'current',
			...Array.from({ length: route.steps.length - 2 }, () => 'upcoming'),
		])
		const addedLayers = addLayer.mock.calls as unknown as Array<
			[{ id: string; paint?: Record<string, unknown> }]
		>
		const routeLineLayer = addedLayers
			.map(([layer]) => layer)
			.find(({ id }) => id === 'yote-route-line')
		expect(addedLayers.map(([layer]) => layer.id)).toContain(
			'yote-route-casing',
		)
		expect(routeLineLayer?.paint?.['line-color']).toEqual(
			expect.arrayContaining(['completed', 'current', 'upcoming']),
		)
		expect(fitNavigation).toHaveBeenLastCalledWith(
			expect.any(Array),
			expect.objectContaining({ maxZoom: 18, pitch: 60, duration: 1300 }),
		)

		adapter.setMode('2d')
		expect(fitNavigation).toHaveBeenLastCalledWith(
			expect.any(Array),
			expect.objectContaining({ pitch: 0, duration: 1000 }),
		)
		const cameraCalls = fitNavigation.mock.calls.length
		const routeUpdates = setRouteData.mock.calls.length
		const pointUpdates = setLocationData.mock.calls.length
		adapter.setContent({
			origin: undefined,
			destination: undefined,
			route,
			navigationSession: { ...navigationSession },
		})
		expect(setRouteData).toHaveBeenCalledTimes(routeUpdates)
		expect(setLocationData).toHaveBeenCalledTimes(pointUpdates)
		const resize = on.mock.calls.find(
			([event]) => event === 'resize',
		)?.[1] as () => void
		resize()
		adapter.showUserLocation(
			{ latitude: 43.6544, longitude: -116.6768 },
			{ focus: false },
		)
		expect(fitNavigation).toHaveBeenCalledTimes(cameraCalls + 1)
		expect(stop).toHaveBeenCalledTimes(cameraCalls + 1)
		adapter.setContent({
			origin: undefined,
			destination: undefined,
			route,
			navigationSession: { ...navigationSession, currentStepIndex: 2 },
		})
		expect(fitNavigation).toHaveBeenCalledTimes(cameraCalls + 2)
		expect(stop).toHaveBeenCalledTimes(cameraCalls + 2)
		const cameraInsets = { top: 130, bottom: 120, left: 24, right: 24 }
		adapter.setContent({
			origin: undefined,
			destination: undefined,
			route,
			navigationSession: { ...navigationSession, currentStepIndex: 2 },
			cameraInsets,
		})
		expect(fitNavigation).toHaveBeenLastCalledWith(
			expect.any(Array),
			expect.objectContaining({ padding: cameraInsets, bearing: 0 }),
		)
		adapter.zoom(1)
		expect(zoomIn).toHaveBeenCalledTimes(1)
		adapter.zoom(-1)
		expect(zoomOut).toHaveBeenCalledTimes(1)
		viewportHeight = 300
		adapter.setContent({
			origin: undefined,
			destination: undefined,
			route,
			navigationSession: { ...navigationSession, currentStepIndex: 2 },
			cameraInsets,
		})
		expect(synchronizeSize).toHaveBeenCalledTimes(1)
		adapter.setContent({
			origin: undefined,
			destination: undefined,
			route,
			navigationSession: { ...navigationSession, currentStepIndex: 2 },
			cameraInsets,
		})
		expect(synchronizeSize).toHaveBeenCalledTimes(1)
	})

	it('fits a preview again when the map canvas is resized', () => {
		const on = vi.fn()
		const fitBounds = vi.fn()
		const mapInstance: MapLibreMapInstance = {
			stop: vi.fn(),
			resize: vi.fn(),
			zoomIn: vi.fn(),
			zoomOut: vi.fn(),
			addImage: vi.fn(),
			easeTo: vi.fn(),
			on,
			addSource: vi.fn(),
			getSource: vi.fn(),
			addLayer: vi.fn(),
			getLayer: vi.fn(),
			fitBounds,
			off: vi.fn(),
			queryRenderedFeatures: vi.fn(() => []),
			remove: vi.fn(),
		}
		const adapter = new MapLibreMapAdapter({
			style: 'https://example.test/style.json',
			createMap: vi.fn(() => mapInstance),
		})
		const route = findWalkingRoute(
			collegeOfIdahoWalkingGraph,
			'cruzen-murray-library',
			'simplot-residence-hall',
		)
		if (!route) throw new Error('Expected residence route fixture')

		adapter.initialize(document.createElement('div'), {
			center: { latitude: 43.6526, longitude: -116.676 },
			zoom: 17,
			mode: '2d',
		})
		const loadListener = on.mock.calls.find(
			([event]) => event === 'load',
		)?.[1] as () => void
		const resizeListener = on.mock.calls.find(
			([event]) => event === 'resize',
		)?.[1] as () => void
		loadListener()
		adapter.setContent({
			origin: undefined,
			destination: undefined,
			route,
			navigationSession: undefined,
		})

		expect(fitBounds).toHaveBeenCalledTimes(1)
		resizeListener()
		expect(fitBounds).toHaveBeenCalledTimes(2)
		expect(fitBounds).toHaveBeenLastCalledWith(
			[
				[
					Math.min(...route.coordinates.map((point) => point.longitude)),
					Math.min(...route.coordinates.map((point) => point.latitude)),
				],
				[
					Math.max(...route.coordinates.map((point) => point.longitude)),
					Math.max(...route.coordinates.map((point) => point.latitude)),
				],
			],
			{
				padding: 32,
				maxZoom: 17.5,
				bearing: 0,
				pitch: 0,
				duration: 1500,
				easing: mapPresentation.camera.easing,
			},
		)
	})

	it('draws the stadium handoff separately from walking legs', () => {
		const on = vi.fn()
		const addSource = vi.fn()
		const addLayer = vi.fn()
		const fitBounds = vi.fn()
		const createMap = vi.fn((): MapLibreMapInstance => ({
			stop: vi.fn(),
			resize: vi.fn(),
			zoomIn: vi.fn(),
			zoomOut: vi.fn(),
			addImage: vi.fn(),
			easeTo: vi.fn(),
			on,
			addSource,
			getSource: vi.fn(),
			addLayer,
			getLayer: vi.fn(),
			fitBounds,
			off: vi.fn(),
			queryRenderedFeatures: vi.fn(() => []),
			remove: vi.fn(),
		}))
		const adapter = new MapLibreMapAdapter({
			style: 'https://example.test/style.json',
			createMap,
		})
		adapter.initialize(document.createElement('div'), {
			center: { latitude: 43.6544341, longitude: -116.6768005 },
			zoom: 18,
			bearing: 185,
			mode: '3d',
		})
		const loadListener = on.mock.calls.find(
			([event]) => event === 'load',
		)?.[1] as () => void
		loadListener()
		adapter.setContent({
			origin: undefined,
			destination: undefined,
			route: undefined,
			navigationSession: undefined,
			drivingHandoff: stadiumDrivingHandoff,
		})

		expect(createMap).toHaveBeenCalledWith(
			expect.objectContaining({ bearing: 185, pitch: 60 }),
		)
		const sources = addSource.mock.calls as unknown as Array<
			[string, { data: { features: Array<{ geometry: { type: string } }> } }]
		>
		const handoffSource = sources
			.filter(([id]) => id === 'yote-driving-handoff')
			.at(-1)
		expect(handoffSource?.[1].data.features[0]?.geometry.type).toBe(
			'LineString',
		)
		expect(addLayer).toHaveBeenCalledWith(
			expect.objectContaining({ id: 'yote-driving-handoff' }),
		)
		expect(fitBounds).toHaveBeenCalledTimes(1)
	})
})
