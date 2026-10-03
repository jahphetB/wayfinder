import osmSnapshot from './campusOsmNetwork.json'
import { calculateDistanceMeters } from '@/domain/navigation/locationVerification'
import type { Coordinates } from '@/domain/navigation/types'

export interface DrivingHandoff {
  readonly destinationId: 'simplot-stadium'
  readonly exitLabel: string
  readonly arrivalLabel: string
  readonly accessNotice: string
  readonly coordinates: readonly Coordinates[]
  readonly instructions: readonly string[]
}

function roadSegment(
  wayId: string,
  startId: string,
  endId: string,
): readonly string[] {
  const way = osmSnapshot.roadWays.find(({ id }) => id === wayId)
  if (!way) throw new Error(`Missing stadium approach road ${wayId}`)
  const start = way.nodeIds.indexOf(startId)
  const end = way.nodeIds.indexOf(endId)
  if (start < 0 || end < 0) {
    throw new Error(`Road ${wayId} no longer joins the stadium approach`)
  }
  if (way.oneway && start > end) {
    throw new Error(`Stadium preview would go against one-way road ${wayId}`)
  }
  return start <= end
    ? way.nodeIds.slice(start, end + 1)
    : way.nodeIds.slice(end, start + 1).reverse()
}

function coordinates(nodeId: string): Coordinates {
  const pair = (osmSnapshot.nodes as Record<string, number[]>)[nodeId]
  if (!pair) throw new Error(`Missing stadium approach point ${nodeId}`)
  if (pair[0] === undefined || pair[1] === undefined) {
    throw new Error(`Incomplete stadium approach point ${nodeId}`)
  }
  return { latitude: pair[0], longitude: pair[1] }
}

const exitId = '127625903'
const otherMappedExitId = '127681168'
const arrivalId = '3347045348'
const exitRoad = osmSnapshot.roadWays.find(({ id }) => id === '13756795')
if (exitRoad?.access !== 'private') {
  throw new Error(
    'The mapped campus exit access tag changed; review the handoff',
  )
}
if (
  calculateDistanceMeters(coordinates(exitId), coordinates(arrivalId)) >=
  calculateDistanceMeters(
    coordinates(otherMappedExitId),
    coordinates(arrivalId),
  )
) {
  throw new Error('A different mapped campus driveway is closer to the stadium')
}

const nodeIds = [
  ...roadSegment('197875245', exitId, '127809809'),
  ...roadSegment('13767980', '127809809', '3347045352').slice(1),
  ...roadSegment('327890075', '3347045352', arrivalId).slice(1),
]

export const stadiumDrivingHandoff: DrivingHandoff = Object.freeze({
  destinationId: 'simplot-stadium',
  exitLabel: 'the mapped campus driveway at Cleveland Boulevard',
  arrivalLabel: 'West-side stadium parking approach',
  accessNotice:
    'The export tags the campus driveway private. Confirm that you are permitted to use it before driving.',
  coordinates: Object.freeze(nodeIds.map(coordinates)),
  instructions: Object.freeze([
    'If permitted, leave campus at the mapped driveway onto Cleveland Boulevard.',
    'Follow one-way Cleveland Boulevard south to South 24th Avenue.',
    'Turn onto South 24th Avenue and continue to the mapped stadium parking access.',
    'Follow the parking access to the west-side stadium approach; the venue entrance is not yet verified.',
  ]),
})
