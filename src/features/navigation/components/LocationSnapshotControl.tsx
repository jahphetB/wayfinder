import type { LocationSnapshot } from '../hooks/useLocationSnapshot'
import { classifyCampusLocation } from '@/data/navigation/classifyCampusLocation'
import { GuideIcon } from '@/app/components/GuideIcon'

export function LocationSnapshotButton({
	snapshot,
}: {
	readonly snapshot: LocationSnapshot
}) {
	return (
		<button
			className="location-action secondary-action"
			id="get-my-location"
			type="button"
			onClick={() =>
				snapshot.isLocating
					? snapshot.cancel()
					: void snapshot.request('locate')
			}
		>
			<GuideIcon name="locate" />
			{snapshot.isLocating ? 'Cancel location lookup' : 'Get my location'}
		</button>
	)
}
export function LocationFeedback({
	snapshot,
}: {
	readonly snapshot: LocationSnapshot
}) {
	const reading = snapshot.reading
	const area = reading ? classifyCampusLocation(reading) : undefined
	const date = reading ? new Date(reading.capturedAtMilliseconds) : undefined
	return (
		<div
			className="snapshot-feedback"
			aria-live="polite"
			aria-atomic="true"
			id="location-snapshot"
		>
			{reading && date && (
				<p className="snapshot-last-checked">
					<span aria-hidden="true" className="snapshot-marker-key" />
					Last checked{' '}
					<time dateTime={date.toISOString()}>
						{date.toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit',
							hour12: false,
						})}
					</time>{' '}
					· ±{Math.ceil(reading.accuracyMeters)} m · Not live
					{snapshot.retained ? ' · Previous snapshot' : ''}
					{area === 'outside'
						? ' · Off campus'
						: area === 'uncertain'
							? ' · Campus position uncertain'
							: ''}
				</p>
			)}
			{snapshot.status === 'loading' ? (
				<p className="snapshot-message">Checking location… You can continue.</p>
			) : snapshot.status === 'error' || snapshot.status === 'cancelled' ? (
				<p className="snapshot-message">
					{snapshot.status === 'cancelled'
						? 'Location lookup cancelled.'
						: snapshot.message.includes('denied')
							? 'Location denied. Directions still work.'
							: 'Location unavailable. Directions still work.'}
					<span className="visually-hidden">{snapshot.message}</span>
				</p>
			) : null}
			{reading && snapshot.status === 'ready' && (
				<span className="visually-hidden">
					{snapshot.message}
					{area === 'outside'
						? ' You appear off campus. The map remains focused on campus.'
						: ''}
				</span>
			)}
		</div>
	)
}
// Standalone composition for integration consumers; the guide places these two controls separately.
export function LocationSnapshotControl({
	snapshot,
}: {
	readonly snapshot: LocationSnapshot
}) {
	return (
		<section aria-label="Location snapshot">
			<LocationSnapshotButton snapshot={snapshot} />
			<LocationFeedback snapshot={snapshot} />
		</section>
	)
}
