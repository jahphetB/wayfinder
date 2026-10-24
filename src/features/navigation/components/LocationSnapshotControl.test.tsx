import { act, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { LocationFeedback } from './LocationSnapshotControl'
import type { LocationSnapshot } from '../hooks/useLocationSnapshot'

describe('mobile location feedback', () => {
	it('ages a real snapshot without acquiring another location or displaying desktop annotations', () => {
		vi.useFakeTimers()
		try {
			vi.setSystemTime(new Date('2026-10-24T12:00:00Z'))
			const request = vi.fn()
			const snapshot = {
				scope: 'route',
				status: 'ready',
				isLocating: false,
				retained: false,
				message: 'Location snapshot updated. This is not a live position.',
				reading: {
					coordinates: { latitude: 43.6526, longitude: -116.676 },
					accuracyMeters: 6.2,
					capturedAtMilliseconds: Date.now() - 5000,
				},
				request,
				cancel: vi.fn(),
			} satisfies LocationSnapshot
			const view = render(<LocationFeedback snapshot={snapshot} mobile />)
			expect(screen.getByText(/Last checked/)).toHaveTextContent(
				'Last checked 5s ago · ±7 m',
			)
			void act(() => {
				vi.advanceTimersByTime(2000)
			})
			expect(screen.getByText(/Last checked/)).toHaveTextContent(
				'Last checked 7s ago · ±7 m',
			)
			expect(screen.queryByText(/Not live/)).not.toBeInTheDocument()
			expect(request).not.toHaveBeenCalled()
			view.unmount()
			expect(vi.getTimerCount()).toBe(0)
		} finally {
			vi.useRealTimers()
		}
	})
})
