import { BrowserLocationProvider } from '@/features/navigation/infrastructure/BrowserLocationProvider'
import type { LocationProvider } from '@/features/navigation/contracts/LocationProvider'

export function createLocationProvider(): LocationProvider {
  return new BrowserLocationProvider(
    typeof navigator === 'undefined' ? undefined : navigator.geolocation,
    globalThis.isSecureContext === true,
  )
}
