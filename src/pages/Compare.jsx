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
    return <div className="p-8 text-error">Failed to load comparison data: {error}</div>
  }
  if (!models) {
    return <div className="p-8 text-on-surface-variant">Loading comparison data...</div>
  }

  const [baseline, pssm, attention] = models
  const chartData = [
    { label: 'Q3 Acc', val: [baseline.q3_accuracy, pssm.q3_accuracy, attention.q3_accuracy] },
    { label: 'Helix F1', val: [baseline.helix_f1 * 100, pssm.helix_f1 * 100, attention.helix_f1 * 100] },
    { label: 'Strand F1', val: [baseline.strand_f1 * 100, pssm.strand_f1 * 100, attention.strand_f1 * 100] },
    { label: 'Coil F1', val: [baseline.coil_f1 * 100, pssm.coil_f1 * 100, attention.coil_f1 * 100] },
  ]

  return (
    <div className="flex-1 p-container-padding lg:p-[40px] flex flex-col gap-panel-gap">
      <div>
        <h2 className="text-4xl font-headline-md text-white mb-2 font-bold">Model Comparison</h2>
        <p className="text-on-surface-variant max-w-2xl">Evaluating structural classification accuracy across variant architectures.</p>
      </div>

      <div className="bg-surface-container-low/60 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-center mb-8 relative z-10">
          <h3 className="text-xl font-bold">Metrics Distribution</h3>
          <div className="flex gap-4 text-[10px] font-bold uppercase">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-surface-container-highest"></div> Baseline</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary-fixed-dim/60"></div> +PSSM</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-secondary-fixed-dim"></div> +Attention</div>
          </div>
        </div>
        {/* Changed items-stretch to items-end to properly anchor the bar charts */}
        <div className="h-[300px] flex items-end gap-12 pl-12 border-l border-b border-white/10 relative z-10 pb-4">
          {chartData.map((item, idx) => (
            <div key={idx} className="flex-1 h-full flex flex-col items-center gap-1 group justify-end">
              <div className="w-full flex items-end justify-center gap-1 h-full">
                <div className="w-6 bg-surface-container-highest rounded-t transition-all" style={{ height: `${item.val[0]}%` }}></div>
                <div className="w-6 bg-primary-fixed-dim/60 rounded-t transition-all" style={{ height: `${item.val[1]}%` }}></div>
                <div className="w-6 bg-secondary-fixed-dim rounded-t shadow-[0_0_10px_rgba(228,181,255,0.4)] transition-all" style={{ height: `${item.val[2]}%` }}></div>
              </div>
              <span className="text-[10px] font-bold uppercase mt-2 text-on-surface-variant whitespace-nowrap shrink-0">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel-real-border overflow-hidden">
        <div className="grid grid-cols-4 p-4 border-b border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          <div>Metric</div><div>Baseline</div><div>+PSSM</div><div>+Attention</div>
        </div>
        <div className="flex flex-col">
          <div className="grid grid-cols-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
            <div className="font-bold text-sm">Overall Q3 Acc</div>
            <div className="text-outline text-lg">{baseline.q3_accuracy}%</div>
            <div className="text-primary text-lg">{pssm.q3_accuracy}%</div>
            <div className="text-secondary text-lg font-bold flex items-center gap-1">
              {attention.q3_accuracy}% <span className="material-symbols-outlined text-xs text-tertiary-container">verified</span>
            </div>
          </div>
          <div className="grid grid-cols-4 p-4 hover:bg-white/5 transition-colors">
            <div className="font-bold text-sm">Strand F1</div>
            <div className="text-outline text-lg">{(baseline.strand_f1 * 100).toFixed(2)}%</div>
            <div className="text-primary text-lg">{(pssm.strand_f1 * 100).toFixed(2)}%</div>
            <div className="text-secondary text-lg font-bold">{(attention.strand_f1 * 100).toFixed(2)}%</div>
          </div>
          <div className="grid grid-cols-4 p-4 border-t border-white/5 hover:bg-white/5 transition-colors">
            <div className="font-bold text-sm">Std Dev (3-seed)</div>
            <div className="text-outline text-lg">±{baseline.std_dev}</div>
            <div className="text-primary text-lg">±{pssm.std_dev}</div>
            <div className="text-secondary text-lg font-bold">±{attention.std_dev}</div>
          </div>
          <div className="grid grid-cols-4 p-4 border-t border-white/5 hover:bg-white/5 transition-colors">
            <div className="font-bold text-sm">Parameters</div>
            <div className="text-outline text-lg">{baseline.params.toLocaleString()}</div>
            <div className="text-primary text-lg">{pssm.params.toLocaleString()}</div>
            <div className="text-secondary text-lg font-bold">{attention.params.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="bg-secondary/5 border-l-4 border-secondary p-6 rounded-r-xl flex gap-4">
        <span className="material-symbols-outlined text-secondary text-3xl">lightbulb</span>
        <div>
          <h4 className="text-lg font-bold text-secondary mb-1">Key Insight</h4>
          <p className="text-sm text-on-surface-variant">Evolutionary PSSM profiles closed most of the performance gap (+10.57 pts), with self-attention adding a further, smaller but statistically consistent improvement (+0.79 pts, validated across 3 random seeds).</p>
        </div>
      </div>
    </div>
  )
}