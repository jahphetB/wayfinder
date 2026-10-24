import deployment from '../../vercel.json'

const headers = Object.fromEntries(
	deployment.headers.flatMap((rule) =>
		rule.headers.map(({ key, value }) => [key, value]),
	),
)

describe('browser security configuration', () => {
	it('limits scripts and workers to this application without eval or inline script exceptions', () => {
		const policy = headers['Content-Security-Policy']!
		expect(policy).toContain("script-src 'self';")
		expect(policy).toContain("script-src-attr 'none'")
		expect(policy).toContain("worker-src 'self'")
		expect(policy).not.toContain('unsafe-eval')
		expect(policy).toContain("frame-ancestors 'none'")
		expect(policy).toContain('https://tile.openstreetmap.org')
	})
	it('preserves explicit geolocation and OSM origin referrers while blocking unnecessary capabilities', () => {
		expect(headers['Permissions-Policy']).toBe(
			'geolocation=(self), camera=(), microphone=()',
		)
		expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
		expect(headers['X-Content-Type-Options']).toBe('nosniff')
		expect(headers['X-Frame-Options']).toBe('DENY')
	})
})
