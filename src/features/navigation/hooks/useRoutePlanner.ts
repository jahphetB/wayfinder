import { useMemo, useState } from 'react'
import { mockLocationSearchResults } from '@/data/navigation/mockLocations'
import { collegeOfIdahoWalkingGraph } from '@/data/navigation/collegeOfIdahoWalkingGraph'
import type { Location, Route } from '@/domain/navigation/types'
import {
	determineRoutePlan,
	filterLocationSearchResults,
	type RoutePlanState,
} from '@/features/navigation/model/routePlanner'

type Field = 'origin' | 'destination'

export function useRoutePlanner() {
	const [routeRevision, setRouteRevision] = useState(0)
	const [origin, setOrigin] = useState<Location>()
	const [destination, setDestination] = useState<Location>()
	const [originQuery, setOriginQuery] = useState('')
	const [destinationQuery, setDestinationQuery] = useState('')
	const [routePlanState, setRoutePlanState] = useState<RoutePlanState>({
		status: 'empty',
	})
	const plannedRoute: Route | undefined =
		routePlanState.status === 'route-ready' ? routePlanState.route : undefined
	const drivingHandoff =
		routePlanState.status === 'driving-handoff'
			? routePlanState.handoff
			: undefined
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
	function planRoute(): RoutePlanState {
		const result = determineRoutePlan(
			collegeOfIdahoWalkingGraph,
			origin,
			destination,
		)
		setRouteRevision((revision) => revision + 1)
		setRoutePlanState(result)
		return result
	}
	function restoreSelection(start: Location, end: Location): void {
		setOrigin(start)
		setDestination(end)
		setOriginQuery(start.label)
		setDestinationQuery(end.label)
		setRoutePlanState({ status: 'empty' })
	}
	return {
		routeRevision,
		origin,
		destination,
		originQuery,
		destinationQuery,
		originSuggestions,
		destinationSuggestions,
		plannedRoute,
		drivingHandoff,
		routePlanState,
		changeQuery,
		selectLocation,
		swapLocations,
		planRoute,
		restoreSelection,
	}
}
