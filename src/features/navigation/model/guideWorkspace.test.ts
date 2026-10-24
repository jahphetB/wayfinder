import { mockLocations } from '@/data/navigation/mockLocations'
import { determineRoutePlan } from './routePlanner'
import { collegeOfIdahoWalkingGraph } from '@/data/navigation/collegeOfIdahoWalkingGraph'
import {
	guideWorkspaceReducer as reduce,
	type GuideWorkspace,
	type RouteProposal,
} from './guideWorkspace'

function proposal(
	revision: number,
	destinationId = 'simplot-dining-hall',
): RouteProposal {
	const origin = mockLocations.find((x) => x.id === 'cruzen-murray-library')!
	const destination = mockLocations.find((x) => x.id === destinationId)!
	const plan = determineRoutePlan(
		collegeOfIdahoWalkingGraph,
		origin,
		destination,
	)
	if (plan.status !== 'route-ready' && plan.status !== 'driving-handoff')
		throw new Error('Fixture route missing')
	return { revision, origin, destination, plan }
}
function journey(): GuideWorkspace {
	return reduce(
		reduce(
			reduce({ view: 'planning' }, { type: 'preview', proposal: proposal(1) }),
			{ type: 'start' },
		),
		{ type: 'next' },
	)
}
describe('guide workspace transactions', () => {
	it('previews without starting and begins only on an explicit start', () => {
		const preview = reduce(
			{ view: 'planning' },
			{ type: 'preview', proposal: proposal(1) },
		)
		expect(preview.view).toBe('preview')
		const started = reduce(preview, { type: 'start' })
		expect(started.view).toBe('navigation')
		if (started.view === 'navigation')
			expect(started.journey.session.currentStepIndex).toBe(0)
	})
	it('preserves the exact journey and step through editing, draft changes and cancellation', () => {
		const original = journey()
		const editing = reduce(original, { type: 'edit' })
		expect(reduce(editing, { type: 'draft-changed' })).toBe(editing)
		const restored = reduce(editing, { type: 'cancel' })
		expect(restored).toEqual(original)
		if (restored.view === 'navigation' && original.view === 'navigation')
			expect(restored.journey).toBe(original.journey)
	})
	it('retains the old journey through replacement preview and cancel', () => {
		const original = journey()
		const preview = reduce(reduce(original, { type: 'edit' }), {
			type: 'preview',
			proposal: proposal(2, 'sterry-hall'),
		})
		expect(reduce(preview, { type: 'cancel' })).toEqual(original)
	})
	it('starts an accepted replacement at its first illustrated step', () => {
		const state = reduce(reduce(journey(), { type: 'edit' }), {
			type: 'preview',
			proposal: proposal(2, 'sterry-hall'),
		})
		const started = reduce(state, { type: 'start' })
		expect(started.view).toBe('navigation')
		if (started.view === 'navigation') {
			expect(started.journey.proposal.revision).toBe(2)
			expect(started.journey.session.currentStepIndex).toBe(0)
		}
	})
	it('keeps the retained journey when editing a replacement preview again', () => {
		const original = journey()
		const preview = reduce(reduce(original, { type: 'edit' }), {
			type: 'preview',
			proposal: proposal(2),
		})
		const editing = reduce(preview, { type: 'draft-changed' })
		expect(editing.view).toBe('editing')
		expect(reduce(editing, { type: 'cancel' })).toEqual(original)
	})
	it('does not create a walking session for the stadium handoff', () => {
		const preview = reduce(
			{ view: 'planning' },
			{ type: 'preview', proposal: proposal(1, 'simplot-stadium') },
		)
		expect(reduce(preview, { type: 'start' })).toBe(preview)
	})
	it('returns Back at the first step to preview without arrival or GPS checks', () => {
		const preview = reduce(
			{ view: 'planning' },
			{ type: 'preview', proposal: proposal(1) },
		)
		expect(
			reduce(reduce(preview, { type: 'start' }), { type: 'back' }),
		).toEqual(preview)
	})
})
