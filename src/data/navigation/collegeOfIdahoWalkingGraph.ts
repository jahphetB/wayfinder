import {
  createWalkingGraph,
  createWalkingGraphRelease,
} from '@/domain/navigation/factories'

const walkingGraph = createWalkingGraph({
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
      direction: 'bidirectional',
      availability: 'available',
      accessibility: 'unverified',
    },
    {
      id: 'central-walkway-to-morrison-quadrangle',
      fromNodeId: 'central-walkway',
      toNodeId: 'morrison-quadrangle',
      distanceMeters: 100,
      direction: 'bidirectional',
      availability: 'available',
      accessibility: 'unverified',
    },
    {
      id: 'morrison-quadrangle-to-tertelings-library',
      fromNodeId: 'morrison-quadrangle',
      toNodeId: 'tertelings-library',
      distanceMeters: 140,
      direction: 'bidirectional',
      availability: 'available',
      accessibility: 'unverified',
    },
    {
      id: 'central-walkway-to-tertelings-library-long-way',
      fromNodeId: 'central-walkway',
      toNodeId: 'tertelings-library',
      distanceMeters: 300,
      direction: 'bidirectional',
      availability: 'available',
      accessibility: 'unverified',
    },
  ],
})

export const collegeOfIdahoWalkingGraphRelease = createWalkingGraphRelease({
  graph: walkingGraph,
  provenance: {
    sourceDescription:
      'Illustrative prototype topology created from project mock locations; not campus-approved.',
    verificationStatus: 'illustrative',
    reviewedOn: '2026-09-20',
  },
})

export const collegeOfIdahoWalkingGraph =
  collegeOfIdahoWalkingGraphRelease.graph
