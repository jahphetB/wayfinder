import { vi } from 'vitest'
import { campusBuildingDetails } from '@/data/campus/buildingDetails'
import {
	MapLibreMapAdapter,
	type MapLibreMapInstance,
} from './MapLibreMapAdapter'

describe('building selection boundary', () => {
	it('loads only three footprints, selects recognized IDs, and removes its listener', () => {
		const on = vi.fn()
		const off = vi.fn()
		const queryRenderedFeatures = vi.fn(
			(): { properties: { id: string } }[] => [],
		)
		const addSource = vi.fn()
		const remove = vi.fn()
		const instance: MapLibreMapInstance = {
			on,
			off,
			queryRenderedFeatures,
			addSource,
			easeTo: vi.fn(),
			getSource: vi.fn(),
			addLayer: vi.fn(),
			getLayer: vi.fn(),
			fitBounds: vi.fn(),
			remove,
		}
		const select = vi.fn()
		const adapter = new MapLibreMapAdapter({
			style: 'https://example.test/map.json',
			createMap: () => instance,
			buildings: campusBuildingDetails,
		})
		adapter.initialize(
			document.createElement('div'),
			{
				center: { latitude: 43.654, longitude: -116.676 },
				zoom: 17,
				mode: '3d',
			},
			{ onBuildingSelect: select },
		)
		const load = on.mock.calls.find(
			([name]) => name === 'load',
		)?.[1] as () => void
		load()
		const source = addSource.mock.calls.find(
			([id]) => id === 'yote-building-details',
		)?.[1] as {
			data: {
				features: {
					properties: { id: string }
					geometry: { coordinates: number[][][] }
				}[]
			}
		}
		expect(source.data.features.map(({ properties }) => properties.id)).toEqual(
			['cruzen-murray-library', 'sterry-hall', 'simplot-dining-hall'],
		)
		for (const feature of source.data.features)
			expect(feature.geometry.coordinates[0]?.[0]).toEqual(
				feature.geometry.coordinates[0]?.at(-1),
			)
		const click = on.mock.calls.find(
			([name]) => name === 'click',
		)?.[1] as (event: { point: { x: number; y: number } }) => void
		queryRenderedFeatures.mockReturnValue([
			{ properties: { id: 'sterry-hall' } },
		])
		click({ point: { x: 0, y: 0 } })
		expect(select).toHaveBeenCalledWith('sterry-hall')
		queryRenderedFeatures.mockReturnValue([{ properties: { id: 'unknown' } }])
		click({ point: { x: 0, y: 0 } })
		queryRenderedFeatures.mockReturnValue([])
		click({ point: { x: 0, y: 0 } })
		expect(select).toHaveBeenCalledTimes(1)
		adapter.destroy()
		expect(off).toHaveBeenCalledWith('click', click)
		expect(remove).toHaveBeenCalledTimes(1)
	})
})
