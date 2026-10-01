import { createWalkingGraph } from './factories'
import { findShortestWalkingPath } from './pathfinding'
import { createRouteSteps } from './routeSteps'

describe('createRouteSteps', () => {
  const graph = createWalkingGraph({
    nodes: [
      { id: 'west', coordinates: { latitude: 43.65, longitude: -116.68 } },
      { id: 'east', coordinates: { latitude: 43.65, longitude: -116.679 } },
      { id: 'north', coordinates: { latitude: 43.651, longitude: -116.679 } },
      {
        id: 'northeast',
        coordinates: { latitude: 43.651, longitude: -116.678 },
      },
    ],
    edges: [
      {
        id: 'west-to-east',
        fromNodeId: 'west',
        toNodeId: 'east',
        distanceMeters: 80,
      },
      {
        id: 'east-to-north',
        fromNodeId: 'east',
        toNodeId: 'north',
        distanceMeters: 100,
      },
      {
        id: 'north-to-northeast',
        fromNodeId: 'north',
        toNodeId: 'northeast',
        distanceMeters: 80,
      },
    ],
  })

  it('creates instructions and checkpoints from path direction', () => {
    const path = findShortestWalkingPath(graph, 'west', 'northeast')
    expect(path).toBeDefined()

    const steps = createRouteSteps(graph, path!, 'west-to-northeast')

    expect(steps.map((step) => step.maneuver)).toEqual([
      'depart',
      'turn-left',
      'turn-right',
    ])
    expect(steps.map((step) => step.checkpoint.kind)).toEqual([
      'turn',
      'turn',
      'destination',
    ])
    expect(steps.map((step) => step.instruction)).toEqual([
      'Start walking and continue for 80 m.',
      'Turn left and continue for 100 m.',
      'Turn right and continue for 80 m to reach your destination.',
    ])
  })

  it('reverses bidirectional edge geometry for a reverse route', () => {
    const path = findShortestWalkingPath(graph, 'north', 'west')
    expect(path).toBeDefined()

    const steps = createRouteSteps(graph, path!, 'north-to-west')

    expect(steps[0]?.coordinates).toEqual([
      { latitude: 43.651, longitude: -116.679 },
      { latitude: 43.65, longitude: -116.679 },
    ])
    expect(steps.at(-1)?.checkpoint).toEqual({
      id: 'north-to-west-checkpoint-2',
      kind: 'destination',
      coordinates: { latitude: 43.65, longitude: -116.68 },
    })
  })

  it('joins consecutive straight path segments into one checkpoint leg', () => {
    const straightGraph = createWalkingGraph({
      nodes: [
        { id: 'a', coordinates: { latitude: 43.65, longitude: -116.68 } },
        { id: 'b', coordinates: { latitude: 43.65, longitude: -116.679 } },
        { id: 'c', coordinates: { latitude: 43.65, longitude: -116.678 } },
      ],
      edges: [
        { id: 'ab', fromNodeId: 'a', toNodeId: 'b', distanceMeters: 80 },
        { id: 'bc', fromNodeId: 'b', toNodeId: 'c', distanceMeters: 80 },
      ],
    })
    const path = findShortestWalkingPath(straightGraph, 'a', 'c')
    if (!path) throw new Error('Expected straight route')

    expect(createRouteSteps(straightGraph, path, 'a-to-c')).toMatchObject([
      {
        maneuver: 'depart',
        distanceMeters: 160,
        coordinates: [
          { latitude: 43.65, longitude: -116.68 },
          { latitude: 43.65, longitude: -116.679 },
          { latitude: 43.65, longitude: -116.678 },
        ],
        checkpoint: { kind: 'destination' },
      },
    ])
  })

  it('combines two nearby turns into one explicit instruction and checkpoint', () => {
    const closeGraph = createWalkingGraph({
      nodes: [
        { id: 'a', coordinates: { latitude: 43.65, longitude: -116.68 } },
        { id: 'b', coordinates: { latitude: 43.65, longitude: -116.679 } },
        { id: 'c', coordinates: { latitude: 43.65005, longitude: -116.679 } },
        { id: 'd', coordinates: { latitude: 43.65005, longitude: -116.678 } },
      ],
      edges: [
        { id: 'ab', fromNodeId: 'a', toNodeId: 'b', distanceMeters: 80 },
        { id: 'bc', fromNodeId: 'b', toNodeId: 'c', distanceMeters: 6 },
        { id: 'cd', fromNodeId: 'c', toNodeId: 'd', distanceMeters: 80 },
      ],
    })
    const path = findShortestWalkingPath(closeGraph, 'a', 'd')
    if (!path) throw new Error('Expected connected close-turn route')
    const steps = createRouteSteps(closeGraph, path, 'close-turns')
    expect(steps).toHaveLength(2)
    expect(steps[1]?.instruction).toBe(
      'Turn left, then turn right after 6 m and continue for 80 m to reach your destination.',
    )
    expect(steps[1]?.coordinates).toHaveLength(3)
    expect(steps[1]?.checkpoint.kind).toBe('destination')

    const distantGraph = createWalkingGraph({
      nodes: closeGraph.nodes.map((node) =>
        node.id === 'c' || node.id === 'd'
          ? {
              ...node,
              coordinates: {
                ...node.coordinates,
                latitude: 43.6503,
              },
            }
          : node,
      ),
      edges: [
        { id: 'ab', fromNodeId: 'a', toNodeId: 'b', distanceMeters: 80 },
        { id: 'bc', fromNodeId: 'b', toNodeId: 'c', distanceMeters: 33 },
        { id: 'cd', fromNodeId: 'c', toNodeId: 'd', distanceMeters: 80 },
      ],
    })
    expect(createRouteSteps(distantGraph, path, 'separate-turns')).toHaveLength(
      3,
    )
  })
})
