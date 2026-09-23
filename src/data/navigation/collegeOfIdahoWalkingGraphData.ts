import type { Location, WalkingGraphRelease } from '@/domain/navigation/types'

interface CollegeOfIdahoWalkingGraphData extends WalkingGraphRelease {
  readonly locations: readonly Pick<Location, 'id' | 'label'>[]
}

/**
 * Editable campus graph dataset. Replace these records with reviewed source
 * data; the loader validates them before routing code can use them.
 */
export const collegeOfIdahoWalkingGraphData = {
  locations: [
    { id: 'campus-entrance', label: 'Campus Entrance' },
    {
      id: 'morrison-quadrangle',
      label: 'Morrison Quadrangle & Clock Tower',
    },
    { id: 'cruzen-murray-library', label: 'Cruzen-Murray Library' },
  ],
  graph: {
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
        id: 'cruzen-murray-library',
        coordinates: { latitude: 43.6545, longitude: -116.67654 },
      },
    ],
    edges: [
      {
        id: 'campus-entrance-to-central-walkway',
        fromNodeId: 'campus-entrance',
        toNodeId: 'central-walkway',
        distanceMeters: 90,
        geometry: [
          { latitude: 43.6522, longitude: -116.6799 },
          { latitude: 43.65245, longitude: -116.67915 },
          { latitude: 43.6528, longitude: -116.6782 },
        ],
        direction: 'bidirectional',
        availability: 'available',
        accessibility: 'unverified',
      },
      {
        id: 'central-walkway-to-morrison-quadrangle',
        fromNodeId: 'central-walkway',
        toNodeId: 'morrison-quadrangle',
        distanceMeters: 100,
        geometry: [
          { latitude: 43.6528, longitude: -116.6782 },
          { latitude: 43.653, longitude: -116.6775 },
          { latitude: 43.6534, longitude: -116.6768 },
        ],
        direction: 'bidirectional',
        availability: 'available',
        accessibility: 'unverified',
      },
      {
        id: 'morrison-quadrangle-to-cruzen-murray-library',
        fromNodeId: 'morrison-quadrangle',
        toNodeId: 'cruzen-murray-library',
        distanceMeters: 140,
        geometry: [
          { latitude: 43.6534, longitude: -116.6768 },
          { latitude: 43.6539, longitude: -116.67665 },
          { latitude: 43.6545, longitude: -116.67654 },
        ],
        direction: 'bidirectional',
        availability: 'available',
        accessibility: 'unverified',
      },
      {
        id: 'central-walkway-to-cruzen-murray-library-long-way',
        fromNodeId: 'central-walkway',
        toNodeId: 'cruzen-murray-library',
        distanceMeters: 300,
        geometry: [
          { latitude: 43.6528, longitude: -116.6782 },
          { latitude: 43.6527, longitude: -116.6765 },
          { latitude: 43.6538, longitude: -116.6759 },
          { latitude: 43.6545, longitude: -116.67654 },
        ],
        direction: 'bidirectional',
        availability: 'available',
        accessibility: 'unverified',
      },
    ],
  },
  provenance: {
    sourceDescription:
      'Published location names were checked against College of Idaho sources. Cruzen-Murray Library identity and coordinate were corroborated with Google Maps and OpenStreetMap-derived public map data. Path topology, distances, restrictions, and accessibility remain illustrative and are not campus-approved.',
    verificationStatus: 'illustrative',
    reviewedOn: '2026-09-20',
  },
} satisfies CollegeOfIdahoWalkingGraphData
