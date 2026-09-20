import type {
  Coordinates,
  Location,
  LocationSearchResult,
  Route,
  WalkingGraph,
  WalkingEdgeAccessibility,
  WalkingEdgeAvailability,
  WalkingEdgeDirection,
  WalkingGraphEdge,
  WalkingGraphNode,
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

interface WalkingGraphNodeInput {
  readonly id: string
  readonly coordinates: CoordinatesInput
}

interface WalkingGraphEdgeInput {
  readonly id: string
  readonly fromNodeId: string
  readonly toNodeId: string
  readonly distanceMeters: number
  readonly direction?: WalkingEdgeDirection
  readonly availability?: WalkingEdgeAvailability
  readonly accessibility?: WalkingEdgeAccessibility
}

interface WalkingGraphInput {
  readonly nodes: readonly WalkingGraphNodeInput[]
  readonly edges: readonly WalkingGraphEdgeInput[]
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

export function createWalkingGraph(input: WalkingGraphInput): WalkingGraph {
  if (input.nodes.length === 0) {
    throw new NavigationValidationError(
      'Walking graph requires at least one node',
    )
  }

  const nodes = input.nodes.map(createWalkingGraphNode)
  assertUniqueIds(nodes, 'Walking graph node')

  const nodeIds = new Set(nodes.map((node) => node.id))
  const edges = input.edges.map((edge) => createWalkingGraphEdge(edge, nodeIds))
  assertUniqueIds(edges, 'Walking graph edge')

  return Object.freeze({
    nodes: Object.freeze(nodes),
    edges: Object.freeze(edges),
  })
}

function createWalkingGraphNode(
  input: WalkingGraphNodeInput,
): WalkingGraphNode {
  assertText(input.id, 'Walking graph node id')

  return Object.freeze({
    id: input.id,
    coordinates: createCoordinates(input.coordinates),
  })
}

function createWalkingGraphEdge(
  input: WalkingGraphEdgeInput,
  nodeIds: ReadonlySet<string>,
): WalkingGraphEdge {
  assertText(input.id, 'Walking graph edge id')
  assertText(input.fromNodeId, 'Walking graph edge start node id')
  assertText(input.toNodeId, 'Walking graph edge end node id')
  assertPositive(input.distanceMeters, 'Walking graph edge distance')

  const direction = input.direction ?? 'bidirectional'
  const availability = input.availability ?? 'available'
  const accessibility = input.accessibility ?? 'unverified'

  assertOneOf(
    direction,
    ['bidirectional', 'forward-only'],
    'Walking graph edge direction',
  )
  assertOneOf(
    availability,
    ['available', 'closed'],
    'Walking graph edge availability',
  )
  assertOneOf(
    accessibility,
    ['unverified', 'step-free', 'stairs'],
    'Walking graph edge accessibility',
  )

  if (input.fromNodeId === input.toNodeId) {
    throw new NavigationValidationError(
      'Walking graph edge must connect different nodes',
    )
  }

  if (!nodeIds.has(input.fromNodeId) || !nodeIds.has(input.toNodeId)) {
    throw new NavigationValidationError(
      'Walking graph edge must reference existing nodes',
    )
  }

  return Object.freeze({
    id: input.id,
    fromNodeId: input.fromNodeId,
    toNodeId: input.toNodeId,
    distanceMeters: input.distanceMeters,
    direction,
    availability,
    accessibility,
  })
}

function assertUniqueIds(
  values: readonly { readonly id: string }[],
  name: string,
): void {
  if (new Set(values.map((value) => value.id)).size !== values.length) {
    throw new NavigationValidationError(`${name} ids must be unique`)
  }
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

function assertOneOf<T extends string>(
  value: T,
  allowedValues: readonly T[],
  name: string,
): void {
  if (!allowedValues.includes(value)) {
    throw new NavigationValidationError(
      `${name} must be one of: ${allowedValues.join(', ')}`,
    )
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
