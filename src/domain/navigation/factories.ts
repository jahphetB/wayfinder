import type {
  Coordinates,
  Location,
  LocationSearchResult,
  Route,
  RouteCheckpointKind,
  RouteDataVerificationStatus,
  RouteManeuver,
  RouteStep,
  WalkingGraph,
  WalkingEdgeAccessibility,
  WalkingEdgeAvailability,
  WalkingEdgeDirection,
  WalkingGraphEdge,
  WalkingGraphNode,
  WalkingGraphProvenance,
  WalkingGraphRelease,
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
  readonly steps: readonly RouteStepInput[]
  readonly distanceMeters: number
  readonly estimatedDurationMinutes: number
}

interface RouteStepInput {
  readonly id: string
  readonly edgeId: string
  readonly maneuver: RouteManeuver
  readonly instruction: string
  readonly coordinates: readonly CoordinatesInput[]
  readonly distanceMeters: number
  readonly checkpoint: {
    readonly id: string
    readonly kind: RouteCheckpointKind
    readonly coordinates: CoordinatesInput
  }
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
  readonly geometry?: readonly CoordinatesInput[]
  readonly direction?: WalkingEdgeDirection
  readonly availability?: WalkingEdgeAvailability
  readonly accessibility?: WalkingEdgeAccessibility
}

interface WalkingGraphInput {
  readonly nodes: readonly WalkingGraphNodeInput[]
  readonly edges: readonly WalkingGraphEdgeInput[]
}

interface WalkingGraphProvenanceInput {
  readonly sourceDescription: string
  readonly verificationStatus: RouteDataVerificationStatus
  readonly reviewedOn: string
  readonly verifiedBy?: string
}

interface WalkingGraphReleaseInput {
  readonly graph: WalkingGraph
  readonly provenance: WalkingGraphProvenanceInput
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

  if (input.steps.length === 0) {
    throw new NavigationValidationError('Route requires at least one step')
  }

  assertPositive(input.distanceMeters, 'Route distance')
  assertPositive(input.estimatedDurationMinutes, 'Route estimated duration')

  const steps = input.steps.map(createRouteStep)
  assertRouteStepSequence(steps)

  const stepDistanceMeters = steps.reduce(
    (total, step) => total + step.distanceMeters,
    0,
  )
  if (Math.abs(stepDistanceMeters - input.distanceMeters) > 0.001) {
    throw new NavigationValidationError(
      'Route distance must equal the combined step distance',
    )
  }

  const coordinates = steps.flatMap((step, index) =>
    index === 0 ? step.coordinates : step.coordinates.slice(1),
  )

