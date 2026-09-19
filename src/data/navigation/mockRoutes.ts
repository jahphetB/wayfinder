import { createRoute } from '@/domain/navigation/factories'

export const mockRoutes = Object.freeze([
  createRoute({
    id: 'coyote-gateway-to-willow-commons',
    originLocationId: 'coyote-gateway',
    destinationLocationId: 'willow-commons',
    coordinates: [
      { latitude: 43.6642, longitude: -116.6885 },
      { latitude: 43.6657, longitude: -116.6863 },
      { latitude: 43.6664, longitude: -116.6852 },
    ],
    distanceMeters: 420,
    estimatedDurationMinutes: 6,
  }),
  createRoute({
    id: 'coyote-gateway-to-ridge-library',
    originLocationId: 'coyote-gateway',
    destinationLocationId: 'ridge-library',
    coordinates: [
      { latitude: 43.6642, longitude: -116.6885 },
      { latitude: 43.6652, longitude: -116.6871 },
      { latitude: 43.6664, longitude: -116.6852 },
      { latitude: 43.6672, longitude: -116.6866 },
      { latitude: 43.6679, longitude: -116.6878 },
    ],
    distanceMeters: 610,
    estimatedDurationMinutes: 8,
  }),
  createRoute({
    id: 'willow-commons-to-ridge-library',
    originLocationId: 'willow-commons',
    destinationLocationId: 'ridge-library',
    coordinates: [
      { latitude: 43.6664, longitude: -116.6852 },
      { latitude: 43.6672, longitude: -116.6866 },
      { latitude: 43.6679, longitude: -116.6878 },
    ],
    distanceMeters: 380,
    estimatedDurationMinutes: 5,
  }),
])
