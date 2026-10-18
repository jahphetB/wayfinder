// Lookup tuning values, not verified promises of physical GPS precision.
export const locationLookupPolicy = Object.freeze({
  maximumWaitMilliseconds: 12_000,
  maximumReadingAgeMilliseconds: 15_000,
  targetAccuracyMeters: 15,
  minimumDistinctReadings: 2,
})
