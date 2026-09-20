import { createWalkingGraph } from '@/domain/navigation/factories'

// Illustrative prototype topology only. Replace after campus path verification.
export const collegeOfIdahoWalkingGraph = createWalkingGraph({
  nodes: [
    {
      id: 'campus-entrance',
      coordinates: { latitude: 43.6522, longitude: -116.6799 },
    },
    {
      id: 'central-walkway',
      coordinates: { latitude: 43.6528, longitude: -116.6782 },
    },
    {
      id: 'morrison-quadrangle',
      coordinates: { latitude: 43.6534, longitude: -116.6768 },
    },
    {
      id: 'tertelings-library',
      coordinates: { latitude: 43.6537, longitude: -116.6749 },
    },
  ],
  edges: [
    {
      id: 'campus-entrance-to-central-walkway',
      fromNodeId: 'campus-entrance',
      toNodeId: 'central-walkway',
      distanceMeters: 90,
    },
    {
      id: 'central-walkway-to-morrison-quadrangle',
      fromNodeId: 'central-walkway',
      toNodeId: 'morrison-quadrangle',
      distanceMeters: 100,
    },
    {
      id: 'morrison-quadrangle-to-tertelings-library',
      fromNodeId: 'morrison-quadrangle',
      toNodeId: 'tertelings-library',
      distanceMeters: 140,
    },
    {
      id: 'central-walkway-to-tertelings-library-long-way',
      fromNodeId: 'central-walkway',
      toNodeId: 'tertelings-library',
      distanceMeters: 300,
    },
  ],
})
