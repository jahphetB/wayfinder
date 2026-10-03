import { calculateDistanceMeters } from '@/domain/navigation/locationVerification'
import type {
  Coordinates,
  Location,
  WalkingGraph,
  WalkingGraphNode,
} from '@/domain/navigation/types'

interface OsmWay {
  readonly id: string
  readonly nodeIds: readonly string[]
  readonly kind: string
}

interface OsmSnapshot {
  readonly nodes: Readonly<Record<string, readonly number[]>>
  readonly ways: readonly OsmWay[]
  readonly buildings: readonly {
    readonly id: string
    readonly nodeIds: readonly string[]
    readonly entranceIds: readonly string[]
  }[]
  readonly areas: readonly {
    readonly id: string
    readonly kind: string
    readonly sport?: string
    readonly nodeIds: readonly string[]
  }[]
  readonly places: readonly { readonly id: string }[]
  readonly entrances: readonly {
    readonly id: string
    readonly kind: string
    readonly description: string
  }[]
}

export type CampusLocationSource =
  | {
      readonly kind: 'building-entrance'
      readonly buildingId: string
      readonly nodeId: string
    }
  | { readonly kind: 'point-of-interest'; readonly nodeId: string }
  | { readonly kind: 'walkway-point'; readonly nodeId: string }
  | {
      readonly kind: 'described-entrance'
      readonly nodeId: string
      readonly descriptionIncludes: string
    }
  | { readonly kind: 'building-outline'; readonly buildingId: string }
  | { readonly kind: 'mapped-area'; readonly areaId: string }
  | {
      readonly kind: 'sports-area'
      readonly areaId: string
      readonly sport: string
      readonly entranceNodeId?: string
    }
  | { readonly kind: 'illustrative'; readonly coordinates: Coordinates }

export interface CampusLocationSpec {
  readonly id: string
  readonly label: string
  readonly source: CampusLocationSource
  readonly maximumConnectorMeters?: number
}

interface MutableEdge {
  id: string
  fromNodeId: string
  toNodeId: string
  distanceMeters: number
  geometry: Coordinates[]
  direction: 'bidirectional'
  availability: 'available'
  accessibility: 'unverified'
  pathKind: 'main' | 'formal' | 'informal' | 'connector'
}

export function buildCampusWalkingGraph(
  snapshot: OsmSnapshot,
  locations: readonly CampusLocationSpec[],
): {
  readonly locations: readonly Pick<Location, 'id' | 'label'>[]
  readonly graph: WalkingGraph
} {
  const walkingNodeIds = new Set(snapshot.ways.flatMap((way) => way.nodeIds))
  const locationCoordinates = locations.map((location) => ({
    ...location,
    coordinates: resolveLocation(snapshot, location),
  }))
  const aliases = new Map<string, string>()
  for (const location of locationCoordinates) {
    const source = location.source
    const nodeId =
      'nodeId' in source
        ? source.nodeId
        : [...walkingNodeIds].find((candidate) => {
            const point = osmCoordinates(snapshot, candidate)
            return (
              point.latitude === location.coordinates.latitude &&
              point.longitude === location.coordinates.longitude
            )
          })
    if (nodeId && walkingNodeIds.has(nodeId)) {
      if (aliases.has(nodeId)) {
        throw new Error(`Multiple destinations use OSM node ${nodeId}`)
      }
      aliases.set(nodeId, location.id)
    }
  }

  const graphNodes = new Map<string, WalkingGraphNode>()
  for (const nodeId of walkingNodeIds) {
    const id = aliases.get(nodeId) ?? `osm:${nodeId}`
    graphNodes.set(id, { id, coordinates: osmCoordinates(snapshot, nodeId) })
  }

  const edges: MutableEdge[] = []
  for (const way of snapshot.ways) {
    if (
      way.kind !== 'main' &&
      way.kind !== 'formal' &&
      way.kind !== 'informal'
    ) {
      throw new Error(`Unknown walking-way kind in OSM way ${way.id}`)
    }
    const pathKind = way.kind
    way.nodeIds.slice(1).forEach((nodeId, index) => {
      const previousId = way.nodeIds[index]
      if (!previousId || previousId === nodeId) return
      const fromNodeId = aliases.get(previousId) ?? `osm:${previousId}`
      const toNodeId = aliases.get(nodeId) ?? `osm:${nodeId}`
      const from = graphNodes.get(fromNodeId)?.coordinates
      const to = graphNodes.get(toNodeId)?.coordinates
      if (!from || !to) throw new Error(`Missing geometry in OSM way ${way.id}`)
      const distanceMeters = calculateDistanceMeters(from, to)
      if (distanceMeters < 0.01) return
      edges.push({
        id: `osm:${way.id}:${index}`,
        fromNodeId,
        toNodeId,
        distanceMeters,
        geometry: [from, to],
        direction: 'bidirectional',
        availability: 'available',
        accessibility: 'unverified',
        pathKind,
      })
    })
  }

  for (const location of locationCoordinates) {
    if (graphNodes.has(location.id)) continue
    graphNodes.set(location.id, {
      id: location.id,
      coordinates: location.coordinates,
    })
    connectLocation(
      graphNodes,
      edges,
      location.id,
      location.coordinates,
      location.maximumConnectorMeters ?? 12,
    )
  }

  return {
    locations: locations.map(({ id, label }) => ({ id, label })),
    graph: { nodes: [...graphNodes.values()], edges },
  }
}

