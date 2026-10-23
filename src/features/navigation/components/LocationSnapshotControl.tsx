import type { LocationSnapshot } from '../hooks/useLocationSnapshot'
import { classifyCampusLocation } from '@/data/navigation/classifyCampusLocation'

export function LocationSnapshotControl({
	snapshot,
}: {
	readonly snapshot: LocationSnapshot
}) {
	const reading = snapshot.reading
	const area = reading ? classifyCampusLocation(reading) : undefined
	return (
		<section
			className="map-location-control location-snapshot-control"
			aria-label="Location snapshot"
			id="location-snapshot"
		>
			<button
				id="get-my-location"
				type="button"
				disabled={snapshot.isLocating}
				onClick={() => void snapshot.request('locate')}
			>
				{snapshot.isLocating ? 'Checking location…' : 'Get my location'}
			</button>
			{snapshot.isLocating && (
				<button
					className="cancel-location-action"
					type="button"
					onClick={snapshot.cancel}
				>
					Cancel location lookup
				</button>
			)}
			<div
				className="snapshot-feedback"
				aria-live="polite"
				aria-atomic="true"
				tabIndex={reading || snapshot.message ? 0 : undefined}
			>
				{reading && (
					<p className="snapshot-last-checked">
						<span aria-hidden="true" className="snapshot-marker-key" />
						Last checked:{' '}
						<time
							dateTime={new Date(reading.capturedAtMilliseconds).toISOString()}
						>
							{new Date(reading.capturedAtMilliseconds).toLocaleString()}
						</time>
						. Approximate accuracy: {Math.ceil(reading.accuracyMeters)} m.
					</p>
				)}
				{snapshot.message && (
					<p className="snapshot-message">{snapshot.message}</p>
				)}
				{snapshot.retained && (
					<p className="snapshot-retained">
						Previous snapshot retained; it has not been refreshed.
					</p>
				)}
				{reading && area === 'outside' && (
					<p>
						You appear off campus. The map remains focused on campus; this
						snapshot is outside the displayed area.
					</p>
				)}
				{reading && area === 'uncertain' && (
					<p>
						Your approximate position overlaps the mapped area edge, or accuracy
						is too limited to determine whether you are on campus.
					</p>
				)}
				{reading && area === 'inside' && (
					<p>Approximate campus snapshot, not live movement.</p>
				)}
			</div>
		</section>
	)
}
