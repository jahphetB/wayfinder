import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'
import { FailureRecovery } from './FailureRecovery'
import { MapLoadingFallback } from './MapLoadingFallback'
import { recoverySettings } from '@/app/recoverySettings'

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
	vi.useRealTimers()
})

describe('failure recovery', () => {
	it('contains a rendering failure and provides a focused page reload action', () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined)
		function BrokenContent(): never {
			throw new Error('Private diagnostic details should not appear')
		}
		render(
			<ErrorBoundary fallback={<FailureRecovery scope="page" />}>
				<BrokenContent />
			</ErrorBoundary>,
		)
		expect(screen.getByRole('heading')).toHaveFocus()
		expect(screen.getByRole('button', { name: 'Reload page' })).toBeVisible()
		expect(
			screen.getByText(/Reloading clears your current route/),
		).toBeVisible()
		expect(screen.queryByText(/Private diagnostic/)).not.toBeInTheDocument()
	})

	it('bounds the map-module wait and removes its timer on unmount', async () => {
		vi.useFakeTimers()
		vi.spyOn(console, 'error').mockImplementation(() => undefined)
		const first = render(<MapLoadingFallback />)
		expect(screen.getByRole('status')).toHaveTextContent('Loading map')
		first.unmount()
		expect(vi.getTimerCount()).toBe(0)
		render(
			<ErrorBoundary fallback={<FailureRecovery scope="map" />}>
				<MapLoadingFallback />
			</ErrorBoundary>,
		)
		await act(async () => {
			vi.advanceTimersByTime(recoverySettings.mapModuleTimeoutMilliseconds)
			await Promise.resolve()
		})
		expect(screen.getByRole('heading')).toHaveTextContent(
			'The map could not open',
		)
		expect(screen.queryByRole('status')).not.toBeInTheDocument()
	})
})
