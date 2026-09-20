import type {
  Location,
  LocationSearchResult,
  Route,
  WalkingGraph,
} from '@/domain/navigation/types'
import { findWalkingRoute } from '@/domain/navigation/walkingRoutes'

export type RoutePlanState =
  | { readonly status: 'empty' }
  | { readonly status: 'invalid-location' }
  | { readonly status: 'route-unavailable' }
  | { readonly status: 'route-ready'; readonly route: Route }

export function filterLocationSearchResults(
  results: readonly LocationSearchResult[],
  query: string,
): readonly LocationSearchResult[] {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  return normalizedQuery.length === 0
    ? results
    : results.filter((result) =>
        result.location.label.toLocaleLowerCase().includes(normalizedQuery),
      )
}

export function findRouteForLocations(
  graph: WalkingGraph,
  origin: Location,
  destination: Location,
): Route | undefined {
  return findWalkingRoute(graph, origin.id, destination.id)
}

export function determineRoutePlan(
  graph: WalkingGraph,
  origin: Location | undefined,
  destination: Location | undefined,
): RoutePlanState {
  if (!origin || !destination) return { status: 'invalid-location' }

  const route = findRouteForLocations(graph, origin, destination)
  return route
    ? { status: 'route-ready', route }
    : { status: 'route-unavailable' }
}
