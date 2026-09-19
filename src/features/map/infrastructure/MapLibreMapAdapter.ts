import {
  Map as MapLibreMap,
  type EaseToOptions,
  type MapOptions,
} from 'maplibre-gl'

import type { MapMode } from '@/domain/navigation/types'
import type {
  MapAdapter,
  MapInitialView,
} from '@/features/map/contracts/MapAdapter'

export interface MapLibreMapInstance {
  easeTo(options: EaseToOptions): unknown
  remove(): void
}

export type MapLibreMapFactory = (options: MapOptions) => MapLibreMapInstance

export interface MapLibreMapAdapterOptions {
  readonly styleUrl: string
  readonly createMap?: MapLibreMapFactory
}

const defaultMapFactory: MapLibreMapFactory = (options) =>
  new MapLibreMap(options)

export class MapLibreMapAdapter implements MapAdapter {
  private map: MapLibreMapInstance | undefined

  private readonly createMap: MapLibreMapFactory

  constructor(private readonly options: MapLibreMapAdapterOptions) {
    this.createMap = options.createMap ?? defaultMapFactory
  }

  initialize(container: HTMLElement, initialView: MapInitialView): void {
    if (this.map) {
      throw new Error('Map adapter has already been initialized')
    }

    this.map = this.createMap({
      container,
      style: this.options.styleUrl,
      center: [initialView.center.longitude, initialView.center.latitude],
      zoom: initialView.zoom,
      ...cameraForMode(initialView.mode),
    })
  }

  setMode(mode: MapMode): void {
    this.requireMap().easeTo({
      ...cameraForMode(mode),
      duration: 450,
    })
  }

  destroy(): void {
    this.map?.remove()
    this.map = undefined
  }

  private requireMap(): MapLibreMapInstance {
    if (!this.map) {
      throw new Error('Map adapter must be initialized before use')
    }

    return this.map
  }
}

function cameraForMode(mode: MapMode): EaseToOptions {
  if (mode === '3d') {
    return { bearing: -20, pitch: 60 }
  }

  return { bearing: 0, pitch: 0 }
}
