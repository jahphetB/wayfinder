import { buildCampusWalkingGraph } from './buildCampusWalkingGraph'

describe('buildCampusWalkingGraph', () => {
  const snapshot = {
    nodes: {
      '1': [43.65, -116.68],
      '2': [43.65, -116.679],
      '3': [43.6501, -116.6795],
    },
    ways: [{ id: '10', nodeIds: ['1', '2'], kind: 'formal' }],
    buildings: [{ id: '20', nodeIds: ['3'], entranceIds: ['3'] }],
    areas: [
      { id: '30', kind: 'parking', nodeIds: ['3'] },
      { id: '31', kind: 'sport', sport: 'tennis', nodeIds: ['3'] },
    ],
    places: [] as { id: string }[],
    entrances: [
      { id: '1', description: 'Main entrance to the Activities Center' },
    ],
  }

  it('splits the nearest walkway segment for an off-path entrance', () => {
    const result = buildCampusWalkingGraph(snapshot, [
      {
        id: 'start',
        label: 'Start',
        source: { kind: 'walkway-point', nodeId: '1' },
      },
      {
        id: 'building',
        label: 'Building',
        source: { kind: 'building-entrance', buildingId: '20', nodeId: '3' },
      },
    ])

    expect(result.graph.nodes.map(({ id }) => id)).toContain('snap:building')
    expect(result.graph.edges.map(({ id }) => id)).toEqual([
      'osm:10:0:a',
      'osm:10:0:b',
      'connector:building',
    ])
    expect(result.graph.edges.at(-1)).toMatchObject({
      fromNodeId: 'building',
      toNodeId: 'snap:building',
      pathKind: 'connector',
      accessibility: 'unverified',
    })
  })

  it('rejects an entrance not tagged on its selected building', () => {
    expect(() =>
      buildCampusWalkingGraph(snapshot, [
        {
          id: 'wrong',
          label: 'Wrong door',
          source: { kind: 'building-entrance', buildingId: '20', nodeId: '2' },
        },
      ]),
    ).toThrow('entrance is absent from its OSM building')
  })

  it('rejects speculative long links to the walking network', () => {
    expect(() =>
      buildCampusWalkingGraph(snapshot, [
        {
          id: 'distant',
          label: 'Distant',
          source: {
            kind: 'illustrative',
            coordinates: { latitude: 43.66, longitude: -116.68 },
          },
        },
      ]),
    ).toThrow('No nearby walking way for distant')
  })

  it('validates a described entrance and keeps mapped areas identifiable', () => {
    const result = buildCampusWalkingGraph(snapshot, [
      {
        id: 'activities',
        label: 'Activities Center',
        source: {
          kind: 'described-entrance',
          nodeId: '1',
          descriptionIncludes: 'activities center',
        },
      },
      {
        id: 'parking',
        label: 'Parking Lot',
        source: { kind: 'mapped-area', areaId: '30' },
      },
    ])
    expect(result.graph.nodes.some(({ id }) => id === 'activities')).toBe(true)
    expect(result.graph.edges.map(({ id }) => id)).toContain(
      'connector:parking',
    )
    expect(() =>
      buildCampusWalkingGraph(snapshot, [
        {
          id: 'pool',
          label: 'Pool',
          source: {
            kind: 'described-entrance',
            nodeId: '1',
            descriptionIncludes: 'swimming pool',
          },
        },
      ]),
    ).toThrow('description does not match OSM')
  })

  it('accepts a tagged court but rejects a mislabeled sport', () => {
    expect(
      buildCampusWalkingGraph(snapshot, [
        {
          id: 'tennis',
          label: 'Tennis Court',
          source: { kind: 'sports-area', areaId: '31', sport: 'tennis' },
        },
      ]).locations,
    ).toEqual([{ id: 'tennis', label: 'Tennis Court' }])
    expect(() =>
      buildCampusWalkingGraph(snapshot, [
        {
          id: 'volleyball',
          label: 'Volleyball Court',
          source: { kind: 'sports-area', areaId: '31', sport: 'volleyball' },
        },
      ]),
    ).toThrow('sport does not match OSM')
  })
})
