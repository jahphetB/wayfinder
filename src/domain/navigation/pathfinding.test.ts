import { createWalkingGraph } from './factories'
import { findShortestWalkingPath } from './pathfinding'

describe('findShortestWalkingPath', () => {
  const graph = createWalkingGraph({
    nodes: [
      { id: 'entrance', coordinates: { latitude: 43.65, longitude: -116.68 } },
      { id: 'quad', coordinates: { latitude: 43.651, longitude: -116.679 } },
      { id: 'library', coordinates: { latitude: 43.652, longitude: -116.678 } },
      {
        id: 'isolated',
        coordinates: { latitude: 43.653, longitude: -116.677 },
      },
    ],
    edges: [
      {
        id: 'entrance-to-quad',
        fromNodeId: 'entrance',
        toNodeId: 'quad',
        distanceMeters: 100,
      },
      {
        id: 'quad-to-library',
        fromNodeId: 'quad',
        toNodeId: 'library',
        distanceMeters: 100,
      },
      {
        id: 'entrance-to-library-long-way',
        fromNodeId: 'entrance',
        toNodeId: 'library',
        distanceMeters: 500,
      },
    ],
  })

  it('finds the shortest path through connected edges', () => {
    expect(findShortestWalkingPath(graph, 'entrance', 'library')).toEqual({
      nodeIds: ['entrance', 'quad', 'library'],
      edgeIds: ['entrance-to-quad', 'quad-to-library'],
      distanceMeters: 200,
    })
  })

  it('treats graph edges as usable in either direction', () => {
    expect(findShortestWalkingPath(graph, 'library', 'entrance')).toEqual({
      nodeIds: ['library', 'quad', 'entrance'],
      edgeIds: ['quad-to-library', 'entrance-to-quad'],
      distanceMeters: 200,
    })
  })

  it('returns no path for an unreachable or unknown node', () => {
    expect(
      findShortestWalkingPath(graph, 'entrance', 'isolated'),
    ).toBeUndefined()
    expect(
      findShortestWalkingPath(graph, 'entrance', 'missing'),
    ).toBeUndefined()
  })
})
