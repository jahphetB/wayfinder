import type {
  Location,
  LocationSearchResult,
  Route,
} from '@/domain/navigation/types'

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
