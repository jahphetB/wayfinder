import { useEffect, useId, useRef } from 'react'

export function FailureRecovery({ scope }: { readonly scope: 'page' | 'map' }) {
	const titleId = useId()
	const headingRef = useRef<HTMLHeadingElement>(null)

	useEffect(() => {
		const heading = headingRef.current
		if (
			scope === 'page' ||
			document.activeElement === document.body ||
			heading?.closest('section')?.contains(document.activeElement)
		) {
			heading?.focus()
		}
	}, [scope])

	return (
		<section
			aria-labelledby={titleId}
			className={
				scope === 'map'
					? 'map-view failure-recovery'
					: 'failure-recovery page-recovery'
			}
		>
			<div className="recovery-panel" role="alert">
				<h2 id={titleId} ref={headingRef} tabIndex={-1}>
					{scope === 'map'
						? 'The map could not open'
						: 'The page could not continue'}
				</h2>
				<p>
					Check your connection, then reload to try again. A newer version may
					also be available.
				</p>
				{scope === 'map' && <p>Your route planner is still available.</p>}
				<p>Reloading clears your current route and navigation progress.</p>
				<button type="button" onClick={() => window.location.reload()}>
					Reload page
				</button>
			</div>
		</section>
	)
}
