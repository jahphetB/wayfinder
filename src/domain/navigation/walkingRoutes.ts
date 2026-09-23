import { createRoute } from './factories'
import { findShortestWalkingPath } from './pathfinding'
import { createRouteSteps } from './routeSteps'
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

  const routeId = `${originLocationId}-to-${destinationLocationId}`
  const steps = createRouteSteps(graph, path, routeId)

  return createRoute({
    id: routeId,
    originLocationId,
    destinationLocationId,
    steps,
    distanceMeters: path.distanceMeters,
    estimatedDurationMinutes: Math.max(
      1,
      Math.ceil(path.distanceMeters / walkingSpeedMetersPerMinute),
    ),
  })
}
