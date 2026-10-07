import { collegeOfIdahoCampus } from './collegeOfIdahoCampus'
import osmSnapshot from './campusOsmNetwork.json'

describe('College of Idaho campus viewport', () => {
  it('keeps the initial map center inside the campus boundary', () => {
    const { center, bounds } = collegeOfIdahoCampus

    expect(center.latitude).toBeGreaterThan(bounds.southwest.latitude)
    expect(center.latitude).toBeLessThan(bounds.northeast.latitude)
    expect(center.longitude).toBeGreaterThan(bounds.southwest.longitude)
    expect(center.longitude).toBeLessThan(bounds.northeast.longitude)
  })

  it('keeps the opening campus-and-stadium frame inside the pan boundary', () => {
    const { bounds, overviewBounds } = collegeOfIdahoCampus

    expect(overviewBounds.southwest.latitude).toBeGreaterThan(
      bounds.southwest.latitude,
    )
    expect(overviewBounds.southwest.longitude).toBeGreaterThan(
      bounds.southwest.longitude,
    )
    expect(overviewBounds.northeast.latitude).toBeLessThan(
      bounds.northeast.latitude,
    )
    expect(overviewBounds.northeast.longitude).toBeLessThan(
      bounds.northeast.longitude,
    )
  })

  it('includes every mapped building and area outline in the opening frame', () => {
    const { southwest, northeast } = collegeOfIdahoCampus.overviewBounds
    const mappedOutlines = [...osmSnapshot.buildings, ...osmSnapshot.areas]

    for (const outline of mappedOutlines) {
      for (const nodeId of outline.nodeIds) {
        const coordinate = (osmSnapshot.nodes as Record<string, number[]>)[
          nodeId
        ]
        if (!coordinate) throw new Error(`Missing mapped point ${nodeId}`)
        expect(coordinate[0], `${outline.id}: ${nodeId}`).toBeGreaterThan(
          southwest.latitude,
        )
        expect(coordinate[0], `${outline.id}: ${nodeId}`).toBeLessThan(
          northeast.latitude,
        )
        expect(coordinate[1], `${outline.id}: ${nodeId}`).toBeGreaterThan(
          southwest.longitude,
        )
        expect(coordinate[1], `${outline.id}: ${nodeId}`).toBeLessThan(
          northeast.longitude,
        )
      }
    }
  })
})
