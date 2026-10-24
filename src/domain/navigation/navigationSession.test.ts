import {
	advanceNavigationSession,
	moveNavigationBack,
	startNavigationSession,
} from './navigationSession'
import { findWalkingRoute } from './walkingRoutes'
import { collegeOfIdahoWalkingGraph } from '@/data/navigation/collegeOfIdahoWalkingGraph'
const route = findWalkingRoute(
	collegeOfIdahoWalkingGraph,
	'cruzen-murray-library',
	'sterry-hall',
)!
describe('manual route walkthrough', () => {
	it('advances only through explicit actions, without a location input', () => {
		let session = startNavigationSession(route)
		expect(session.status).toBe('awaiting-start')
		session = advanceNavigationSession(session)
		expect(session).toMatchObject({ status: 'navigating', currentStepIndex: 0 })
		for (let i = 0; i < route.steps.length; i++)
			session = advanceNavigationSession(session)
		expect(session.status).toBe('completed')
		expect(advanceNavigationSession(session)).toBe(session)
		expect(moveNavigationBack(session)).toMatchObject({
			status: 'navigating',
			currentStepIndex: route.steps.length - 1,
		})
	})
	it('backs up to the start without modifying route data', () => {
		const session = startNavigationSession(route)
		expect(moveNavigationBack(session)).toBe(session)
		expect(moveNavigationBack(advanceNavigationSession(session))).toEqual(
			session,
		)
		expect(route.steps.length).toBeGreaterThan(1)
	})
	it('rejects an empty walkthrough', () => {
		expect(() => startNavigationSession({ ...route, steps: [] })).toThrow()
	})
})
