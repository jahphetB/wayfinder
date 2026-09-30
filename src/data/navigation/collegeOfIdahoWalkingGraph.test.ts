import osmSnapshot from './campusOsmNetwork.json'
import {
  collegeOfIdahoWalkingGraph,
  collegeOfIdahoWalkingGraphRelease,
} from './collegeOfIdahoWalkingGraph'
import { collegeOfIdahoWalkingGraphData } from './collegeOfIdahoWalkingGraphData'
import { mockLocations } from './mockLocations'
import { calculateDistanceMeters } from '@/domain/navigation/locationVerification'
import { findWalkingRoute } from '@/domain/navigation/walkingRoutes'

describe('imported campus walking graph', () => {
  it('loads a validated, illustrative snapshot of the new OSM export', () => {
    expect(osmSnapshot.source).toMatchObject({
      sha256:
        '8B0EC753640275B3177D2C2514862B41EB7EB78228E870C16BED58C0276A2FEE',
      connectedWayCount: 184,
      connectedNodeCount: 581,
    })
    expect(collegeOfIdahoWalkingGraphRelease).toMatchObject({
      provenance: {
        verificationStatus: 'illustrative',
        reviewedOn: '2026-09-29',
      },
    })
    expect(collegeOfIdahoWalkingGraphRelease.graph).not.toBe(
      collegeOfIdahoWalkingGraphData.graph,
    )
  })

  it('keeps every searchable location on the connected graph', () => {
    const graphNodeIds = new Set(
      collegeOfIdahoWalkingGraph.nodes.map(({ id }) => id),
    )
    expect(mockLocations).toHaveLength(21)
    expect(mockLocations.every(({ id }) => graphNodeIds.has(id))).toBe(true)
  })

  it('keeps the two user-identified Simplot destinations at distinct entrances', () => {
    const cafeteria = mockLocations.find(
      ({ id }) => id === 'simplot-dining-hall',
    )
    const residence = mockLocations.find(
      ({ id }) => id === 'simplot-residence-hall',
    )
    expect(cafeteria).toMatchObject({
      label: 'Simplot Dining Hall (Cafeteria)',
      coordinates: { latitude: 43.6528175, longitude: -116.6753616 },
    })
    expect(residence).toMatchObject({
      label: 'Simplot Residence Hall',
      coordinates: { latitude: 43.6533194, longitude: -116.6747409 },
    })
    expect(cafeteria?.coordinates).not.toEqual(residence?.coordinates)
  })

  it('offers only campus buildings with mapped entrance nodes and one connected landmark', () => {
    const labels = mockLocations.map(({ label }) => label)
    expect(labels).toContain('Anderson Residence Hall')
    expect(labels).toContain('McCain Student Center')
    expect(labels).toContain('Centennial Amphitheater')
    expect(labels).not.toContain('West Hall')
    expect(labels).not.toContain('N.L. Terteling Library')
    expect(labels).not.toContain('Marty Holly Athletic Center')
  })

  it('finds routes to every offered place using connected path geometry', () => {
    for (const destination of mockLocations) {
      if (destination.id === 'campus-entrance') continue
      const route = findWalkingRoute(
        collegeOfIdahoWalkingGraph,
        'campus-entrance',
        destination.id,
      )
      expect(route, destination.label).toBeDefined()
      expect(route?.coordinates[0]).toEqual({
        latitude: 43.6522,
        longitude: -116.6799,
      })
      expect(route?.coordinates.at(-1)).toEqual(destination.coordinates)
      expect(route?.steps.at(-1)?.checkpoint.kind).toBe('destination')
    }
  })

  it('uses the mapped library entrance and measures the drawn route distance', () => {
    const route = findWalkingRoute(
      collegeOfIdahoWalkingGraph,
      'campus-entrance',
      'cruzen-murray-library',
    )
    if (!route) throw new Error('Expected library route')
    expect(route.coordinates.at(-1)).toEqual({
      latitude: 43.6544341,
      longitude: -116.6768005,
    })
    expect(route.distanceMeters).toBeGreaterThan(500)
    expect(route.distanceMeters).toBeLessThan(560)
    const drawnDistance = route.coordinates
      .slice(1)
      .reduce((total, point, index) => {
        const previous = route.coordinates[index]
        if (!previous) throw new Error('Missing route coordinate')
        return total + calculateDistanceMeters(previous, point)
      }, 0)
    expect(Math.abs(drawnDistance - route.distanceMeters)).toBeLessThan(0.01)
    expect(route.steps.length).toBeGreaterThan(1)
    expect(route.steps.length).toBeLessThan(20)
  })

  it('keeps temporary off-walkway links identifiable from imported paths', () => {
    const connectors = collegeOfIdahoWalkingGraph.edges.filter(
      ({ pathKind }) => pathKind === 'connector',
    )
    expect(connectors.map(({ id }) => id)).toContain(
      'connector:campus-entrance',
    )
    expect(
      connectors.find(({ id }) => id === 'connector:campus-entrance')
        ?.distanceMeters,
    ).toBeGreaterThan(100)
    for (const edge of connectors) {
      expect(edge.availability).toBe('available')
      expect(edge.accessibility).toBe('unverified')
    }
  })

  it('preserves informal path classification without declaring accessibility', () => {
    const informal = collegeOfIdahoWalkingGraph.edges.filter(
      ({ pathKind }) => pathKind === 'informal',
    )
    expect(informal.length).toBeGreaterThan(0)
    expect(
      informal.every(({ accessibility }) => accessibility === 'unverified'),
    ).toBe(true)
  })
})
