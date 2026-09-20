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
        'Illustrative prototype topology created from project mock locations; not campus-approved.',
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
