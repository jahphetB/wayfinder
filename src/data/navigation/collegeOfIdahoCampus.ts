import { createCoordinates } from '@/domain/navigation/factories'

export const collegeOfIdahoCampus = Object.freeze({
  name: 'The College of Idaho',
  address: '2112 Cleveland Blvd, Caldwell, ID 83605',
  center: createCoordinates({ latitude: 43.6526, longitude: -116.676 }),
  bounds: Object.freeze({
    southwest: createCoordinates({ latitude: 43.6495, longitude: -116.682 }),
    northeast: createCoordinates({ latitude: 43.6575, longitude: -116.6705 }),
  }),
  initialZoom: 17.2,
})
