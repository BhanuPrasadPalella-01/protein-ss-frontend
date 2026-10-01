import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Edges, Line, OrbitControls } from '@react-three/drei'
import { CubicBezierCurve3, Quaternion, Vector3 } from 'three'
import { EDGES, LAYERS, formatParams } from '../pages/architectureLayers'

// Theme colors from index.css
const COLORS = {
  input: '#849495',      // outline
  layer: '#00dbe9',      // primary-fixed-dim
  attention: '#e4b5ff',  // secondary
  op: '#b9cacb',         // on-surface-variant
  classifier: '#2df882', // tertiary-container
  output: '#2df882',
  edge: '#3b494b',       // outline-variant
  skip: '#e4b5ff',
}

const SCENE_CENTER = [1.25, 0.3, 0]
// Half-extents of the pipeline (blocks plus labels) around SCENE_CENTER, used to fit the camera.
const SCENE_HALF_WIDTH = 18
const SCENE_HALF_HEIGHT = 4.5
const CAMERA_FOV = 45
const TAN_HALF_FOV = Math.tan((CAMERA_FOV * Math.PI) / 360)
const OP_RADIUS = 0.45
// Labels are scaled by on-screen pixels per world unit, so they keep their size relative to the
// blocks at any zoom level or canvas size.
const LABEL_SCALE_PER_PX = 0.05
const MAX_LABEL_SCALE = 1.6

// Block height follows the feature dimension; block width follows (log) parameter count.
function blockSize(layer) {
  const height = 0.5 + 3 * Math.sqrt(layer.dim / 128)
  const width = layer.params ? 0.35 + 0.35 * Math.log10(layer.params) : 0.7
  return { width, height, depth: 1.2 }
}

const byId = Object.fromEntries(LAYERS.map((l) => [l.id, { ...l, size: blockSize(l) }]))
const blockTop = (layer) => (layer.kind === 'op' ? OP_RADIUS : layer.size.height / 2)
const blockBottom = (layer) => -blockTop(layer)

function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = (e) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

