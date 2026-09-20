import { createLocation } from '@/domain/navigation/factories'

import { determineRoutePlan, findRouteForLocations } from './routePlanner'
import { mockRoutes } from '@/data/navigation/mockRoutes'
import { mockLocations } from '@/data/navigation/mockLocations'

const coyoteGateway = mockLocations.find(
  (location) => location.id === 'coyote-gateway',
)
const ridgeLibrary = mockLocations.find(
  (location) => location.id === 'ridge-library',
)

if (!coyoteGateway || !ridgeLibrary) {
  throw new Error('Required navigation fixtures are missing')
}

describe('route planner model', () => {
  it('returns an invalid-location state when a selection is missing', () => {
    expect(determineRoutePlan(mockRoutes, undefined, ridgeLibrary)).toEqual({
      status: 'invalid-location',
    })
  })

  it('returns an unavailable state when no sample route connects the locations', () => {
    const unconnectedLocation = createLocation({
      id: 'unconnected-location',
      label: 'Unconnected Location',
      coordinates: { latitude: 43.67, longitude: -116.68 },
    })

    expect(
      determineRoutePlan(mockRoutes, coyoteGateway, unconnectedLocation),
    ).toEqual({ status: 'route-unavailable' })
  })

  it('returns a route-ready state and finds routes in either direction', () => {
    const route = findRouteForLocations(mockRoutes, ridgeLibrary, coyoteGateway)

    expect(route?.id).toBe('coyote-gateway-to-ridge-library')
    expect(determineRoutePlan(mockRoutes, coyoteGateway, ridgeLibrary)).toEqual(
      { status: 'route-ready', route },
    )
  })
})
