import {
	calculateDistanceMeters,
	createLocationReading,
} from './locationVerification'
describe('location reading validation and geometry', () => {
	it('validates immutable real readings without checkpoint matching', () => {
		const reading = createLocationReading({
			coordinates: { latitude: 43.65, longitude: -116.68 },
			accuracyMeters: 20,
			capturedAtMilliseconds: Date.now(),
		})
		expect(Object.isFrozen(reading)).toBe(true)
		expect(() =>
			createLocationReading({ ...reading, accuracyMeters: -1 }),
		).toThrow()
		expect(() =>
			createLocationReading({
				...reading,
				coordinates: { latitude: 100, longitude: 0 },
			}),
		).toThrow()
	})
	it('calculates symmetric physical distances', () => {
		const a = { latitude: 43.65, longitude: -116.68 },
			b = { latitude: 43.651, longitude: -116.68 }
		expect(calculateDistanceMeters(a, a)).toBe(0)
		expect(calculateDistanceMeters(a, b)).toBeCloseTo(111.2, 0)
		expect(calculateDistanceMeters(a, b)).toBe(calculateDistanceMeters(b, a))
	})
})
