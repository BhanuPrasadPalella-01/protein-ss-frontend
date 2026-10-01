import { useState, useEffect } from 'react'

const API_URL = 'https://protein-ss-backend.onrender.com'

const ssColor = { H: 'bg-ss-helix', E: 'bg-ss-strand', C: 'bg-ss-coil' }

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
    <div className="flex-1 p-gutter md:p-container-padding flex flex-col gap-panel-gap">
      <header className="flex justify-between items-end gap-4 flex-wrap border-b border-line pb-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-fg mb-1">CB513 Explorer</h2>
          <p className="text-fg-muted text-sm">Compare structural predictions against benchmark samples.</p>
        </div>
        <div className="bg-raised border border-line text-xs font-medium text-fg-muted px-3 py-1 rounded-full">{samples.length} samples available</div>
      </header>

      {error && <div className="bg-danger/10 border border-danger/40 text-danger px-4 py-2 rounded-lg text-sm" role="alert">{error}</div>}

      <div className="flex flex-col lg:flex-row gap-panel-gap h-full flex-1">
        <div className="hidden lg:flex flex-col w-64 panel p-3 h-[calc(100vh-200px)] overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {samples.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedId(s.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors border-l-2 focus-visible:outline-2 focus-visible:outline-accent ${s.id === selectedId ? 'bg-raised border-accent' : 'border-transparent hover:bg-raised'
                  }`}
              >
                <div className="text-sm font-medium text-fg">{s.id}</div>
                <div className="text-xs text-fg-muted">Length: {s.length}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-panel-gap">
          {selectedSample && (
            <div className="panel p-6 flex justify-between items-center gap-4 flex-wrap">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-fg">{selectedSample.id}</h2>
                <p className="text-fg-muted text-sm">{selectedSample.length} residues • CB513 benchmark</p>
              </div>
              <div className="bg-success/10 border border-success/30 px-3 py-1.5 rounded-full flex items-center gap-2">
                <span className="material-symbols-outlined text-success text-[18px]">science</span>
                <span className="text-xs font-medium text-success">Held-out test set</span>
              </div>
            </div>
          )}

          {loading && <div className="panel p-6 text-fg-muted">Running predictions...</div>}

          {prediction && !loading && (
            <div className="panel p-6 flex flex-col gap-6">
              <div className="flex justify-between items-end gap-4 flex-wrap">
                <h3 className="eyebrow">Structural alignment</h3>
                <div className="flex gap-4 text-sm text-fg-muted">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-ss-helix"></div> Helix</div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-ss-strand"></div> Strand</div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-ss-coil"></div> Coil</div>
                </div>
              </div>

              <div className="bg-sunken border border-line p-5 rounded-lg overflow-x-auto">
                <div className="flex items-center mb-4">
                  <div className="w-28 text-xs font-medium text-fg-muted shrink-0">Ground truth</div>
                  <StructureStrip structure={prediction.true_structure} />
                </div>
                <div className="flex items-center mb-4">
                  <div className="w-28 text-xs font-medium text-accent shrink-0">+PSSM</div>
                  <StructureStrip structure={prediction.pssm_prediction} />
                </div>
                <div className="flex items-center">
                  <div className="w-28 text-xs font-medium text-accent-2 shrink-0">+Attention</div>
                  <StructureStrip structure={prediction.attention_prediction} />
                </div>
              </div>

              <div className="flex items-center gap-panel-gap flex-wrap">
                {[
                  { label: 'PSSM match', value: prediction.pssm_match_accuracy, ring: 'text-accent' },
                  { label: 'Attention match', value: prediction.attention_match_accuracy, ring: 'text-accent-2' },
                ].map((m) => (
                  <div key={m.label} className="flex items-center gap-4 bg-raised border border-line p-4 rounded-lg">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-full h-full rotate-[-90deg]" aria-hidden="true">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-line" />
                        <circle
                          cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent"
                          strokeDasharray={175}
                          strokeDashoffset={175 - (175 * m.value) / 100}
                          strokeLinecap="round"
                          className={m.ring}
                        />
                      </svg>
                      <span className="absolute text-sm font-semibold text-fg">{m.value}%</span>
                    </div>
                    <div>
                      <div className="eyebrow">{m.label}</div>
                      <div className="text-sm font-medium text-fg">vs ground truth</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
