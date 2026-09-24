import { vi } from 'vitest'
import { PrototypeLocationProvider } from './PrototypeLocationProvider'

describe('PrototypeLocationProvider', () => {
  it('returns the requested checkpoint without using browser location', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000)
    const provider = new PrototypeLocationProvider()
    const expectedCoordinates = { latitude: 43.65, longitude: -116.68 }

    await expect(
      provider.requestCurrentLocation({ expectedCoordinates }),
    ).resolves.toEqual({
      coordinates: expectedCoordinates,
      accuracyMeters: 1,
      capturedAtMilliseconds: 1_000,
    })
    await expect(
      provider.requestCurrentLocation({ expectedCoordinates }),
    ).resolves.toMatchObject({ capturedAtMilliseconds: 1_001 })
  })
})
