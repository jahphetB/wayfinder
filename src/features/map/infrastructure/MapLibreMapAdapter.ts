import {
  Map as MapLibreMap,
  setWorkerUrl,
  type EaseToOptions,
  type MapOptions,
} from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

import type { MapMode } from '@/domain/navigation/types'
import type {
  MapAdapter,
  MapContent,
  MapInitialView,
} from '@/features/map/contracts/MapAdapter'

export interface MapLibreMapInstance {
  easeTo(options: EaseToOptions): unknown
  on(event: 'load', listener: () => void): unknown
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
  readonly style: NonNullable<MapOptions['style']>
  readonly createMap?: MapLibreMapFactory
}

setWorkerUrl(workerUrl)

const defaultMapFactory: MapLibreMapFactory = (options) =>
  new MapLibreMap(options)

export class MapLibreMapAdapter implements MapAdapter {
  private map: MapLibreMapInstance | undefined

  private isReady = false

  private content: MapContent = {
    origin: undefined,
    destination: undefined,
    route: undefined,
  }

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
      style: this.options.style,
      center: [initialView.center.longitude, initialView.center.latitude],
      zoom: initialView.zoom,
      ...cameraForMode(initialView.mode),
    })
    this.map.on('load', () => {
      this.isReady = true
      this.syncContent()
    })
  }

  setMode(mode: MapMode): void {
    this.requireMap().easeTo({
      ...cameraForMode(mode),
      duration: 450,
    })
  }

  setContent(content: MapContent): void {
    this.content = content
    if (this.isReady) this.syncContent()
  }

  destroy(): void {
    this.map?.remove()
    this.map = undefined
    this.isReady = false
  }

  private requireMap(): MapLibreMapInstance {
    if (!this.map) {
      throw new Error('Map adapter must be initialized before use')
    }

    return this.map
  }

  private syncContent(): void {
    const map = this.requireMap()
    const routeData = {
      type: 'FeatureCollection',
      features: this.content.route
        ? [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: this.content.route.coordinates.map((point) => [
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
    const locationData = {
      type: 'FeatureCollection',
      features: locations.map((location) => ({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [
            location.coordinates.longitude,
            location.coordinates.latitude,
          ],
        },
      })),
    }
    const routeSource = map.getSource('yote-route')
    if (isGeoJsonSource(routeSource)) routeSource.setData(routeData)
    else map.addSource('yote-route', { type: 'geojson', data: routeData })
    const locationSource = map.getSource('yote-locations')
    if (isGeoJsonSource(locationSource)) locationSource.setData(locationData)
    else
      map.addSource('yote-locations', { type: 'geojson', data: locationData })
    if (!map.getLayer('yote-route-line'))
      map.addLayer({
        id: 'yote-route-line',
        type: 'line',
        source: 'yote-route',
        paint: { 'line-color': '#155f3a', 'line-width': 6 },
      })
    if (!map.getLayer('yote-location-points'))
      map.addLayer({
        id: 'yote-location-points',
        type: 'circle',
        source: 'yote-locations',
        paint: {
          'circle-radius': 8,
          'circle-color': '#ef694c',
          'circle-stroke-color': '#fff',
          'circle-stroke-width': 3,
        },
      })
    if (this.content.route) {
      const longitudes = this.content.route.coordinates.map(
        (point) => point.longitude,
      )
      const latitudes = this.content.route.coordinates.map(
        (point) => point.latitude,
      )
      map.fitBounds(
        [
          [Math.min(...longitudes), Math.min(...latitudes)],
          [Math.max(...longitudes), Math.max(...latitudes)],
        ],
        { padding: 80, maxZoom: 16, duration: 700 },
      )
    }
  }
}

function cameraForMode(mode: MapMode): EaseToOptions {
  if (mode === '3d') {
    return { bearing: -20, pitch: 60 }
  }

  return { bearing: 0, pitch: 0 }
}

function isGeoJsonSource(
  value: unknown,
): value is { setData(data: object): void } {
  return typeof value === 'object' && value !== null && 'setData' in value
}
