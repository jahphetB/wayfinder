import { act, renderHook } from '@testing-library/react'
import { vi } from 'vitest'
import { useLocationSnapshot } from './useLocationSnapshot'
import type { LocationProvider } from '../contracts/LocationProvider'
import { LocationProviderError } from '../contracts/LocationProviderError'

const reading = () => ({
	coordinates: { latitude: 43.6544, longitude: -116.6768 },
	accuracyMeters: 8,
	capturedAtMilliseconds: Date.now(),
})

describe('button-triggered location snapshots', () => {
	it('never requests on mount and retains a dated snapshot after refresh failure', async () => {
		const provider = {
			requestCurrentLocation: vi
				.fn()
				.mockResolvedValueOnce(reading())
				.mockRejectedValueOnce(new LocationProviderError('permission-denied')),
		}
		const { result } = renderHook(() => useLocationSnapshot(provider, 'one'))
		expect(provider.requestCurrentLocation).not.toHaveBeenCalled()
		await act(() => result.current.request('locate'))
		const first = result.current.reading
		await act(() => result.current.request('walkthrough'))
		expect(result.current.reading).toBe(first)
		expect(result.current.retained).toBe(true)
		expect(result.current.message).toContain('permission was denied')
	})
	it('cancels superseded requests and discards late results across route changes', async () => {
		const resolves: ((value: ReturnType<typeof reading>) => void)[] = []
		const provider = {
			requestCurrentLocation: vi.fn<LocationProvider['requestCurrentLocation']>(
				() => new Promise((resolve) => resolves.push(resolve)),
			),
		}
		const { result, rerender, unmount } = renderHook(
			({ scope }) => useLocationSnapshot(provider, scope),
			{ initialProps: { scope: 'one' } },
		)
		let first: Promise<void>, second: Promise<void>
		act(() => {
			first = result.current.request('walkthrough')
		})
		act(() => {
			second = result.current.request('walkthrough')
		})
		expect(
			provider.requestCurrentLocation.mock.calls[0]![0].signal?.aborted,
		).toBe(true)
		rerender({ scope: 'two' })
		expect(
			provider.requestCurrentLocation.mock.calls[1]![0].signal?.aborted,
		).toBe(true)
		await act(async () => {
			resolves[0]!(reading())
			resolves[1]!(reading())
			await Promise.all([first!, second!])
		})
		expect(result.current.reading).toBeUndefined()
		expect(result.current.isLocating).toBe(false)
		act(() => {
			void result.current.request('locate')
		})
		unmount()
		expect(
			provider.requestCurrentLocation.mock.calls[2]![0].signal?.aborted,
		).toBe(true)
	})
	it('rejects stale snapshots rather than showing them as fresh', async () => {
		const provider = {
			requestCurrentLocation: vi.fn().mockResolvedValue({
				...reading(),
				capturedAtMilliseconds: Date.now() - 60_000,
			}),
		}
		const { result } = renderHook(() => useLocationSnapshot(provider, 'one'))
		await act(() => result.current.request('locate'))
		expect(result.current.status).toBe('error')
		expect(result.current.reading).toBeUndefined()
	})
})
