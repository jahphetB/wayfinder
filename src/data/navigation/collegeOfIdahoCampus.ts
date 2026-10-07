import { createCoordinates } from '@/domain/navigation/factories'

export const collegeOfIdahoCampus = Object.freeze({
  name: 'The College of Idaho',
  address: '2112 Cleveland Blvd, Caldwell, ID 83605',
  // Library entrance in the supplied OSM export; Sterry Hall lies roughly south.
  center: createCoordinates({ latitude: 43.6544341, longitude: -116.6768005 }),
  bounds: Object.freeze({
    southwest: createCoordinates({ latitude: 43.6475, longitude: -116.682 }),
    northeast: createCoordinates({ latitude: 43.6595, longitude: -116.6695 }),
  }),
  // Frame the mapped campus facilities and both stadium outlines on opening.
  overviewBounds: Object.freeze({
    southwest: createCoordinates({ latitude: 43.65065, longitude: -116.6807 }),
    northeast: createCoordinates({ latitude: 43.65565, longitude: -116.66985 }),
  }),
  initialZoom: 18,
  initialBearing: 185,
})
