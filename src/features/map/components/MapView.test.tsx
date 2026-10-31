import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { createMapAdapter } from '@/composition/createMapAdapter'
import type {
	MapAdapter,
	MapAdapterCallbacks,
	MapInitialView,
} from '@/features/map/contracts/MapAdapter'
import type { LocationProvider } from '@/features/navigation/contracts/LocationProvider'
import { LocationProviderError } from '@/features/navigation/contracts/LocationProviderError'
import { MapView } from './MapView'
import { LocationSnapshotControl } from '@/features/navigation/components/LocationSnapshotControl'
import { useLocationSnapshot } from '@/features/navigation/hooks/useLocationSnapshot'
import type { Route } from '@/domain/navigation/types'
import { findWalkingRoute } from '@/domain/navigation/walkingRoutes'
import { collegeOfIdahoWalkingGraph } from '@/data/navigation/collegeOfIdahoWalkingGraph'

vi.mock('@/composition/createMapAdapter', () => ({ createMapAdapter: vi.fn() }))

const campusReading = {
	coordinates: { latitude: 43.6544341, longitude: -116.6768005 },
	accuracyMeters: 10,
	capturedAtMilliseconds: Date.now(),
}

function renderMap(
	provider: LocationProvider,
	onBuildingSelect = vi.fn(),
	route?: Route,
) {
	const showUserLocation = vi.fn()
	vi.mocked(createMapAdapter).mockReturnValue({
		initialize: vi.fn(
			(
				_container: HTMLElement,
				_initialView: MapInitialView,
				callbacks?: MapAdapterCallbacks,
			): void => {
				callbacks?.onReady?.()
			},
		),
		setMode: vi.fn(),
		zoom: vi.fn(),
		setContent: vi.fn(),
		showUserLocation,
		destroy: vi.fn(),
	} satisfies MapAdapter)

	function MapHarness() {
		const snapshot = useLocationSnapshot(provider, 'map-test')
		return (
			<>
				<LocationSnapshotControl snapshot={snapshot} />
				<MapView
					onBuildingSelect={onBuildingSelect}
					origin={undefined}
					destination={undefined}
					route={route}
					navigationSession={undefined}
					drivingHandoff={undefined}
					mode="3d"
					onModeChange={vi.fn()}
					snapshot={snapshot}
				/>
			</>
		)
	}
	render(<MapHarness />)
	return showUserLocation
}

