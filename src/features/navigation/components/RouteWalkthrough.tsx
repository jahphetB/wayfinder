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
	const starting = session.status === 'awaiting-start'
	const complete = session.status === 'completed'
	const step = session.route.steps[session.currentStepIndex]
	return (
		<section
			className="route-walkthrough checkpoint-navigation"
			aria-label="Route walkthrough"
			id="route-walkthrough"
		>
			{starting && (
				<button
					type="button"
					className="route-action start-navigation-action"
					onClick={onNext}
				>
					Start navigating
				</button>
			)}
			{!starting && !complete && step && (
				<div className="current-instruction">
					<h3>
						Step {session.currentStepIndex + 1} of {session.route.steps.length}
					</h3>
					<p>{step.instruction}</p>
				</div>
			)}
			{!starting && (
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
			)}
			<p className="walkthrough-status" role="status" aria-atomic="true">
				{complete
					? 'Route walkthrough complete. This does not confirm your physical arrival.'
					: starting
						? 'Explore the route at your own pace. Location is optional.'
						: 'Next advances the illustration and requests a location snapshot. You do not need to walk or wait for location.'}
			</p>
			<div className="navigation-actions">
				{!starting && (
					<button type="button" className="secondary-action" onClick={onBack}>
						Back
					</button>
				)}
				{!starting && !complete && (
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
