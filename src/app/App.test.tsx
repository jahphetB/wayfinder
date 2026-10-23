import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import type { NavigationSession } from '@/domain/navigation/types'

vi.mock('@/features/map/components/MapView', () => ({
	MapView: ({
		navigationSession,
		mode,
	}: {
		navigationSession: NavigationSession | undefined
		mode: '2d' | '3d'
	}) => (
		<section
			aria-label="Interactive map"
			data-map-mode={mode}
			data-navigation-step={navigationSession?.currentStepIndex}
		/>
	),
}))

import { App } from './App'

async function selectLibraryAndDining(
	user: ReturnType<typeof userEvent.setup>,
) {
	await user.click(screen.getByRole('combobox', { name: 'Start' }))
	await user.click(
		screen.getByRole('option', { name: 'Cruzen-Murray Library' }),
	)
	await user.click(screen.getByRole('combobox', { name: 'Destination' }))
	await user.click(
		screen.getByRole('option', { name: 'Simplot Dining Hall (Cafeteria)' }),
	)
}

describe('App', () => {
	it('keeps keyboard focus on search and connects its active descendant to the actual option', async () => {
		const user = userEvent.setup()
		render(<App />)
		const input = screen.getByRole('combobox', { name: 'Start' })
		await user.click(input)
		await user.keyboard('{ArrowDown}')
		const activeId = input.getAttribute('aria-activedescendant')
		expect(activeId).toBeTruthy()
		const activeOption = document.getElementById(activeId!)
		expect(activeOption).toHaveAttribute('role', 'option')
		expect(activeOption).toHaveAttribute('aria-selected', 'true')
		expect(activeOption).toHaveAttribute('tabindex', '-1')
		expect(activeOption?.parentElement).toHaveAttribute('role', 'listbox')
		expect(input).toHaveFocus()
		await user.keyboard('{Escape}')
		expect(input).toHaveAttribute('aria-expanded', 'false')
		expect(input).not.toHaveAttribute('aria-activedescendant')
		expect(input).toHaveFocus()
		await user.keyboard('{ArrowUp}')
		expect(input).toHaveAttribute('aria-expanded', 'true')
		await user.tab()
		expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
		expect(screen.getByRole('button', { name: /Swap/ })).toHaveFocus()
	})

	it('announces empty results and resets the active option after editing', async () => {
		const user = userEvent.setup()
		render(<App />)
		const input = screen.getByRole('combobox', { name: 'Start' })
		await user.click(input)
		await user.keyboard('{ArrowDown}')
		await user.type(input, 'NoSuchCampusPlace')
		expect(input).not.toHaveAttribute('aria-activedescendant')
		expect(input).toHaveAttribute('aria-expanded', 'false')
		expect(screen.getByText('No matching start locations.')).toHaveAttribute(
			'aria-live',
			'polite',
		)
		await user.keyboard('{ArrowDown}{Enter}')
		expect(input).toHaveValue('NoSuchCampusPlace')
	})
	it('mounts navigation only after preview and resets it when editing the route', async () => {
		const user = userEvent.setup()
		const requestCurrentLocation = vi.fn().mockResolvedValue({
			coordinates: { latitude: 43.6544341, longitude: -116.6768005 },
			accuracyMeters: 1,
			capturedAtMilliseconds: Date.now(),
		})
		render(<App locationProvider={{ requestCurrentLocation }} />)
		await selectLibraryAndDining(user)
		expect(
			screen.queryByRole('button', { name: 'Start navigation' }),
		).not.toBeInTheDocument()
		await user.click(screen.getByRole('button', { name: 'Preview route' }))
		expect(requestCurrentLocation).not.toHaveBeenCalled()
		await user.click(screen.getByRole('button', { name: 'Start navigation' }))
		expect(screen.getByText(/Step 1 of \d+/)).toBeInTheDocument()
		expect(
			screen.getByRole('region', { name: 'Interactive map' }),
		).toHaveAttribute('data-navigation-step', '0')
		await user.click(screen.getByRole('button', { name: 'Preview route' }))
		expect(
			screen.getByRole('button', { name: 'Start navigation' }),
		).toBeInTheDocument()
		await user.clear(screen.getByRole('combobox', { name: 'Start' }))
		expect(
			screen.queryByRole('region', { name: 'Checkpoint navigation' }),
		).not.toBeInTheDocument()
	})
	it('renders the route-planning workspace', () => {
		render(<App />)

		expect(
			screen.getByRole('heading', { name: 'Find your way on campus' }),
		).toBeInTheDocument()
		expect(
			screen.getByRole('region', { name: 'Interactive map' }),
		).toBeInTheDocument()
		expect(
			screen.getByRole('region', { name: 'Interactive map' }),
		).toHaveAttribute('data-map-mode', '3d')
		expect(screen.getByRole('combobox', { name: 'Start' })).toHaveValue('')
		expect(screen.getByRole('combobox', { name: 'Destination' })).toHaveValue(
			'',
		)
	})

	it('shows a clear invalid-location state after a typed value is not selected', async () => {
		const user = userEvent.setup()
		render(<App />)

		const startInput = screen.getByRole('combobox', { name: 'Start' })
		await user.type(startInput, 'Unknown place')
		await user.click(screen.getByRole('button', { name: 'Preview route' }))

		expect(screen.getByRole('alert')).toHaveTextContent(
			'Choose a suggestion for both locations before previewing a route.',
		)
	})

	it('allows a person to select an autocomplete suggestion with the keyboard', async () => {
		const user = userEvent.setup()
		render(<App />)

		const startInput = screen.getByRole('combobox', { name: 'Start' })
		await user.type(startInput, 'Morrison')
		await user.keyboard('{ArrowDown}{Enter}')

		expect(startInput).toHaveValue('Morrison Quadrangle & Clock Tower')
		await user.click(screen.getByRole('combobox', { name: 'Destination' }))
		await user.click(
			screen.getByRole('option', { name: 'Simplot Dining Hall (Cafeteria)' }),
		)
		await user.click(screen.getByRole('button', { name: 'Preview route' }))
		expect(screen.getByText('Walking route')).toBeInTheDocument()
	})

	it('lets prototype users advance simulated checkpoints without exposing demo controls', async () => {
		const user = userEvent.setup()
		render(<App />)

		await selectLibraryAndDining(user)
		await user.click(screen.getByRole('button', { name: 'Preview route' }))
		expect(screen.queryByLabelText('Demo checkpoint result')).toBeNull()
		await user.click(screen.getByRole('button', { name: 'Start navigation' }))

		expect(screen.getByText(/Step 1 of \d+/)).toBeInTheDocument()
		expect(screen.getByRole('status')).toHaveTextContent(
			'simulate the next checkpoint',
		)
	})

	it('searches the added building destinations', async () => {
		const user = userEvent.setup()
		render(<App />)

		const destinationInput = screen.getByRole('combobox', {
			name: 'Destination',
		})
		await user.type(destinationInput, 'Sterry')

		expect(
			screen.getByRole('option', { name: 'Sterry Hall' }),
		).toBeInTheDocument()
	})

	it('lists the expanded campus places for scrolling and keyboard selection', async () => {
		const user = userEvent.setup()
		render(<App />)

		const destinationInput = screen.getByRole('combobox', {
			name: 'Destination',
		})
		await user.click(destinationInput)
		expect(screen.getAllByRole('option').length).toBeGreaterThan(15)
		expect(
			screen.getByRole('option', { name: 'Centennial Amphitheater' }),
		).toBeInTheDocument()
		await user.type(destinationInput, 'McCain')
		await user.keyboard('{ArrowDown}{Enter}')
		expect(destinationInput).toHaveValue('McCain Student Center')
	})

	it('keeps the start action directly after preview and separates the stadium handoff', async () => {
		const user = userEvent.setup()
		render(<App />)
		await selectLibraryAndDining(user)
		await user.click(screen.getByRole('button', { name: 'Preview route' }))
		const preview = screen.getByRole('button', { name: 'Preview route' })
		const start = screen.getByRole('button', { name: 'Start navigation' })
		expect(
			preview.compareDocumentPosition(start) & Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy()

		const destination = screen.getByRole('combobox', { name: 'Destination' })
		await user.clear(destination)
		await user.type(destination, 'Simplot Stadium')
		await user.click(screen.getByRole('option', { name: 'Simplot Stadium' }))
		await user.click(preview)
		expect(screen.getByText('Prototype driving handoff')).toBeInTheDocument()
		expect(
			screen.queryByRole('button', { name: 'Start navigation' }),
		).toBeNull()
	})
})
