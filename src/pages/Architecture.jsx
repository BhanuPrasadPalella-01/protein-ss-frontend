import { lazy, Suspense } from 'react'
import { LAYERS, TOTAL_PARAMS, formatParams } from './architectureLayers'

// Three.js is only downloaded when this page is opened.
const ArchitectureScene = lazy(() => import('../components/ArchitectureScene'))

export default function Architecture() {
  return (
    <div className="flex-1 p-gutter md:p-container-padding flex flex-col gap-6">
      <section>
        <h1 className="text-3xl font-headline-md text-primary mb-2">Model Architecture</h1>
        <p className="text-on-surface-variant max-w-3xl">
          The PSSM + self-attention BiLSTM behind the ~80% Q3 result on CB513, with {TOTAL_PARAMS.toLocaleString('en-US')} parameters.
          Drag to rotate, scroll or pinch to zoom, right-drag or two-finger drag to pan, and hover or tap a layer for details.
        </p>
      </section>

      <section className="glass-panel-real-border relative overflow-hidden h-[320px] md:h-[55vh] md:min-h-[380px]">
        <Suspense fallback={<div className="h-full flex items-center justify-center text-on-surface-variant text-sm">Loading 3D view…</div>}>
          <ArchitectureScene />
        </Suspense>
      </section>

      <section className="glass-panel-real-border p-6 overflow-x-auto">
        <h2 className="text-xl font-headline-md text-primary mb-4">Layers in order</h2>
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] uppercase tracking-wider text-on-surface-variant border-b border-white/10">
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
              <tr key={layer.id} className="border-b border-white/5">
                <td className="py-2 pr-4 text-on-surface-variant">{i + 1}</td>
                <td className="py-2 pr-4 font-semibold text-on-surface whitespace-nowrap">{layer.name}</td>
                <td className="py-2 pr-4 font-mono text-primary-fixed-dim whitespace-nowrap">{layer.shape}</td>
                <td className="py-2 pr-4 text-on-surface-variant whitespace-nowrap">{formatParams(layer.params)}</td>
                <td className="py-2 text-on-surface-variant">{layer.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
