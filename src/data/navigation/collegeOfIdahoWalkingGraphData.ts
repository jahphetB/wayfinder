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
        coordinates: { latitude: 43.6523682, longitude: -116.6777374 },
      },
      {
        id: 'morrison-quadrangle',
        coordinates: { latitude: 43.6531483, longitude: -116.6775964 },
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
        distanceMeters: 190,
        geometry: [
          { latitude: 43.6522, longitude: -116.6799 },
          { latitude: 43.6526291, longitude: -116.6786006 },
          { latitude: 43.6525551, longitude: -116.6784061 },
          { latitude: 43.6525365, longitude: -116.6783434 },
          { latitude: 43.6525306, longitude: -116.6782691 },
          { latitude: 43.6525478, longitude: -116.6781865 },
          { latitude: 43.6525296, longitude: -116.678091 },
          { latitude: 43.6525231, longitude: -116.6780644 },
          { latitude: 43.6524884, longitude: -116.6779233 },
          { latitude: 43.6524435, longitude: -116.6778194 },
          { latitude: 43.6523841, longitude: -116.6777507 },
          { latitude: 43.6523682, longitude: -116.6777374 },
        ],
        direction: 'bidirectional',
        availability: 'available',
        accessibility: 'unverified',
      },
      {
        id: 'central-walkway-to-morrison-quadrangle',
        fromNodeId: 'central-walkway',
        toNodeId: 'morrison-quadrangle',
        distanceMeters: 110,
        geometry: [
          { latitude: 43.6523682, longitude: -116.6777374 },
          { latitude: 43.6524034, longitude: -116.6776941 },
          { latitude: 43.6525006, longitude: -116.6775761 },
          { latitude: 43.6528485, longitude: -116.6771493 },
          { latitude: 43.652933, longitude: -116.6772767 },
          { latitude: 43.653107, longitude: -116.6775353 },
          { latitude: 43.6531483, longitude: -116.6775964 },
        ],
        direction: 'bidirectional',
        availability: 'available',
        accessibility: 'unverified',
      },
      {
        id: 'morrison-quadrangle-to-cruzen-murray-library',
        fromNodeId: 'morrison-quadrangle',
        toNodeId: 'cruzen-murray-library',
        distanceMeters: 190,
        geometry: [
          { latitude: 43.6531483, longitude: -116.6775964 },
          { latitude: 43.6536078, longitude: -116.6770193 },
          { latitude: 43.6536519, longitude: -116.6769639 },
          { latitude: 43.6537635, longitude: -116.67713 },
          { latitude: 43.653819, longitude: -116.6770667 },
          { latitude: 43.6538615, longitude: -116.6770667 },
          { latitude: 43.6541047, longitude: -116.6767581 },
          { latitude: 43.6541643, longitude: -116.676845 },
          { latitude: 43.6541642, longitude: -116.6765775 },
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
        distanceMeters: 400,
        geometry: [
          { latitude: 43.6523682, longitude: -116.6777374 },
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
      'Published location names were checked against College of Idaho sources. Cruzen-Murray Library identity and coordinate were corroborated with Google Maps and OpenStreetMap-derived public map data. Prototype path shapes were aligned to visible OpenStreetMap footways on 2026-09-24, with a temporary connector from the off-walkway campus entrance. Distances, restrictions, accessibility, entrance connections, and physical accuracy remain illustrative and are not campus-approved.',
    verificationStatus: 'illustrative',
    reviewedOn: '2026-09-24',
  },
} satisfies CollegeOfIdahoWalkingGraphData
