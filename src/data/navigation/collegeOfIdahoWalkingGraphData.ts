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
    id: 'morrison-quadrangle',
    label: 'Morrison Quadrangle & Clock Tower',
    source: { kind: 'point-of-interest', nodeId: '14239949038' },
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
      nodeId: '14229217299',
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
      kind: 'described-entrance',
      nodeId: '9284508267',
      descriptionIncludes: 'Activities Center',
    },
  },
  {
    id: 'jaac-swimming-pool',
    label: 'J.A. Albertson Swimming Pool',
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
  ...(
    [
      [
        'former-terteling-library',
        'N.L. Terteling Library (former)',
        '492831877',
      ],
      ['west-hall', 'West Hall', '492831897'],
      [
        'marty-holly-athletic-center',
        'Marty Holly Athletic Center',
        '603509924',
      ],
      ['mustard-apartments', 'Mustard Apartments', '603518405'],
      ['ketchup-apartments', 'Ketchup Apartments', '603518406'],
      ['sawtooth-apartments', 'Sawtooth Apartments', '603518408'],
      ['owyhee-apartments', 'Owyhee Apartments', '603518410'],
    ] as const
  ).map(([id, label, buildingId]) => ({
    id,
    label,
    source: { kind: 'building-outline' as const, buildingId },
    maximumConnectorMeters: 25,
  })),
  ...(
    [
      ['simplot-finney-parking', 'Simplot/Finney Parking Lots', '319413905'],
      ['hayman-parking', 'Hayman Parking Lots', '319413906'],
      ['hayman-parking-2', 'Hayman Parking Lot 2', '1006303601'],
      ['village-parking', 'Village Parking Lot', '492831862'],
      ['anderson-parking', 'Anderson Parking Lot', '492831869'],
      ['jaac-parking', 'JAAC Parking Lot', '492831927'],
      ['mccain-parking', 'McCain Parking Lot', '603509928'],
      ['jewett-parking', 'Jewett Parking Lot', '603516934'],
      ['hendren-parking', 'Hendren Parking Lot', '603518414'],
      ['mountains-parking', 'Mountains Parking Lot', '1564171297'],
      ['simplot-stadium', 'Simplot Stadium', '327890065'],
    ] as const
  ).map(([id, label, areaId]) => ({
    id,
    label,
    source: { kind: 'mapped-area' as const, areaId },
    maximumConnectorMeters: areaId === '327890065' ? 35 : 15,
  })),
  ...(
    [
      ['tennis-court-1', 'Tennis Court 1', '1468620718', 'tennis'],
      ['tennis-court-2', 'Tennis Court 2', '1468620719', 'tennis'],
      ['tennis-court-3', 'Tennis Court 3', '1468620720', 'tennis'],
      ['pickleball-court-1', 'Pickleball Court 1', '1468620588', 'pickleball'],
      ['pickleball-court-2', 'Pickleball Court 2', '1468620589', 'pickleball'],
      ['basketball-court', 'Basketball Court', '1468620587', 'basketball'],
      [
        'beach-volleyball-court-1',
        'Beach Volleyball Court 1',
        '1006303602',
        'beachvolleyball',
      ],
      [
        'beach-volleyball-court-2',
        'Beach Volleyball Court 2',
        '1564171295',
        'beachvolleyball',
        '14239949034',
      ],
    ] as const
  ).map(([id, label, areaId, sport, entranceNodeId]) => ({
    id,
    label,
    source: {
      kind: 'sports-area' as const,
      areaId,
      sport,
      ...(entranceNodeId ? { entranceNodeId } : {}),
    },
    maximumConnectorMeters: 35,
  })),
  ...(
    [
      [
        'orma-smith-museum',
        'Orma J. Smith Museum of Natural History',
        '5729141036',
      ],
      ['whittenberger-planetarium', 'Whittenberger Planetarium', '5729141037'],
      ['rosenthal-gallery', 'Rosenthal Gallery of Art', '5729141045'],
    ] as const
  ).map(([id, label, nodeId]) => ({
    id,
    label,
    source: { kind: 'point-of-interest' as const, nodeId },
    maximumConnectorMeters: 25,
  })),
]

const campusNetwork = buildCampusWalkingGraph(osmSnapshot, locations)

export const collegeOfIdahoWalkingGraphData = {
  ...campusNetwork,
  provenance: {
    sourceDescription:
      'Pedestrian ways, building, parking, and sport outlines, entrances, and place descriptions come from the user-observed 2026-10-01 OpenStreetMap export (SHA-256 03B9BD752A588BFF7CB04A87B06D417736E1BFBC49091AFD9EF8452A88C0B40C). Court numbering is provisional. Formal paths always outrank informal paths; main footways are favored among formal alternatives. The displayed distance is physical length. Unmapped destination connectors and outline-derived entry points remain illustrative. Entrance reachability, access, crossing safety, and walking directions have not been campus-approved. OpenStreetMap data is ODbL: https://www.openstreetmap.org/copyright.',
    verificationStatus: 'illustrative',
    reviewedOn: '2026-10-01',
  },
} satisfies CollegeOfIdahoWalkingGraphData
