export type LocationFailure =
  | 'permission-denied'
  | 'unavailable'
  | 'timeout'
  | 'unsupported'
  | 'insecure-context'

export class LocationProviderError extends Error {
  constructor(readonly code: LocationFailure) {
    super(`Location request failed: ${code}`)
    this.name = 'LocationProviderError'
  }
}
