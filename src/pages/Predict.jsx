import { useEffect, useState } from 'react'

const API_URL = 'https://protein-ss-backend.onrender.com'

const SLOW_REQUEST_MS = 4000

const colorMap = { H: 'bg-error', E: 'bg-tertiary-container', C: 'bg-surface-bright' }

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
    <div className="flex-1 p-gutter md:p-container-padding flex flex-col gap-6">
      <section className="glass-panel-real-border p-6 flex flex-col gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <span className="material-symbols-outlined text-[160px]">science</span>
        </div>
        <div className="flex justify-between items-start z-10">
          <div>
            <h1 className="text-3xl font-headline-md text-primary mb-2">Sequence Analysis</h1>
            <p className="text-on-surface-variant">Enter amino acid sequence for real-time secondary structure prediction.</p>
          </div>
          <div className="bg-primary-container/10 border border-primary/20 px-4 py-2 rounded-full flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-fixed-dim text-sm">model_training</span>
            <span className="text-[10px] font-bold uppercase text-primary-fixed-dim">Baseline Model</span>
          </div>
        </div>
        <div className="z-10">
          <label className="text-[10px] uppercase font-bold text-on-surface-variant mb-2 block">Amino Acid Sequence</label>
          <textarea
            className="seq-input w-full rounded-lg p-4 resize-none focus:outline-none focus:border-primary-fixed-dim h-32"
            placeholder="e.g. MKTAYIAKQRQISFVKSHFSRQ..."
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
          ></textarea>
        </div>
        {loading && slow && (
          <div className="z-10 bg-primary-container/10 border border-primary/20 text-primary-fixed-dim px-4 py-2 rounded-lg text-sm">
            Waking up the server, this can take up to a minute…
          </div>
        )}
        {error && (
          <div className="z-10 bg-error/10 border border-error/30 text-error px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-between items-center z-10">
          <span className="text-on-surface-variant text-[10px] font-bold uppercase">
            Works on any sequence — evolutionary profile not required
          </span>
          <button
            onClick={handlePredict}
            disabled={loading}
            className="bg-primary-container text-on-primary-container text-[10px] font-bold uppercase px-8 py-3 rounded-lg shadow-[0_0_15px_rgba(0,219,233,0.4)] flex items-center gap-2 hover:brightness-110 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">play_arrow</span>
            {loading ? 'Predicting...' : 'Predict'}
          </button>
        </div>
      </section>

      {result && (
        <section className="glass-panel-real-border p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-headline-md text-primary">Prediction Results</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-on-surface-variant">
                <div className="w-2 h-2 rounded-full bg-error"></div> Helix
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-on-surface-variant">
                <div className="w-2 h-2 rounded-full bg-tertiary-container"></div> Strand
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-on-surface-variant">
                <div className="w-2 h-2 rounded-full bg-surface-bright"></div> Coil
              </div>
            </div>
          </div>

          <div className="w-full h-8 flex rounded-full overflow-hidden border border-white/10 bg-surface-container-lowest">
            {result.predicted_structure.split('').map((c, i) => (
              <div key={i} className={`h-full ${colorMap[c]}`} style={{ width: `${100 / result.predicted_structure.length}%` }}></div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="glass-panel px-4 py-3 rounded-lg text-center flex flex-col gap-1">
              <span className="text-2xl font-bold text-white">{result.percentages.H}%</span>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant">Helix</span>
            </div>
            <div className="glass-panel px-4 py-3 rounded-lg text-center flex flex-col gap-1">
              <span className="text-2xl font-bold text-white">{result.percentages.E}%</span>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant">Strand</span>
            </div>
            <div className="glass-panel px-4 py-3 rounded-lg text-center flex flex-col gap-1">
              <span className="text-2xl font-bold text-white">{result.percentages.C}%</span>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant">Coil</span>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
