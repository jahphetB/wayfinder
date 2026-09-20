import { collegeOfIdahoWalkingGraph } from './collegeOfIdahoWalkingGraph'
import { findShortestWalkingPath } from '@/domain/navigation/pathfinding'

describe('College of Idaho walking graph', () => {
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
