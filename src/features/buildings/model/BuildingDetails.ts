import type { MapBuilding } from '@/features/map/contracts/MapBuilding'

export interface BuildingPhoto {
  readonly label: string
  readonly alt: string
  readonly src?: string
  readonly credit?: string
}

export interface BuildingDetails extends MapBuilding {
  readonly description: string
  readonly details: readonly {
    readonly heading: string
    readonly text: string
  }[]
  readonly photos: readonly [BuildingPhoto, BuildingPhoto, ...BuildingPhoto[]]
}
