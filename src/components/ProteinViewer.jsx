import { useEffect, useMemo, useRef, useState } from 'react'
import * as $3Dmol from '3dmol'
import { readColorTokens, useTheme } from '../theme'
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion'

// Interactive 3D cartoon of an ESMFold structure. The ribbon shape is ESMFold's; the colors are either
// our model's predicted helix/strand/coil label for each residue, or ESMFold's own confidence (pLDDT).

const COLOR_TOKENS = ['ss-helix', 'ss-strand', 'ss-coil', 'conf-very-high', 'conf-high', 'conf-low', 'conf-very-low']
const SS_TOKEN = { H: 'ss-helix', E: 'ss-strand', C: 'ss-coil' }
const SS_NAME = { H: 'helix', E: 'strand', C: 'coil' }
const confidenceToken = (p) => (p > 90 ? 'conf-very-high' : p > 70 ? 'conf-high' : p > 50 ? 'conf-low' : 'conf-very-low')
const toHex = (css) => parseInt(css.replace('#', ''), 16)

export default function ProteinViewer({ pdb, structure, plddt, colorBy }) {
  const container = useRef(null)
  const viewerRef = useRef(null)
  const [hovered, setHovered] = useState(null)
  const reducedMotion = usePrefersReducedMotion()
  const { theme } = useTheme()
  // App applies the new theme to <html> before re-rendering, so this reads the current token values.
  const colors = useMemo(() => readColorTokens(COLOR_TOKENS), [theme]) // eslint-disable-line react-hooks/exhaustive-deps

  // Create the viewer and load the structure once per PDB.
  useEffect(() => {
    const viewer = $3Dmol.createViewer(container.current, { backgroundColor: 'white', backgroundAlpha: 0, antialias: true })
    viewerRef.current = viewer
    viewer.addModel(pdb, 'pdb')
    viewer.setHoverable({}, true,
      (atom) => setHovered({ resi: atom.resi, resn: atom.resn }),
      () => setHovered(null))
    viewer.zoomTo()
    viewer.zoom(1.4)
    const observer = new ResizeObserver(() => { viewer.resize(); viewer.render() })
    observer.observe(container.current)
    return () => {
      observer.disconnect()
      viewer.spin(false)
      viewer.clear()
      viewerRef.current = null
    }
  }, [pdb])

  // Color by our prediction or by confidence; re-applied when the theme or the choice changes.
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return
    const colorfunc = colorBy === 'confidence'
      ? (atom) => toHex(colors[confidenceToken(plddt[atom.resi - 1] ?? 0)])
      : (atom) => toHex(colors[SS_TOKEN[structure[atom.resi - 1]] ?? 'ss-coil'])
    viewer.setStyle({}, { cartoon: { colorfunc, thickness: 0.4, arrows: true } })
    viewer.render()
  }, [colorBy, colors, plddt, structure, pdb])

  // Slow idle spin, off for reduced motion.
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return
    viewer.spin(reducedMotion ? false : 'y', 0.4)
  }, [reducedMotion, pdb])

  const label = hovered && structure[hovered.resi - 1]
  return (
    <div className="relative w-full h-full">
      <div ref={container} className="absolute inset-0" role="img" aria-label={`3D structure of ${structure.length} residues, colored by ${colorBy === 'confidence' ? 'ESMFold confidence' : 'our predicted secondary structure'}`} />
      {hovered && (
        <div className="absolute left-3 top-3 rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs text-fg shadow-sm pointer-events-none">
          <span className="font-medium">{hovered.resn} {hovered.resi}</span>
          {label && <span className="text-fg-muted"> · predicted {SS_NAME[label]}</span>}
          {plddt[hovered.resi - 1] !== undefined && <span className="text-fg-muted"> · pLDDT {Math.round(plddt[hovered.resi - 1])}</span>}
        </div>
      )}
    </div>
  )
}
