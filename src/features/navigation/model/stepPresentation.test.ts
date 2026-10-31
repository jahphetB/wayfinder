import { describe, it, expect } from 'vitest'
import { presentStep } from './stepPresentation'
import { collegeOfIdahoWalkingGraph } from '@/data/navigation/collegeOfIdahoWalkingGraph'
import { findWalkingRoute } from '@/domain/navigation/walkingRoutes'
import { mockLocations } from '@/data/navigation/mockLocations'

describe('step presentation', () => {
	it('uses actual distance and origin without copying reference examples', () => {
		const route = findWalkingRoute(
			collegeOfIdahoWalkingGraph,
			'cruzen-murray-library',
			'sterry-hall',
		)!
		const origin = mockLocations.find(
			(location) => location.id === 'cruzen-murray-library',
		)!
		const step = route.steps[0]!
		expect(presentStep(step, origin)).toEqual({
			title: 'Head from Cruzen-Murray Library',
			detail: `Continue for ${Math.round(step.distanceMeters)} m`,
		})
	})
	it('preserves a second turn in combined instructions', () => {
		const route = findWalkingRoute(
			collegeOfIdahoWalkingGraph,
			'cruzen-murray-library',
			'sterry-hall',
		)!
		const origin = mockLocations.find(
			(location) => location.id === 'cruzen-murray-library',
		)!
		const compound = route.steps.find((step) =>
			step.instruction.includes(', then '),
		)!
		expect(presentStep(compound, origin).detail).toBe(compound.instruction)
	})
})
