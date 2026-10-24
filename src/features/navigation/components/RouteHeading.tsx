import type { RouteProposal } from '../model/guideWorkspace'

export function RouteHeading({
	proposal,
	onEdit,
	summary = false,
}: {
	readonly proposal: RouteProposal
	readonly onEdit?: () => void
	readonly summary?: boolean
}) {
	const route =
		proposal.plan.status === 'route-ready' ? proposal.plan.route : undefined
	return (
		<section
			className={`route-heading ${summary ? 'route-heading--summary' : ''}`}
			aria-label={summary ? 'Walking route' : 'Selected route'}
		>
			{summary && (
				<div className="route-heading-top">
					<span>Walking route</span>
					{onEdit && (
						<button className="edit-route-link" type="button" onClick={onEdit}>
							Edit route
						</button>
					)}
				</div>
			)}
			<p className="route-heading-names">
				{proposal.origin.label} → {proposal.destination.label}
			</p>
			{summary && route && (
				<p className="route-heading-metrics">
					{route.steps.length} steps · ~{route.estimatedDurationMinutes} min ·{' '}
					{Math.round(route.distanceMeters)} m (est.)
				</p>
			)}
		</section>
	)
}
