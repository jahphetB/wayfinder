import type { Coordinates } from '@/domain/navigation/types'

export interface MapBuilding {
  readonly id: string
  readonly label: string
  readonly footprint: readonly Coordinates[]
}
