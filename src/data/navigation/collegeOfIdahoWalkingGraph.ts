import {
  createWalkingGraph,
  createWalkingGraphRelease,
} from '@/domain/navigation/factories'
import { collegeOfIdahoWalkingGraphData } from './collegeOfIdahoWalkingGraphData'

export const collegeOfIdahoWalkingGraphRelease = createWalkingGraphRelease({
  graph: createWalkingGraph(collegeOfIdahoWalkingGraphData.graph),
  provenance: collegeOfIdahoWalkingGraphData.provenance,
})

export const collegeOfIdahoWalkingGraph =
  collegeOfIdahoWalkingGraphRelease.graph