  return Object.freeze({
    id: input.id,
    originLocationId: input.originLocationId,
    destinationLocationId: input.destinationLocationId,
    coordinates: Object.freeze(coordinates),
    steps: Object.freeze(steps),
    distanceMeters: input.distanceMeters,
    estimatedDurationMinutes: input.estimatedDurationMinutes,
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

  const nodesById = new Map(nodes.map((node) => [node.id, node]))
  const edges = input.edges.map((edge) =>
    createWalkingGraphEdge(edge, nodesById),
  )
  assertUniqueIds(edges, 'Walking graph edge')

  return Object.freeze({
    nodes: Object.freeze(nodes),
    edges: Object.freeze(edges),
  })
}

export function createWalkingGraphRelease(
  input: WalkingGraphReleaseInput,
): WalkingGraphRelease {
  const provenance = createWalkingGraphProvenance(input.provenance)

  return Object.freeze({
    graph: input.graph,
    provenance,
  })
}

function createWalkingGraphProvenance(
  input: WalkingGraphProvenanceInput,
): WalkingGraphProvenance {
  assertText(input.sourceDescription, 'Walking graph source description')
  assertOneOf(
    input.verificationStatus,
    ['illustrative', 'verified'],
    'Walking graph verification status',
  )
  assertIsoDate(input.reviewedOn, 'Walking graph review date')

  if (input.verificationStatus === 'verified') {
    if (!input.verifiedBy) {
      throw new NavigationValidationError(
        'Verified walking graph data requires a verifier',
      )
    }

    assertText(input.verifiedBy, 'Walking graph verifier')
  }

  return Object.freeze({
    sourceDescription: input.sourceDescription,
    verificationStatus: input.verificationStatus,
    reviewedOn: input.reviewedOn,
    ...(input.verifiedBy ? { verifiedBy: input.verifiedBy } : {}),
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
  nodesById: ReadonlyMap<string, WalkingGraphNode>,
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

  const fromNode = nodesById.get(input.fromNodeId)
  const toNode = nodesById.get(input.toNodeId)
  if (!fromNode || !toNode) {
    throw new NavigationValidationError(
      'Walking graph edge must reference existing nodes',
    )
  }

  const geometry = (
    input.geometry ?? [fromNode.coordinates, toNode.coordinates]
  ).map(createCoordinates)

  if (geometry.length < 2) {
    throw new NavigationValidationError(
      'Walking graph edge geometry requires at least two coordinates',
    )
  }

  if (
    !coordinatesEqual(geometry[0], fromNode.coordinates) ||
    !coordinatesEqual(geometry.at(-1), toNode.coordinates)
  ) {
    throw new NavigationValidationError(
      'Walking graph edge geometry must start and end at its connected nodes',
    )
  }

  return Object.freeze({
    id: input.id,
    fromNodeId: input.fromNodeId,
    toNodeId: input.toNodeId,
    distanceMeters: input.distanceMeters,
    geometry: Object.freeze(geometry),
    direction,
    availability,
    accessibility,
  })
}

function createRouteStep(input: RouteStepInput): RouteStep {
  assertText(input.id, 'Route step id')
  assertText(input.edgeId, 'Route step edge id')
  assertText(input.instruction, 'Route step instruction')
  assertPositive(input.distanceMeters, 'Route step distance')
  assertOneOf(
    input.maneuver,
    ['depart', 'continue', 'turn-left', 'turn-right', 'turn-around'],
    'Route step maneuver',
  )
  assertText(input.checkpoint.id, 'Route checkpoint id')
  assertOneOf(
    input.checkpoint.kind,
    ['turn', 'destination'],
    'Route checkpoint kind',
  )

  if (input.coordinates.length < 2) {
    throw new NavigationValidationError(
      'Route step geometry requires at least two coordinates',
    )
  }

  const coordinates = input.coordinates.map(createCoordinates)
  const checkpointCoordinates = createCoordinates(input.checkpoint.coordinates)

  if (!coordinatesEqual(coordinates.at(-1), checkpointCoordinates)) {
    throw new NavigationValidationError(
      'Route checkpoint must match the end of its step geometry',
    )
  }

  return Object.freeze({
    id: input.id,
    edgeId: input.edgeId,
    maneuver: input.maneuver,
    instruction: input.instruction,
    coordinates: Object.freeze(coordinates),
    distanceMeters: input.distanceMeters,
    checkpoint: Object.freeze({
      id: input.checkpoint.id,
      kind: input.checkpoint.kind,
      coordinates: checkpointCoordinates,
    }),
  })
}

function assertRouteStepSequence(steps: readonly RouteStep[]): void {
  const firstStep = steps[0]
  if (!firstStep || firstStep.maneuver !== 'depart') {
    throw new NavigationValidationError(
      'The first route step maneuver must be depart',
    )
  }

  for (let index = 1; index < steps.length; index += 1) {
    const previousStep = steps[index - 1]
    const currentStep = steps[index]

    if (!previousStep || !currentStep) {
      throw new NavigationValidationError('Route step sequence is incomplete')
    }

    if (currentStep.maneuver === 'depart') {
      throw new NavigationValidationError(
        'Only the first route step maneuver can be depart',
      )
    }

    if (
      !coordinatesEqual(
        previousStep.coordinates.at(-1),
        currentStep.coordinates[0],
      )
    ) {
      throw new NavigationValidationError(
        'Route step geometries must form a continuous path',
      )
    }

    if (previousStep.checkpoint.kind !== 'turn') {
      throw new NavigationValidationError(
        'Only the final route checkpoint can be a destination',
      )
    }
  }

  if (steps.at(-1)?.checkpoint.kind !== 'destination') {
    throw new NavigationValidationError(
      'The final route checkpoint must be the destination',
    )
  }
}

function coordinatesEqual(
  first: Coordinates | undefined,
  second: Coordinates | undefined,
): boolean {
  return (
    first?.latitude === second?.latitude &&
    first?.longitude === second?.longitude
  )
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

function assertIsoDate(value: string, name: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new NavigationValidationError(`${name} must use YYYY-MM-DD format`)
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`)
  if (
    Number.isNaN(parsedDate.valueOf()) ||
    !parsedDate.toISOString().startsWith(value)
  ) {
    throw new NavigationValidationError(`${name} must be a real calendar date`)
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
