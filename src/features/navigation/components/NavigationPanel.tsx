import type { ReturnTypeOfCampusGuide } from '../hooks/useCampusGuide'
import type { GuideWorkspace } from '../model/guideWorkspace'
import { LocationField } from './LocationField'
import { RouteHeading } from './RouteHeading'
import { GuideIcon } from '@/app/components/GuideIcon'
import type { ReactNode } from 'react'

export function NavigationPanel({
	planner,
	workspace,
	onCancel,
	onStart,
	feedback,
}: {
	readonly planner: ReturnTypeOfCampusGuide['planner']
	readonly workspace: GuideWorkspace
	readonly onCancel: () => void
	readonly onStart: () => void
	readonly feedback?: ReactNode
}) {
	const editing =
		workspace.view === 'editing' ||
		(workspace.view === 'preview' && Boolean(workspace.previous))
	const previous =
		workspace.view === 'editing'
			? workspace.journey
			: workspace.view === 'preview'
				? workspace.previous
				: undefined
	const error =
		planner.routePlanState.status === 'invalid-location'
			? 'Choose a suggestion for both locations before previewing a route.'
			: planner.routePlanState.status === 'route-unavailable'
				? 'A walking route is not available for this location pair yet.'
				: undefined
	return (
		<section
			className="navigation-panel"
			aria-label={editing ? 'Edit route' : 'Plan your route'}
			id="route-planner"
		>
			{editing && previous ? (
				<>
					<p className="walkthrough-paused">
						<GuideIcon name="pause" />
						Walkthrough paused ·{' '}
						{previous.session.status === 'completed'
							? 'Complete'
							: `Step ${previous.session.currentStepIndex + 1} of ${previous.session.route.steps.length}`}
					</p>
					<RouteHeading proposal={previous.proposal} />
				</>
			) : (
				<h2 className="planner-title">Plan your route</h2>
			)}
			<form
				className="route-form"
				onSubmit={(event) => {
					event.preventDefault()
					planner.planRoute()
				}}
			>
				<div className="route-fields">
					<LocationField
						label="Start"
						query={planner.originQuery}
						suggestions={planner.originSuggestions}
						onChange={(value) => planner.changeQuery('origin', value)}
						onSelect={(location) => planner.selectLocation('origin', location)}
					/>
					<button
						className="swap-locations"
						type="button"
						aria-label="Swap start and destination"
						onClick={() => planner.swapLocations()}
					>
						<GuideIcon name="swap" />
					</button>
					<LocationField
						label="Destination"
						query={planner.destinationQuery}
						suggestions={planner.destinationSuggestions}
						onChange={(value) => planner.changeQuery('destination', value)}
						onSelect={(location) =>
							planner.selectLocation('destination', location)
						}
					/>
				</div>
				<div
					className={
						editing
							? 'planner-actions planner-actions--editing'
							: 'planner-actions'
					}
				>
					{editing && (
						<button
							className="secondary-action"
							type="button"
							onClick={onCancel}
						>
							Cancel
						</button>
					)}
					<button className="route-action" type="submit">
						{editing ? 'Preview changes' : 'Preview route'}
					</button>
				</div>
			</form>
			{error && (
				<p className="planner-error" role="alert">
					{error}
				</p>
			)}
			{feedback}
			{workspace.view === 'preview' && (
				<div className="route-preview" aria-label="Route preview">
					{workspace.proposal.plan.status === 'route-ready' ? (
						<>
							<RouteHeading proposal={workspace.proposal} summary />
							<button
								className="route-action start-navigation-action"
								type="button"
								onClick={onStart}
							>
								Start navigating
							</button>
						</>
					) : (
						<section className="driving-handoff">
							<h2>Prototype driving handoff</h2>
							<p>{workspace.proposal.plan.handoff.accessNotice}</p>
							<ol>
								{workspace.proposal.plan.handoff.instructions.map((text) => (
									<li key={text}>{text}</li>
								))}
							</ol>
						</section>
					)}
				</div>
			)}
		</section>
	)
}
