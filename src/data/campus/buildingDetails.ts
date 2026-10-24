import snapshot from '@/data/navigation/campusOsmNetwork.json'
import { createCoordinates } from '@/domain/navigation/factories'
import type { BuildingDetails } from '@/features/buildings/model/BuildingDetails'

function footprint(buildingId: string): BuildingDetails['footprint'] {
	const building = snapshot.buildings.find(({ id }) => id === buildingId)
	if (
		!building ||
		building.nodeIds.length < 4 ||
		building.nodeIds[0] !== building.nodeIds.at(-1)
	) {
		throw new Error(
			`Building details require a closed OSM footprint: ${buildingId}`,
		)
	}
	return Object.freeze(
		building.nodeIds.map((id) => {
			const point = (snapshot.nodes as Record<string, readonly number[]>)[id]
			if (point?.[0] === undefined || point[1] === undefined) {
				throw new Error(`Building details are missing OSM node ${id}`)
			}
			return createCoordinates({ latitude: point[0], longitude: point[1] })
		}),
	)
}

export const campusBuildingDetails: readonly BuildingDetails[] = [
	{
		id: 'cruzen-murray-library',
		label: 'Cruzen-Murray Library',
		footprint: footprint('603509923'),
		description:
			'The campus library. This building is available as a starting point or destination in the route planner.',
		details: [
			{
				heading: 'Entrance',
				text: 'Directions use the main entrance recorded in the campus map. The illustrative 3D shape is a visual aid, not a measurement of the building.',
			},
			{
				heading: 'Plan your visit',
				text: 'Opening hours, room information, and accessibility details have not been added. Confirm current access before visiting.',
			},
		],
		photos: [
			{ label: 'Exterior', alt: 'Exterior of Cruzen-Murray Library' },
			{ label: 'Entrance', alt: 'Main entrance of Cruzen-Murray Library' },
		],
	},
	{
		id: 'sterry-hall',
		label: 'Sterry Hall',
		footprint: footprint('492831879'),
		description:
			'Sterry Hall is a mapped campus building. Select it in the route planner to preview the walking approach to its mapped entrance.',
		details: [
			{
				heading: 'Entrance',
				text: 'Directions use the main entrance recorded in the current campus map. Building details do not change the selected route.',
			},
			{
				heading: 'Plan your visit',
				text: 'Opening hours, room information, and accessibility details have not been added. Confirm current access before visiting.',
			},
		],
		photos: [
			{ label: 'Exterior', alt: 'Exterior of Sterry Hall' },
			{ label: 'Entrance', alt: 'Main entrance of Sterry Hall' },
		],
	},
	{
		id: 'simplot-dining-hall',
		label: 'Simplot Dining Hall (Cafeteria)',
		footprint: footprint('492831873'),
		description:
			'The cafeteria is connected to Simplot Residence Hall. The two destinations use different entrances.',
		details: [
			{
				heading: 'Cafeteria entrance',
				text: 'For the cafeteria, directions use the entrance near Blatchley Hall, identified through firsthand campus observations. The other main entrance serves the residence hall.',
			},
			{
				heading: 'Plan your visit',
				text: 'Meal times, menus, visitor access, and accessibility details have not been added. Confirm current dining arrangements before visiting.',
			},
		],
		photos: [
			{ label: 'Exterior', alt: 'Exterior of Simplot Dining Hall' },
			{
				label: 'Cafeteria entrance',
				alt: 'Cafeteria entrance near Blatchley Hall',
			},
		],
	},
]