describe('MapView location control', () => {
	it('never lets an independent location result refocus a selected route', async () => {
		const route = findWalkingRoute(
			collegeOfIdahoWalkingGraph,
			'cruzen-murray-library',
			'sterry-hall',
		)!
		const show = renderMap(
			{ requestCurrentLocation: vi.fn().mockResolvedValue(campusReading) },
			vi.fn(),
			route,
		)
		await userEvent
			.setup()
			.click(screen.getByRole('button', { name: 'Get my location' }))
		await waitFor(() =>
			expect(show).toHaveBeenLastCalledWith(campusReading.coordinates, {
				focus: false,
			}),
		)
	})
	it('keeps the map instance while presentation props change and renders reference mode controls', () => {
		const onBuildingSelect = vi.fn()
		renderMap({ requestCurrentLocation: vi.fn() }, onBuildingSelect)
		expect(
			screen.getByRole('group', { name: 'Map display mode' }),
		).toBeInTheDocument()
		expect(
			document.getElementById('map-viewport')?.querySelector('.map-canvas'),
		).not.toBeNull()
		const adapter = vi.mocked(createMapAdapter).mock.results.at(-1)
			?.value as MapAdapter
		act(() =>
			vi
				.mocked(adapter)
				.initialize.mock.calls[0]?.[2]?.onBuildingSelect?.(
					'simplot-dining-hall',
				),
		)
		expect(onBuildingSelect).toHaveBeenCalledWith('simplot-dining-hall')
	})
	it('shows a recoverable map error when initialization fails', async () => {
		const setMode = vi.fn()
		const setContent = vi.fn()
		const destroy = vi.fn()
		const adapter: MapAdapter = {
			initialize: vi.fn(() => {
				throw new Error('WebGL is unavailable')
			}),
			setMode,
			zoom: vi.fn(),
			setContent,
			showUserLocation: vi.fn(),
			destroy,
		}
		vi.mocked(createMapAdapter).mockReturnValue(adapter)
		render(
			<MapView
				origin={undefined}
				destination={undefined}
				route={undefined}
				navigationSession={undefined}
				drivingHandoff={undefined}
				mode="3d"
				onModeChange={vi.fn()}
				snapshot={{
					scope: 'test',
					status: 'idle',
					message: '',
					isLocating: false,
					retained: false,
					request: vi.fn(),
					cancel: vi.fn(),
				}}
			/>,
		)

		expect(await screen.findByRole('alert')).toHaveTextContent(
			'WebGL2 graphics are required',
		)
		expect(setMode).not.toHaveBeenCalled()
		expect(setContent).not.toHaveBeenCalled()
		expect(destroy).toHaveBeenCalledTimes(1)
	})

	it('reports refinement progress, cancels, and discards a late result', async () => {
		let complete: ((reading: typeof campusReading) => void) | undefined
		const requestCurrentLocation = vi.fn<
			LocationProvider['requestCurrentLocation']
		>(
			() =>
				new Promise((resolve) => {
					complete = resolve
				}),
		)
		const showUserLocation = renderMap({ requestCurrentLocation })
		const user = userEvent.setup()
		await user.click(screen.getByRole('button', { name: 'Get my location' }))
		const lookup = requestCurrentLocation.mock.calls[0]![0]
		act(() => lookup.onProgress?.({ accuracyMeters: 45, readingCount: 1 }))
		expect(
			screen.getByText(/Checking location… You can continue/),
		).toBeVisible()
		await user.click(
			screen.getByRole('button', { name: 'Cancel location lookup' }),
		)
		expect(lookup.signal?.aborted).toBe(true)
		expect(screen.getByText('Location lookup cancelled.')).toBeVisible()
		await act(async () => {
			complete?.(campusReading)
			await Promise.resolve()
		})
		expect(showUserLocation).not.toHaveBeenCalledWith(campusReading.coordinates)
		expect(
			screen.getByRole('button', { name: 'Get my location' }),
		).toBeEnabled()
	})

	it('aborts active lookup when the map unmounts', async () => {
		const requestCurrentLocation = vi.fn<
			LocationProvider['requestCurrentLocation']
		>(() => new Promise(() => {}))
		renderMap({ requestCurrentLocation })
		await userEvent
			.setup()
			.click(screen.getByRole('button', { name: 'Get my location' }))
		const signal = requestCurrentLocation.mock.calls[0]![0].signal
		cleanup()
		expect(signal?.aborted).toBe(true)
	})
	it('requests real location only on click and focuses an on-campus reading', async () => {
		const requestCurrentLocation = vi.fn().mockResolvedValue(campusReading)
		const showUserLocation = renderMap({ requestCurrentLocation })

		expect(requestCurrentLocation).not.toHaveBeenCalled()
		expect(
			screen.getByRole('group', { name: 'Map display mode' }),
		).toBeInTheDocument()
		await userEvent
			.setup()
			.click(screen.getByRole('button', { name: 'Get my location' }))

		await waitFor(() =>
			expect(showUserLocation).toHaveBeenLastCalledWith(
				campusReading.coordinates,
				{ focus: true },
			),
		)
		expect(screen.getByText(/Last checked/)).toBeInTheDocument()
	})

	it('warns when clearly off campus without moving the map', async () => {
		const showUserLocation = renderMap({
			requestCurrentLocation: vi.fn().mockResolvedValue({
				...campusReading,
				coordinates: { latitude: 43.661, longitude: -116.676 },
			}),
		})
		await userEvent
			.setup()
			.click(screen.getByRole('button', { name: 'Get my location' }))

		expect(await screen.findByText(/appear off campus/)).toBeInTheDocument()
		expect(showUserLocation).toHaveBeenCalledWith(undefined, { focus: true })
		expect(showUserLocation).not.toHaveBeenCalledWith(expect.any(Object))
	})

	it('explains denied permission instead of claiming a position', async () => {
		renderMap({
			requestCurrentLocation: vi
				.fn()
				.mockRejectedValue(new LocationProviderError('permission-denied')),
		})
		await userEvent
			.setup()
			.click(screen.getByRole('button', { name: 'Get my location' }))

		expect(await screen.findByText(/permission was denied/)).toBeInTheDocument()
	})
})
