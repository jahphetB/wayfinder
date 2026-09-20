import { createLocation } from '@/domain/navigation/factories'

import { determineRoutePlan, findRouteForLocations } from './routePlanner'
import { collegeOfIdahoWalkingGraph } from '@/data/navigation/collegeOfIdahoWalkingGraph'
import { mockLocations } from '@/data/navigation/mockLocations'

const campusEntrance = mockLocations.find(
  (location) => location.id === 'campus-entrance',
)
const cruzenMurrayLibrary = mockLocations.find(
  (location) => location.id === 'cruzen-murray-library',
)

if (!campusEntrance || !cruzenMurrayLibrary) {
  throw new Error('Required navigation fixtures are missing')
}

describe('route planner model', () => {
  it('returns an invalid-location state when a selection is missing', () => {
    expect(
      determineRoutePlan(
        collegeOfIdahoWalkingGraph,
        undefined,
        cruzenMurrayLibrary,
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
      cruzenMurrayLibrary,
      campusEntrance,
    )
    const forwardRoute = findRouteForLocations(
      collegeOfIdahoWalkingGraph,
      campusEntrance,
      cruzenMurrayLibrary,
    )

    expect(reverseRoute?.id).toBe('cruzen-murray-library-to-campus-entrance')
    expect(forwardRoute?.id).toBe('campus-entrance-to-cruzen-murray-library')
    expect(
      determineRoutePlan(
        collegeOfIdahoWalkingGraph,
        campusEntrance,
        cruzenMurrayLibrary,
      ),
    ).toEqual({ status: 'route-ready', route: forwardRoute })
  })
})
