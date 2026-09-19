import type {
  Coordinates,
  Location,
  MapMode,
  Route,
} from '@/domain/navigation/types'

export interface MapInitialView {
  readonly center: Coordinates
  readonly zoom: number
  readonly mode: MapMode
}

export interface MapAdapter {
  initialize(container: HTMLElement, initialView: MapInitialView): void
  setMode(mode: MapMode): void
  setContent(content: MapContent): void
  destroy(): void
}

export interface MapContent {
  readonly origin: Location | undefined
  readonly destination: Location | undefined
  readonly route: Route | undefined
}

export type MapAdapterFactory = () => MapAdapter
