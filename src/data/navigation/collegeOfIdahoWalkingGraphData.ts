import osmSnapshot from './campusOsmNetwork.json'
import {
  buildCampusWalkingGraph,
  type CampusLocationSpec,
} from './buildCampusWalkingGraph'
import type { WalkingGraphRelease } from '@/domain/navigation/types'

interface CollegeOfIdahoWalkingGraphData extends WalkingGraphRelease {
  readonly locations: readonly { readonly id: string; readonly label: string }[]
}

// Only entrances on the mapped building outline become building destinations.
// Simplot's two labels reflect the user's firsthand identification of its doors.
const locations: readonly CampusLocationSpec[] = [
  {
    id: 'campus-entrance',
    label: 'Campus Entrance',
    source: {
      kind: 'illustrative',
      coordinates: { latitude: 43.6522, longitude: -116.6799 },
    },
    maximumConnectorMeters: 120,
  },
  {
    id: 'morrison-quadrangle',
    label: 'Morrison Quadrangle & Clock Tower',
    source: { kind: 'walkway-point', nodeId: '9284498078' },
  },
  {
    id: 'cruzen-murray-library',
    label: 'Cruzen-Murray Library',
    source: {
      kind: 'building-entrance',
      buildingId: '603509923',
      nodeId: '14229218107',
    },
  },
  {
    id: 'blatchley-hall',
    label: 'Blatchley Hall',
    source: {
      kind: 'building-entrance',
      buildingId: '492831905',
      nodeId: '14229217297',
    },
  },
  {
    id: 'simplot-dining-hall',
    label: 'Simplot Dining Hall (Cafeteria)',
    source: {
      kind: 'building-entrance',
      buildingId: '492831873',
      nodeId: '14229218101',
    },
  },
  {
    id: 'simplot-residence-hall',
    label: 'Simplot Residence Hall',
    source: {
      kind: 'building-entrance',
      buildingId: '492831873',
      nodeId: '14229218102',
    },
  },
  {
    id: 'sterry-hall',
    label: 'Sterry Hall',
    source: {
      kind: 'building-entrance',
      buildingId: '492831879',
      nodeId: '14229218105',
    },
  },
  {
    id: 'anderson-residence-hall',
    label: 'Anderson Residence Hall',
    source: {
      kind: 'building-entrance',
      buildingId: '492831868',
      nodeId: '14229217300',
    },
  },
  {
    id: 'kathryn-albertson-international-center',
    label: 'Kathryn Albertson International Center',
    source: {
      kind: 'building-entrance',
      buildingId: '492831871',
      nodeId: '14229217298',
    },
  },
  {
    id: 'finney-residence-hall',
    label: 'Finney Residence Hall',
    source: {
      kind: 'building-entrance',
      buildingId: '492831875',
      nodeId: '14229218103',
    },
  },
  {
    id: 'hendren-hall',
    label: 'Hendren Hall',
    source: {
      kind: 'building-entrance',
      buildingId: '492831880',
      nodeId: '14233022388',
    },
  },
  {
    id: 'covell-hall',
    label: 'Covell Hall',
    source: {
      kind: 'building-entrance',
      buildingId: '492831884',
      nodeId: '14229218121',
    },
  },
  {
    id: 'strahorn-hall',
    label: 'Strahorn Hall',
    source: {
      kind: 'building-entrance',
      buildingId: '492831886',
      nodeId: '14233022386',
    },
  },
  {
    id: 'boone-hall',
    label: 'Boone Hall',
    source: {
      kind: 'building-entrance',
      buildingId: '492831888',
      nodeId: '14229222226',
    },
  },
  {
    id: 'jewett-auditorium-and-chapel',
    label: 'Jewett Auditorium & Chapel',
    source: {
      kind: 'building-entrance',
      buildingId: '492831890',
      nodeId: '14229218118',
    },
  },
  {
    id: 'langroise-center',
    label: 'Langroise Center',
    source: {
      kind: 'building-entrance',
      buildingId: '492831892',
      nodeId: '14229218119',
    },
  },
  {
    id: 'voorhees-residence-hall',
    label: 'Voorhees Residence Hall',
    source: {
      kind: 'building-entrance',
      buildingId: '492831893',
      nodeId: '14229218114',
    },
  },
  {
    id: 'hayman-residence-hall',
    label: 'Hayman Residence Hall',
    source: {
      kind: 'building-entrance',
      buildingId: '492831895',
      nodeId: '14233022375',
    },
  },
  {
    id: 'mccain-student-center',
    label: 'McCain Student Center',
    source: {
      kind: 'building-entrance',
      buildingId: '492831899',
      nodeId: '14233047413',
    },
  },
  {
    id: 'ja-albertson-activities-center',
    label: 'J.A. Albertson Activities Center',
    source: {
      kind: 'building-entrance',
      buildingId: '492831903',
      nodeId: '14233022397',
    },
  },
  {
    id: 'centennial-amphitheater',
    label: 'Centennial Amphitheater',
    source: { kind: 'point-of-interest', nodeId: '5729141038' },
  },
]

const campusNetwork = buildCampusWalkingGraph(osmSnapshot, locations)

export const collegeOfIdahoWalkingGraphData = {
  ...campusNetwork,
  provenance: {
    sourceDescription:
      'Pedestrian ways and tagged building entrances were imported from the user-observed 2026-09-29 OpenStreetMap export (SHA-256 8B0EC753640275B3177D2C2514862B41EB7EB78228E870C16BED58C0276A2FEE). Informal ways have a small route-cost penalty; displayed distance is physical path length. The Campus Entrance and short unmapped destination connectors remain illustrative. Entrance reachability, access, crossing safety, and walking directions have not been campus-approved. OpenStreetMap data is ODbL: https://www.openstreetmap.org/copyright.',
    verificationStatus: 'illustrative',
    reviewedOn: '2026-09-29',
  },
} satisfies CollegeOfIdahoWalkingGraphData
