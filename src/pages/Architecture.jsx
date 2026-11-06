import { lazy, Suspense, useState } from 'react'
import { LAYERS, TOTAL_PARAMS, formatParams } from './architectureLayers'
import ModelWalkthrough from '../components/ModelWalkthrough'

// Three.js is only downloaded when the 3D overview tab is opened.
const ArchitectureScene = lazy(() => import('../components/ArchitectureScene'))

const VIEWS = [
  { id: 'walkthrough', label: 'Walkthrough', icon: 'route' },
  { id: '3d', label: '3D overview', icon: 'view_in_ar' },
]

export default function Architecture() {
  const [view, setView] = useState('walkthrough')

  return (
    <div className="flex-1 p-gutter md:p-container-padding flex flex-col gap-panel-gap">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-fg mb-1">Model architecture</h1>
        <p className="text-fg-muted max-w-3xl">
          The PSSM + self-attention BiLSTM behind the ~80% Q3 result on CB513, with {TOTAL_PARAMS.toLocaleString('en-US')} parameters.
          {view === 'walkthrough'
            ? ' Follow 12 residues of a real test protein through every layer, using the model\'s actual numbers.'
            : ' Drag to rotate, scroll or pinch to zoom, right-drag or two-finger drag to pan, and hover or tap a layer for details.'}
        </p>
      </section>

      <div role="tablist" aria-label="Architecture view" className="flex gap-1 p-1 rounded-lg bg-raised border border-line self-start">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            role="tab"
            type="button"
            aria-selected={view === v.id}
            onClick={() => setView(v.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === v.id ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted hover:text-fg'}`}
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{v.icon}</span>
            {v.label}
          </button>
        ))}
      </div>

      {view === 'walkthrough' ? (
        <section className="panel p-5 md:p-6" role="tabpanel">
          <ModelWalkthrough />
        </section>
      ) : (
        <section className="panel relative overflow-hidden h-[320px] md:h-[55vh] md:min-h-[380px]" role="tabpanel">
          <Suspense fallback={<div className="h-full flex items-center justify-center text-fg-muted text-sm">Loading 3D view…</div>}>
            <ArchitectureScene />
          </Suspense>
        </section>
      )}

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
