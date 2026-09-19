import {
  NavigationValidationError,
  createCoordinates,
  createRoute,
} from './factories'

describe('navigation factories', () => {
  it('creates immutable coordinates', () => {
    const coordinates = createCoordinates({
      latitude: 43.6642,
      longitude: -116.6885,
    })

    expect(coordinates).toEqual({ latitude: 43.6642, longitude: -116.6885 })
    expect(Object.isFrozen(coordinates)).toBe(true)
  })

  it('rejects an invalid coordinate range', () => {
    expect(() => createCoordinates({ latitude: 91, longitude: 0 })).toThrow(
      NavigationValidationError,
    )
  })

  it('rejects a route with the same origin and destination', () => {
    expect(() =>
      createRoute({
        id: 'invalid-route',
        originLocationId: 'same-location',
        destinationLocationId: 'same-location',
        coordinates: [
          { latitude: 43.6642, longitude: -116.6885 },
          { latitude: 43.6652, longitude: -116.6871 },
        ],
        distanceMeters: 100,
        estimatedDurationMinutes: 2,
      }),
    ).toThrow(NavigationValidationError)
  })
})
