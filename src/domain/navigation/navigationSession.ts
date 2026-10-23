import { NavigationValidationError } from './factories'
import type { NavigationSession, Route } from './types'

export function startNavigationSession(route: Route): NavigationSession {
	if (!route.steps.length || !route.coordinates[0])
		throw new NavigationValidationError(
			'A walkthrough requires a route with steps',
		)
	return Object.freeze({ route, status: 'awaiting-start', currentStepIndex: 0 })
}

export function advanceNavigationSession(
	session: NavigationSession,
): NavigationSession {
	if (session.status === 'completed') return session
	if (session.status === 'awaiting-start')
		return Object.freeze({ ...session, status: 'navigating' })
	const currentStepIndex = session.currentStepIndex + 1
	return Object.freeze({
		route: session.route,
		status:
			currentStepIndex >= session.route.steps.length
				? 'completed'
				: 'navigating',
		currentStepIndex,
	})
}

export function moveNavigationBack(
	session: NavigationSession,
): NavigationSession {
	if (session.status === 'awaiting-start') return session
	if (session.currentStepIndex === 0)
		return startNavigationSession(session.route)
	return Object.freeze({
		route: session.route,
		status: 'navigating',
		currentStepIndex: session.currentStepIndex - 1,
	})
}