function resolveLocation(
  snapshot: OsmSnapshot,
  location: CampusLocationSpec,
): Coordinates {
  const source = location.source
  if (source.kind === 'illustrative') return source.coordinates
  if (source.kind === 'building-outline') {
    const building = snapshot.buildings.find(
      ({ id }) => id === source.buildingId,
    )
    if (!building)
      throw new Error(`${location.label} building is absent from OSM`)
    return nearestOutlinePoint(snapshot, building.nodeIds)
  }
  if (source.kind === 'mapped-area' || source.kind === 'sports-area') {
    const area = snapshot.areas.find(({ id }) => id === source.areaId)
    if (!area) throw new Error(`${location.label} area is absent from OSM`)
    if (
      source.kind === 'sports-area' &&
      (area.kind !== 'sport' || area.sport !== source.sport)
    ) {
      throw new Error(`${location.label} sport does not match OSM`)
    }
    if (source.kind === 'sports-area' && source.entranceNodeId) {
      const entrance = snapshot.entrances.find(
        ({ id }) => id === source.entranceNodeId,
      )
      if (
        !area.nodeIds.includes(source.entranceNodeId) ||
        entrance?.kind !== 'main'
      ) {
        throw new Error(`${location.label} main entrance does not match OSM`)
      }
      return osmCoordinates(snapshot, source.entranceNodeId)
    }
    return nearestOutlinePoint(snapshot, area.nodeIds)
  }
  if (source.kind === 'building-entrance') {
    const building = snapshot.buildings.find(
      ({ id }) => id === source.buildingId,
    )
    if (!building?.entranceIds.includes(source.nodeId)) {
      throw new Error(
        `${location.label} entrance is absent from its OSM building`,
      )
    }
  } else if (source.kind === 'described-entrance') {
    const entrance = snapshot.entrances.find(({ id }) => id === source.nodeId)
    if (
      !entrance?.description
        .toLowerCase()
        .includes(source.descriptionIncludes.toLowerCase())
    ) {
      throw new Error(
        `${location.label} entrance description does not match OSM`,
      )
    }
  } else if (
    source.kind === 'point-of-interest' &&
    !snapshot.places.some(({ id }) => id === source.nodeId)
  ) {
    throw new Error(`${location.label} point is absent from the OSM snapshot`)
  } else if (
    source.kind === 'walkway-point' &&
    !snapshot.ways.some(({ nodeIds }) => nodeIds.includes(source.nodeId))
  ) {
    throw new Error(
      `${location.label} point is absent from the walking network`,
    )
  }
  return osmCoordinates(snapshot, source.nodeId)
}

function nearestOutlinePoint(
  snapshot: OsmSnapshot,
  outlineIds: readonly string[],
): Coordinates {
  const segments = snapshot.ways.flatMap((way) =>
    way.nodeIds.slice(1).map((endId, index) => ({
      start: osmCoordinates(snapshot, way.nodeIds[index]!),
      end: osmCoordinates(snapshot, endId),
    })),
  )
  let nearest: { point: Coordinates; distanceMeters: number } | undefined
  for (const nodeId of new Set(outlineIds)) {
    const point = osmCoordinates(snapshot, nodeId)
    for (const segment of segments) {
      const distanceMeters = projectOntoSegment(
        point,
        segment.start,
        segment.end,
      ).distanceMeters
      if (!nearest || distanceMeters < nearest.distanceMeters) {
        nearest = { point, distanceMeters }
      }
    }
  }
  if (!nearest) throw new Error('Mapped area has no usable outline point')
  return nearest.point
}

