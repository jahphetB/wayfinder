import type { StyleSpecification } from 'maplibre-gl'

import type { MapAdapterFactory } from '@/features/map/contracts/MapAdapter'
import { MapLibreMapAdapter } from '@/features/map/infrastructure/MapLibreMapAdapter'
import { MapLibreGeoreferencedBuildingLayer } from '@/features/map/infrastructure/MapLibreGeoreferencedBuildingLayer'
import { libraryPrototypeBuilding } from '@/data/scene/libraryPrototypeBuilding'
import { campusBuildingDetails } from '@/data/campus/buildingDetails'

const defaultMapStyle = {
  version: 8,
  sources: {
    openStreetMap: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 19,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'open-street-map',
      type: 'raster',
      source: 'openStreetMap',
    },
  ],
} satisfies StyleSpecification

export const createMapAdapter: MapAdapterFactory = () =>
  new MapLibreMapAdapter({
    style: import.meta.env.VITE_MAP_STYLE_URL ?? defaultMapStyle,
    buildings: campusBuildingDetails,
    campusLayer: new MapLibreGeoreferencedBuildingLayer(
      libraryPrototypeBuilding,
    ),
  })
