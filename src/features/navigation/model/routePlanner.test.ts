import { createLocation } from '@/domain/navigation/factories'

import { determineRoutePlan, findRouteForLocations } from './routePlanner'
import { mockRoutes } from '@/data/navigation/mockRoutes'
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
      determineRoutePlan(mockRoutes, undefined, tertelingsLibrary),
    ).toEqual({ status: 'invalid-location' })
  })

  it('returns an unavailable state when no sample route connects the locations', () => {
    const unconnectedLocation = createLocation({
      id: 'unconnected-location',
      label: 'Unconnected Location',
      coordinates: { latitude: 43.67, longitude: -116.68 },
    })

    expect(
      determineRoutePlan(mockRoutes, campusEntrance, unconnectedLocation),
    ).toEqual({ status: 'route-unavailable' })
  })

  it('returns a route-ready state and finds routes in either direction', () => {
    const route = findRouteForLocations(
      mockRoutes,
      tertelingsLibrary,
      campusEntrance,
    )

    expect(route?.id).toBe('campus-entrance-to-tertelings-library')
    expect(
      determineRoutePlan(mockRoutes, campusEntrance, tertelingsLibrary),
    ).toEqual({ status: 'route-ready', route })
  })
})