function osmCoordinates(snapshot: OsmSnapshot, nodeId: string): Coordinates {
  const pair = snapshot.nodes[nodeId]
  const latitude = pair?.[0]
  const longitude = pair?.[1]
  if (latitude === undefined || longitude === undefined) {
    throw new Error(`OSM node ${nodeId} has no coordinates`)
  }
  return { latitude, longitude }
}

function connectLocation(
  graphNodes: Map<string, WalkingGraphNode>,
  edges: MutableEdge[],
  locationId: string,
  coordinates: Coordinates,
  maximumConnectorMeters: number,
): void {
  const candidates = edges
    .filter((edge) => edge.pathKind !== 'connector')
    .map((edge) => ({ edge, ...projectOntoEdge(coordinates, edge) }))
  candidates.sort(
    (first, second) => first.distanceMeters - second.distanceMeters,
  )
  const nearest = candidates[0]
  if (!nearest || nearest.distanceMeters > maximumConnectorMeters) {
    throw new Error(`No nearby walking way for ${locationId}`)
  }

  let targetNodeId: string
  if (nearest.fraction <= 0.000001) {
    targetNodeId = nearest.edge.fromNodeId
  } else if (nearest.fraction >= 0.999999) {
    targetNodeId = nearest.edge.toNodeId
  } else {
    targetNodeId = `snap:${locationId}`
    graphNodes.set(targetNodeId, {
      id: targetNodeId,
      coordinates: nearest.point,
    })
    const oldIndex = edges.indexOf(nearest.edge)
    edges.splice(
      oldIndex,
      1,
      segment(
        nearest.edge,
        nearest.edge.fromNodeId,
        targetNodeId,
        nearest.edge.geometry[0]!,
        nearest.point,
        'a',
      ),
      segment(
        nearest.edge,
        targetNodeId,
        nearest.edge.toNodeId,
        nearest.point,
        nearest.edge.geometry[1]!,
        'b',
      ),
    )
  }
  const target = graphNodes.get(targetNodeId)?.coordinates
  if (!target) throw new Error(`Missing connector endpoint for ${locationId}`)
  const connectorMeters = calculateDistanceMeters(coordinates, target)
  if (connectorMeters < 0.01) {
    throw new Error(
      `Destination ${locationId} nearly duplicates a walking node`,
    )
  }
  edges.push({
    id: `connector:${locationId}`,
    fromNodeId: locationId,
    toNodeId: targetNodeId,
    distanceMeters: connectorMeters,
    geometry: [coordinates, target],
    direction: 'bidirectional',
    availability: 'available',
    accessibility: 'unverified',
    pathKind: 'connector',
  })
}

function segment(
  source: MutableEdge,
  fromNodeId: string,
  toNodeId: string,
  from: Coordinates,
  to: Coordinates,
  suffix: string,
): MutableEdge {
  return {
    ...source,
    id: `${source.id}:${suffix}`,
    fromNodeId,
    toNodeId,
    distanceMeters: calculateDistanceMeters(from, to),
    geometry: [from, to],
  }
}

function projectOntoEdge(
  point: Coordinates,
  edge: MutableEdge,
): {
  readonly fraction: number
  readonly point: Coordinates
  readonly distanceMeters: number
} {
  return projectOntoSegment(point, edge.geometry[0]!, edge.geometry[1]!)
}

function projectOntoSegment(
  point: Coordinates,
  start: Coordinates,
  end: Coordinates,
): {
  readonly fraction: number
  readonly point: Coordinates
  readonly distanceMeters: number
} {
  const longitudeScale = Math.cos((point.latitude * Math.PI) / 180)
  const dx = (end.longitude - start.longitude) * longitudeScale
  const dy = end.latitude - start.latitude
  const denominator = dx * dx + dy * dy
  const fraction = Math.max(
    0,
    Math.min(
      1,
      denominator === 0
        ? 0
        : ((point.longitude - start.longitude) * longitudeScale * dx +
            (point.latitude - start.latitude) * dy) /
            denominator,
    ),
  )
  const projected = {
    latitude: start.latitude + (end.latitude - start.latitude) * fraction,
    longitude: start.longitude + (end.longitude - start.longitude) * fraction,
  }
  return {
    fraction,
    point: projected,
    distanceMeters: calculateDistanceMeters(point, projected),
  }
}
