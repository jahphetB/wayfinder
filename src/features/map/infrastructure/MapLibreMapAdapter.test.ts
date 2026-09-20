import { vi } from 'vitest'

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
})
