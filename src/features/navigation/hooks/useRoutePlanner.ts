import { useMemo, useState } from 'react'
import {
  mockLocationSearchResults,
  mockLocations,
} from '@/data/navigation/mockLocations'
import { mockRoutes } from '@/data/navigation/mockRoutes'
import type { Location, Route } from '@/domain/navigation/types'
import {
  filterLocationSearchResults,
  findRouteForLocations,
} from '@/features/navigation/model/routePlanner'

type Field = 'origin' | 'destination'
const findLocation = (id: string): Location => {
  const location = mockLocations.find((candidate) => candidate.id === id)
  if (!location) throw new Error(`Required mock location "${id}" was not found`)
  return location
}
const initialOrigin = findLocation('coyote-gateway')
const initialDestination = findLocation('ridge-library')

export function useRoutePlanner() {
  const [origin, setOrigin] = useState<Location | undefined>(initialOrigin)
  const [destination, setDestination] = useState<Location | undefined>(
    initialDestination,
  )
  const [originQuery, setOriginQuery] = useState(initialOrigin.label)
  const [destinationQuery, setDestinationQuery] = useState(
    initialDestination.label,
  )
  const [plannedRoute, setPlannedRoute] = useState<Route | undefined>()
  const originSuggestions = useMemo(
    () => filterLocationSearchResults(mockLocationSearchResults, originQuery),
    [originQuery],
  )
  const destinationSuggestions = useMemo(
    () =>
      filterLocationSearchResults(mockLocationSearchResults, destinationQuery),
    [destinationQuery],
  )
  function changeQuery(field: Field, value: string): void {
    if (field === 'origin') {
      setOriginQuery(value)
      setOrigin(undefined)
    } else {
      setDestinationQuery(value)
      setDestination(undefined)
    }
    setPlannedRoute(undefined)
  }
  function selectLocation(field: Field, location: Location): void {
    if (field === 'origin') {
      setOrigin(location)
      setOriginQuery(location.label)
    } else {
      setDestination(location)
      setDestinationQuery(location.label)
    }
    setPlannedRoute(undefined)
  }
  function swapLocations(): void {
    setOrigin(destination)
    setDestination(origin)
    setOriginQuery(destination?.label ?? '')
    setDestinationQuery(origin?.label ?? '')
    setPlannedRoute(undefined)
  }
  function planRoute(): void {
    if (origin && destination)
      setPlannedRoute(findRouteForLocations(mockRoutes, origin, destination))
  }
  return {
    origin,
    destination,
    originQuery,
    destinationQuery,
    originSuggestions,
    destinationSuggestions,
    plannedRoute,
    canPlanRoute: Boolean(origin && destination),
    changeQuery,
    selectLocation,
    swapLocations,
    planRoute,
  }
}
