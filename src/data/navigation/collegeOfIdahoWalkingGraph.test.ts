import {
  collegeOfIdahoWalkingGraph,
  collegeOfIdahoWalkingGraphRelease,
} from './collegeOfIdahoWalkingGraph'
import { collegeOfIdahoWalkingGraphData } from './collegeOfIdahoWalkingGraphData'
import { findShortestWalkingPath } from '@/domain/navigation/pathfinding'
import { findWalkingRoute } from '@/domain/navigation/walkingRoutes'
import { mockLocations } from './mockLocations'

describe('College of Idaho walking graph', () => {
  it('loads the editable dataset through the validated graph boundary', () => {
    expect(collegeOfIdahoWalkingGraphRelease).toMatchObject({
      graph: collegeOfIdahoWalkingGraphData.graph,
      provenance: collegeOfIdahoWalkingGraphData.provenance,
    })
    expect(collegeOfIdahoWalkingGraphRelease.graph).not.toBe(
      collegeOfIdahoWalkingGraphData.graph,
    )
  })

  it('labels current path data as illustrative rather than verified', () => {
    expect(collegeOfIdahoWalkingGraphRelease.provenance).toEqual({
      sourceDescription: expect.stringContaining('not campus-approved'),
      verificationStatus: 'illustrative',
      reviewedOn: '2026-09-28',
    })
    expect(
      collegeOfIdahoWalkingGraphRelease.provenance.sourceDescription,
    ).toContain('entrance node 14229217297')
  })

  it('represents each searchable mock location as a graph node', () => {
    const graphNodeIds = new Set(
      collegeOfIdahoWalkingGraph.nodes.map((node) => node.id),
    )

    expect(
      mockLocations.every((location) => graphNodeIds.has(location.id)),
    ).toBe(true)
  })

  it('keeps the publicly corroborated current-library coordinate consistent', () => {
    const libraryLocation = mockLocations.find(
      (location) => location.id === 'cruzen-murray-library',
    )
    const libraryNode = collegeOfIdahoWalkingGraph.nodes.find(
      (node) => node.id === 'cruzen-murray-library',
    )

    expect(libraryLocation).toMatchObject({
      label: 'Cruzen-Murray Library',
      coordinates: { latitude: 43.6545, longitude: -116.67654 },
    })
    expect(libraryNode?.coordinates).toEqual(libraryLocation?.coordinates)
  })

  it('makes three additional campus buildings searchable and routable', () => {
    expect(
      mockLocations
        .filter((location) =>
          ['blatchley-hall', 'simplot-dining-hall', 'sterry-hall'].includes(
            location.id,
          ),
        )
        .map((location) => location.label),
    ).toEqual(['Blatchley Hall', 'Simplot Dining Hall', 'Sterry Hall'])

    for (const destinationLocationId of [
      'blatchley-hall',
      'simplot-dining-hall',
      'sterry-hall',
    ]) {
      expect(
        findWalkingRoute(
          collegeOfIdahoWalkingGraph,
          'campus-entrance',
          destinationLocationId,
        ),
      ).toMatchObject({
        originLocationId: 'campus-entrance',
        destinationLocationId,
      })
    }
  })

  it('previews Blatchley Hall at the mapped main entrance with a short connector', () => {
    const entrance = { latitude: 43.652507, longitude: -116.675338 }
    const blatchleyNode = collegeOfIdahoWalkingGraph.nodes.find(
      (node) => node.id === 'blatchley-hall',
    )
    const route = findWalkingRoute(
      collegeOfIdahoWalkingGraph,
      'campus-entrance',
      'blatchley-hall',
    )

    expect(blatchleyNode?.coordinates).toEqual(entrance)
    expect(route?.coordinates.at(-2)).toEqual({
      latitude: 43.6525363,
      longitude: -116.6753107,
    })
    expect(route?.coordinates.at(-1)).toEqual(entrance)
    expect(route?.steps.at(-1)?.distanceMeters).toBe(275)
    expect(
      collegeOfIdahoWalkingGraphRelease.provenance.verificationStatus,
    ).toBe('illustrative')
  })

  it('provides a shorter connected path to the current library', () => {
    expect(
      findShortestWalkingPath(
        collegeOfIdahoWalkingGraph,
        'campus-entrance',
        'cruzen-murray-library',
      ),
    ).toEqual({
      nodeIds: [
        'campus-entrance',
        'central-walkway',
        'morrison-quadrangle',
        'cruzen-murray-library',
      ],
      edgeIds: [
        'campus-entrance-to-central-walkway',
        'central-walkway-to-morrison-quadrangle',
        'morrison-quadrangle-to-cruzen-murray-library',
      ],
      distanceMeters: 490,
    })
  })

  it('preserves illustrative edge geometry and creates checkpoint steps', () => {
    const route = findWalkingRoute(
      collegeOfIdahoWalkingGraph,
      'campus-entrance',
      'cruzen-murray-library',
    )

    expect(route?.coordinates).toHaveLength(27)
    expect(route?.steps).toHaveLength(3)
    expect(route?.steps.map((step) => step.checkpoint.kind)).toEqual([
      'turn',
      'turn',
      'destination',
    ])
    expect(route?.coordinates[0]).toEqual({
      latitude: 43.6522,
      longitude: -116.6799,
    })
    expect(route?.coordinates[1]).toEqual({
      latitude: 43.6526291,
      longitude: -116.6786006,
    })
    expect(route?.coordinates.at(-1)).toEqual({
      latitude: 43.6545,
      longitude: -116.67654,
    })
  })
})
