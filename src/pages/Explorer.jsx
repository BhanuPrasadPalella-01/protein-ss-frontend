import { useState, useEffect } from 'react'

const API_URL = 'https://protein-ss-backend.onrender.com'

// Updated to use your custom theme colors
const ssColor = { H: 'bg-error', E: 'bg-tertiary-container', C: 'bg-surface-bright' }

function StructureStrip({ structure }) {
  // Optimization: Group identical consecutive characters to drastically reduce DOM nodes
  const blocks = structure.match(/(.)\1*/g) || [];
  const totalLen = structure.length;

  return (
    <div className="flex h-5 w-full rounded-sm overflow-hidden gap-[1px]">
      {blocks.map((block, i) => (
        <div
          key={i}
          className={ssColor[block[0]]}
          style={{ width: `${(block.length / totalLen) * 100}%` }}
        ></div>
      ))}
    </div>
  )
}

export default function Explorer() {
  const [samples, setSamples] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/samples`)
      .then((res) => res.json())
      .then((data) => {
        setSamples(data)
        if (data.length > 0) setSelectedId(data[0].id)
      })
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setLoading(true)
    setPrediction(null)
    fetch(`${API_URL}/samples/${selectedId}/predict`)
      .then((res) => res.json())
      .then((data) => setPrediction(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [selectedId])

  const selectedSample = samples.find((s) => s.id === selectedId)

  return (
    <div className="flex-1 p-gutter md:p-container-padding flex flex-col gap-6">
      <header className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h2 className="text-3xl font-bold">CB513 Explorer</h2>
          <p className="text-on-surface-variant text-sm">Analyze structural predictions against benchmark samples.</p>
        </div>
        <div className="bg-surface-variant text-[10px] font-bold uppercase px-3 py-1 rounded">{samples.length} samples available</div>
      </header>

      {error && <div className="bg-error/10 border border-error/30 text-error px-4 py-2 rounded-lg text-sm">{error}</div>}

      <div className="flex flex-col lg:flex-row gap-6 h-full flex-1">
        <div className="hidden lg:flex flex-col w-72 glass-panel-real-border p-4 h-[calc(100vh-200px)] overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {samples.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`p-3 rounded-md cursor-pointer transition-all border-l-2 ${s.id === selectedId ? 'bg-primary-container/10 border-primary-fixed-dim' : 'border-transparent hover:bg-white/5'
                  }`}
              >
                <div className="text-sm font-bold">{s.id}</div>
                <div className="text-[10px] text-on-surface-variant uppercase">Length: {s.length}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          {selectedSample && (
            <div className="glass-panel-real-border p-6 flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-bold tracking-tight">{selectedSample.id}</h2>
                <p className="text-on-surface-variant text-sm">{selectedSample.length} residues • CB513 benchmark</p>
              </div>
              <div className="bg-tertiary-container/10 border border-tertiary-container/30 px-4 py-2 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary-container text-sm">science</span>
                <span className="text-[10px] font-bold uppercase text-tertiary-container">Held-out test set</span>
              </div>
            </div>
          )}

          {loading && <div className="glass-panel-real-border p-6 text-on-surface-variant">Running predictions...</div>}

          {prediction && !loading && (
            <div className="glass-panel-real-border p-6 flex flex-col gap-8">
              <div className="flex justify-between items-end">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary-fixed-dim">Structural Alignment</h3>
                <div className="flex gap-4 text-[10px] font-bold uppercase">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-error"></div> Helix</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-tertiary-container"></div> Strand</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-surface-bright"></div> Coil</div>
                </div>
              </div>

              <div className="bg-black/30 p-6 rounded-xl overflow-x-auto">
                <div className="flex items-center mb-4">
                  <div className="w-24 text-[10px] font-bold text-on-surface-variant uppercase shrink-0">Ground Truth</div>
                  <StructureStrip structure={prediction.true_structure} />
                </div>
                <div className="flex items-center mb-4">
                  <div className="w-24 text-[10px] font-bold text-primary-fixed-dim uppercase shrink-0">+PSSM</div>
                  <StructureStrip structure={prediction.pssm_prediction} />
                </div>
                <div className="flex items-center">
                  <div className="w-24 text-[10px] font-bold text-secondary uppercase shrink-0">+Attention</div>
                  <StructureStrip structure={prediction.attention_prediction} />
                </div>
              </div>

              <div className="flex items-center gap-6 mt-auto flex-wrap">
                <div className="flex items-center gap-4 glass-panel p-4 rounded-xl">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full rotate-[-90deg]">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
                      <circle
                        cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent"
                        strokeDasharray={175}
                        strokeDashoffset={175 - (175 * prediction.pssm_match_accuracy) / 100}
                        className="text-primary-fixed-dim"
                      />
                    </svg>
                    <span className="absolute text-sm font-bold">{prediction.pssm_match_accuracy}%</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-on-surface-variant">PSSM Match</div>
                    <div className="text-sm font-bold">vs Ground Truth</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 glass-panel p-4 rounded-xl">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full rotate-[-90deg]">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
                      <circle
                        cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent"
                        strokeDasharray={175}
                        strokeDashoffset={175 - (175 * prediction.attention_match_accuracy) / 100}
                        className="text-secondary"
                      />
                    </svg>
                    <span className="absolute text-sm font-bold">{prediction.attention_match_accuracy}%</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-on-surface-variant">Attention Match</div>
                    <div className="text-sm font-bold">vs Ground Truth</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}