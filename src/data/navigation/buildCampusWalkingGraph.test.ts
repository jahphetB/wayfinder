import { buildCampusWalkingGraph } from './buildCampusWalkingGraph'

describe('buildCampusWalkingGraph', () => {
  const snapshot = {
    nodes: {
      '1': [43.65, -116.68],
      '2': [43.65, -116.679],
      '3': [43.6501, -116.6795],
    },
    ways: [{ id: '10', nodeIds: ['1', '2'], kind: 'formal' }],
    buildings: [{ id: '20', entranceIds: ['3'] }],
    places: [] as { id: string }[],
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
})
