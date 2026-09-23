import { collegeOfIdahoCampus } from '@/data/navigation/collegeOfIdahoCampus'
import type { GeoreferencedBuilding } from '@/features/map/contracts/GeoreferencedBuilding'

/**
 * A deliberately simple calibration building for the 3D architecture spike.
 * Its campus anchor is real, but its shape and dimensions are illustrative.
 */
export const collegeOfIdahoScenePrototype = Object.freeze({
  building: Object.freeze({
    id: 'campus-3d-calibration-building',
    label: 'Illustrative campus building',
    anchor: collegeOfIdahoCampus.center,
    altitudeMeters: 0,
    headingDegrees: 18,
    dimensionsMeters: Object.freeze({
      width: 32,
      depth: 22,
      height: 13,
    }),
    color: '#d9a441',
    verificationStatus: 'illustrative',
  } satisfies GeoreferencedBuilding),
})
