import osmSnapshot from './campusOsmNetwork.json'
import {
  collegeOfIdahoWalkingGraph,
  collegeOfIdahoWalkingGraphRelease,
} from './collegeOfIdahoWalkingGraph'
import { mockLocations } from './mockLocations'
import { calculateDistanceMeters } from '@/domain/navigation/locationVerification'
import { findShortestWalkingPath } from '@/domain/navigation/pathfinding'
import { findWalkingRoute } from '@/domain/navigation/walkingRoutes'

describe('imported campus walking graph', () => {
  it('loads the reviewed source without claiming verified access', () => {
    expect(osmSnapshot.source).toMatchObject({
      sha256:
        '03B9BD752A588BFF7CB04A87B06D417736E1BFBC49091AFD9EF8452A88C0B40C',
      connectedWayCount: 181,
      connectedNodeCount: 565,
    })
    expect(osmSnapshot.ways.filter(({ kind }) => kind === 'main')).toHaveLength(
      10,
    )
    expect(collegeOfIdahoWalkingGraphRelease.provenance).toMatchObject({
      verificationStatus: 'illustrative',
      reviewedOn: '2026-10-01',
    })
  })

  it('lists the mapped campus places without the invented gate', () => {
    const nodeIds = new Set(
      collegeOfIdahoWalkingGraph.nodes.map(({ id }) => id),
    )
    expect(mockLocations).toHaveLength(50)
    expect(mockLocations.every(({ id }) => nodeIds.has(id))).toBe(true)
    const labels = mockLocations.map(({ label }) => label)
    expect(labels).toContain('West Hall')
    expect(labels).toContain('Mustard Apartments')
    expect(labels).toContain('JAAC Parking Lot')
    expect(labels).toContain('J.A. Albertson Swimming Pool')
    expect(labels).toContain('Tennis Court 1')
    expect(labels).toContain('Pickleball Court 2')
    expect(labels).toContain('Beach Volleyball Court 1')
    expect(labels).toContain('Basketball Court')
    expect(labels).not.toContain('Campus Entrance')
  })

  it('keeps every new mapped court connected to the pedestrian graph', () => {
    const courtIds = mockLocations
      .filter(({ id }) => id.includes('court'))
      .map(({ id }) => id)
    expect(courtIds).toHaveLength(8)
    for (const destinationId of courtIds) {
      expect(
        findWalkingRoute(
          collegeOfIdahoWalkingGraph,
          'cruzen-murray-library',
          destinationId,
        ),
      ).toBeDefined()
    }
  })

  it('targets the mapped Beach Volleyball Court 2 gate', () => {
    const court = mockLocations.find(
      ({ id }) => id === 'beach-volleyball-court-2',
    )
    expect(court?.coordinates).toEqual({
      latitude: osmSnapshot.nodes['14239949034'][0],
      longitude: osmSnapshot.nodes['14239949034'][1],
    })
    expect(
      collegeOfIdahoWalkingGraph.edges.find(
        ({ id }) => id === 'connector:beach-volleyball-court-2',
      )?.accessibility,
    ).toBe('unverified')
  })

  it('uses the student entrance at Anderson and distinct JAAC/pool entrances', () => {
    const point = (id: string) =>
      mockLocations.find((place) => place.id === id)?.coordinates
    expect(point('anderson-residence-hall')).toEqual({
      latitude: 43.652427,
      longitude: -116.673779,
    })
    expect(point('ja-albertson-activities-center')).toEqual({
      latitude: 43.6520813,
      longitude: -116.6751117,
    })
    expect(point('jaac-swimming-pool')).toEqual({
      latitude: 43.6518337,
      longitude: -116.6757321,
    })
  })

  it('routes between the library and every listed place', () => {
    const origin = mockLocations.find(
      ({ id }) => id === 'cruzen-murray-library',
    )
    if (!origin) throw new Error('Missing library')
    for (const destination of mockLocations) {
      if (destination.id === origin.id) continue
      const route = findWalkingRoute(
        collegeOfIdahoWalkingGraph,
        origin.id,
        destination.id,
      )
      expect(route, destination.label).toBeDefined()
      expect(route?.coordinates[0]).toEqual(origin.coordinates)
      expect(route?.coordinates.at(-1)).toEqual(destination.coordinates)
      expect(route?.steps.at(-1)?.checkpoint.kind).toBe('destination')
    }
  })

  it('uses main paths, not informal shortcuts, from the library to cafeteria', () => {
    const path = findShortestWalkingPath(
      collegeOfIdahoWalkingGraph,
      'cruzen-murray-library',
      'simplot-dining-hall',
    )
    if (!path) throw new Error('Missing cafeteria route')
    const selected = path.edgeIds.map((id) =>
      collegeOfIdahoWalkingGraph.edges.find((edge) => edge.id === id),
    )
    expect(selected.some((edge) => edge?.pathKind === 'main')).toBe(true)
    expect(selected.every((edge) => edge?.pathKind !== 'informal')).toBe(true)
    const route = findWalkingRoute(
      collegeOfIdahoWalkingGraph,
      'cruzen-murray-library',
      'simplot-dining-hall',
    )
    if (!route) throw new Error('Missing cafeteria route')
    const drawnMeters = route.coordinates
      .slice(1)
      .reduce(
        (total, point, index) =>
          total + calculateDistanceMeters(route.coordinates[index]!, point),
        0,
      )
    expect(Math.abs(drawnMeters - route.distanceMeters)).toBeLessThan(0.01)
  })

  it('distinguishes inferred links from observed path geometry', () => {
    const connectors = collegeOfIdahoWalkingGraph.edges.filter(
      ({ pathKind }) => pathKind === 'connector',
    )
    expect(connectors.length).toBeGreaterThan(0)
    expect(connectors.map(({ id }) => id)).not.toContain(
      'connector:campus-entrance',
    )
    expect(
      connectors.every(({ accessibility }) => accessibility === 'unverified'),
    ).toBe(true)
    expect(
      collegeOfIdahoWalkingGraph.edges.some(
        ({ pathKind }) => pathKind === 'informal',
      ),
    ).toBe(true)
  })
})
