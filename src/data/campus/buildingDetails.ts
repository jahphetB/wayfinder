import snapshot from '@/data/navigation/campusOsmNetwork.json'
import { createCoordinates } from '@/domain/navigation/factories'
import type { BuildingDetails } from '@/features/buildings/model/BuildingDetails'
import libraryRoom from '@/assets/buildings/Cruzen-Murray_Library,_College_of_Idaho-2.jpg'
import libraryExterior from '@/assets/buildings/Cruzen-Murray_Library,_College_of_Idaho-exterior.jpg'
import libraryInterior from '@/assets/buildings/Cruzen-Murray_Library,_College_of_Idaho-interior.jpg'
import sterryOne from '@/assets/buildings/sterry-hall-1.jpg'
import sterryTwo from '@/assets/buildings/sterry-hall-2.jpg'
import cafeteriaOne from '@/assets/buildings/cafteria-1.jpg'
import cafeteriaTwo from '@/assets/buildings/cafteria-2.jpg'
import hendrenOne from '@/assets/buildings/hendren-hall-1.jpeg'
import hendrenTwo from '@/assets/buildings/hendre-hall-2.jpg'

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
			{
				label: 'Study room',
				alt: 'Study room inside Cruzen-Murray Library',
				src: libraryExterior,
			},
			{
				label: 'Exterior',
				alt: 'Exterior of Cruzen-Murray Library',
				src: libraryRoom,
			},
			{
				label: 'Interior',
				alt: 'Interior of Cruzen-Murray Library',
				src: libraryInterior,
				credit: 'Photographer: Gabe Border (embedded image credit)',
			},
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
			{
				label: 'View 1',
				alt: 'Sterry Hall, first supplied view',
				src: sterryOne,
			},
			{
				label: 'View 2',
				alt: 'Sterry Hall, second supplied view',
				src: sterryTwo,
			},
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
			{
				label: 'Dining interior',
				alt: 'Serving area inside Simplot Dining Hall',
				src: cafeteriaOne,
			},
			{
				label: 'Dining view',
				alt: 'Simplot Dining Hall, second supplied view',
				src: cafeteriaTwo,
			},
		],
	},
	{
		id: 'hendren-hall',
		label: 'Hendren Hall',
		footprint: footprint('492831880'),
		description:
			'Hendren Hall is a mapped campus building and a selectable walking-route destination.',
		details: [
			{
				heading: 'Entrance and access',
				text: 'Routes use the entrance recorded in the campus dataset. Opening hours, room information and accessibility details have not been added; confirm current access on site.',
			},
		],
		photos: [
			{
				label: 'Tower and entrance',
				alt: 'Hendren Hall tower and entrance',
				src: hendrenOne,
			},
			{
				label: 'View 2',
				alt: 'Hendren Hall, second supplied view',
				src: hendrenTwo,
			},
		],
	},
]
