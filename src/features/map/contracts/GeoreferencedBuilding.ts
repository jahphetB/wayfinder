import type { Coordinates } from '@/domain/navigation/types'

export interface GeoreferencedBuilding {
	readonly id: string
	readonly label: string
	readonly anchor: Coordinates
	readonly altitudeMeters: number
	readonly footprint: readonly Coordinates[]
	readonly heightMeters: number
	readonly color: string
	readonly verificationStatus: 'illustrative' | 'verified'
}
