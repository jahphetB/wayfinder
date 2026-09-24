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
  readonly maxBounds?: MapBounds
}

export interface MapBounds {
  readonly southwest: Coordinates
  readonly northeast: Coordinates
}

export interface MapAdapterCallbacks {
  readonly onReady?: () => void
  readonly onError?: (error: Error) => void
}

export interface MapAdapter {
  initialize(
    container: HTMLElement,
    initialView: MapInitialView,
    callbacks?: MapAdapterCallbacks,
  ): void
  setMode(mode: MapMode): void
  setContent(content: MapContent): void
  destroy(): void
}

export interface MapContent {
  readonly origin: Location | undefined
  readonly destination: Location | undefined
  readonly route: Route | undefined
  readonly navigationSession: NavigationSession | undefined
}

export type MapAdapterFactory = () => MapAdapter
