import { NavigationValidationError, createCoordinates } from './factories'
import type { Coordinates, LocationReading } from './types'

const earthRadiusMeters = 6_371_008.8

interface LocationReadingInput {
	readonly coordinates: Coordinates
	readonly accuracyMeters: number
	readonly capturedAtMilliseconds: number
}

export function createLocationReading(
	input: LocationReadingInput,
): LocationReading {
	assertNonNegative(input.accuracyMeters, 'Location accuracy')
	assertNonNegative(input.capturedAtMilliseconds, 'Location timestamp')

	return Object.freeze({
		coordinates: createCoordinates(input.coordinates),
		accuracyMeters: input.accuracyMeters,
		capturedAtMilliseconds: input.capturedAtMilliseconds,
	})
}

export function calculateDistanceMeters(
	from: Coordinates,
	to: Coordinates,
): number {
	const fromLatitude = degreesToRadians(from.latitude)
	const toLatitude = degreesToRadians(to.latitude)
	const latitudeDifference = toLatitude - fromLatitude
	const longitudeDifference = degreesToRadians(to.longitude - from.longitude)

	const haversine =
		Math.sin(latitudeDifference / 2) ** 2 +
		Math.cos(fromLatitude) *
			Math.cos(toLatitude) *
			Math.sin(longitudeDifference / 2) ** 2
	const clampedHaversine = Math.min(1, Math.max(0, haversine))

	return (
		2 *
		earthRadiusMeters *
		Math.atan2(Math.sqrt(clampedHaversine), Math.sqrt(1 - clampedHaversine))
	)
}

function assertNonNegative(value: number, name: string): void {
	if (!Number.isFinite(value) || value < 0) {
		throw new NavigationValidationError(`${name} must be a non-negative number`)
	}
}

function degreesToRadians(value: number): number {
	return (value * Math.PI) / 180
}
