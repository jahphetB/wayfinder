import { BrowserLocationProvider } from '@/features/navigation/infrastructure/BrowserLocationProvider'
import type { LocationProvider } from '@/features/navigation/contracts/LocationProvider'
import { PrototypeLocationProvider } from '@/features/navigation/infrastructure/PrototypeLocationProvider'
import { RefinedBrowserLocationProvider } from '@/features/navigation/infrastructure/RefinedBrowserLocationProvider'

export function createLocationProvider(): LocationProvider {
	if (import.meta.env.VITE_LOCATION_MODE !== 'browser') {
		return new PrototypeLocationProvider()
	}

	return createBrowserLocationProvider()
}

export function createBrowserLocationProvider(): LocationProvider {
	return new BrowserLocationProvider(
		typeof navigator === 'undefined' ? undefined : navigator.geolocation,
		globalThis.isSecureContext === true,
	)
}

export function createLocationLookupProvider(): LocationProvider {
	return new RefinedBrowserLocationProvider(
		typeof navigator === 'undefined' ? undefined : navigator.geolocation,
		globalThis.isSecureContext === true,
	)
}
