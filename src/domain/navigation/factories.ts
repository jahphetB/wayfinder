import type {
  Coordinates,
  Location,
  LocationSearchResult,
  Route,
} from './types'

interface CoordinatesInput {
  readonly latitude: number
  readonly longitude: number
}

interface LocationInput {
  readonly id: string
  readonly label: string
  readonly coordinates: CoordinatesInput
}

interface LocationSearchResultInput {
  readonly location: Location
  readonly matchedText: string
}

interface RouteInput {
  readonly id: string
  readonly originLocationId: string
  readonly destinationLocationId: string
  readonly coordinates: readonly CoordinatesInput[]
  readonly distanceMeters: number
  readonly estimatedDurationMinutes: number
}

export class NavigationValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NavigationValidationError'
  }
}

export function createCoordinates(input: CoordinatesInput): Coordinates {
  assertInRange(input.latitude, -90, 90, 'Latitude')
  assertInRange(input.longitude, -180, 180, 'Longitude')

  return Object.freeze({ ...input })
}

export function createLocation(input: LocationInput): Location {
  assertText(input.id, 'Location id')
  assertText(input.label, 'Location label')

  return Object.freeze({
    id: input.id,
    label: input.label,
    coordinates: createCoordinates(input.coordinates),
  })
}

export function createLocationSearchResult(
  input: LocationSearchResultInput,
): LocationSearchResult {
  assertText(input.matchedText, 'Search result matched text')

  return Object.freeze({ ...input })
}

export function createRoute(input: RouteInput): Route {
  assertText(input.id, 'Route id')
  assertText(input.originLocationId, 'Route origin location id')
  assertText(input.destinationLocationId, 'Route destination location id')

  if (input.originLocationId === input.destinationLocationId) {
    throw new NavigationValidationError(
      'Route origin and destination must be different locations',
    )
  }

  if (input.coordinates.length < 2) {
    throw new NavigationValidationError(
      'Route geometry requires at least two coordinates',
    )
  }

  assertPositive(input.distanceMeters, 'Route distance')
  assertPositive(input.estimatedDurationMinutes, 'Route estimated duration')

  return Object.freeze({
    ...input,
    coordinates: Object.freeze(input.coordinates.map(createCoordinates)),
  })
}

function assertText(value: string, name: string): void {
  if (value.trim().length === 0) {
    throw new NavigationValidationError(`${name} cannot be empty`)
  }
}

function assertPositive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new NavigationValidationError(`${name} must be a positive number`)
  }
}

function assertInRange(
  value: number,
  minimum: number,
  maximum: number,
  name: string,
): void {
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new NavigationValidationError(
      `${name} must be between ${minimum} and ${maximum}`,
    )
  }
}
