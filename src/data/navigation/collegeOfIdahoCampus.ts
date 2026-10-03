import { createCoordinates } from '@/domain/navigation/factories'

export const collegeOfIdahoCampus = Object.freeze({
  name: 'The College of Idaho',
  address: '2112 Cleveland Blvd, Caldwell, ID 83605',
  // Library entrance in the supplied OSM export; Sterry Hall lies roughly south.
  center: createCoordinates({ latitude: 43.6544341, longitude: -116.6768005 }),
  bounds: Object.freeze({
    southwest: createCoordinates({ latitude: 43.6475, longitude: -116.682 }),
    northeast: createCoordinates({ latitude: 43.6595, longitude: -116.6705 }),
  }),
  initialZoom: 18,
  initialBearing: 185,
})
