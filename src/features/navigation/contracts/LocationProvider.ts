import type { LocationReading } from '@/domain/navigation/types'

export interface LocationProvider {
  requestCurrentLocation(): Promise<LocationReading>
}
