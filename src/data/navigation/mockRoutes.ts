import { createRoute } from '@/domain/navigation/factories'

export const mockRoutes = Object.freeze([
  createRoute({
    id: 'campus-entrance-to-morrison-quadrangle',
    originLocationId: 'campus-entrance',
    destinationLocationId: 'morrison-quadrangle',
    coordinates: [
      { latitude: 43.6522, longitude: -116.6799 },
      { latitude: 43.6528, longitude: -116.6782 },
      { latitude: 43.6534, longitude: -116.6768 },
    ],
    distanceMeters: 190,
    estimatedDurationMinutes: 3,
  }),
  createRoute({
    id: 'campus-entrance-to-tertelings-library',
    originLocationId: 'campus-entrance',
    destinationLocationId: 'tertelings-library',
    coordinates: [
      { latitude: 43.6522, longitude: -116.6799 },
      { latitude: 43.6528, longitude: -116.6782 },
      { latitude: 43.6534, longitude: -116.6768 },
      { latitude: 43.6537, longitude: -116.6749 },
    ],
    distanceMeters: 330,
    estimatedDurationMinutes: 5,
  }),
  createRoute({
    id: 'morrison-quadrangle-to-tertelings-library',
    originLocationId: 'morrison-quadrangle',
    destinationLocationId: 'tertelings-library',
    coordinates: [
      { latitude: 43.6534, longitude: -116.6768 },
      { latitude: 43.6537, longitude: -116.6749 },
    ],
    distanceMeters: 160,
    estimatedDurationMinutes: 2,
  }),
])
