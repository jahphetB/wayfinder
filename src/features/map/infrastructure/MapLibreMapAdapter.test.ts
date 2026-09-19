import { vi } from 'vitest'

import type { MapLibreMapInstance } from './MapLibreMapAdapter'
import { MapLibreMapAdapter } from './MapLibreMapAdapter'

describe('MapLibreMapAdapter', () => {
  it('creates a 3D map and changes to 2D mode through its provider boundary', () => {
    const easeTo = vi.fn()
    const remove = vi.fn()
    const mapInstance: MapLibreMapInstance = {
      easeTo,
      remove,
    }
    const createMap = vi.fn(() => mapInstance)
    const adapter = new MapLibreMapAdapter({
      styleUrl: 'https://example.test/style.json',
      createMap,
    })
    const container = document.createElement('div')

    adapter.initialize(container, {
      center: { latitude: 43.6642, longitude: -116.6885 },
      zoom: 15,
      mode: '3d',
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
      styleUrl: 'https://example.test/style.json',
      createMap: vi.fn(),
    })

    expect(() => adapter.setMode('3d')).toThrow(
      'Map adapter must be initialized before use',
    )
  })
})
