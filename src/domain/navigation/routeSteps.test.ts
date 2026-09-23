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
})
