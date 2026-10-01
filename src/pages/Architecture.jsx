import { lazy, Suspense } from 'react'
import { LAYERS, TOTAL_PARAMS, formatParams } from './architectureLayers'

// Three.js is only downloaded when this page is opened.
const ArchitectureScene = lazy(() => import('../components/ArchitectureScene'))

export default function Architecture() {
  return (
    <div className="flex-1 p-gutter md:p-container-padding flex flex-col gap-panel-gap">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-fg mb-1">Model architecture</h1>
        <p className="text-fg-muted max-w-3xl">
          The PSSM + self-attention BiLSTM behind the ~80% Q3 result on CB513, with {TOTAL_PARAMS.toLocaleString('en-US')} parameters.
          Drag to rotate, scroll or pinch to zoom, right-drag or two-finger drag to pan, and hover or tap a layer for details.
        </p>
      </section>

      <section className="panel relative overflow-hidden h-[320px] md:h-[55vh] md:min-h-[380px]">
        <Suspense fallback={<div className="h-full flex items-center justify-center text-fg-muted text-sm">Loading 3D view…</div>}>
          <ArchitectureScene />
        </Suspense>
      </section>

      <section className="panel p-6 overflow-x-auto">
        <h2 className="text-lg font-semibold text-fg mb-4">Layers in order</h2>
        <table className="w-full text-sm text-left">
          <thead className="eyebrow border-b border-line">
            <tr>
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">Layer</th>
              <th className="py-2 pr-4">Output shape</th>
              <th className="py-2 pr-4">Parameters</th>
              <th className="py-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {LAYERS.map((layer, i) => (
              <tr key={layer.id} className="border-b border-line last:border-0">
                <td className="py-2 pr-4 text-fg-muted">{i + 1}</td>
                <td className="py-2 pr-4 font-medium text-fg whitespace-nowrap">{layer.name}</td>
                <td className="py-2 pr-4 font-mono text-accent whitespace-nowrap">{layer.shape}</td>
                <td className="py-2 pr-4 text-fg-muted whitespace-nowrap">{formatParams(layer.params)}</td>
                <td className="py-2 text-fg-muted">{layer.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
