import path from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import deployment from './vercel.json' with { type: 'json' }

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
	preview: {
		headers: Object.fromEntries(
			deployment.headers.flatMap((rule) =>
				rule.headers.map(({ key, value }) => [key, value]),
			),
		),
	},
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(projectRoot, 'src'),
		},
	},
	optimizeDeps: {
		exclude: ['maplibre-gl'],
	},
	build: {
		sourcemap: false,
		license: { fileName: 'THIRD_PARTY_LICENSES.md' },
		rolldownOptions: {
			output: {
				postBanner:
					'/* Yotes Wayfinder: Copyright (c) 2026 jahphetB. Original portions: all rights reserved. Third-party licenses: /THIRD_PARTY_LICENSES.md. */',
			},
		},
		target: 'es2022',
	},
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./src/test/setup.ts'],
		css: true,
	},
})
