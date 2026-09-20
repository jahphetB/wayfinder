import type {
  Location,
  LocationSearchResult,
  Route,
} from '@/domain/navigation/types'

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
  routes: readonly Route[],
  origin: Location,
  destination: Location,
): Route | undefined {
  return routes.find(
    (route) =>
      (route.originLocationId === origin.id &&
        route.destinationLocationId === destination.id) ||
      (route.originLocationId === destination.id &&
        route.destinationLocationId === origin.id),
  )
}

export function determineRoutePlan(
  routes: readonly Route[],
  origin: Location | undefined,
  destination: Location | undefined,
): RoutePlanState {
  if (!origin || !destination) return { status: 'invalid-location' }

  const route = findRouteForLocations(routes, origin, destination)
  return route
    ? { status: 'route-ready', route }
    : { status: 'route-unavailable' }
}
