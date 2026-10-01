import { useState, useEffect } from 'react'

const API_URL = 'https://protein-ss-backend.onrender.com'

export default function Compare() {
  const [models, setModels] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/comparison`)
      .then((res) => res.json())
      .then((data) => setModels(data.models))
      .catch((err) => setError(err.message))
  }, [])

  if (error) {
    return <div className="p-8 text-danger" role="alert">Failed to load comparison data: {error}</div>
  }
  if (!models) {
    return <div className="p-8 text-fg-muted">Loading comparison data...</div>
  }

  const [baseline, pssm, attention] = models
  const chartData = [
    { label: 'Q3 Acc', val: [baseline.q3_accuracy, pssm.q3_accuracy, attention.q3_accuracy] },
    { label: 'Helix F1', val: [baseline.helix_f1 * 100, pssm.helix_f1 * 100, attention.helix_f1 * 100] },
    { label: 'Strand F1', val: [baseline.strand_f1 * 100, pssm.strand_f1 * 100, attention.strand_f1 * 100] },
    { label: 'Coil F1', val: [baseline.coil_f1 * 100, pssm.coil_f1 * 100, attention.coil_f1 * 100] },
  ]

  // Bar fill and table text color for each model series, in [baseline, pssm, attention] order.
  const barClass = ['bg-model-baseline', 'bg-model-pssm', 'bg-model-attention']
  const valueClass = ['text-fg-muted', 'text-accent', 'text-accent-2 font-semibold']
  const rows = [
    { label: 'Overall Q3 accuracy', format: (m) => `${m.q3_accuracy}%` },
    { label: 'Strand F1', format: (m) => `${(m.strand_f1 * 100).toFixed(2)}%` },
    { label: 'Std dev (3 seeds)', format: (m) => `±${m.std_dev}` },
    { label: 'Parameters', format: (m) => m.params.toLocaleString() },
  ]

  return (
    <div className="flex-1 p-gutter md:p-container-padding flex flex-col gap-panel-gap max-w-5xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-fg mb-1">Model comparison</h2>
        <p className="text-fg-muted max-w-2xl">Structural classification accuracy across the three architectures.</p>
      </div>

      <div className="panel p-6 md:p-8">
        <div className="flex justify-between items-center gap-4 flex-wrap mb-8">
          <h3 className="text-lg font-semibold text-fg">Metrics distribution</h3>
          <div className="flex gap-4 text-sm text-fg-muted">
            {['Baseline', '+PSSM', '+Attention'].map((name, i) => (
              <div key={name} className="flex items-center gap-2"><div className={`w-3 h-3 rounded-sm ${barClass[i]}`}></div> {name}</div>
            ))}
          </div>
        </div>
        <div className="h-[300px] flex items-end gap-6 md:gap-12 pl-4 md:pl-12 border-l border-b border-line pb-4">
          {chartData.map((item, idx) => (
            <div key={idx} className="flex-1 h-full flex flex-col items-center gap-1 justify-end">
              <div className="w-full flex items-end justify-center gap-1 h-full">
                {item.val.map((v, i) => (
                  <div key={i} className={`w-6 rounded-t ${barClass[i]}`} style={{ height: `${v}%` }} title={`${v.toFixed(2)}%`}></div>
                ))}
              </div>
              <span className="text-xs font-medium mt-2 text-fg-muted whitespace-nowrap shrink-0">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="grid grid-cols-4 px-4 py-3 border-b border-line bg-raised">
          <div className="eyebrow">Metric</div><div className="eyebrow">Baseline</div><div className="eyebrow">+PSSM</div><div className="eyebrow">+Attention</div>
        </div>
        {rows.map((row, r) => (
          <div key={row.label} className={`grid grid-cols-4 px-4 py-3 hover:bg-raised transition-colors ${r > 0 ? 'border-t border-line' : ''}`}>
            <div className="font-medium text-sm text-fg">{row.label}</div>
            {models.map((m, i) => (
              <div key={m.name} className={`text-base flex items-center gap-1 ${valueClass[i]}`}>
                {row.format(m)}
                {r === 0 && i === 2 && <span className="material-symbols-outlined text-[16px] text-success" aria-label="best">verified</span>}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="bg-accent-2/10 border border-accent-2/30 p-5 rounded-xl flex gap-4">
        <span className="material-symbols-outlined text-accent-2 text-2xl">lightbulb</span>
        <div>
          <h4 className="text-base font-semibold text-fg mb-1">Key insight</h4>
          <p className="text-sm text-fg-muted">Evolutionary PSSM profiles closed most of the performance gap (+10.57 pts), with self-attention adding a further, smaller but statistically consistent improvement (+0.79 pts, validated across 3 random seeds).</p>
        </div>
      </div>
    </div>
  )
}
