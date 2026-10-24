import type { Location, NavigationSession } from '@/domain/navigation/types'
import {
	advanceNavigationSession,
	moveNavigationBack,
	startNavigationSession,
} from '@/domain/navigation/navigationSession'
import type { RoutePlanState } from './routePlanner'

export interface RouteProposal {
	readonly revision: number
	readonly origin: Location
	readonly destination: Location
	readonly plan: Extract<
		RoutePlanState,
		{ status: 'route-ready' | 'driving-handoff' }
	>
}
export interface GuideJourney {
	readonly proposal: RouteProposal
	readonly session: NavigationSession
}
export type GuideWorkspace =
	| { readonly view: 'planning' }
	| {
			readonly view: 'preview'
			readonly proposal: RouteProposal
			readonly previous?: GuideJourney
	  }
	| { readonly view: 'navigation'; readonly journey: GuideJourney }
	| { readonly view: 'editing'; readonly journey: GuideJourney }

export type GuideAction =
	| { readonly type: 'draft-changed' }
	| { readonly type: 'preview'; readonly proposal: RouteProposal }
	| { readonly type: 'edit' | 'cancel' | 'start' | 'next' | 'back' }

export function guideWorkspaceReducer(
	state: GuideWorkspace,
	action: GuideAction,
): GuideWorkspace {
	switch (action.type) {
		case 'draft-changed':
			return state.view === 'preview'
				? state.previous
					? { view: 'editing', journey: state.previous }
					: { view: 'planning' }
				: state
		case 'preview': {
			const previous =
				state.view === 'editing' || state.view === 'navigation'
					? state.journey
					: state.view === 'preview'
						? state.previous
						: undefined
			return {
				view: 'preview',
				proposal: action.proposal,
				...(previous ? { previous } : {}),
			}
		}
		case 'edit':
			return state.view === 'navigation'
				? { view: 'editing', journey: state.journey }
				: state
		case 'cancel':
			if (state.view === 'editing')
				return { view: 'navigation', journey: state.journey }
			if (state.view === 'preview')
				return state.previous
					? { view: 'navigation', journey: state.previous }
					: { view: 'planning' }
			return state
		case 'start':
			if (
				state.view !== 'preview' ||
				state.proposal.plan.status !== 'route-ready'
			)
				return state
			return {
				view: 'navigation',
				journey: {
					proposal: state.proposal,
					session: advanceNavigationSession(
						startNavigationSession(state.proposal.plan.route),
					),
				},
			}
		case 'next':
			return state.view === 'navigation'
				? {
						...state,
						journey: {
							...state.journey,
							session: advanceNavigationSession(state.journey.session),
						},
					}
				: state
		case 'back': {
			if (state.view !== 'navigation') return state
			const session = moveNavigationBack(state.journey.session)
			return session.status === 'awaiting-start'
				? { view: 'preview', proposal: state.journey.proposal }
				: { ...state, journey: { ...state.journey, session } }
		}
	}
}

export function displayedProposal(
	state: GuideWorkspace,
): RouteProposal | undefined {
	return state.view === 'planning'
		? undefined
		: state.view === 'preview'
			? state.proposal
			: state.journey.proposal
}
