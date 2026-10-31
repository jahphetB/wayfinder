import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn((query: string) => ({
		matches: query === '(min-width: 640px)',
		media: query,
		onchange: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		addListener: vi.fn(),
		removeListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
})

// jsdom has no native modal lifecycle; browser checks cover real focus trapping.
HTMLDialogElement.prototype.showModal = function () {
	this.open = true
	this.querySelector('button')?.focus()
}
HTMLDialogElement.prototype.close = function () {
	this.open = false
}
// Rendering is covered by real-browser screenshots, not jsdom's absent 2D canvas.
vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
	() => null,
)
