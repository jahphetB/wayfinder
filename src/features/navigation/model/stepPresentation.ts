import type { Location, RouteStep } from '@/domain/navigation/types'

export function presentStep(step: RouteStep, origin: Location) {
	const title = {
		depart: `Head from ${origin.label}`,
		continue: 'Continue straight',
		'turn-left': 'Turn left',
		'turn-right': 'Turn right',
		'turn-around': 'Turn around',
	}[step.maneuver]
	// Preserve the second maneuver in merged steps instead of replacing it with a distance.
	const detail = step.instruction.includes(', then ')
		? step.instruction
		: `Continue for ${Math.round(step.distanceMeters)} m`
	return { title, detail }
}
