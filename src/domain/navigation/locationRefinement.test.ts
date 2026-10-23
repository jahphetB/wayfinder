import { selectBestRecentReading } from './locationRefinement'
import type { LocationReading } from './types'

const reading = (
	accuracyMeters: number,
	capturedAtMilliseconds: number,
): LocationReading => ({
	coordinates: { latitude: 43.65, longitude: -116.68 },
	accuracyMeters,
	capturedAtMilliseconds,
})

describe('selectBestRecentReading', () => {
	it('keeps the most accurate recent reading, preferring newer ties', () => {
		const older = reading(5, 1000)
		const newer = reading(5, 2000)
		expect(
			selectBestRecentReading([older, reading(10, 2500), newer], 3000, 2500),
		).toBe(newer)
	})
	it('ignores stale and future readings rather than treating them as precise fixes', () => {
		expect(
			selectBestRecentReading(
				[reading(1, 0), reading(1, 4000), reading(30, 2900)],
				3000,
				1000,
			)?.accuracyMeters,
		).toBe(30)
		expect(selectBestRecentReading([], 3000, 1000)).toBeUndefined()
		expect(selectBestRecentReading([reading(1, 0)], 3000, 1000)).toBeUndefined()
	})
})
