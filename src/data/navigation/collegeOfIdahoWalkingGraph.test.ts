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
      sourceDescription:
        'Published location names were checked against College of Idaho sources. Cruzen-Murray Library identity and coordinate were corroborated with Google Maps and OpenStreetMap-derived public map data. Path topology, distances, restrictions, and accessibility remain illustrative and are not campus-approved.',
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
      distanceMeters: 330,
    })
  })

  it('preserves illustrative edge geometry and creates checkpoint steps', () => {
    const route = findWalkingRoute(
      collegeOfIdahoWalkingGraph,
      'campus-entrance',
      'cruzen-murray-library',
    )

    expect(route?.coordinates).toHaveLength(7)
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
    expect(route?.coordinates.at(-1)).toEqual({
      latitude: 43.6545,
      longitude: -116.67654,
    })
  })
})
