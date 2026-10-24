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
	it('uses header building search to select a draft destination without acquiring location', async () => {
		const provider = { requestCurrentLocation: vi.fn() }
		const user = userEvent.setup()
		render(<App locationProvider={provider} />)
		await user.type(
			screen.getByRole('combobox', { name: 'Search buildings' }),
			'Sterry',
		)
		await user.click(screen.getByRole('option', { name: 'Sterry Hall' }))
		expect(screen.getByRole('combobox', { name: 'Destination' })).toHaveValue(
			'Sterry Hall',
		)
		expect(
			screen.getByRole('combobox', { name: 'Search buildings' }),
		).toHaveValue('')
		expect(provider.requestCurrentLocation).not.toHaveBeenCalled()
	})
	it('returns dialog focus to the visible menu trigger without acquiring location', async () => {
		const provider = { requestCurrentLocation: vi.fn() }
		const user = userEvent.setup()
		render(<App locationProvider={provider} />)
		const menu = screen.getByLabelText('Open menu')
		await user.click(menu)
		await user.click(
			screen.getByRole('button', { name: 'Cruzen-Murray Library details' }),
		)
		expect(
			screen.getByRole('dialog', { name: 'Cruzen-Murray Library' }),
		).toBeVisible()
		await user.click(
			screen.getByRole('button', { name: 'Close building details' }),
		)
		expect(menu).toHaveFocus()
		expect(provider.requestCurrentLocation).not.toHaveBeenCalled()
	})
	it('has one persistent map, one location control and one Back/Next pair', async () => {
		const user = userEvent.setup()
		render(
			<App
				locationProvider={{
					requestCurrentLocation: vi.fn(() => new Promise<never>(() => {})),
				}}
			/>,
		)
		await selectLibraryAndDining(user)
		await user.click(screen.getByRole('button', { name: 'Preview route' }))
		const map = screen.getByRole('region', { name: 'Interactive map' })
		await user.click(screen.getByRole('button', { name: 'Start navigating' }))
		expect(screen.getByRole('region', { name: 'Interactive map' })).toBe(map)
		expect(screen.getAllByRole('button', { name: 'Back' })).toHaveLength(1)
		expect(screen.getAllByRole('button', { name: 'Next' })).toHaveLength(1)
		expect(
			screen.getAllByRole('button', { name: 'Cancel location lookup' }),
		).toHaveLength(1)
	})
	it('advances immediately while location is pending or denied and never calls Back a location trigger', async () => {
		const user = userEvent.setup()
		const provider = {
			requestCurrentLocation: vi
				.fn()
				.mockRejectedValue(new Error('Permission denied')),
		}
		render(<App locationProvider={provider} />)
		await selectLibraryAndDining(user)
		await user.click(screen.getByRole('button', { name: 'Preview route' }))
		expect(provider.requestCurrentLocation).not.toHaveBeenCalled()
		await user.click(screen.getByRole('button', { name: 'Start navigating' }))
		expect(screen.getByText(/Step 1 of/)).toBeVisible()
		await user.click(screen.getByRole('button', { name: 'Next' }))
		expect(screen.getByText(/Step 2 of/)).toBeVisible()
		expect(provider.requestCurrentLocation).toHaveBeenCalledTimes(2)
		await user.click(screen.getByRole('button', { name: 'Back' }))
		expect(provider.requestCurrentLocation).toHaveBeenCalledTimes(2)
		while (screen.queryByRole('button', { name: 'Next' }))
			await user.click(screen.getByRole('button', { name: 'Next' }))
		expect(screen.getByRole('status')).toHaveTextContent(
			'does not confirm your physical arrival',
		)
	}, 15_000)
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

	it('retains the exact journey through invalid editing, replacement preview and Cancel', async () => {
		const user = userEvent.setup()
		render(
			<App
				locationProvider={{
					requestCurrentLocation: vi
						.fn()
						.mockRejectedValue(new Error('denied')),
				}}
			/>,
		)
		await selectLibraryAndDining(user)
		await user.click(screen.getByRole('button', { name: 'Preview route' }))
		await user.click(screen.getByRole('button', { name: 'Start navigating' }))
		await user.click(screen.getByRole('button', { name: 'Next' }))
		const map = screen.getByRole('region', { name: 'Interactive map' })
		expect(map).toHaveAttribute('data-navigation-step', '1')
		await user.click(screen.getByRole('button', { name: 'Edit route' }))
		await user.clear(screen.getByRole('combobox', { name: 'Destination' }))
		await user.click(screen.getByRole('button', { name: 'Preview changes' }))
		expect(screen.getByRole('alert')).toBeVisible()
		await user.type(
			screen.getByRole('combobox', { name: 'Destination' }),
			'Sterry',
		)
		await user.click(screen.getByRole('option', { name: 'Sterry Hall' }))
		await user.click(screen.getByRole('button', { name: 'Preview changes' }))
		await user.click(screen.getByRole('button', { name: 'Cancel' }))
		expect(screen.getByRole('region', { name: 'Interactive map' })).toBe(map)
		expect(map).toHaveAttribute('data-navigation-step', '1')
		expect(
			screen.getByRole('region', { name: 'Walking route' }),
		).toHaveTextContent('Simplot Dining Hall')
		await user.click(screen.getByRole('button', { name: 'Edit route' }))
		await user.clear(screen.getByRole('combobox', { name: 'Destination' }))
		await user.type(
			screen.getByRole('combobox', { name: 'Destination' }),
			'Sterry',
		)
		await user.click(screen.getByRole('option', { name: 'Sterry Hall' }))
		await user.click(screen.getByRole('button', { name: 'Preview changes' }))
		await user.click(screen.getByRole('button', { name: 'Start navigating' }))
		expect(map).toHaveAttribute('data-navigation-step', '0')
		expect(
			screen.getByRole('region', { name: 'Walking route' }),
		).toHaveTextContent('Sterry Hall')
	}, 15000)
	it('renders the route-planning workspace', () => {
		render(<App />)

		expect(
			screen.getByRole('heading', { name: 'Plan your route' }),
		).toBeInTheDocument()
		expect(
			screen.getByRole('region', { name: 'Interactive map' }),
		).toBeInTheDocument()
		expect(
			screen.getByRole('region', { name: 'Interactive map' }),
		).toHaveAttribute('data-map-mode', '2d')
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

	it('lets users advance the walkthrough without physical location checks', async () => {
		const user = userEvent.setup()
		render(<App />)

		await selectLibraryAndDining(user)
		await user.click(screen.getByRole('button', { name: 'Preview route' }))
		expect(screen.queryByLabelText('Demo checkpoint result')).toBeNull()
		await user.click(screen.getByRole('button', { name: 'Start navigating' }))

		expect(screen.getByText(/Step 1 of \d+/)).toBeInTheDocument()
		expect(screen.getByRole('status')).toHaveTextContent(
			'Next advances the illustration',
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
		const start = screen.getByRole('button', { name: 'Start navigating' })
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
			screen.queryByRole('button', { name: 'Start navigating' }),
		).toBeNull()
	})
})
