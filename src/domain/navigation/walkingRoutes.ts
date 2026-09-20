import { createRoute } from './factories'
import { findShortestWalkingPath } from './pathfinding'
import type { Route, WalkingGraph } from './types'

const walkingSpeedMetersPerMinute = 66

export function findWalkingRoute(
  graph: WalkingGraph,
  originLocationId: string,
  destinationLocationId: string,
): Route | undefined {
  if (originLocationId === destinationLocationId) {
    return undefined
  }

  const path = findShortestWalkingPath(
    graph,
    originLocationId,
    destinationLocationId,
  )

  if (!path) {
    return undefined
  }

  const coordinatesByNodeId = new Map(
    graph.nodes.map((node) => [node.id, node.coordinates]),
  )
  const coordinates = path.nodeIds.map((nodeId) => {
    const coordinate = coordinatesByNodeId.get(nodeId)

    if (!coordinate) {
      throw new Error(`Walking path references unknown node: ${nodeId}`)
    }

    return coordinate
  })

  return createRoute({
    id: `${originLocationId}-to-${destinationLocationId}`,
    originLocationId,
    destinationLocationId,
    coordinates,
    distanceMeters: path.distanceMeters,
    estimatedDurationMinutes: Math.max(
      1,
      Math.ceil(path.distanceMeters / walkingSpeedMetersPerMinute),
    ),
  })
}
