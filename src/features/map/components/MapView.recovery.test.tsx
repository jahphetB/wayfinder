import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { createMapAdapter } from '@/composition/createMapAdapter'
import { recoverySettings } from '@/app/recoverySettings'
import type {
	MapAdapter,
	MapAdapterCallbacks,
	MapInitialView,
} from '../contracts/MapAdapter'
import { MapView } from './MapView'

vi.mock('@/composition/createMapAdapter', () => ({ createMapAdapter: vi.fn() }))

afterEach(() => {
	cleanup()
	vi.useRealTimers()
})

function createPendingAdapter() {
	let callbacks: MapAdapterCallbacks | undefined
	const adapter = {
		initialize: vi.fn(
			(
				_container: HTMLElement,
				_view: MapInitialView,
				value?: MapAdapterCallbacks,
			) => {
				callbacks = value
			},
		),
		setMode: vi.fn(),
		setContent: vi.fn(),
		showUserLocation: vi.fn(),
		destroy: vi.fn(),
	} satisfies MapAdapter
	return { adapter, callbacks: () => callbacks }
}

function renderPendingMap() {
	return render(
		<MapView
			origin={undefined}
			destination={undefined}
			route={undefined}
			navigationSession={undefined}
			drivingHandoff={undefined}
			mode="2d"
			onModeChange={vi.fn()}
			locationLookupProvider={{ requestCurrentLocation: vi.fn() }}
		/>,
	)
}

describe('map lifecycle recovery', () => {
	it('distinguishes lost graphics from an unsupported browser', async () => {
		const pending = createPendingAdapter()
		vi.mocked(createMapAdapter).mockReturnValue(pending.adapter)
		renderPendingMap()
		await act(async () => {
			pending.callbacks()?.onReady?.()
			pending
				.callbacks()
				?.onError?.(new Error('WebGL graphics context was lost'))
			await Promise.resolve()
		})
		expect(screen.getByRole('alert')).toHaveTextContent(
			'The map graphics were interrupted',
		)
		expect(screen.getByRole('alert')).not.toHaveTextContent(
			'Enable graphics acceleration',
		)
	})
	it('times out, ignores stale readiness, and replays content and mode on explicit retry', async () => {
		vi.useFakeTimers()
		const first = createPendingAdapter()
		const second = createPendingAdapter()
		vi.mocked(createMapAdapter)
			.mockReturnValueOnce(first.adapter)
			.mockReturnValueOnce(second.adapter)
		renderPendingMap()
		await act(async () => {
			vi.advanceTimersByTime(
				recoverySettings.mapInitializationTimeoutMilliseconds,
			)
			await Promise.resolve()
		})
		expect(screen.getByRole('alert')).toHaveTextContent('Check your connection')
		expect(first.adapter.destroy).toHaveBeenCalledTimes(1)
		act(() => first.callbacks()?.onReady?.())
		expect(screen.getByRole('button', { name: '2D' })).toBeDisabled()
		fireEvent.click(screen.getByRole('button', { name: 'Try map again' }))
		expect(second.adapter.setContent).toHaveBeenCalledWith(
			expect.objectContaining({ route: undefined }),
		)
		expect(second.adapter.setMode).toHaveBeenCalledWith('2d')
		act(() => second.callbacks()?.onReady?.())
		expect(screen.getByRole('button', { name: '2D' })).toBeEnabled()
		expect(
			screen.getByRole('group', { name: 'Building details' }),
		).toBeInTheDocument()
		expect(vi.getTimerCount()).toBe(0)
	})

	it('retains controls on partial imagery failure and destroys a fatally failed map', async () => {
		const first = createPendingAdapter()
		vi.mocked(createMapAdapter).mockReturnValue(first.adapter)
		const view = renderPendingMap()
		act(() => {
			first.callbacks()?.onReady?.()
			first.callbacks()?.onWarning?.()
		})
		expect(screen.getByRole('status')).toHaveTextContent(
			'Some map imagery could not load',
		)
		expect(screen.getByRole('button', { name: '2D' })).toBeEnabled()
		await act(async () => {
			first
				.callbacks()
				?.onError?.(new Error('https://private.test/style?token=secret'))
			await Promise.resolve()
		})
		expect(screen.getByRole('alert')).not.toHaveTextContent('secret')
		expect(first.adapter.destroy).toHaveBeenCalledTimes(1)
		expect(screen.getByRole('button', { name: '2D' })).toBeDisabled()
		expect(
			screen.queryByRole('group', { name: 'Building details' }),
		).not.toBeInTheDocument()
		view.unmount()
		expect(first.adapter.destroy).toHaveBeenCalledTimes(1)
	})

	it('clears its deadline and ignores callbacks after unmount', () => {
		vi.useFakeTimers()
		const pending = createPendingAdapter()
		vi.mocked(createMapAdapter).mockReturnValue(pending.adapter)
		const view = renderPendingMap()
		view.unmount()
		expect(vi.getTimerCount()).toBe(0)
		act(() => pending.callbacks()?.onReady?.())
		expect(pending.adapter.destroy).toHaveBeenCalledTimes(1)
	})
})
