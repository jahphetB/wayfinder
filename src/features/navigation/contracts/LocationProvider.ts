import type { LocationReading } from '@/domain/navigation/types'

export interface LocationRequest {
	/** A single button-triggered bounded snapshot request. */
	readonly signal?: AbortSignal
	readonly onProgress?: (progress: {
		readonly accuracyMeters: number
		readonly readingCount: number
	}) => void
}

export interface LocationProvider {
	requestCurrentLocation(request: LocationRequest): Promise<LocationReading>
}
