import type { GuideJourney } from '../model/guideWorkspace'
import { GuideIcon } from '@/app/components/GuideIcon'
import { presentStep } from '../model/stepPresentation'

export function CurrentInstruction({
	journey,
}: {
	readonly journey: GuideJourney
}) {
	const { session, proposal } = journey
	const complete = session.status === 'completed'
	const step =
		session.route.steps[
			Math.min(session.currentStepIndex, session.route.steps.length - 1)
		]!
	const text = presentStep(step, proposal.origin)
	return (
		<section
			className="current-instruction"
			aria-label="Current instruction"
			aria-live="polite"
			aria-atomic="true"
		>
			<p className="current-instruction-counter">
				{complete
					? 'Walkthrough complete'
					: `Step ${session.currentStepIndex + 1} of ${session.route.steps.length}`}
			</p>
			<div className="current-instruction-body">
				<GuideIcon name={step.maneuver} />
				<div>
					<h2>{complete ? 'Route walkthrough complete' : text.title}</h2>
					<p>{complete ? 'Physical arrival is not confirmed.' : text.detail}</p>
				</div>
			</div>
		</section>
	)
}
