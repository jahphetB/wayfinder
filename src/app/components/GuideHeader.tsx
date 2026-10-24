import { useRef, useState } from 'react'
import { LocationField } from '@/features/navigation/components/LocationField'
import { mockLocationSearchResults } from '@/data/navigation/mockLocations'
import type { Location } from '@/domain/navigation/types'
import type { GuideJourney } from '@/features/navigation/model/guideWorkspace'
import { campusBuildingDetails } from '@/data/campus/buildingDetails'
import { GuideIcon } from './GuideIcon'
export function GuideHeader({
	journey,
	desktop,
	onEdit,
	onPrivacy,
	onBuilding,
	onDestination,
}: {
	readonly journey: GuideJourney | undefined
	readonly desktop: boolean
	readonly onEdit: () => void
	readonly onPrivacy: () => void
	readonly onBuilding: (id: string) => void
	readonly onDestination: (location: Location) => void
}) {
	const [query, setQuery] = useState('')
	const matches = mockLocationSearchResults.filter((result) =>
		result.location.label.toLowerCase().includes(query.toLowerCase()),
	)
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
				<>
					<div className="header-building-search">
						<LocationField
							label="Search buildings"
							query={query}
							suggestions={matches}
							onChange={setQuery}
							onSelect={(location) => {
								setQuery('')
								onDestination(location)
							}}
						/>
					</div>
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
				</>
			) : null}
		</header>
	)
}