// Labels are plain DOM elements in an overlay above the canvas. Each one is tied to an empty
// 3D anchor object, and LabelProjector moves the element to the anchor's screen position every frame.
function LabelProjector({ registry, hovered }) {
  const point = useMemo(() => new Vector3(), [])
  // In on-demand render mode (reduced motion), request a frame when the tooltip appears so it gets
  // positioned. (The first frame is requested from the Canvas's onCreated.)
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => invalidate(), [invalidate, hovered])
  useFrame(({ camera, size }) => {
    for (const [key, el] of Object.entries(registry.labels)) {
      const anchor = registry.anchors[key]
      if (!el || !anchor) continue
      anchor.getWorldPosition(point)
      const pxPerUnit = size.height / (2 * TAN_HALF_FOV * camera.position.distanceTo(point))
      const scale = 'fixedSize' in el.dataset ? 1 : Math.min(MAX_LABEL_SCALE, LABEL_SCALE_PER_PX * pxPerUnit)
      point.project(camera)
      const x = (point.x * 0.5 + 0.5) * size.width
      const y = (-point.y * 0.5 + 0.5) * size.height
      const shiftY = 'above' in el.dataset ? '-100%' : '-50%'
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, ${shiftY}) scale(${scale})`
      el.style.visibility = point.z < 1 ? 'visible' : 'hidden'
    }
  })
  return null
}

function LayerBlock({ layer, hovered, onHover, anchorRef }) {
  const { width, height, depth } = layer.size
  const color = COLORS[layer.kind]
  const isOp = layer.kind === 'op'

  const handlers = {
    onPointerOver: (e) => { e.stopPropagation(); onHover(layer.id) },
    onPointerOut: () => onHover(null),
    // Taps also fire pointerover, so a click just (re)selects; tapping empty space clears via onPointerMissed.
    onClick: (e) => { e.stopPropagation(); onHover(layer.id) },
  }

  return (
    <group position={[layer.pos[0], layer.pos[1], 0]}>
      <mesh {...handlers}>
        {isOp ? <sphereGeometry args={[OP_RADIUS, 32, 16]} /> : <boxGeometry args={[width, height, depth]} />}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.55 : 0.15}
          roughness={0.45}
          metalness={0.1}
          transparent
          opacity={layer.kind === 'input' || layer.kind === 'output' ? 0.55 : 0.8}
        />
        {!isOp && <Edges color={color} threshold={15} />}
      </mesh>
      <group ref={anchorRef(`label:${layer.id}`)} position={[0, blockBottom(layer) - 0.7, 0]} />
      <group ref={anchorRef(`tip:${layer.id}`)} position={[0, blockTop(layer) + 0.3, 0]} />
      {isOp && <group ref={anchorRef(`symbol:${layer.id}`)} position={[0, 0, OP_RADIUS]} />}
    </group>
  )
}

// Point where an edge leaves (side = 1) or enters (side = -1) a block, on its facing side.
function edgeAnchor(layer, side) {
  const half = layer.kind === 'op' ? OP_RADIUS : layer.size.width / 2
  return new Vector3(layer.pos[0] + side * half, layer.pos[1], 0)
}

function Connection({ edge, anchorRef }) {
  const from = byId[edge.from]
  const to = byId[edge.to]

  const { points, arrowPos, arrowQuat, labelPos } = useMemo(() => {
    let curve
    if (edge.skip) {
      // Arc from the top of the BiLSTM, over the attention block, down into the add node.
      const start = new Vector3(from.pos[0], from.pos[1] + blockTop(from), 0)
      const end = new Vector3(to.pos[0], to.pos[1] + OP_RADIUS, 0)
      const lift = blockTop(from) + 2.2
      curve = new CubicBezierCurve3(start, new Vector3(start.x, lift, 0), new Vector3(end.x, lift, 0), end)
    } else {
      const start = edgeAnchor(from, 1)
      const end = edgeAnchor(to, -1)
      const midX = (start.x + end.x) / 2
      curve = new CubicBezierCurve3(start, new Vector3(midX, start.y, 0), new Vector3(midX, end.y, 0), end)
    }
    const tangent = curve.getTangent(1)
    return {
      points: curve.getPoints(40),
      arrowPos: curve.getPoint(1).sub(tangent.clone().multiplyScalar(0.15)),
      arrowQuat: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), tangent),
      labelPos: curve.getPoint(0.5).add(new Vector3(0, 0.35, 0)),
    }
  }, [edge, from, to])

  const color = edge.skip ? COLORS.skip : COLORS.edge
  return (
    <group>
      <Line points={points} color={color} lineWidth={edge.skip ? 2.5 : 2} dashed={edge.skip} dashSize={0.3} gapSize={0.15} />
      <mesh position={arrowPos} quaternion={arrowQuat}>
        <coneGeometry args={[0.12, 0.3, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {edge.skip && <group ref={anchorRef('label:skip')} position={labelPos} />}
    </group>
  )
}

// Places the camera so the whole pipeline fits the canvas, and refits on resize
// (a narrow phone screen needs the camera much further back than a wide desktop one).
function FitCamera() {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)
  const aspect = useThree((s) => s.size.width / s.size.height)
  useLayoutEffect(() => {
    const distance = 1.08 * Math.max(SCENE_HALF_WIDTH / (TAN_HALF_FOV * aspect), SCENE_HALF_HEIGHT / TAN_HALF_FOV)
    camera.position.set(SCENE_CENTER[0], SCENE_CENTER[1] + distance * 0.15, distance)
    camera.lookAt(...SCENE_CENTER)
    controls?.update()
  }, [camera, controls, aspect])
  return null
}

// Subtle auto-motion: a slow side-to-side sway around the scene center. A full spin would swing
// the ends of this wide pipeline into the camera.
function Sway({ enabled, children }) {
  const group = useRef()
  const elapsed = useRef(0)
  useFrame((_, delta) => {
    if (!enabled) return
    elapsed.current += delta
    group.current.rotation.y = Math.sin(elapsed.current * 0.35) * 0.3
  })
  return (
    <group position={SCENE_CENTER} ref={group}>
      <group position={SCENE_CENTER.map((v) => -v)}>{children}</group>
    </group>
  )
}

export default function ArchitectureScene() {
  const reducedMotion = usePrefersReducedMotion()
  const [hovered, setHovered] = useState(null)
  // Maps label keys to their 3D anchor objects and overlay elements; filled in by callback refs.
  const registry = useMemo(() => ({ anchors: {}, labels: {} }), [])
  const anchorRef = (key) => (obj) => { registry.anchors[key] = obj }
  const labelRef = (key) => (el) => { registry.labels[key] = el }
  const hoveredLayer = hovered && byId[hovered]

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ fov: CAMERA_FOV, position: [SCENE_CENTER[0], 4, 40] }}
        dpr={[1, 2]}
        // With reduced motion nothing animates, so only render on interaction.
        frameloop={reducedMotion ? 'demand' : 'always'}
        // Requests the first frame once the canvas is ready; frame requests made earlier are dropped,
        // which in on-demand mode would leave the labels unpositioned.
        onCreated={(state) => state.invalidate()}
        onPointerMissed={() => setHovered(null)}
        fallback={<div className="p-6 text-on-surface-variant">3D view needs WebGL. The layer table below lists the same architecture.</div>}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 8]} intensity={1.2} />
        <directionalLight position={[-8, -4, -6]} intensity={0.3} />

        <FitCamera />
        <Sway enabled={!reducedMotion && hovered === null}>
          {LAYERS.map((layer) => (
            <LayerBlock
              key={layer.id}
              layer={byId[layer.id]}
              hovered={hovered === layer.id}
              onHover={setHovered}
              anchorRef={anchorRef}
            />
          ))}
          {EDGES.map((edge) => (
            <Connection key={`${edge.from}-${edge.to}`} edge={edge} anchorRef={anchorRef} />
          ))}
        </Sway>

        <OrbitControls
          makeDefault
          target={SCENE_CENTER}
          screenSpacePanning
          enableDamping={!reducedMotion}
          minDistance={8}
          maxDistance={120}
        />
        <LabelProjector registry={registry} hovered={hovered} />
      </Canvas>

      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {LAYERS.map((layer) => (
          <div key={layer.id} ref={labelRef(`label:${layer.id}`)} className="absolute left-0 top-0 invisible text-center whitespace-nowrap leading-tight">
            <div className="text-[12px] font-semibold text-on-surface">{layer.label}</div>
            <div className="text-[10px] font-mono text-on-surface-variant">{layer.shape}</div>
          </div>
        ))}
        {LAYERS.filter((l) => l.kind === 'op').map((layer) => (
          <div key={layer.id} ref={labelRef(`symbol:${layer.id}`)} className="absolute left-0 top-0 invisible text-surface font-bold text-lg leading-none">
            {layer.symbol}
          </div>
        ))}
        <div ref={labelRef('label:skip')} className="absolute left-0 top-0 invisible text-[10px] font-bold uppercase tracking-wider text-secondary whitespace-nowrap">
          Skip connection
        </div>
        {hoveredLayer && (
          <div
            key={hoveredLayer.id}
            ref={labelRef(`tip:${hoveredLayer.id}`)}
            data-fixed-size
            data-above
            className="absolute left-0 top-0 invisible z-10 rounded-lg border border-white/15 bg-surface-container-high/95 px-3 py-2 text-xs whitespace-nowrap shadow-lg"
          >
            <div className="font-bold text-on-surface">{hoveredLayer.name}</div>
            <div className="font-mono text-primary-fixed-dim">{hoveredLayer.shape}</div>
            <div className="text-on-surface-variant">{formatParams(hoveredLayer.params)}</div>
            <div className="text-on-surface-variant/80 mt-1">{hoveredLayer.detail}</div>
          </div>
        )}
      </div>
    </div>
  )
}
