import type {
  Coordinates,
  RouteManeuver,
  RouteStep,
  WalkingGraph,
  WalkingGraphEdge,
  WalkingPath,
} from './types'

const straightThresholdDegrees = 30
const turnAroundThresholdDegrees = 150

export function createRouteSteps(
  graph: WalkingGraph,
  path: WalkingPath,
  routeId: string,
): readonly RouteStep[] {
  const edgesById = new Map(graph.edges.map((edge) => [edge.id, edge]))

  return Object.freeze(
    path.edgeIds.map((edgeId, index): RouteStep => {
      const edge = edgesById.get(edgeId)
      const startNodeId = path.nodeIds[index]

      if (!edge || !startNodeId) {
        throw new Error(`Walking path references unknown edge: ${edgeId}`)
      }

      const coordinates = orientEdgeGeometry(edge, startNodeId)
      const previousCoordinates =
        index === 0
          ? undefined
          : orientEdgeGeometry(
              requireEdge(edgesById, path.edgeIds[index - 1]),
              path.nodeIds[index - 1],
            )
      const maneuver = previousCoordinates
        ? determineManeuver(previousCoordinates, coordinates)
        : 'depart'
      const isFinalStep = index === path.edgeIds.length - 1
      const checkpointCoordinates = coordinates.at(-1)

      if (!checkpointCoordinates) {
        throw new Error(`Walking edge ${edge.id} has no checkpoint coordinate`)
      }

      return Object.freeze({
        id: `${routeId}-step-${index + 1}`,
        edgeId,
        maneuver,
        instruction: createInstruction(
          maneuver,
          edge.distanceMeters,
          isFinalStep,
        ),
        coordinates,
        distanceMeters: edge.distanceMeters,
        checkpoint: Object.freeze({
          id: `${routeId}-checkpoint-${index + 1}`,
          kind: isFinalStep ? ('destination' as const) : ('turn' as const),
          coordinates: checkpointCoordinates,
        }),
      })
    }),
  )
}

function requireEdge(
  edgesById: ReadonlyMap<string, WalkingGraphEdge>,
  edgeId: string | undefined,
): WalkingGraphEdge {
  const edge = edgeId ? edgesById.get(edgeId) : undefined
  if (!edge) {
    throw new Error(`Walking path references unknown edge: ${edgeId ?? ''}`)
  }

  return edge
}

function orientEdgeGeometry(
  edge: WalkingGraphEdge,
  startNodeId: string | undefined,
): readonly Coordinates[] {
  if (edge.fromNodeId === startNodeId) {
    return edge.geometry
  }

  if (edge.toNodeId === startNodeId) {
    return Object.freeze([...edge.geometry].reverse())
  }

  throw new Error(
    `Walking path enters edge ${edge.id} from a node it does not connect`,
  )
}

function determineManeuver(
  previousCoordinates: readonly Coordinates[],
  currentCoordinates: readonly Coordinates[],
): RouteManeuver {
  const incomingStart = previousCoordinates.at(-2)
  const incomingEnd = previousCoordinates.at(-1)
  const outgoingStart = currentCoordinates[0]
  const outgoingEnd = currentCoordinates[1]

  if (!incomingStart || !incomingEnd || !outgoingStart || !outgoingEnd) {
    throw new Error('Route step geometry requires at least two coordinates')
  }

  const incomingBearing = calculateBearing(incomingStart, incomingEnd)
  const outgoingBearing = calculateBearing(outgoingStart, outgoingEnd)
  const turnDegrees = normalizeDegrees(outgoingBearing - incomingBearing)
  const absoluteTurnDegrees = Math.abs(turnDegrees)

  if (absoluteTurnDegrees < straightThresholdDegrees) return 'continue'
  if (absoluteTurnDegrees >= turnAroundThresholdDegrees) return 'turn-around'
  return turnDegrees < 0 ? 'turn-left' : 'turn-right'
}

function calculateBearing(from: Coordinates, to: Coordinates): number {
  const fromLatitude = degreesToRadians(from.latitude)
  const toLatitude = degreesToRadians(to.latitude)
  const longitudeDifference = degreesToRadians(to.longitude - from.longitude)

  const y = Math.sin(longitudeDifference) * Math.cos(toLatitude)
  const x =
    Math.cos(fromLatitude) * Math.sin(toLatitude) -
    Math.sin(fromLatitude) *
      Math.cos(toLatitude) *
      Math.cos(longitudeDifference)

  return (radiansToDegrees(Math.atan2(y, x)) + 360) % 360
}

function normalizeDegrees(value: number): number {
  return ((value + 540) % 360) - 180
}

function createInstruction(
  maneuver: RouteManeuver,
  distanceMeters: number,
  isFinalStep: boolean,
): string {
  const action = {
    depart: 'Start walking',
    continue: 'Continue straight',
    'turn-left': 'Turn left',
    'turn-right': 'Turn right',
    'turn-around': 'Turn around',
  }[maneuver]
  const destinationText = isFinalStep ? ' to reach your destination' : ''

  return `${action} and continue for ${Math.round(distanceMeters)} m${destinationText}.`
}

function degreesToRadians(value: number): number {
  return (value * Math.PI) / 180
}

function radiansToDegrees(value: number): number {
  return (value * 180) / Math.PI
}
