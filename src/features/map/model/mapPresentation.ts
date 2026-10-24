// Camera distances are zoom levels, angles are degrees, and durations are milliseconds.
// HTML control colors live in src/styles/theme.css; these colors are drawn by WebGL.
export const mapPresentation = {
	rendering: { maximumPixelRatio: 2 },
	snapshot: {
		color: '#b8ed9a',
		outline: '#245233',
		radiusPixels: 6,
		haloRadiusPixels: 10,
	},
	buildingSelection: {
		color: '#68438c',
		fillOpacity: 0.12,
		outlineOpacity: 0.6,
		outlineWidthPixels: 1.5,
	},
	camera: {
		pitch: 60,
		initialBearing: -20,
		overviewPaddingPixels: 24,
		overviewMaxZoom: 16,
		previewPaddingPixels: 32,
		previewMaxZoom: 17.5,
		previewDurationMilliseconds: 1500,
		navigationDurationMilliseconds: 1300,
		modeDurationMilliseconds: 1000,
		locationZoom: 17,
		locationDurationMilliseconds: 900,
		navigationZoom: 18.3,
		navigationOffsetPixels: 80,
		easing: (progress: number): number =>
			progress * progress * (3 - 2 * progress),
	},
	routeColors: {
		completed: '#155f3a',
		current: '#f28528',
		upcoming: '#6e567f',
		preview: '#593777',
		handoff: '#593777',
	},
} as const
