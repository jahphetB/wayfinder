import {
  createLocation,
  createLocationSearchResult,
} from '@/domain/navigation/factories'
import { collegeOfIdahoWalkingGraphData } from './collegeOfIdahoWalkingGraphData'

function findGraphNodeCoordinates(locationId: string) {
  const node = collegeOfIdahoWalkingGraphData.graph.nodes.find(
    (candidate) => candidate.id === locationId,
  )

  if (!node) {
    throw new Error(
      `Location "${locationId}" must have a matching walking graph node`,
    )
  }

  return node.coordinates
}

export const mockLocations = Object.freeze([
  ...collegeOfIdahoWalkingGraphData.locations.map((location) =>
    createLocation({
      ...location,
      coordinates: findGraphNodeCoordinates(location.id),
    }),
  ),
])

export const mockLocationSearchResults = Object.freeze(
  mockLocations.map((location) =>
    createLocationSearchResult({
      location,
      matchedText: location.label,
    }),
  ),
)
