import type {
	Coordinates,
	Location,
	MapMode,
	NavigationSession,
	Route,
} from '@/domain/navigation/types'

export interface MapInitialView {
	readonly center: Coordinates
	readonly zoom: number
	readonly mode: MapMode
	readonly bearing?: number
	readonly maxBounds?: MapBounds
	readonly overviewBounds?: MapBounds
}

export interface MapBounds {
	readonly southwest: Coordinates
	readonly northeast: Coordinates
}

export interface MapAdapterCallbacks {
	readonly onBuildingSelect?: (buildingId: string) => void
	readonly onReady?: () => void
	readonly onError?: (error: Error) => void
	readonly onWarning?: () => void
}

export interface MapAdapter {
	initialize(
		container: HTMLElement,
		initialView: MapInitialView,
		callbacks?: MapAdapterCallbacks,
	): void
	setMode(mode: MapMode): void
	zoom(direction: 1 | -1): void
	setContent(content: MapContent): void
	showUserLocation(
		coordinates: Coordinates | undefined,
		options?: { readonly focus: boolean },
	): void
	destroy(): void
}

export interface MapContent {
	readonly selectedLocation?: Location | undefined
	readonly cameraInsets?:
		| {
				readonly top: number
				readonly bottom: number
				readonly left: number
				readonly right: number
		  }
		| undefined
	readonly origin: Location | undefined
	readonly destination: Location | undefined
	readonly route: Route | undefined
	readonly navigationSession: NavigationSession | undefined
	readonly drivingHandoff?:
		| {
				readonly coordinates: readonly Coordinates[]
		  }
		| undefined
}

export type MapAdapterFactory = () => MapAdapter
