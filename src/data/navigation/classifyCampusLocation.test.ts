import { classifyCampusLocation } from './classifyCampusLocation'

const reading = (
  latitude: number,
  longitude: number,
  accuracyMeters: number,
) => ({
  coordinates: { latitude, longitude },
  accuracyMeters,
  capturedAtMilliseconds: 1,
})

describe('classifyCampusLocation', () => {
  it('classifies a precise reading within the mapped campus area', () => {
    expect(classifyCampusLocation(reading(43.6544341, -116.6768005, 12))).toBe(
      'inside',
    )
  })

  it('classifies a clearly distant reading as outside', () => {
    expect(classifyCampusLocation(reading(43.661, -116.676, 20))).toBe(
      'outside',
    )
  })

  it('does not overclaim when reported accuracy crosses the area edge', () => {
    expect(classifyCampusLocation(reading(43.65563, -116.676, 20))).toBe(
      'uncertain',
    )
    expect(classifyCampusLocation(reading(43.6557, -116.676, 20))).toBe(
      'uncertain',
    )
  })
})
