import { BrowserLocationProvider } from '@/features/navigation/infrastructure/BrowserLocationProvider'
import type { LocationProvider } from '@/features/navigation/contracts/LocationProvider'
import { PrototypeLocationProvider } from '@/features/navigation/infrastructure/PrototypeLocationProvider'

export function createLocationProvider(): LocationProvider {
  if (import.meta.env.VITE_LOCATION_MODE !== 'browser') {
    return new PrototypeLocationProvider()
  }

  return new BrowserLocationProvider(
    typeof navigator === 'undefined' ? undefined : navigator.geolocation,
    globalThis.isSecureContext === true,
  )
}
