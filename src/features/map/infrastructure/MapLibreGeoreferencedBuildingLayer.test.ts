import type { CustomRenderMethodInput, Map as MapLibreMap } from 'maplibre-gl'
import { vi } from 'vitest'

import type { GeoreferencedBuilding } from '@/features/map/contracts/GeoreferencedBuilding'

import { MapLibreGeoreferencedBuildingLayer } from './MapLibreGeoreferencedBuildingLayer'

const building: GeoreferencedBuilding = {
  id: 'test-building',
  label: 'Test building',
  anchor: { latitude: 43.6526, longitude: -116.676 },
  altitudeMeters: 0,
  headingDegrees: 0,
  dimensionsMeters: { width: 20, depth: 10, height: 8 },
  color: '#d9a441',
  verificationStatus: 'illustrative',
}

describe('MapLibreGeoreferencedBuildingLayer', () => {
  it('shares the map canvas and renderer while visible', () => {
    const render = vi.fn()
    const resetState = vi.fn()
    const dispose = vi.fn()
    const renderer = { autoClear: true, render, resetState, dispose }
    const createRenderer = vi.fn(() => renderer)
    const canvas = document.createElement('canvas')
    const triggerRepaint = vi.fn()
    const map = {
      getCanvas: () => canvas,
      triggerRepaint,
    } as unknown as MapLibreMap
    const layer = new MapLibreGeoreferencedBuildingLayer(building, {
      createRenderer,
    })

    layer.onAdd?.(map, {} as WebGL2RenderingContext)
    layer.render({} as WebGL2RenderingContext, renderOptions())
    layer.setVisible(false)
    layer.render({} as WebGL2RenderingContext, renderOptions())
    layer.onRemove?.()

    expect(createRenderer).toHaveBeenCalledWith({
      antialias: true,
      canvas,
      context: {},
    })
    expect(renderer.autoClear).toBe(false)
    expect(resetState).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledTimes(1)
    expect(triggerRepaint).toHaveBeenCalledTimes(1)
    expect(dispose).toHaveBeenCalledTimes(1)
  })
})

function renderOptions(): CustomRenderMethodInput {
  return {
    farZ: 1,
    nearZ: 0,
    fov: 1,
    modelViewProjectionMatrix: identityMatrix(),
    projectionMatrix: identityMatrix(),
    shaderData: {
      variantName: 'mercator',
      vertexShaderPrelude: '',
      define: '',
    },
    defaultProjectionData: {
      mainMatrix: identityMatrix(),
      tileMercatorCoords: [0, 0, 1, 1],
      clippingPlane: [0, 0, 0, 0],
      projectionTransition: 0,
      fallbackMatrix: identityMatrix(),
      clipAntimeridian: false,
    },
    getProjectionData: vi.fn(),
  }
}

function identityMatrix(): Float32Array {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
}
