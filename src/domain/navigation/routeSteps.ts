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
const nearbyTurnMergeMeters = 12

export function createRouteSteps(
  graph: WalkingGraph,
  path: WalkingPath,
  routeId: string,
): readonly RouteStep[] {
  const edgesById = new Map(graph.edges.map((edge) => [edge.id, edge]))
  const legs: {
    edgeId: string
    maneuver: RouteManeuver
    coordinates: Coordinates[]
    distanceMeters: number
  }[] = []
  let previousCoordinates: readonly Coordinates[] | undefined

  path.edgeIds.forEach((edgeId, index) => {
    const edge = edgesById.get(edgeId)
    const startNodeId = path.nodeIds[index]
    if (!edge || !startNodeId) {
      throw new Error(`Walking path references unknown edge: ${edgeId}`)
    }

    const coordinates = orientEdgeGeometry(edge, startNodeId)
    const maneuver = previousCoordinates
      ? determineManeuver(previousCoordinates, coordinates)
      : 'depart'
    const currentLeg = legs.at(-1)
    if (maneuver === 'continue' && currentLeg) {
      currentLeg.coordinates.push(...coordinates.slice(1))
      currentLeg.distanceMeters += edge.distanceMeters
    } else {
      legs.push({
        edgeId,
        maneuver,
        coordinates: [...coordinates],
        distanceMeters: edge.distanceMeters,
      })
    }
    previousCoordinates = coordinates
  })

  const guidedLegs: ((typeof legs)[number] & {
    followingManeuver?: RouteManeuver
    distanceBeforeFollowingTurn?: number
  })[] = []
  for (let index = 0; index < legs.length; index += 1) {
    const leg = legs[index]!
    const next = legs[index + 1]
    if (
      next &&
      leg.maneuver !== 'depart' &&
      leg.distanceMeters <= nearbyTurnMergeMeters &&
      next.maneuver !== 'depart'
    ) {
      guidedLegs.push({
        ...leg,
        coordinates: [...leg.coordinates, ...next.coordinates.slice(1)],
        distanceMeters: leg.distanceMeters + next.distanceMeters,
        followingManeuver: next.maneuver,
        distanceBeforeFollowingTurn: leg.distanceMeters,
      })
      index += 1
    } else {
      guidedLegs.push(leg)
    }
  }

  return Object.freeze(
    guidedLegs.map((leg, index): RouteStep => {
      const checkpointCoordinates = leg.coordinates.at(-1)
      if (!checkpointCoordinates) {
        throw new Error(
          `Walking leg ${leg.edgeId} has no checkpoint coordinate`,
        )
      }
      const isFinalStep = index === guidedLegs.length - 1
      return Object.freeze({
        id: `${routeId}-step-${index + 1}`,
        edgeId: leg.edgeId,
        maneuver: leg.maneuver,
        instruction: createInstruction(
          leg.maneuver,
          leg.distanceMeters,
          isFinalStep,
          leg.followingManeuver,
          leg.distanceBeforeFollowingTurn,
        ),
        coordinates: Object.freeze(leg.coordinates),
        distanceMeters: leg.distanceMeters,
        checkpoint: Object.freeze({
          id: `${routeId}-checkpoint-${index + 1}`,
          kind: isFinalStep ? ('destination' as const) : ('turn' as const),
          coordinates: checkpointCoordinates,
        }),
      })
    }),
  )
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
  followingManeuver?: RouteManeuver,
  distanceBeforeFollowingTurn?: number,
): string {
  const action = {
    depart: 'Start walking',
    continue: 'Continue straight',
    'turn-left': 'Turn left',
    'turn-right': 'Turn right',
    'turn-around': 'Turn around',
  }[maneuver]
  const destinationText = isFinalStep ? ' to reach your destination' : ''

  if (followingManeuver && distanceBeforeFollowingTurn !== undefined) {
    const followingAction = {
      depart: 'start walking',
      continue: 'continue straight',
      'turn-left': 'turn left',
      'turn-right': 'turn right',
      'turn-around': 'turn around',
    }[followingManeuver]
    return `${action}, then ${followingAction} after ${Math.round(distanceBeforeFollowingTurn)} m and continue for ${Math.round(distanceMeters - distanceBeforeFollowingTurn)} m${destinationText}.`
  }

  return `${action} and continue for ${Math.round(distanceMeters)} m${destinationText}.`
}

function degreesToRadians(value: number): number {
  return (value * Math.PI) / 180
}

function radiansToDegrees(value: number): number {
  return (value * 180) / Math.PI
}
