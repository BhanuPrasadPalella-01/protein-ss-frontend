import { lazy, Suspense, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// Three.js is only downloaded once a prediction is shown on this page.
const StructureScene = lazy(() => import('../components/StructureScene'))

const API_URL = 'https://protein-ss-backend.onrender.com'

const SLOW_REQUEST_MS = 4000

const colorMap = { H: 'bg-ss-helix', E: 'bg-ss-strand', C: 'bg-ss-coil' }

export default function Predict() {
  const [sequence, setSequence] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [slow, setSlow] = useState(false)

  // The backend sleeps on Render's free tier; ping it on page load so it starts waking up early.
  useEffect(() => {
    fetch(`${API_URL}/health`).catch(() => {})
  }, [])

  const handlePredict = async () => {
    if (!sequence.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setSlow(false)
    const slowTimer = setTimeout(() => setSlow(true), SLOW_REQUEST_MS)

    try {
      const res = await fetch(`${API_URL}/predict/baseline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequence: sequence.trim() }),
      })
      if (!res.ok) {
        // 400s carry a human-readable validation message from the backend; show it as-is.
        const errData = await res.json().catch(() => null)
        if (res.status === 400 && typeof errData?.detail === 'string') {
          throw new Error(errData.detail)
        }
        throw new Error(`Prediction failed (server error ${res.status}). Please try again.`)
      }
      const data = await res.json()
      setResult(data)
    } catch (err) {
      // fetch itself rejects with a TypeError when the server can't be reached at all.
      setError(err instanceof TypeError
        ? "Couldn't reach the prediction server. Check your connection and try again."
        : err.message)
    } finally {
      clearTimeout(slowTimer)
      setSlow(false)
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 p-gutter md:p-container-padding flex flex-col gap-panel-gap max-w-5xl">
      <section className="panel p-6 flex flex-col gap-5">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-fg mb-1">Sequence analysis</h1>
            <p className="text-fg-muted">Enter an amino-acid sequence for real-time secondary structure prediction.</p>
          </div>
          <div className="bg-raised border border-line px-3 py-1.5 rounded-full flex items-center gap-2">
            <span className="material-symbols-outlined text-accent text-[18px]">model_training</span>
            <span className="text-xs font-medium text-fg">Baseline model · ~68.7% Q3</span>
          </div>
        </div>
        <div className="bg-raised border border-line px-4 py-3 rounded-lg text-sm text-fg-muted">
          This live demo runs the <span className="text-fg font-medium">sequence-only baseline</span> (~68.7% Q3 on CB513),
          because the stronger models need an evolutionary profile (PSSM) that can't be computed for a pasted sequence.
          To see the PSSM + attention model (~80% Q3), open the{' '}
          <Link to="/explorer" className="text-accent font-medium underline underline-offset-2 hover:opacity-80">CB513 Explorer</Link>.
        </div>
        <div>
          <label htmlFor="sequence" className="eyebrow mb-2 block">Amino-acid sequence</label>
          <textarea
            id="sequence"
            className="seq-input w-full rounded-lg p-4 resize-none focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 h-32"
            placeholder="e.g. MKTAYIAKQRQISFVKSHFSRQ..."
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
          ></textarea>
        </div>
        {loading && slow && (
          <div className="bg-accent/10 border border-accent/30 text-fg px-4 py-2 rounded-lg text-sm" role="status">
            Waking up the server, this can take up to a minute…
          </div>
        )}
        {error && (
          <div className="bg-danger/10 border border-danger/40 text-danger px-4 py-2 rounded-lg text-sm" role="alert">
            {error}
          </div>
        )}
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <span className="text-fg-muted text-sm">
            Standard amino-acid letters only · max 700 residues
          </span>
          <button
            onClick={handlePredict}
            disabled={loading}
            className="bg-accent text-accent-fg text-sm font-medium px-6 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            {loading ? 'Predicting...' : 'Predict'}
          </button>
        </div>
      </section>

      {result && (
        <section className="panel p-6 flex flex-col gap-5">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <h2 className="text-xl font-semibold text-fg">Prediction results</h2>
            <div className="flex gap-4 text-sm text-fg-muted">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-ss-helix"></div> Helix</div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-ss-strand"></div> Strand</div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-ss-coil"></div> Coil</div>
            </div>
          </div>

          <div className="w-full h-8 flex rounded-md overflow-hidden border border-line bg-sunken">
            {result.predicted_structure.split('').map((c, i) => (
              <div key={i} className={`h-full ${colorMap[c]}`} style={{ width: `${100 / result.predicted_structure.length}%` }}></div>
            ))}
          </div>

          <figure className="flex flex-col gap-2">
            <div className="h-[260px] md:h-[300px] rounded-lg border border-line bg-sunken overflow-hidden">
              <Suspense fallback={<div className="h-full flex items-center justify-center text-fg-muted text-sm">Loading 3D view…</div>}>
                <StructureScene structure={result.predicted_structure} />
              </Suspense>
            </div>
            <figcaption className="text-sm text-fg-muted">
              Schematic from predicted H/E/C labels, not a folded 3D structure. Drag to rotate, scroll or pinch to zoom.
            </figcaption>
          </figure>

          <div className="grid grid-cols-3 gap-4">
            {[['H', 'Helix'], ['E', 'Strand'], ['C', 'Coil']].map(([key, label]) => (
              <div key={key} className="bg-raised border border-line px-4 py-3 rounded-lg text-center flex flex-col gap-1">
                <span className="text-2xl font-semibold text-fg">{result.percentages[key]}%</span>
                <span className="eyebrow">{label}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
