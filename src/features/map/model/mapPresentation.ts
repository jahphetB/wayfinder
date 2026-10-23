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
		pitch2d: 30,
		pitch3d: 60,
		initialBearing3d: -20,
		overviewPitch3d: 40,
		overviewPaddingPixels: 24,
		overviewMaxZoom: 16,
		previewPaddingPixels: 32,
		previewMaxZoom: 17.5,
		previewDurationMilliseconds: 1500,
		navigationDurationMilliseconds: 1300,
		modeDurationMilliseconds: 1000,
		locationZoom: 17,
		locationDurationMilliseconds: 900,
		navigationZoom: 18,
		navigationOffsetPixels: 80,
		easing: (progress: number): number =>
			progress * progress * (3 - 2 * progress),
	},
	routeColors: {
		completed: '#7b8881',
		current: '#087a45',
		upcoming: '#d9872f',
		preview: '#155f3a',
		handoff: '#593777',
	},
} as const
