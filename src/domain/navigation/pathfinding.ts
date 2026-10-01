import type { WalkingGraph, WalkingGraphEdge, WalkingPath } from './types'

interface QueueEntry {
  readonly nodeId: string
  readonly informalMeters: number
  readonly adjustedMeters: number
  readonly distanceMeters: number
}

type RouteCost = Pick<QueueEntry, 'informalMeters' | 'adjustedMeters'>

interface PreviousStep {
  readonly nodeId: string
  readonly edgeId: string
}

export function findShortestWalkingPath(
  graph: WalkingGraph,
  originNodeId: string,
  destinationNodeId: string,
): WalkingPath | undefined {
  const nodeIds = new Set(graph.nodes.map((node) => node.id))

  if (!nodeIds.has(originNodeId) || !nodeIds.has(destinationNodeId)) {
    return undefined
  }

  if (originNodeId === destinationNodeId) {
    return Object.freeze({
      nodeIds: Object.freeze([originNodeId]),
      edgeIds: Object.freeze([]),
      distanceMeters: 0,
    })
  }

  const costs = new Map<string, RouteCost>([
    [originNodeId, { informalMeters: 0, adjustedMeters: 0 }],
  ])
  const previousSteps = new Map<string, PreviousStep>()
  const queue: QueueEntry[] = [
    {
      nodeId: originNodeId,
      informalMeters: 0,
      adjustedMeters: 0,
      distanceMeters: 0,
    },
  ]

  while (queue.length > 0) {
    queue.sort(compareCost)
    const current = queue.shift()

    if (!current || compareCost(current, costs.get(current.nodeId)!) !== 0) {
      continue
    }

    if (current.nodeId === destinationNodeId) {
      return createWalkingPath(
        originNodeId,
        destinationNodeId,
        current.distanceMeters,
        previousSteps,
      )
    }

    for (const edge of connectedEdges(graph.edges, current.nodeId)) {
      const neighborNodeId = otherNodeId(edge, current.nodeId)
      const nextCost: RouteCost = {
        informalMeters:
          current.informalMeters +
          (edge.pathKind === 'informal' ? edge.distanceMeters : 0),
        adjustedMeters:
          current.adjustedMeters +
          edge.distanceMeters * (edge.pathKind === 'main' ? 0.9 : 1),
      }
      const nextDistance = current.distanceMeters + edge.distanceMeters

      const existingCost = costs.get(neighborNodeId)
      if (existingCost && compareCost(nextCost, existingCost) >= 0) {
        continue
      }

      costs.set(neighborNodeId, nextCost)
      previousSteps.set(neighborNodeId, {
        nodeId: current.nodeId,
        edgeId: edge.id,
      })
      queue.push({
        nodeId: neighborNodeId,
        ...nextCost,
        distanceMeters: nextDistance,
      })
    }
  }

  return undefined
}

function compareCost(first: RouteCost, second: RouteCost): number {
  return (
    first.informalMeters - second.informalMeters ||
    first.adjustedMeters - second.adjustedMeters
  )
}

function connectedEdges(
  edges: readonly WalkingGraphEdge[],
  nodeId: string,
): readonly WalkingGraphEdge[] {
  return edges.filter(
    (edge) =>
      edge.availability === 'available' &&
      (edge.direction === 'bidirectional'
        ? edge.fromNodeId === nodeId || edge.toNodeId === nodeId
        : edge.fromNodeId === nodeId),
  )
}

function otherNodeId(edge: WalkingGraphEdge, nodeId: string): string {
  return edge.fromNodeId === nodeId ? edge.toNodeId : edge.fromNodeId
}

function createWalkingPath(
  originNodeId: string,
  destinationNodeId: string,
  distanceMeters: number,
  previousSteps: ReadonlyMap<string, PreviousStep>,
): WalkingPath {
  const nodeIds = [destinationNodeId]
  const edgeIds: string[] = []
  let currentNodeId = destinationNodeId

  while (currentNodeId !== originNodeId) {
    const previousStep = previousSteps.get(currentNodeId)

    if (!previousStep) {
      throw new Error('Shortest path reconstruction failed')
    }

    nodeIds.push(previousStep.nodeId)
    edgeIds.push(previousStep.edgeId)
    currentNodeId = previousStep.nodeId
  }

  return Object.freeze({
    nodeIds: Object.freeze(nodeIds.reverse()),
    edgeIds: Object.freeze(edgeIds.reverse()),
    distanceMeters,
  })
}
