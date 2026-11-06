import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../api'

// The 3D libraries are only downloaded once a prediction is shown on this page.
const ProteinViewer = lazy(() => import('../components/ProteinViewer'))
const StructureScene = lazy(() => import('../components/StructureScene'))

const SLOW_REQUEST_MS = 4000
const FOLD_MAX_RESIDUES = 400 // the public ESMFold API's limit

const CONFIDENCE_BANDS = [
  { cls: 'bg-conf-very-high', label: 'Very high (>90)' },
  { cls: 'bg-conf-high', label: 'Confident (70–90)' },
  { cls: 'bg-conf-low', label: 'Low (50–70)' },
  { cls: 'bg-conf-very-low', label: 'Very low (<50)' },
]

const colorMap = { H: 'bg-ss-helix', E: 'bg-ss-strand', C: 'bg-ss-coil' }

export default function Predict() {
  const [sequence, setSequence] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [slow, setSlow] = useState(false)
  // 3D structure from ESMFold: { status: 'loading' | 'done' | 'error' | 'too-long', data?, error? }
  const [fold, setFold] = useState(null)
  const [colorBy, setColorBy] = useState('prediction')
  const foldRequest = useRef(null)

  const requestFold = async (seq) => {
    foldRequest.current?.abort()
    if (seq.length > FOLD_MAX_RESIDUES) {
      setFold({ status: 'too-long' })
      return
    }
    const ctrl = new AbortController()
    foldRequest.current = ctrl
    setFold({ status: 'loading' })
    try {
      const res = await fetch(`${API_URL}/fold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequence: seq }),
        signal: ctrl.signal,
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(typeof data?.detail === 'string' ? data.detail : `Folding failed (server error ${res.status}).`)
      setFold({ status: 'done', data })
    } catch (err) {
      if (err.name === 'AbortError') return
      setFold({ status: 'error', error: err instanceof TypeError ? "Couldn't reach the server to fold this sequence." : err.message })
    }
  }

  // The backend sleeps on Render's free tier; ping it on page load so it starts waking up early.
  useEffect(() => {
    fetch(`${API_URL}/health`).catch(() => {})
  }, [])

  const handlePredict = async () => {
    if (!sequence.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    foldRequest.current?.abort()
    setFold(null)
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
      requestFold(data.sequence)
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
            Standard amino-acid letters only · max 700 residues.
            <span className="block text-xs mt-0.5">For the 3D model, sequences up to {FOLD_MAX_RESIDUES} residues are also sent to Meta's ESMFold service.</span>
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

          <figure className="flex flex-col gap-3">
            <div className="flex justify-between items-center gap-3 flex-wrap">
              <h3 className="text-base font-semibold text-fg">3D structure</h3>
              {fold?.status === 'done' && (
                <div role="group" aria-label="Color the structure by" className="flex gap-1 p-1 rounded-lg bg-raised border border-line text-sm">
                  {[['prediction', 'Our prediction'], ['confidence', 'ESMFold confidence']].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={colorBy === id}
                      onClick={() => setColorBy(id)}
                      className={`px-3 py-1 rounded-md font-medium transition-colors ${colorBy === id ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted hover:text-fg'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-[340px] md:h-[440px] rounded-lg border border-line bg-sunken overflow-hidden">
              {fold?.status === 'loading' && (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-fg-muted text-sm" role="status">
                  <span className="material-symbols-outlined animate-spin motion-reduce:animate-none text-accent" aria-hidden="true">progress_activity</span>
                  Folding with ESMFold… usually a few seconds
                </div>
              )}
              {fold?.status === 'done' && (
                <Suspense fallback={<div className="h-full flex items-center justify-center text-fg-muted text-sm">Loading 3D viewer…</div>}>
                  <ProteinViewer pdb={fold.data.pdb} structure={result.predicted_structure} plddt={fold.data.plddt} colorBy={colorBy} />
                </Suspense>
              )}
              {(fold?.status === 'error' || fold?.status === 'too-long') && (
                <Suspense fallback={<div className="h-full flex items-center justify-center text-fg-muted text-sm">Loading 3D view…</div>}>
                  <StructureScene structure={result.predicted_structure} />
                </Suspense>
              )}
            </div>

            {fold?.status === 'done' && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-fg-muted">
                {colorBy === 'prediction'
                  ? [['bg-ss-helix', 'Helix'], ['bg-ss-strand', 'Strand'], ['bg-ss-coil', 'Coil']].map(([cls, label]) => (
                      <span key={label} className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded-sm ${cls}`} />{label}</span>
                    ))
                  : CONFIDENCE_BANDS.map((b) => (
                      <span key={b.label} className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded-sm ${b.cls}`} />{b.label}</span>
                    ))}
              </div>
            )}

            <figcaption className="text-sm text-fg-muted">
              {fold?.status === 'done' && (
                <>
                  3D shape predicted by ESMFold (Meta){colorBy === 'prediction' ? ", colored by our model's helix/strand/coil labels" : ', colored by its per-residue confidence'}.
                  {fold.data.mean_plddt !== null && ` Mean confidence (pLDDT): ${Math.round(fold.data.mean_plddt)}.`}
                  {' '}Drag to rotate, scroll or pinch to zoom, hover a residue for details.
                </>
              )}
              {fold?.status === 'too-long' && `ESMFold folds up to ${FOLD_MAX_RESIDUES} residues, so this shows a schematic from the predicted H/E/C labels instead, not a folded 3D structure.`}
              {fold?.status === 'error' && `${fold.error} Showing a schematic from the predicted H/E/C labels instead, not a folded 3D structure.`}
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
