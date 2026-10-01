import { useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { CatmullRomCurve3, Curve, ExtrudeGeometry, LineCurve3, Shape, TubeGeometry, Vector3 } from 'three'
import { readColorTokens, useTheme } from '../theme'
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion'

// Schematic of a predicted H/E/C string: helix runs as spirals, strand runs as flat arrows,
// coil runs as a thin tube. It is drawn from the labels alone, not from a folded structure.

const DX = 0.32               // world units per residue along the chain
const ROW_RESIDUES = 100      // long chains wrap into rows joined by U-turns
const ROW_GAP = 3.2           // vertical distance between rows
const HELIX_RADIUS = 0.45
const HELIX_TUBE = 0.1
const RESIDUES_PER_TURN = 3.6 // alpha helix
const COIL_TUBE = 0.06
const RADIAL_SEGMENTS = 8
const STRAND_HALF_WIDTH = 0.22
const STRAND_HEAD_HALF_WIDTH = 0.42
const STRAND_DEPTH = 0.1
const CAMERA_FOV = 40
const TAN_HALF_FOV = Math.tan((CAMERA_FOV * Math.PI) / 360)

const COLOR_TOKENS = ['ss-helix', 'ss-strand', 'ss-coil', 'line-strong']
const tokenForType = { H: 'ss-helix', E: 'ss-strand', C: 'ss-coil' }

// x position of residue i within its row (rows alternate direction), and the row's y.
const rowOf = (i) => Math.floor(i / ROW_RESIDUES)
const dirOf = (row) => (row % 2 === 0 ? 1 : -1)
const xAt = (i) => {
  const row = rowOf(i)
  const col = i % ROW_RESIDUES
  return (dirOf(row) === 1 ? col : ROW_RESIDUES - 1 - col) * DX
}
const yAt = (row) => -row * ROW_GAP

// A helix around the x axis whose radius ramps up from and back down to the axis at both ends,
// so it joins the neighbouring coil and strand pieces without a gap.
class HelixCurve extends Curve {
  constructor(x0, x1, y, turns) {
    super()
    Object.assign(this, { x0, x1, y, turns })
  }
  getPoint(t, target = new Vector3()) {
    const ramp = Math.min(1, t / 0.12, (1 - t) / 0.12)
    const r = HELIX_RADIUS * ramp
    const angle = t * this.turns * Math.PI * 2
    return target.set(this.x0 + (this.x1 - this.x0) * t, this.y + r * Math.sin(angle), r * Math.cos(angle))
  }
}

function arrowGeometry(length) {
  const head = Math.min(0.5, length * 0.5)
  const body = length - head
  const shape = new Shape()
  shape.moveTo(0, -STRAND_HALF_WIDTH)
  shape.lineTo(body, -STRAND_HALF_WIDTH)
  shape.lineTo(body, -STRAND_HEAD_HALF_WIDTH)
  shape.lineTo(length, 0)
  shape.lineTo(body, STRAND_HEAD_HALF_WIDTH)
  shape.lineTo(body, STRAND_HALF_WIDTH)
  shape.lineTo(0, STRAND_HALF_WIDTH)
  shape.closePath()
  const geometry = new ExtrudeGeometry(shape, { depth: STRAND_DEPTH, bevelEnabled: false })
  geometry.translate(0, 0, -STRAND_DEPTH / 2)
  return geometry
}

// Splits the label string into runs, splits runs at row boundaries, and builds one geometry per piece.
// Each piece records the residue range [start, end) it covers, which drives the draw-in animation.
function buildLayout(structure) {
  const n = structure.length
  const pieces = []
  let i = 0
  while (i < n) {
    const type = structure[i]
    let end = i
    while (end < n && structure[end] === type && rowOf(end) === rowOf(i)) end++
    const row = rowOf(i)
    const dir = dirOf(row)
    const x0 = xAt(i) - (dir * DX) / 2
    const x1 = xAt(end - 1) + (dir * DX) / 2
    const y = yAt(row)
    const count = end - i
    if (type === 'H') {
      const curve = new HelixCurve(x0, x1, y, Math.max(1, count / RESIDUES_PER_TURN))
      const segments = Math.max(24, count * 14)
      pieces.push({ kind: 'tube', type, start: i, end, segments, geometry: new TubeGeometry(curve, segments, HELIX_TUBE, RADIAL_SEGMENTS) })
    } else if (type === 'E') {
      pieces.push({ kind: 'arrow', type, start: i, end, position: [x0, y, 0], dir, geometry: arrowGeometry(Math.abs(x1 - x0)) })
    } else {
      const segments = Math.max(2, count * 2)
      const curve = new LineCurve3(new Vector3(x0, y, 0), new Vector3(x1, y, 0))
      pieces.push({ kind: 'tube', type: 'C', start: i, end, segments, geometry: new TubeGeometry(curve, segments, COIL_TUBE, RADIAL_SEGMENTS) })
    }
    i = end
  }

  // U-turns between rows. They're layout only, so they're drawn in a neutral color.
  const rows = rowOf(n - 1) + 1
  for (let row = 0; row < rows - 1; row++) {
    const dir = dirOf(row)
    const boundary = (row + 1) * ROW_RESIDUES
    const xEdge = xAt(boundary - 1) + (dir * DX) / 2
    const radius = ROW_GAP / 2
    const cy = yAt(row) - radius
    const points = Array.from({ length: 17 }, (_, k) => {
      const theta = Math.PI / 2 - (k / 16) * Math.PI
      return new Vector3(xEdge + dir * radius * Math.cos(theta), cy + radius * Math.sin(theta), 0)
    })
    const segments = 24
    pieces.push({
      kind: 'tube', type: 'turn', start: boundary - 0.25, end: boundary + 0.25, segments,
      geometry: new TubeGeometry(new CatmullRomCurve3(points), segments, COIL_TUBE, RADIAL_SEGMENTS),
    })
  }

  const width = Math.min(n, ROW_RESIDUES) * DX
  const extraX = rows > 1 ? ROW_GAP / 2 : 0
  return {
    n,
    pieces,
    center: [width / 2 - DX / 2, -((rows - 1) * ROW_GAP) / 2, 0],
    halfWidth: width / 2 + extraX + 0.5,
    halfHeight: ((rows - 1) * ROW_GAP) / 2 + 1.2,
  }
}

// Shows a piece up to fraction p (0..1) of its length: tubes by drawing only the first part of
// their index buffer, arrows by stretching out from the tail.
function reveal(piece, obj, p) {
  obj.visible = p > 0
  if (piece.kind === 'tube') {
    obj.geometry.setDrawRange(0, Math.ceil(p * piece.segments) * RADIAL_SEGMENTS * 6)
  } else {
    obj.scale.x = Math.max(p, 0.001)
  }
}

function Chain({ layout, colors, reducedMotion }) {
  const group = useRef()
  // Animation state: each piece's mesh and last applied progress, plus elapsed time. Chain is keyed
  // by the prediction, so a new prediction remounts it and starts the draw-in from zero.
  const anim = useRef({ objects: [], last: [], elapsed: 0, done: false })
  const duration = Math.min(4, Math.max(1, 0.8 + layout.n * 0.006))

  useFrame((_, delta) => {
    const a = anim.current
    if (!reducedMotion) {
      // Subtle idle motion: a slow sway.
      a.elapsed += delta
      group.current.rotation.y = Math.sin(a.elapsed * 0.4) * 0.12
    }
    if (a.done) return
    const position = reducedMotion ? Infinity : (a.elapsed / duration) * layout.n
    layout.pieces.forEach((piece, k) => {
      const obj = a.objects[k]
      if (!obj) return
      const p = Math.min(1, Math.max(0, (position - piece.start) / (piece.end - piece.start)))
      if (p !== a.last[k]) {
        reveal(piece, obj, p)
        a.last[k] = p
      }
    })
    if (position >= layout.n + 1) a.done = true
  })

  // Hide (or, with reduced motion, fully show) each piece as it mounts, before the first frame paints.
  const register = (k) => (obj) => {
    const a = anim.current
    a.objects[k] = obj
    if (obj && a.last[k] === undefined) {
      const p = reducedMotion ? 1 : 0
      reveal(layout.pieces[k], obj, p)
      a.last[k] = p
    }
  }

  return (
    <group position={layout.center} ref={group}>
      <group position={layout.center.map((v) => -v)}>
        {layout.pieces.map((piece, k) => {
          const color = piece.type === 'turn' ? colors['line-strong'] : colors[tokenForType[piece.type]]
          const material = <meshStandardMaterial color={color} roughness={0.5} metalness={0.05} />
          return piece.kind === 'arrow' ? (
            <group key={k} ref={register(k)} position={piece.position} rotation={[0, piece.dir === 1 ? 0 : Math.PI, 0]}>
              <mesh geometry={piece.geometry}>{material}</mesh>
            </group>
          ) : (
            <mesh key={k} ref={register(k)} geometry={piece.geometry}>{material}</mesh>
          )
        })}
      </group>
    </group>
  )
}

// Fits the whole chain in view, and refits on resize or when a new prediction changes its size.
function FitCamera({ layout }) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)
  const aspect = useThree((s) => s.size.width / s.size.height)
  useLayoutEffect(() => {
    // 1.3 leaves room for the idle sway, which brings one end of the chain closer to the camera.
    const distance = 1.3 * Math.max(layout.halfWidth / (TAN_HALF_FOV * aspect), layout.halfHeight / TAN_HALF_FOV)
    const [cx, cy] = layout.center
    camera.position.set(cx, cy + distance * 0.2, distance)
    camera.lookAt(...layout.center)
    if (controls) {
      controls.target.set(...layout.center)
      controls.update()
    }
  }, [camera, controls, aspect, layout])
  return null
}

