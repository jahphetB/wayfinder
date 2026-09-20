import {
  collegeOfIdahoWalkingGraph,
  collegeOfIdahoWalkingGraphRelease,
} from './collegeOfIdahoWalkingGraph'
import { findShortestWalkingPath } from '@/domain/navigation/pathfinding'
import { mockLocations } from './mockLocations'

describe('College of Idaho walking graph', () => {
  it('labels current path data as illustrative rather than verified', () => {
    expect(collegeOfIdahoWalkingGraphRelease.provenance).toEqual({
      sourceDescription:
        'Location names were checked against the College of Idaho campus map; the N.L. Terteling Library coordinate was corroborated with OpenStreetMap-derived public map data. Path topology, distances, restrictions, and accessibility remain illustrative and are not campus-approved.',
      verificationStatus: 'illustrative',
      reviewedOn: '2026-09-20',
    })
  })

  it('represents each searchable mock location as a graph node', () => {
    const graphNodeIds = new Set(
      collegeOfIdahoWalkingGraph.nodes.map((node) => node.id),
    )

    expect(
      mockLocations.every((location) => graphNodeIds.has(location.id)),
    ).toBe(true)
  })

  it('keeps the publicly corroborated library coordinate consistent', () => {
    const libraryLocation = mockLocations.find(
      (location) => location.id === 'tertelings-library',
    )
    const libraryNode = collegeOfIdahoWalkingGraph.nodes.find(
      (node) => node.id === 'tertelings-library',
    )

    expect(libraryLocation).toMatchObject({
      label: 'N.L. Terteling Library',
      coordinates: { latitude: 43.65392, longitude: -116.67593 },
    })
    expect(libraryNode?.coordinates).toEqual(libraryLocation?.coordinates)
  })

  it('provides a shorter connected path to the library', () => {
    expect(
      findShortestWalkingPath(
        collegeOfIdahoWalkingGraph,
        'campus-entrance',
        'tertelings-library',
      ),
    ).toEqual({
      nodeIds: [
        'campus-entrance',
        'central-walkway',
        'morrison-quadrangle',
        'tertelings-library',
      ],
      edgeIds: [
        'campus-entrance-to-central-walkway',
        'central-walkway-to-morrison-quadrangle',
        'morrison-quadrangle-to-tertelings-library',
      ],
      distanceMeters: 330,
    })
  })
})
