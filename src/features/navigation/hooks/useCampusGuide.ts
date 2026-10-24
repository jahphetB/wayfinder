import { useReducer, useRef } from 'react'
import type { Location } from '@/domain/navigation/types'
import {
	displayedProposal,
	guideWorkspaceReducer,
} from '../model/guideWorkspace'
import { useRoutePlanner } from './useRoutePlanner'

export function useCampusGuide() {
	const draft = useRoutePlanner()
	const [workspace, dispatch] = useReducer(guideWorkspaceReducer, {
		view: 'planning',
	})
	const revision = useRef(0)
	const proposal = displayedProposal(workspace)
	function preview(): void {
		const plan = draft.planRoute()
		if (
			!draft.origin ||
			!draft.destination ||
			(plan.status !== 'route-ready' && plan.status !== 'driving-handoff')
		)
			return
		dispatch({
			type: 'preview',
			proposal: {
				revision: ++revision.current,
				origin: draft.origin,
				destination: draft.destination,
				plan,
			},
		})
	}
	function edit(): void {
		if (workspace.view !== 'navigation') return
		draft.restoreSelection(
			workspace.journey.proposal.origin,
			workspace.journey.proposal.destination,
		)
		dispatch({ type: 'edit' })
	}
	function cancel(): void {
		const previous =
			workspace.view === 'editing'
				? workspace.journey
				: workspace.view === 'preview'
					? workspace.previous
					: undefined
		if (previous)
			draft.restoreSelection(
				previous.proposal.origin,
				previous.proposal.destination,
			)
		dispatch({ type: 'cancel' })
	}
	const planner = {
		...draft,
		changeQuery(field: 'origin' | 'destination', value: string): void {
			dispatch({ type: 'draft-changed' })
			draft.changeQuery(field, value)
		},
		selectLocation(field: 'origin' | 'destination', location: Location): void {
			dispatch({ type: 'draft-changed' })
			draft.selectLocation(field, location)
		},
		swapLocations(): void {
			dispatch({ type: 'draft-changed' })
			draft.swapLocations()
		},
		planRoute: preview,
	}
	return { workspace, proposal, planner, edit, cancel, dispatch }
}

export type ReturnTypeOfCampusGuide = ReturnType<typeof useCampusGuide>
