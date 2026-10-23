import type { NavigationSession } from '@/domain/navigation/types'

export function RouteWalkthrough({
	session,
	onNext,
	onBack,
}: {
	readonly session: NavigationSession
	readonly onNext: () => void
	readonly onBack: () => void
}) {
	if (session.status === 'awaiting-start') return null
	const complete = session.status === 'completed'
	const step = session.route.steps[session.currentStepIndex]
	return (
		<section
			className="route-walkthrough checkpoint-navigation"
			aria-label="Route walkthrough"
			id="route-walkthrough"
		>
			{!complete && step && (
				<div className="current-instruction">
					<h3>
						Step {session.currentStepIndex + 1} of {session.route.steps.length}
					</h3>
					<p>{step.instruction}</p>
				</div>
			)}
			<ul aria-label="Route leg colors" className="route-leg-legend">
				<li>
					<span className="legend-swatch completed" />
					Completed
				</li>
				<li>
					<span className="legend-swatch current" />
					Current leg
				</li>
				<li>
					<span className="legend-swatch upcoming" />
					Upcoming
				</li>
			</ul>
			<p className="walkthrough-status" role="status" aria-atomic="true">
				{complete
					? 'Route walkthrough complete. This does not confirm your physical arrival.'
					: 'Next advances the illustration and requests a location snapshot. You do not need to walk or wait for location.'}
			</p>
			<div className="navigation-actions">
				<button
					type="button"
					className="secondary-action previous-step-action"
					onClick={onBack}
				>
					Back
				</button>
				{!complete && (
					<button
						type="button"
						className="route-action next-step-action"
						onClick={onNext}
					>
						Next
					</button>
				)}
			</div>
		</section>
	)
}
