import type { WalkingGraph, WalkingGraphEdge, WalkingPath } from './types'

interface QueueEntry {
  readonly nodeId: string
  readonly distanceMeters: number
}

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

  const distances = new Map<string, number>([[originNodeId, 0]])
  const previousSteps = new Map<string, PreviousStep>()
  const queue: QueueEntry[] = [{ nodeId: originNodeId, distanceMeters: 0 }]

  while (queue.length > 0) {
    queue.sort((first, second) => first.distanceMeters - second.distanceMeters)
    const current = queue.shift()

    if (!current || current.distanceMeters !== distances.get(current.nodeId)) {
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
      const nextDistance = current.distanceMeters + edge.distanceMeters

      if (nextDistance >= (distances.get(neighborNodeId) ?? Infinity)) {
        continue
      }

      distances.set(neighborNodeId, nextDistance)
      previousSteps.set(neighborNodeId, {
        nodeId: current.nodeId,
        edgeId: edge.id,
      })
      queue.push({ nodeId: neighborNodeId, distanceMeters: nextDistance })
    }
  }

  return undefined
}

function connectedEdges(
  edges: readonly WalkingGraphEdge[],
  nodeId: string,
): readonly WalkingGraphEdge[] {
  return edges.filter(
    (edge) => edge.fromNodeId === nodeId || edge.toNodeId === nodeId,
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
