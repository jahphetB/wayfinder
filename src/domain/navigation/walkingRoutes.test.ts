import { createWalkingGraph } from './factories'
import { findWalkingRoute } from './walkingRoutes'

describe('findWalkingRoute', () => {
  const graph = createWalkingGraph({
    nodes: [
      { id: 'entrance', coordinates: { latitude: 43.65, longitude: -116.68 } },
      { id: 'quad', coordinates: { latitude: 43.651, longitude: -116.679 } },
      { id: 'library', coordinates: { latitude: 43.652, longitude: -116.678 } },
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
        distanceMeters: 150,
      },
    ],
  })

  it('converts a shortest walking path into a renderable route', () => {
    expect(findWalkingRoute(graph, 'entrance', 'library')).toEqual({
      id: 'entrance-to-library',
      originLocationId: 'entrance',
      destinationLocationId: 'library',
      coordinates: [
        { latitude: 43.65, longitude: -116.68 },
        { latitude: 43.651, longitude: -116.679 },
        { latitude: 43.652, longitude: -116.678 },
      ],
      distanceMeters: 250,
      estimatedDurationMinutes: 4,
    })
  })

  it('returns no route when the locations are the same or disconnected', () => {
    expect(findWalkingRoute(graph, 'entrance', 'entrance')).toBeUndefined()
    expect(findWalkingRoute(graph, 'entrance', 'unknown')).toBeUndefined()
  })
})
