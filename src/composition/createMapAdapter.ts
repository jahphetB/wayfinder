import type { MapAdapterFactory } from '@/features/map/contracts/MapAdapter'
import { MapLibreMapAdapter } from '@/features/map/infrastructure/MapLibreMapAdapter'

const defaultMapStyleUrl = 'https://demotiles.maplibre.org/style.json'

export const createMapAdapter: MapAdapterFactory = () =>
  new MapLibreMapAdapter({
    styleUrl: import.meta.env.VITE_MAP_STYLE_URL ?? defaultMapStyleUrl,
  })
