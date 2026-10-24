import { useRef } from 'react'
import type { GuideJourney } from '@/features/navigation/model/guideWorkspace'
import { campusBuildingDetails } from '@/data/campus/buildingDetails'
import { GuideIcon } from './GuideIcon'
export function GuideHeader({
	journey,
	desktop,
	onEdit,
	onPrivacy,
	onBuilding,
}: {
	readonly journey: GuideJourney | undefined
	readonly desktop: boolean
	readonly onEdit: () => void
	readonly onPrivacy: () => void
	readonly onBuilding: (id: string) => void
}) {
	const menu = useRef<HTMLDetailsElement>(null)
	function close() {
		if (menu.current) {
			menu.current.open = false
			menu.current.querySelector('summary')?.focus()
		}
	}
	return (
		<header className="guide-header">
			<div className="guide-brand">
				<h1>Yotes Wayfinder{journey && desktop ? <sup>™</sup> : ''}</h1>
				{journey && (
					<p>
						{desktop
							? 'The College of Idaho'
							: `${journey.proposal.origin.label} → ${journey.proposal.destination.label}`}
					</p>
				)}
			</div>
			{journey && !desktop ? (
				<button
					className="header-edit secondary-action"
					type="button"
					onClick={onEdit}
				>
					Edit route
				</button>
			) : !journey ? (
				<details
					className="guide-menu"
					ref={menu}
					onKeyDown={(event) => {
						if (event.key === 'Escape') {
							close()
							menu.current?.querySelector('summary')?.focus()
						}
					}}
				>
					<summary aria-label="Open menu">
						<GuideIcon name="menu" />
					</summary>
					<div className="guide-menu-items">
						{campusBuildingDetails.map((building) => (
							<button
								key={building.id}
								type="button"
								onClick={() => {
									close()
									onBuilding(building.id)
								}}
							>
								{building.label} details
							</button>
						))}
						<button
							type="button"
							onClick={() => {
								close()
								onPrivacy()
							}}
						>
							Privacy
						</button>
					</div>
				</details>
			) : null}
		</header>
	)
}
