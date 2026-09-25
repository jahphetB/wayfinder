import { vi } from 'vitest'
import { LocationProviderError } from '../contracts/LocationProviderError'
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

  it('provides predictable unsuccessful and uncertain outcomes for interface testing', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(100_000)
    const provider = new PrototypeLocationProvider()
    const expectedCoordinates = { latitude: 43.65, longitude: -116.68 }

    provider.setScenario('uncertain-accuracy')
    await expect(
      provider.requestCurrentLocation({ expectedCoordinates }),
    ).resolves.toMatchObject({
      coordinates: expectedCoordinates,
      accuracyMeters: 25,
      capturedAtMilliseconds: 100_000,
    })

    provider.setScenario('mismatched')
    await expect(
      provider.requestCurrentLocation({ expectedCoordinates }),
    ).resolves.toMatchObject({
      coordinates: { latitude: 43.651, longitude: -116.68 },
      accuracyMeters: 1,
    })

    provider.setScenario('stale')
    await expect(
      provider.requestCurrentLocation({ expectedCoordinates }),
    ).resolves.toMatchObject({
      capturedAtMilliseconds: 69_000,
    })

    provider.setScenario('unavailable')
    await expect(
      provider.requestCurrentLocation({ expectedCoordinates }),
    ).rejects.toEqual(new LocationProviderError('unavailable'))
  })
})
