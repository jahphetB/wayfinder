import { useEffect, useRef } from 'react'
export function PrivacyDialog({ onClose }: { readonly onClose: () => void }) {
	const ref = useRef<HTMLDialogElement>(null)
	useEffect(() => {
		const previous = document.activeElement
		const dialog = ref.current
		dialog?.showModal()
		return () => {
			dialog?.close()
			if (previous instanceof HTMLElement && previous.isConnected)
				previous.focus()
		}
	}, [])
	return (
		<dialog
			ref={ref}
			className="privacy-dialog"
			aria-labelledby="privacy-title"
			onCancel={(event) => {
				event.preventDefault()
				onClose()
			}}
		>
			<header>
				<h2 id="privacy-title">Location &amp; privacy</h2>
				<button
					type="button"
					onClick={onClose}
					aria-label="Close privacy information"
				>
					×
				</button>
			</header>
			<div className="privacy-content">
				<p>
					This campus guide illustrates a route. Start navigating and Next
					advance the walkthrough whether or not you move or allow location.
					Completion does not confirm physical arrival.
				</p>
				<p>
					Only Get my location, Start navigating and Next request your
					approximate position. A brief lookup may collect several readings and
					stops when finished, cancelled or timed out. Back, page loading and
					time passing do not request location.
				</p>
				<p>
					The green circle is a last-checked snapshot, not live movement. Each
					new snapshot replaces the previous one. Location is kept only in this
					tab’s memory; this app does not save or upload location history.
					Closing or reloading the page clears it.
				</p>
				<p>
					Vercel serves the website. The configured map service receives
					ordinary map requests, including your IP address and the viewed map
					areas. Your browser or operating system may use its own location
					service. This app adds no analytics or external error-reporting
					service.
				</p>
				<p>
					The current mapped dataset is the accepted guide baseline, with some
					inferred connections and unverified access details. Check signs and
					conditions on site. Future corrections can update the guide without
					changing how it works.
				</p>
			</div>
		</dialog>
	)
}