export default function StructureScene({ structure }) {
  const reducedMotion = usePrefersReducedMotion()
  const { theme } = useTheme()
  // App applies the new theme to <html> before re-rendering, so this reads the current token values.
  const colors = useMemo(() => readColorTokens(COLOR_TOKENS), [theme]) // eslint-disable-line react-hooks/exhaustive-deps
  const layout = useMemo(() => buildLayout(structure), [structure])

  // Free the previous prediction's geometry when a new one replaces it.
  useLayoutEffect(() => () => layout.pieces.forEach((p) => p.geometry.dispose()), [layout])

  const counts = useMemo(() => {
    const runs = structure.match(/(.)\1*/g) || []
    return { H: runs.filter((r) => r[0] === 'H').length, E: runs.filter((r) => r[0] === 'E').length }
  }, [structure])

  return (
    <div
      className="w-full h-full"
      role="img"
      aria-label={`Schematic of ${structure.length} residues: ${counts.H} helix segments and ${counts.E} strand segments`}
    >
      <Canvas
        camera={{ fov: CAMERA_FOV, position: [0, 2, 20] }}
        dpr={[1, 2]}
        // With reduced motion nothing animates, so only render on interaction.
        frameloop={reducedMotion ? 'demand' : 'always'}
        // Requests the first frame once the canvas is ready; earlier requests are dropped in on-demand mode.
        onCreated={(state) => state.invalidate()}
        fallback={<div className="p-6 text-fg-muted">3D view needs WebGL. The bar above shows the same prediction.</div>}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 8, 10]} intensity={1.3} />
        <directionalLight position={[-6, -4, -8]} intensity={0.3} />
        <FitCamera layout={layout} />
        <Chain key={structure} layout={layout} colors={colors} reducedMotion={reducedMotion} />
        <OrbitControls makeDefault enablePan={false} enableDamping={!reducedMotion} minDistance={3} maxDistance={200} />
      </Canvas>
    </div>
  )
}
