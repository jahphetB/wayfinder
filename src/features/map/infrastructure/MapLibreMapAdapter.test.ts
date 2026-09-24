import { vi } from 'vitest'
import { collegeOfIdahoWalkingGraph } from '@/data/navigation/collegeOfIdahoWalkingGraph'
import { findWalkingRoute } from '@/domain/navigation/walkingRoutes'
import type { NavigationSession } from '@/domain/navigation/types'

import type { MapLibreMapInstance } from './MapLibreMapAdapter'
import { MapLibreMapAdapter } from './MapLibreMapAdapter'

describe('MapLibreMapAdapter', () => {
  it('creates a 3D map and changes to 2D mode through its provider boundary', () => {
    const easeTo = vi.fn()
    const remove = vi.fn()
    const mapInstance: MapLibreMapInstance = {
      easeTo,
      on: vi.fn(),
      addSource: vi.fn(),
      getSource: vi.fn(),
      addLayer: vi.fn(),
      getLayer: vi.fn(),
      fitBounds: vi.fn(),
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
      duration: 450,
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
      easeTo: vi.fn(),
      on,
      addSource: vi.fn(),
      getSource: vi.fn(),
      addLayer: vi.fn(),
      getLayer: vi.fn(),
      fitBounds: vi.fn(),
      remove: vi.fn(),
    }
    const onReady = vi.fn()
    const onError = vi.fn()
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
      { onReady, onError },
    )

    const loadListener = on.mock.calls.find(
      ([event]) => event === 'load',
    )?.[1] as () => void
    const errorListener = on.mock.calls.find(
      ([event]) => event === 'error',
    )?.[1] as (event: { error: Error }) => void

    loadListener()
    const error = new Error('Tile request failed')
    errorListener({ error })

    expect(onReady).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(error)
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
      easeTo: vi.fn(),
      on,
      addSource: vi.fn(),
      getSource: vi.fn(),
      addLayer,
      getLayer: vi.fn(),
      fitBounds: vi.fn(),
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
    const easeTo = vi.fn()
    const addLayer = vi.fn()
    const setRouteData = vi.fn()
    const setLocationData = vi.fn()
    const mapInstance: MapLibreMapInstance = {
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
      fitBounds: vi.fn(),
      remove: vi.fn(),
    }
    const adapter = new MapLibreMapAdapter({
      style: 'https://example.test/style.json',
      createMap: vi.fn(() => mapInstance),
    })
    const route = findWalkingRoute(
      collegeOfIdahoWalkingGraph,
      'campus-entrance',
      'cruzen-murray-library',
    )
    if (!route) throw new Error('Expected campus route fixture')
    const navigationSession = {
      route,
      status: 'navigating',
      currentStepIndex: 1,
    } satisfies NavigationSession

    adapter.initialize(document.createElement('div'), {
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
    ).toEqual(['completed', 'current', 'upcoming'])
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
    expect(easeTo).toHaveBeenLastCalledWith(
      expect.objectContaining({
        center: [
          route.steps[1]!.coordinates[0]!.longitude,
          route.steps[1]!.coordinates[0]!.latitude,
        ],
        zoom: 18,
        pitch: 60,
        offset: [0, 80],
        duration: 700,
      }),
    )

    adapter.setMode('2d')
    expect(easeTo).toHaveBeenLastCalledWith(
      expect.objectContaining({ pitch: 0, duration: 450 }),
    )
  })
})
