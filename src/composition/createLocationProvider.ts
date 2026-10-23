import type { LocationProvider } from '@/features/navigation/contracts/LocationProvider'
import { RefinedBrowserLocationProvider } from '@/features/navigation/infrastructure/RefinedBrowserLocationProvider'

export function createLocationLookupProvider(): LocationProvider {
	return new RefinedBrowserLocationProvider(
		typeof navigator === 'undefined' ? undefined : navigator.geolocation,
		globalThis.isSecureContext === true,
	)
}
