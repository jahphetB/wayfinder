import { useMemo, useState } from 'react'
import {
  mockLocationSearchResults,
  mockLocations,
} from '@/data/navigation/mockLocations'
import { collegeOfIdahoWalkingGraph } from '@/data/navigation/collegeOfIdahoWalkingGraph'
import type { Location, Route } from '@/domain/navigation/types'
import {
  determineRoutePlan,
  filterLocationSearchResults,
  type RoutePlanState,
} from '@/features/navigation/model/routePlanner'

type Field = 'origin' | 'destination'
const findLocation = (id: string): Location => {
  const location = mockLocations.find((candidate) => candidate.id === id)
  if (!location) throw new Error(`Required mock location "${id}" was not found`)
  return location
}
const initialOrigin = findLocation('campus-entrance')
const initialDestination = findLocation('cruzen-murray-library')

export function useRoutePlanner() {
  const [origin, setOrigin] = useState<Location | undefined>(initialOrigin)
  const [destination, setDestination] = useState<Location | undefined>(
    initialDestination,
  )
  const [originQuery, setOriginQuery] = useState(initialOrigin.label)
  const [destinationQuery, setDestinationQuery] = useState(
    initialDestination.label,
  )
  const [routePlanState, setRoutePlanState] = useState<RoutePlanState>({
    status: 'empty',
  })
  const plannedRoute: Route | undefined =
    routePlanState.status === 'route-ready' ? routePlanState.route : undefined
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
    setRoutePlanState({ status: 'empty' })
  }
  function selectLocation(field: Field, location: Location): void {
    if (field === 'origin') {
      setOrigin(location)
      setOriginQuery(location.label)
    } else {
      setDestination(location)
      setDestinationQuery(location.label)
    }
    setRoutePlanState({ status: 'empty' })
  }
  function swapLocations(): void {
    setOrigin(destination)
    setDestination(origin)
    setOriginQuery(destination?.label ?? '')
    setDestinationQuery(origin?.label ?? '')
    setRoutePlanState({ status: 'empty' })
  }
  function planRoute(): void {
    setRoutePlanState(
      determineRoutePlan(collegeOfIdahoWalkingGraph, origin, destination),
    )
  }
  return {
    origin,
    destination,
    originQuery,
    destinationQuery,
    originSuggestions,
    destinationSuggestions,
    plannedRoute,
    routePlanState,
    changeQuery,
    selectLocation,
    swapLocations,
    planRoute,
  }
}
