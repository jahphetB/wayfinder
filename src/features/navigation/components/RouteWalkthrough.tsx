import { useEffect, useRef } from 'react'
import type { GuideJourney } from '../model/guideWorkspace'
import { presentStep } from '../model/stepPresentation'
import { GuideIcon } from '@/app/components/GuideIcon'

export function RouteWalkthrough({
	journey,
}: {
	readonly journey: GuideJourney
}) {
	const { session, proposal } = journey
	const list = useRef<HTMLOListElement>(null)
	useEffect(() => {
		list.current
			?.querySelector('[aria-current="step"]')
			?.scrollIntoView?.({ block: 'nearest', behavior: 'instant' })
	}, [session.currentStepIndex])
	return (
		<section
			className="route-walkthrough"
			aria-label="Route walkthrough"
			id="route-walkthrough"
		>
			<p className="visually-hidden" role="status">
				{session.status === 'completed'
					? 'Route walkthrough complete. This does not confirm your physical arrival.'
					: `Step ${session.currentStepIndex + 1} of ${session.route.steps.length}. Next advances the illustration; location is optional.`}
			</p>
			<ol className="route-timeline" ref={list} aria-label="Route steps">
				{session.route.steps.map((step, index) => {
					const text = presentStep(step, proposal.origin)
					const complete =
						session.status === 'completed' || index < session.currentStepIndex
					const current =
						session.status !== 'completed' && index === session.currentStepIndex
					return (
						<li
							key={step.id}
							className={
								current
									? 'route-step is-current'
									: complete
										? 'route-step is-completed'
										: 'route-step'
							}
							aria-current={current ? 'step' : undefined}
						>
							<span className="step-number" aria-hidden="true">
								{index + 1}
							</span>
							<div>
								<h2>{text.title}</h2>
								<p>{text.detail}</p>
							</div>
						</li>
					)
				})}
			</ol>
			<details className="all-steps">
				<summary>
					<GuideIcon name="steps" />
					All steps
					<GuideIcon name="down" />
				</summary>
				<ol>
					{session.route.steps.map((step) => (
						<li key={step.id}>{step.instruction}</li>
					))}
				</ol>
			</details>
		</section>
	)
}
