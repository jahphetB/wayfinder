import { minimatch, Minimatch } from 'minimatch'
import manifest from 'minimatch/package.json'

describe('patched development glob matching', () => {
	it('retains the named API and matching options used by the lint/type tooling', () => {
		expect(manifest.version).toBe('11.0.1')
		expect(minimatch('src/app/App.tsx', '**/*.{ts,tsx}')).toBe(true)
		expect(minimatch('src/app/App.css', '**/*.{ts,tsx}')).toBe(false)
		expect(
			new Minimatch('**/node_modules/**', { dot: true }).match(
				'node_modules/minimatch/index.js',
			),
		).toBe(true)
		expect(
			new Minimatch('**/*', { dot: true }).match('.codex/config.toml'),
		).toBe(true)
		expect(
			new Minimatch('src/**', { optimizationLevel: 2 }).match(
				'src/app/App.tsx',
			),
		).toBe(true)
	})
})
