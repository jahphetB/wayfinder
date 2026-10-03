import { createLocation } from '@/domain/navigation/factories'

import { determineRoutePlan, findRouteForLocations } from './routePlanner'
import { collegeOfIdahoWalkingGraph } from '@/data/navigation/collegeOfIdahoWalkingGraph'
import { mockLocations } from '@/data/navigation/mockLocations'

const simplotDiningHall = mockLocations.find(
  (location) => location.id === 'simplot-dining-hall',
)
const cruzenMurrayLibrary = mockLocations.find(
  (location) => location.id === 'cruzen-murray-library',
)
const simplotStadium = mockLocations.find(
  (location) => location.id === 'simplot-stadium',
)

if (!simplotDiningHall || !cruzenMurrayLibrary || !simplotStadium) {
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
        simplotDiningHall,
        unconnectedLocation,
      ),
    ).toEqual({ status: 'route-unavailable' })
  })

  it('returns a route-ready state and calculates routes in either direction', () => {
    const reverseRoute = findRouteForLocations(
      collegeOfIdahoWalkingGraph,
      cruzenMurrayLibrary,
      simplotDiningHall,
    )
    const forwardRoute = findRouteForLocations(
      collegeOfIdahoWalkingGraph,
      simplotDiningHall,
      cruzenMurrayLibrary,
    )

    expect(reverseRoute?.id).toBe(
      'cruzen-murray-library-to-simplot-dining-hall',
    )
    expect(forwardRoute?.id).toBe(
      'simplot-dining-hall-to-cruzen-murray-library',
    )
    expect(
      determineRoutePlan(
        collegeOfIdahoWalkingGraph,
        simplotDiningHall,
        cruzenMurrayLibrary,
      ),
    ).toEqual({ status: 'route-ready', route: forwardRoute })
  })

  it('shows a driving handoff, not walking checkpoints, for Simplot Stadium', () => {
    const plan = determineRoutePlan(
      collegeOfIdahoWalkingGraph,
      cruzenMurrayLibrary,
      simplotStadium,
    )
    expect(plan.status).toBe('driving-handoff')
    if (plan.status !== 'driving-handoff') return
    expect(plan.handoff.exitLabel).toContain('Cleveland Boulevard')
    expect(plan.handoff.coordinates.length).toBeGreaterThan(4)
  })
})
