import type { Coordinates } from '@/domain/navigation/types'

export interface BuildingDimensionsMeters {
  readonly width: number
  readonly depth: number
  readonly height: number
}

export interface GeoreferencedBuilding {
  readonly id: string
  readonly label: string
  readonly anchor: Coordinates
  readonly altitudeMeters: number
  readonly headingDegrees: number
  readonly dimensionsMeters: BuildingDimensionsMeters
  readonly color: string
  readonly verificationStatus: 'illustrative' | 'verified'
}
