import type { Coordinates, MapMode } from '@/domain/navigation/types'

export interface MapInitialView {
  readonly center: Coordinates
  readonly zoom: number
  readonly mode: MapMode
}

export interface MapAdapter {
  initialize(container: HTMLElement, initialView: MapInitialView): void
  setMode(mode: MapMode): void
  destroy(): void
}

export type MapAdapterFactory = () => MapAdapter
