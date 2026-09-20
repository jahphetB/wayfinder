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
    id: 'tertelings-library',
    label: 'N.L. Terteling Library',
    coordinates: { latitude: 43.65392, longitude: -116.67593 },
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
