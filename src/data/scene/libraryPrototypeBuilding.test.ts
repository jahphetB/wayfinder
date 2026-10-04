import osmSnapshot from '@/data/navigation/campusOsmNetwork.json'
import { libraryPrototypeBuilding } from './libraryPrototypeBuilding'

describe('library prototype 3D source', () => {
  it('uses the mapped library outline without claiming measured height', () => {
    const library = osmSnapshot.buildings.find(({ id }) => id === '603509923')
    if (!library) throw new Error('Missing mapped library')

    expect(libraryPrototypeBuilding.footprint).toHaveLength(
      library.nodeIds.length - 1,
    )
    expect(libraryPrototypeBuilding.footprint[0]).toEqual({
      latitude: osmSnapshot.nodes['5729082110'][0],
      longitude: osmSnapshot.nodes['5729082110'][1],
    })
    expect(libraryPrototypeBuilding.heightMeters).toBe(8)
    expect(libraryPrototypeBuilding.verificationStatus).toBe('illustrative')
  })
})
