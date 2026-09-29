import {
  collegeOfIdahoWalkingGraph,
  collegeOfIdahoWalkingGraphRelease,
} from './collegeOfIdahoWalkingGraph'
import { collegeOfIdahoWalkingGraphData } from './collegeOfIdahoWalkingGraphData'
import { findShortestWalkingPath } from '@/domain/navigation/pathfinding'
import { findWalkingRoute } from '@/domain/navigation/walkingRoutes'
import { calculateDistanceMeters } from '@/domain/navigation/locationVerification'
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
        collegeOfIdahoWalkingGraphData.provenance.sourceDescription,
      verificationStatus: 'illustrative',
      reviewedOn: '2026-09-28',
    })
    expect(
      collegeOfIdahoWalkingGraphRelease.provenance.sourceDescription,
    ).toContain('not been campus-approved')
    expect(
      collegeOfIdahoWalkingGraphRelease.provenance.sourceDescription,
    ).toContain('node 14229218101')
  })

  it('represents each searchable mock location as a graph node', () => {
    const graphNodeIds = new Set(
      collegeOfIdahoWalkingGraph.nodes.map((node) => node.id),
    )

    expect(
      mockLocations.every((location) => graphNodeIds.has(location.id)),
    ).toBe(true)
  })

  it('uses the mapped library entrance as the searchable destination', () => {
    const libraryLocation = mockLocations.find(
      (location) => location.id === 'cruzen-murray-library',
    )
    const libraryNode = collegeOfIdahoWalkingGraph.nodes.find(
      (node) => node.id === 'cruzen-murray-library',
    )

    expect(libraryLocation).toMatchObject({
      label: 'Cruzen-Murray Library',
      coordinates: { latitude: 43.6544341, longitude: -116.6768005 },
    })
    expect(libraryNode?.coordinates).toEqual(libraryLocation?.coordinates)
  })

  it('makes both Simplot entrances and the other current buildings routable', () => {
    expect(
      mockLocations
        .filter((location) =>
          [
            'blatchley-hall',
            'simplot-dining-hall',
            'simplot-residence-hall',
            'sterry-hall',
          ].includes(location.id),
        )
        .map((location) => location.label),
    ).toEqual([
      'Blatchley Hall',
      'Simplot Dining Hall',
      'Simplot Residence Hall',
      'Sterry Hall',
    ])

    for (const destinationLocationId of [
      'blatchley-hall',
      'simplot-dining-hall',
      'simplot-residence-hall',
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
    expect(route?.steps.at(-1)?.distanceMeters).toBe(61)
    expect(
      collegeOfIdahoWalkingGraphRelease.provenance.verificationStatus,
    ).toBe('illustrative')
  })

  it('keeps the two user-identified Simplot destinations at distinct entrances', () => {
    const cafeteria = findWalkingRoute(
      collegeOfIdahoWalkingGraph,
      'campus-entrance',
      'simplot-dining-hall',
    )
    const residence = findWalkingRoute(
      collegeOfIdahoWalkingGraph,
      'campus-entrance',
      'simplot-residence-hall',
    )

    expect(cafeteria?.coordinates.at(-1)).toEqual({
      latitude: 43.6528175,
      longitude: -116.6753616,
    })
    expect(residence?.coordinates.at(-1)).toEqual({
      latitude: 43.6533194,
      longitude: -116.6747409,
    })
  })

  it('selects the shorter connected footway route to the library', () => {
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
        'morrison-split',
        'east-fork',
        'north-junction',
        'cruzen-murray-library',
      ],
      edgeIds: [
        'campus-entrance-to-central-walkway',
        'central-walkway-to-morrison-split',
        'morrison-split-to-east-fork',
        'east-fork-to-north-junction',
        'north-junction-to-cruzen-murray-library',
      ],
      distanceMeters: 535,
    })
  })

  it('derives checkpoint steps from the mapped footway geometry', () => {
    const route = findWalkingRoute(
      collegeOfIdahoWalkingGraph,
      'campus-entrance',
      'cruzen-murray-library',
    )

    expect(route?.steps).toHaveLength(5)
    expect(route?.steps.map((step) => step.checkpoint.kind)).toEqual([
      'turn',
      'turn',
      'turn',
      'turn',
      'destination',
    ])
    expect(route?.coordinates[0]).toEqual({
      latitude: 43.6522,
      longitude: -116.6799,
    })
    expect(route?.coordinates[1]).toEqual({
      latitude: 43.652754,
      longitude: -116.6787884,
    })
    expect(route?.coordinates.at(-1)).toEqual({
      latitude: 43.6544341,
      longitude: -116.6768005,
    })
  })

  it('keeps each walking-edge distance consistent with its drawn geometry', () => {
    for (const edge of collegeOfIdahoWalkingGraph.edges) {
      const drawnMeters = edge.geometry
        .slice(1)
        .reduce((distance, point, index) => {
          const previous = edge.geometry[index]
          if (!previous) throw new Error(`Missing coordinate in ${edge.id}`)
          return distance + calculateDistanceMeters(previous, point)
        }, 0)

      expect(Math.abs(edge.distanceMeters - drawnMeters), edge.id).toBeLessThan(
        1,
      )
    }
  })
})
