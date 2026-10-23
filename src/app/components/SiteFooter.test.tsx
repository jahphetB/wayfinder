import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SiteFooter } from './SiteFooter'

it('credits the developer with a trademark and exposes the native privacy disclosure', async () => {
	const user = userEvent.setup()
	render(<SiteFooter />)
	expect(screen.getByRole('contentinfo')).toHaveTextContent(
		'Wayfinder™ · Developed by Yaphet',
	)
	expect(screen.getByRole('link', { name: 'Yaphet' })).toHaveAttribute(
		'href',
		'https://github.com/jahphetB',
	)
	const disclosure = screen.getByText('Location & privacy')
	await user.click(disclosure)
	expect(disclosure.closest('details')).toHaveAttribute('open')
	expect(screen.getByText(/Only Get my location/)).toBeVisible()
})
