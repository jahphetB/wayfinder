import {
  MercatorCoordinate,
  type CustomLayerInterface,
  type CustomRenderMethodInput,
  type Map as MapLibreMap,
} from 'maplibre-gl'
import {
  Camera,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Scene,
  Shape,
  Vector2,
  Vector3,
  WebGLRenderer,
  type WebGLRendererParameters,
} from 'three'

import type { GeoreferencedBuilding } from '@/features/map/contracts/GeoreferencedBuilding'

interface ThreeRenderer {
  autoClear: boolean
  resetState(): void
  render(scene: Scene, camera: Camera): void
  dispose(): void
}

type ThreeRendererFactory = (
  parameters: WebGLRendererParameters,
) => ThreeRenderer

interface MapLibreGeoreferencedBuildingLayerOptions {
  readonly createRenderer?: ThreeRendererFactory
}

const defaultRendererFactory: ThreeRendererFactory = (parameters) =>
  new WebGLRenderer(parameters)

export class MapLibreGeoreferencedBuildingLayer implements CustomLayerInterface {
  readonly id = 'yote-campus-building'

  readonly type = 'custom'

  readonly renderingMode = '3d'

  private readonly camera = new Camera()

  private readonly scene = new Scene()

  private readonly buildingGeometry: ExtrudeGeometry

  private readonly buildingMaterial: MeshStandardMaterial

  private readonly modelTransform: Matrix4

  private readonly createRenderer: ThreeRendererFactory

  private map: MapLibreMap | undefined

  private renderer: ThreeRenderer | undefined

  private isVisible = true

  constructor(
    building: GeoreferencedBuilding,
    options: MapLibreGeoreferencedBuildingLayerOptions = {},
  ) {
    this.createRenderer = options.createRenderer ?? defaultRendererFactory
    this.buildingGeometry = createFootprintGeometry(building)
    this.buildingMaterial = new MeshStandardMaterial({
      color: building.color,
      roughness: 0.78,
      metalness: 0.05,
    })

    const buildingGroup = new Group()
    buildingGroup.add(new Mesh(this.buildingGeometry, this.buildingMaterial))
    this.scene.add(buildingGroup)
    this.scene.add(new HemisphereLight('#fff8df', '#405c4b', 2.1))

    const sunlight = new DirectionalLight('#fff2cf', 2.5)
    sunlight.position.set(-30, 45, -20)
    this.scene.add(sunlight)

    this.modelTransform = createModelTransform(building)
  }

  onAdd(map: MapLibreMap, gl: WebGL2RenderingContext): void {
    this.map = map
    this.renderer = this.createRenderer({
      canvas: map.getCanvas(),
      context: gl,
      antialias: true,
    })
    this.renderer.autoClear = false
  }

  render(_gl: WebGL2RenderingContext, options: CustomRenderMethodInput): void {
    if (!this.isVisible || !this.renderer) return

    this.camera.projectionMatrix
      .fromArray(options.defaultProjectionData.mainMatrix)
      .multiply(this.modelTransform)
    this.renderer.resetState()
    this.renderer.render(this.scene, this.camera)
  }

  onRemove(): void {
    this.buildingGeometry.dispose()
    this.buildingMaterial.dispose()
    this.renderer?.dispose()
    this.renderer = undefined
    this.map = undefined
  }

  setVisible(isVisible: boolean): void {
    this.isVisible = isVisible
    this.map?.triggerRepaint()
  }
}

function createModelTransform(building: GeoreferencedBuilding): Matrix4 {
  const anchor = MercatorCoordinate.fromLngLat(
    [building.anchor.longitude, building.anchor.latitude],
    building.altitudeMeters,
  )
  const metersToMercatorUnits = anchor.meterInMercatorCoordinateUnits()
  return new Matrix4()
    .makeTranslation(anchor.x, anchor.y, anchor.z)
    .scale(
      new Vector3(
        metersToMercatorUnits,
        -metersToMercatorUnits,
        metersToMercatorUnits,
      ),
    )
    .multiply(new Matrix4().makeRotationX(Math.PI / 2))
}

function createFootprintGeometry(
  building: GeoreferencedBuilding,
): ExtrudeGeometry {
  if (
    !Number.isFinite(building.heightMeters) ||
    building.heightMeters <= 0 ||
    building.footprint.length < 3
  ) {
    throw new Error('A 3D building needs a footprint and positive height')
  }
  const anchor = MercatorCoordinate.fromLngLat([
    building.anchor.longitude,
    building.anchor.latitude,
  ])
  const metersToMercatorUnits = anchor.meterInMercatorCoordinateUnits()
  const outline = building.footprint.map((point) => {
    const mapped = MercatorCoordinate.fromLngLat([
      point.longitude,
      point.latitude,
    ])
    return new Vector2(
      (mapped.x - anchor.x) / metersToMercatorUnits,
      (anchor.y - mapped.y) / metersToMercatorUnits,
    )
  })
  const geometry = new ExtrudeGeometry(new Shape(outline), {
    depth: building.heightMeters,
    bevelEnabled: false,
  })
  // Shape Y points north; rotate extrusion depth into local vertical Y.
  geometry.rotateX(-Math.PI / 2)
  return geometry
}
