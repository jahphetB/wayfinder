import { createLocation } from '@/domain/navigation/factories'

import { determineRoutePlan, findRouteForLocations } from './routePlanner'
import { collegeOfIdahoWalkingGraph } from '@/data/navigation/collegeOfIdahoWalkingGraph'
import { mockLocations } from '@/data/navigation/mockLocations'

const campusEntrance = mockLocations.find(
  (location) => location.id === 'campus-entrance',
)
const tertelingsLibrary = mockLocations.find(
  (location) => location.id === 'tertelings-library',
)

if (!campusEntrance || !tertelingsLibrary) {
  throw new Error('Required navigation fixtures are missing')
}

describe('route planner model', () => {
  it('returns an invalid-location state when a selection is missing', () => {
    expect(
      determineRoutePlan(
        collegeOfIdahoWalkingGraph,
        undefined,
        tertelingsLibrary,
      ),
    ).toEqual({ status: 'invalid-location' })
  })

  it('returns an unavailable state when the graph has no connected location', () => {
    const unconnectedLocation = createLocation({
      id: 'unconnected-location',
      label: 'Unconnected Location',
      coordinates: { latitude: 43.67, longitude: -116.68 },
    })

    expect(
      determineRoutePlan(
        collegeOfIdahoWalkingGraph,
        campusEntrance,
        unconnectedLocation,
      ),
    ).toEqual({ status: 'route-unavailable' })
  })

  it('returns a route-ready state and calculates routes in either direction', () => {
    const reverseRoute = findRouteForLocations(
      collegeOfIdahoWalkingGraph,
      tertelingsLibrary,
      campusEntrance,
    )
    const forwardRoute = findRouteForLocations(
      collegeOfIdahoWalkingGraph,
      campusEntrance,
      tertelingsLibrary,
    )

    expect(reverseRoute?.id).toBe('tertelings-library-to-campus-entrance')
    expect(forwardRoute?.id).toBe('campus-entrance-to-tertelings-library')
    expect(
      determineRoutePlan(
        collegeOfIdahoWalkingGraph,
        campusEntrance,
        tertelingsLibrary,
      ),
    ).toEqual({ status: 'route-ready', route: forwardRoute })
  })
})
