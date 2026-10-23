import { vi } from 'vitest'
import { RefinedBrowserLocationProvider } from './RefinedBrowserLocationProvider'
import { locationLookupPolicy } from '../model/locationLookupPolicy'

const request = { expectedCoordinates: { latitude: 43.65, longitude: -116.68 } }
const now = 1_000_000
const position = (
	accuracy: number,
	timestamp = Date.now(),
): GeolocationPosition =>
	({
		coords: { latitude: 43.65, longitude: -116.68, accuracy },
		timestamp,
	}) as GeolocationPosition

function setup() {
	const watchPosition = vi.fn<Geolocation['watchPosition']>().mockReturnValue(7)
	const clearWatch = vi.fn<Geolocation['clearWatch']>()
	return {
		watchPosition,
		clearWatch,
		provider: new RefinedBrowserLocationProvider(
			{ watchPosition, clearWatch },
			true,
		),
	}
}

describe('RefinedBrowserLocationProvider', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(now)
	})
	afterEach(() => vi.useRealTimers())

	it('starts on demand, collects distinct fixes, and stops with the best adequate result', async () => {
		const { provider, watchPosition, clearWatch } = setup()
		const onProgress = vi.fn()
		expect(watchPosition).not.toHaveBeenCalled()
		const pending = provider.requestCurrentLocation({ ...request, onProgress })
		const [success, , options] = watchPosition.mock.calls[0]!
		expect(options).toEqual({
			enableHighAccuracy: true,
			maximumAge: 0,
			timeout: 12_000,
		})
		success(position(50))
		expect(clearWatch).not.toHaveBeenCalled()
		vi.advanceTimersByTime(100)
		success(position(8))
		await expect(pending).resolves.toMatchObject({ accuracyMeters: 8 })
		expect(onProgress).toHaveBeenLastCalledWith({
			accuracyMeters: 8,
			readingCount: 2,
		})
		expect(clearWatch).toHaveBeenCalledExactlyOnceWith(7)
		success(position(1))
		expect(onProgress).toHaveBeenCalledTimes(2)
		expect(vi.getTimerCount()).toBe(0)
	})

	it('does not count a repeated callback as another reading, and preserves a better earlier fix', async () => {
		const { provider, watchPosition, clearWatch } = setup()
		const pending = provider.requestCurrentLocation(request)
		const success = watchPosition.mock.calls[0]![0]
		const first = position(5)
		success(first)
		success(first)
		expect(clearWatch).not.toHaveBeenCalled()
		vi.advanceTimersByTime(100)
		success(position(40))
		await expect(pending).resolves.toMatchObject({ accuracyMeters: 5 })
	})

	it('returns a single coarse reading at the deadline and always clears the watcher', async () => {
		const { provider, watchPosition, clearWatch } = setup()
		const pending = provider.requestCurrentLocation(request)
		watchPosition.mock.calls[0]![0](position(80))
		vi.advanceTimersByTime(locationLookupPolicy.maximumWaitMilliseconds)
		await expect(pending).resolves.toMatchObject({ accuracyMeters: 80 })
		expect(clearWatch).toHaveBeenCalledExactlyOnceWith(7)
	})

	it('ignores stale, future, and malformed positions and times out without a usable fix', async () => {
		const { provider, watchPosition, clearWatch } = setup()
		const pending = provider.requestCurrentLocation(request)
		const rejection = expect(pending).rejects.toMatchObject({
			code: 'unavailable',
		})
		const success = watchPosition.mock.calls[0]![0]
		success(position(1, now - 20_000))
		success(position(1, now + 1000))
		success(position(-1))
		vi.advanceTimersByTime(12_000)
		await rejection
		expect(clearWatch).toHaveBeenCalledWith(7)
	})

	it.each([
		[1, 'permission-denied'],
		[2, 'unavailable'],
		[3, 'timeout'],
	] as const)(
		'handles browser error %s and cleans up',
		async (code, expected) => {
			const { provider, watchPosition, clearWatch } = setup()
			const pending = provider.requestCurrentLocation(request)
			const rejection = expect(pending).rejects.toMatchObject({
				code: expected,
			})
			watchPosition.mock.calls[0]![1]!({ code } as GeolocationPositionError)
			if (code !== 1) vi.advanceTimersByTime(12_000)
			await rejection
			expect(clearWatch).toHaveBeenCalledWith(7)
		},
	)

	it('cancels immediately, discards late results, and supports a later request', async () => {
		const { provider, watchPosition, clearWatch } = setup()
		const controller = new AbortController()
		const progress = vi.fn()
		const pending = provider.requestCurrentLocation({
			...request,
			signal: controller.signal,
			onProgress: progress,
		})
		const rejection = expect(pending).rejects.toMatchObject({
			name: 'AbortError',
		})
		controller.abort()
		await rejection
		watchPosition.mock.calls[0]![0](position(1))
		expect(progress).not.toHaveBeenCalled()
		expect(clearWatch).toHaveBeenCalledExactlyOnceWith(7)
		expect(vi.getTimerCount()).toBe(0)
		const next = provider.requestCurrentLocation(request)
		watchPosition.mock.calls[1]![0](position(5))
		vi.advanceTimersByTime(1)
		watchPosition.mock.calls[1]![0](position(4))
		await expect(next).resolves.toMatchObject({ accuracyMeters: 4 })
	})

	it('rejects unsupported, insecure, and already cancelled requests without starting a watch', async () => {
		await expect(
			new RefinedBrowserLocationProvider(
				undefined,
				false,
			).requestCurrentLocation(request),
		).rejects.toMatchObject({ code: 'insecure-context' })
		await expect(
			new RefinedBrowserLocationProvider(
				undefined,
				true,
			).requestCurrentLocation(request),
		).rejects.toMatchObject({ code: 'unsupported' })
		const { provider, watchPosition } = setup()
		await expect(
			provider.requestCurrentLocation({
				...request,
				signal: AbortSignal.abort(),
			}),
		).rejects.toMatchObject({ name: 'AbortError' })
		expect(watchPosition).not.toHaveBeenCalled()
	})

	it('cleans up a synchronously completed watcher and a throwing browser API', async () => {
		const clearWatch = vi.fn()
		const provider = new RefinedBrowserLocationProvider(
			{
				clearWatch,
				watchPosition(success) {
					success(position(10, now - 1))
					success(position(5))
					return 9
				},
			},
			true,
		)
		await expect(
			provider.requestCurrentLocation(request),
		).resolves.toMatchObject({ accuracyMeters: 5 })
		expect(clearWatch).toHaveBeenCalledExactlyOnceWith(9)
		const throwing = new RefinedBrowserLocationProvider(
			{
				clearWatch,
				watchPosition() {
					throw new Error('Browser failed')
				},
			},
			true,
		)
		await expect(
			throwing.requestCurrentLocation(request),
		).rejects.toMatchObject({ code: 'unavailable' })
		expect(vi.getTimerCount()).toBe(0)
	})
})
