import osmSnapshot from '@/data/navigation/campusOsmNetwork.json'
import { createCoordinates } from '@/domain/navigation/factories'
import type { Coordinates } from '@/domain/navigation/types'
import type { GeoreferencedBuilding } from '@/features/map/contracts/GeoreferencedBuilding'

const library = osmSnapshot.buildings.find(({ id }) => id === '603509923')
if (!library || library.nodeIds[0] !== library.nodeIds.at(-1)) {
  throw new Error('The mapped library footprint is missing or not closed')
}

const footprint: readonly Coordinates[] = library.nodeIds
  .slice(0, -1)
  .map((nodeId) => {
    const pair = (osmSnapshot.nodes as Record<string, readonly number[]>)[
      nodeId
    ]
    if (pair?.[0] === undefined || pair[1] === undefined) {
      throw new Error(`Missing library footprint point ${nodeId}`)
    }
    return createCoordinates({ latitude: pair[0], longitude: pair[1] })
  })

if (footprint.length < 3) {
  throw new Error('The mapped library footprint has fewer than three points')
}

const latitudes = footprint.map(({ latitude }) => latitude)
const longitudes = footprint.map(({ longitude }) => longitude)

export const libraryPrototypeBuilding: GeoreferencedBuilding = Object.freeze({
  id: 'cruzen-murray-library-prototype',
  label: 'Cruzen-Murray Library (illustrative 3D shape)',
  anchor: createCoordinates({
    latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
    longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
  }),
  altitudeMeters: 0,
  footprint: Object.freeze(footprint),
  // A visible prototype height, not a measurement of this building.
  heightMeters: 8,
  color: '#d8c7a8',
  verificationStatus: 'illustrative',
})
