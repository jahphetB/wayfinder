import { vi } from 'vitest'
import { BrowserLocationProvider } from './BrowserLocationProvider'

describe('BrowserLocationProvider', () => {
  function setup() {
    const getCurrentPosition = vi.fn<Geolocation['getCurrentPosition']>()
    return {
      getCurrentPosition,
      provider: new BrowserLocationProvider({ getCurrentPosition }, true),
    }
  }

  it('requests one fresh reading only on demand and validates the result', async () => {
    const { provider, getCurrentPosition } = setup()
    expect(getCurrentPosition).not.toHaveBeenCalled()
    const request = provider.requestCurrentLocation()
    const [success, , options] = getCurrentPosition.mock.calls[0]!
    expect(options).toEqual({
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15_000,
    })
    success({
      coords: { latitude: 43.65, longitude: -116.68, accuracy: 5 },
      timestamp: 1000,
    } as GeolocationPosition)
    await expect(request).resolves.toEqual({
      coordinates: { latitude: 43.65, longitude: -116.68 },
      accuracyMeters: 5,
      capturedAtMilliseconds: 1000,
    })
    expect(getCurrentPosition).toHaveBeenCalledTimes(1)
  })

  it.each([
    [1, 'permission-denied'],
    [2, 'unavailable'],
    [3, 'timeout'],
  ] as const)(
    'maps browser error %s to a stable failure',
    async (code, expected) => {
      const { provider, getCurrentPosition } = setup()
      const request = provider.requestCurrentLocation()
      getCurrentPosition.mock.calls[0]![1]!({
        code,
      } as GeolocationPositionError)
      await expect(request).rejects.toMatchObject({ code: expected })
    },
  )

  it('rejects insecure, unsupported, and invalid position results', async () => {
    await expect(
      new BrowserLocationProvider(undefined, false).requestCurrentLocation(),
    ).rejects.toMatchObject({ code: 'insecure-context' })
    await expect(
      new BrowserLocationProvider(undefined, true).requestCurrentLocation(),
    ).rejects.toMatchObject({ code: 'unsupported' })
    const { provider, getCurrentPosition } = setup()
    const request = provider.requestCurrentLocation()
    getCurrentPosition.mock.calls[0]![0]({
      coords: { latitude: 100, longitude: 0, accuracy: -1 },
      timestamp: 1000,
    } as GeolocationPosition)
    await expect(request).rejects.toMatchObject({ code: 'unavailable' })
  })
})
