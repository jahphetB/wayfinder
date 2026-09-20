import {
  createLocation,
  createLocationSearchResult,
} from '@/domain/navigation/factories'

export const mockLocations = Object.freeze([
  createLocation({
    id: 'campus-entrance',
    label: 'Campus Entrance',
    coordinates: { latitude: 43.6522, longitude: -116.6799 },
  }),
  createLocation({
    id: 'morrison-quadrangle',
    label: 'Morrison Quadrangle & Clock Tower',
    coordinates: { latitude: 43.6534, longitude: -116.6768 },
  }),
  createLocation({
    id: 'cruzen-murray-library',
    label: 'Cruzen-Murray Library',
    coordinates: { latitude: 43.6545, longitude: -116.67654 },
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
