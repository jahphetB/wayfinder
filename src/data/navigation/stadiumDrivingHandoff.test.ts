import osmSnapshot from './campusOsmNetwork.json'
import { stadiumDrivingHandoff } from './stadiumDrivingHandoff'

describe('prototype stadium driving handoff', () => {
  it('starts at the nearer mapped driveway and ends at the west-side parking approach', () => {
    expect(stadiumDrivingHandoff.coordinates[0]).toEqual({
      latitude: osmSnapshot.nodes['127625903'][0],
      longitude: osmSnapshot.nodes['127625903'][1],
    })
    expect(stadiumDrivingHandoff.coordinates.at(-1)).toEqual({
      latitude: osmSnapshot.nodes['3347045348'][0],
      longitude: osmSnapshot.nodes['3347045348'][1],
    })
    expect(stadiumDrivingHandoff.instructions.at(-1)).toContain(
      'entrance is not yet verified',
    )
  })
})
