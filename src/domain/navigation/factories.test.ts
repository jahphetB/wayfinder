import {
  NavigationValidationError,
  createCoordinates,
  createRoute,
  createWalkingGraph,
  createWalkingGraphRelease,
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
        steps: [
          {
            id: 'invalid-route-step-1',
            edgeId: 'test-edge',
            maneuver: 'depart',
            instruction: 'Start walking for 100 m.',
            coordinates: [
              { latitude: 43.6642, longitude: -116.6885 },
              { latitude: 43.6652, longitude: -116.6871 },
            ],
            distanceMeters: 100,
            checkpoint: {
              id: 'invalid-route-checkpoint-1',
              kind: 'destination',
              coordinates: { latitude: 43.6652, longitude: -116.6871 },
            },
          },
        ],
        distanceMeters: 100,
        estimatedDurationMinutes: 2,
      }),
    ).toThrow(NavigationValidationError)
  })

  it('rejects a walking edge that references an unknown node', () => {
    expect(() =>
      createWalkingGraph({
        nodes: [
          {
            id: 'known-node',
            coordinates: { latitude: 43.6642, longitude: -116.6885 },
          },
        ],
        edges: [
          {
            id: 'invalid-edge',
            fromNodeId: 'known-node',
            toNodeId: 'unknown-node',
            distanceMeters: 100,
          },
        ],
      }),
    ).toThrow(NavigationValidationError)
  })

  it('rejects edge geometry that does not connect its declared nodes', () => {
    expect(() =>
      createWalkingGraph({
        nodes: [
          { id: 'start', coordinates: { latitude: 43.65, longitude: -116.68 } },
          { id: 'end', coordinates: { latitude: 43.651, longitude: -116.679 } },
        ],
        edges: [
          {
            id: 'disconnected-geometry',
            fromNodeId: 'start',
            toNodeId: 'end',
            distanceMeters: 100,
            geometry: [
              { latitude: 43.6505, longitude: -116.6795 },
              { latitude: 43.651, longitude: -116.679 },
            ],
          },
        ],
      }),
    ).toThrow(NavigationValidationError)
  })

  it('rejects verified walking-graph data without a named verifier', () => {
    const graph = createWalkingGraph({
      nodes: [
        {
          id: 'known-node',
          coordinates: { latitude: 43.6642, longitude: -116.6885 },
        },
      ],
      edges: [],
    })

    expect(() =>
      createWalkingGraphRelease({
        graph,
        provenance: {
          sourceDescription: 'Campus facilities survey',
          verificationStatus: 'verified',
          reviewedOn: '2026-09-20',
        },
      }),
    ).toThrow(NavigationValidationError)
  })
})
