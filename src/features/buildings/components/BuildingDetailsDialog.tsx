import { useEffect, useId, useRef } from 'react'
import type { BuildingDetails } from '../model/BuildingDetails'
import { BuildingPhotoCarousel } from './BuildingPhotoCarousel'

export function BuildingDetailsDialog({
	building,
	onClose,
}: {
	readonly building: BuildingDetails
	readonly onClose: () => void
}) {
	const dialogRef = useRef<HTMLDialogElement>(null)
	const titleId = useId()
	useEffect(() => {
		const dialog = dialogRef.current
		const previousFocus = document.activeElement
		dialog?.showModal()
		dialog?.querySelector('button')?.focus()
		return () => {
			dialog?.close()
			if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
				previousFocus.focus()
		}
	}, [])

	return (
		<dialog
			ref={dialogRef}
			className="building-dialog"
			aria-labelledby={titleId}
			onKeyDown={(event) => {
				if (event.key !== 'Tab') return
				const controls = event.currentTarget.querySelectorAll<HTMLElement>(
					'button:not([disabled]), [tabindex="0"]',
				)
				const first = controls[0]
				const last = controls[controls.length - 1]
				if (event.shiftKey && document.activeElement === first) {
					event.preventDefault()
					last?.focus()
				} else if (!event.shiftKey && document.activeElement === last) {
					event.preventDefault()
					first?.focus()
				}
			}}
			onCancel={(event) => {
				event.preventDefault()
				onClose()
			}}
			onClick={(event) => {
				if (event.target === event.currentTarget) {
					const bounds = event.currentTarget.getBoundingClientRect()
					if (
						event.clientX < bounds.left ||
						event.clientX > bounds.right ||
						event.clientY < bounds.top ||
						event.clientY > bounds.bottom
					)
						onClose()
				}
			}}
		>
			<header className="building-dialog-header">
				<h2 id={titleId}>{building.label}</h2>
				<button
					type="button"
					aria-label="Close building details"
					onClick={onClose}
				>
					×
				</button>
			</header>
			<BuildingPhotoCarousel key={building.id} photos={building.photos} />
			<section
				className="building-dialog-description"
				tabIndex={0}
				aria-label={`About ${building.label}`}
			>
				<p>{building.description}</p>
				{building.details.map(({ heading, text }) => (
					<section key={heading}>
						<h3>{heading}</h3>
						<p>{text}</p>
					</section>
				))}
			</section>
		</dialog>
	)
}
