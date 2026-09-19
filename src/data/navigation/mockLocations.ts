import {
  createLocation,
  createLocationSearchResult,
} from '@/domain/navigation/factories'

export const mockLocations = Object.freeze([
  createLocation({
    id: 'coyote-gateway',
    label: 'Coyote Gateway',
    coordinates: { latitude: 43.6642, longitude: -116.6885 },
  }),
  createLocation({
    id: 'willow-commons',
    label: 'Willow Commons',
    coordinates: { latitude: 43.6664, longitude: -116.6852 },
  }),
  createLocation({
    id: 'ridge-library',
    label: 'Ridge Library',
    coordinates: { latitude: 43.6679, longitude: -116.6878 },
  }),
])

export const mockLocationSearchResults = Object.freeze(
  mockLocations.map((location) =>
    createLocationSearchResult({
      location,
      matchedText: location.label,
    }),
  ),
)
