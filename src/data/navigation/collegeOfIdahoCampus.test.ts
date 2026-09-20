import { collegeOfIdahoCampus } from './collegeOfIdahoCampus'

describe('College of Idaho campus viewport', () => {
  it('keeps the initial map center inside the campus boundary', () => {
    const { center, bounds } = collegeOfIdahoCampus

    expect(center.latitude).toBeGreaterThan(bounds.southwest.latitude)
    expect(center.latitude).toBeLessThan(bounds.northeast.latitude)
    expect(center.longitude).toBeGreaterThan(bounds.southwest.longitude)
    expect(center.longitude).toBeLessThan(bounds.northeast.longitude)
  })
})
