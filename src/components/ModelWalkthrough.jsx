import { useEffect, useMemo, useState } from 'react'
import { getJSON } from '../api'
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion'

// Follows a 12-residue window of a CB513 test protein through the PSSM + attention model, using the
// real activations from GET /samples/{id}/trace. Each residue is a column; each stage is a row.

const WINDOW = 12
const LABEL_W = 136
const COL_W = 52
const CELL = 5          // one feature value
const GRID_COLS = 8     // features are drawn as 8-wide grids
const WIDTH = LABEL_W + WINDOW * COL_W

// Vertical layout of the rows (SVG units).
const Y = {
  residue: 22,
  pssm: 52,
  embedding: 82,
  joined: 118,
  lstmForward: 172,
  bilstm: 182,
  lstmBackward: 272,
  attentionBase: 400,
  probs: 424,
  predicted: 492,
  truth: 518,
  check: 548,
}
const HEIGHT = 566

const STAGES = [
  { id: 'input', title: 'Input', text: 'Each residue enters as its amino-acid letter plus a row of the PSSM: 22 numbers saying how often each amino acid appears at this position across related proteins.' },
  { id: 'embedding', title: 'Embedding', text: 'The letter is looked up in a learned table and becomes 32 numbers. Residues with the same letter get the same 32 numbers.' },
  { id: 'joined', title: 'Join', text: 'The 32 embedding numbers and the 22 PSSM numbers are joined: 54 numbers per residue.' },
  { id: 'bilstm', title: 'BiLSTM', text: 'Two LSTMs read the whole protein, one left to right and one right to left, 64 numbers each: 128 per residue. Now every residue carries context from its neighbours, so the same letter can end up with different numbers.' },
  { id: 'attention', title: 'Attention', text: 'Every residue looks at every other residue in the protein, through 4 heads. Arcs show how strongly residues in this window attend to each other; click a residue to see only its arcs.' },
  { id: 'output', title: 'Output', text: 'The attention result is added back onto the BiLSTM output and normalised, then one linear layer turns the 128 numbers into 3 probabilities. The highest one is the prediction.' },
]

const SS_FILL = { H: 'fill-ss-helix', E: 'fill-ss-strand', C: 'fill-ss-coil' }
const SS_NAME = { H: 'Helix', E: 'Strand', C: 'Coil' }
const colX = (i) => LABEL_W + i * COL_W + COL_W / 2

const maxAbs = (rows) => Math.max(1e-6, ...rows.flat().map(Math.abs))

// A feature vector as an 8-wide grid of cells: accent for positive values, accent-2 for negative,
// stronger for larger magnitude. Scaled to the largest value of that stage in this window, on a
// square-root curve so small values stay visible next to large ones.
function FeatureGrid({ values, x, y, scale, offset = 0 }) {
  return values.map((v, k) => {
    const idx = k + offset
    return (
      <rect
        key={idx}
        x={x + (idx % GRID_COLS) * CELL}
        y={y + Math.floor(idx / GRID_COLS) * CELL}
        width={CELL - 1}
        height={CELL - 1}
        className={v >= 0 ? 'fill-accent' : 'fill-accent-2'}
        fillOpacity={0.12 + 0.88 * Math.sqrt(Math.min(1, Math.abs(v) / scale))}
      />
    )
  })
}

function RowLabel({ y, title, detail }) {
  return (
    <g>
      <text x={0} y={y} className="fill-fg text-[12px] font-medium">{title}</text>
      {detail && <text x={0} y={y + 14} className="fill-fg-muted text-[11px]">{detail}</text>}
    </g>
  )
}

function Stage({ id, active, children }) {
  return (
    <g className="transition-opacity duration-300" opacity={active === 'all' || active === id ? 1 : 0.22} aria-hidden={active !== 'all' && active !== id}>
      {children}
    </g>
  )
}

export default function ModelWalkthrough() {
  const reducedMotion = usePrefersReducedMotion()
  const [samples, setSamples] = useState([])
  const [sampleId, setSampleId] = useState(null)
  const [start, setStart] = useState(null)        // null = let the API pick a clear window
  const [slider, setSlider] = useState(null)      // live slider value, applied to `start` after a pause
  const [result, setResult] = useState(null)      // { key, data } of the latest finished trace
  const [error, setError] = useState(null)
  const [stage, setStage] = useState('all')
  const [playing, setPlaying] = useState(false)
  const [head, setHead] = useState('avg')
  const [selected, setSelected] = useState(null)  // selected column (0..11)

  useEffect(() => {
    const ctrl = new AbortController()
    getJSON('/samples', ctrl.signal)
      .then((data) => {
        setSamples(data)
        if (data.length > 0) setSampleId(data[0].id)
      })
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message) })
    return () => ctrl.abort()
  }, [])

  const key = sampleId && `${sampleId}:${start ?? 'auto'}`
  useEffect(() => {
    if (!sampleId) return
    // Abort the previous request so a slow response can't overwrite a newer one.
    const ctrl = new AbortController()
    const query = start === null ? '' : `?start=${start}`
    getJSON(`/samples/${sampleId}/trace${query}`, ctrl.signal)
      .then((data) => setResult({ key: `${sampleId}:${start ?? 'auto'}`, data }))
      .catch((err) => {
        if (err.name === 'AbortError') return
        setError(err.message.includes('Not Found')
          ? 'This view needs the latest backend, which adds the /samples/{id}/trace endpoint.'
          : err.message)
      })
    return () => ctrl.abort()
  }, [sampleId, start])

  // Moving the slider only fetches once it rests for a moment.
  useEffect(() => {
    if (slider === null) return
    const t = setTimeout(() => setStart(slider), 200)
    return () => clearTimeout(t)
  }, [slider])

  // Play steps through the stages one at a time, then shows everything.
  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => {
      const i = STAGES.findIndex((st) => st.id === stage)
      if (i === STAGES.length - 1) {
        setPlaying(false)
        setStage('all')
      } else {
        setStage(STAGES[i + 1].id)
      }
    }, 3200)
    return () => clearTimeout(t)
  }, [playing, stage])

  // Keep the last finished trace on screen while a new window loads, so the view doesn't flash.
  const trace = result?.data
  const loading = Boolean(key) && result?.key !== key && !error
  const w = trace?.window

  const scales = useMemo(() => w && {
    pssm: maxAbs(w.pssm),
    embedding: maxAbs(w.embedding),
    bilstm: maxAbs(w.bilstm),
  }, [w])

  // Attention matrix for the chosen head, or the average of the 4 heads.
  const attention = useMemo(() => {
    if (!w) return null
    if (head !== 'avg') return { m: w.attention[head], outside: w.attention_outside[head] }
    const m = w.attention[0].map((row, i) => row.map((_, j) => w.attention.reduce((s, h) => s + h[i][j], 0) / 4))
    const outside = w.attention_outside[0].map((_, i) => w.attention_outside.reduce((s, h) => s + h[i], 0) / 4)
    return { m, outside }
  }, [w, head])

  const selectSample = (id) => {
    setError(null)
    setSampleId(id)
    setStart(null)
    setSlider(null)
    setSelected(null)
  }

  const sample = samples.find((s) => s.id === sampleId)
  const maxStart = sample ? sample.length - WINDOW : 0
  const startValue = slider ?? trace?.start ?? 0
  const correct = w ? [...w.predicted].filter((c, i) => c === w.true[i]).length : 0
  const activeStage = STAGES.find((s) => s.id === stage)
  const meanOutside = attention ? attention.outside.reduce((a, b) => a + b, 0) / attention.outside.length : 0

  return (
    <div className="flex flex-col gap-5">
      {/* Controls: protein and window */}
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="eyebrow">Test protein</span>
          <select
            value={sampleId ?? ''}
            onChange={(e) => selectSample(e.target.value)}
            className="seq-input rounded-lg px-3 py-2 text-sm font-sans"
          >
            {samples.map((s) => <option key={s.id} value={s.id}>{s.id} · {s.length} residues</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm flex-1 min-w-[220px]">
          <span className="eyebrow">Window: residues {startValue + 1}–{startValue + WINDOW}</span>
          <input
            type="range"
            min={0}
            max={Math.max(0, maxStart)}
            step={1}
            value={startValue}
            onChange={(e) => { setSlider(Number(e.target.value)); setSelected(null) }}
            className="accent-accent"
            disabled={!sample}
          />
        </label>
        {loading && <span className="text-sm text-fg-muted" role="status">Running the model…</span>}
      </div>

      {/* Whole protein, true structure, with the window marked */}
      {trace && (
        <div className="relative h-3 rounded-sm overflow-hidden flex gap-px bg-sunken" aria-hidden="true">
          {(trace.true_structure.match(/(.)\1*/g) || []).map((run, i) => (
            <div key={i} className={{ H: 'bg-ss-helix', E: 'bg-ss-strand', C: 'bg-ss-coil' }[run[0]]} style={{ flex: run.length }} />
          ))}
          <div
            className="absolute inset-y-0 border-2 border-fg rounded-sm"
            style={{ left: `${(trace.start / trace.sequence.length) * 100}%`, width: `${(WINDOW / trace.sequence.length) * 100}%` }}
          />
        </div>
      )}

      {error && <div className="bg-danger/10 border border-danger/40 text-danger px-4 py-2 rounded-lg text-sm" role="alert">{error}</div>}

      {/* Stage stepper */}
      <div className="flex flex-wrap items-center gap-2">
        {STAGES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => { setPlaying(false); setStage(s.id) }}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${stage === s.id ? 'bg-accent text-accent-fg border-accent' : 'border-line text-fg-muted hover:text-fg hover:bg-raised'}`}
          >
            <span className="opacity-70 mr-1">{i + 1}</span>{s.title}
          </button>
        ))}
        <span className="flex-1" />
        <button
          type="button"
          onClick={() => { setStage(playing ? 'all' : STAGES[0].id); setPlaying(!playing) }}
          className="px-3 py-1.5 rounded-lg text-sm border border-line text-fg hover:bg-raised flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{playing ? 'stop' : 'play_arrow'}</span>
          {playing ? 'Stop' : 'Play through'}
        </button>
        <button
          type="button"
          onClick={() => { setPlaying(false); setStage('all') }}
          className={`px-3 py-1.5 rounded-lg text-sm border ${stage === 'all' ? 'border-line-strong text-fg' : 'border-line text-fg-muted hover:text-fg hover:bg-raised'}`}
        >
          Show all
        </button>
      </div>
      <p className="text-sm text-fg-muted min-h-[2.5rem]" aria-live="polite">
        {activeStage ? activeStage.text : 'All stages at once. Pick a stage to focus on it, or play through them in order.'}
        {activeStage?.id === 'attention' && attention && ` On average, ${Math.round(meanOutside * 100)}% of these residues' attention goes to residues outside this window.`}
      </p>

      {/* The diagram */}
      {w && scales && attention && (
        <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-60' : ''}`}>
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full min-w-[640px] h-auto font-sans"
            role="img"
            aria-label={`Residues ${trace.start + 1} to ${trace.start + WINDOW} of ${trace.id} passing through the model. ${correct} of ${WINDOW} predicted correctly.`}
          >
            {/* Selected column highlight */}
            {selected !== null && (
              <rect x={LABEL_W + selected * COL_W + 2} y={4} width={COL_W - 4} height={HEIGHT - 8} rx={8} className="fill-raised" />
            )}

            <Stage id="input" active={stage}>
              <RowLabel y={Y.residue + 4} title="Amino acid" detail="1 letter" />
              {[...w.residues].map((aa, i) => (
                <g
                  key={i}
                  role="button"
                  tabIndex={0}
                  aria-label={`Residue ${trace.start + i + 1}, ${aa}`}
                  onClick={() => setSelected(selected === i ? null : i)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(selected === i ? null : i) } }}
                  className="cursor-pointer focus:outline-none"
                >
                  <circle cx={colX(i)} cy={Y.residue} r={14} className={selected === i ? 'fill-accent' : 'fill-surface stroke-line-strong'} strokeWidth={1} />
                  <text x={colX(i)} y={Y.residue + 4.5} textAnchor="middle" className={`text-[13px] font-semibold font-mono ${selected === i ? 'fill-accent-fg' : 'fill-fg'}`}>{aa}</text>
                </g>
              ))}
              <RowLabel y={Y.pssm + 6} title="PSSM" detail="22 numbers" />
              {w.pssm.map((row, i) => <FeatureGrid key={i} values={row} x={colX(i) - 20} y={Y.pssm} scale={scales.pssm} />)}
            </Stage>

            <Stage id="embedding" active={stage}>
              <RowLabel y={Y.embedding + 8} title="Embedding" detail="32 numbers" />
              {w.embedding.map((row, i) => <FeatureGrid key={i} values={row} x={colX(i) - 20} y={Y.embedding} scale={scales.embedding} />)}
            </Stage>

            <Stage id="joined" active={stage}>
              <RowLabel y={Y.joined + 14} title="Joined" detail="32 + 22 = 54" />
              {w.embedding.map((row, i) => (
                <g key={i}>
                  <FeatureGrid values={row} x={colX(i) - 20} y={Y.joined} scale={scales.embedding} />
                  <FeatureGrid values={w.pssm[i]} x={colX(i) - 20} y={Y.joined} scale={scales.pssm} offset={32} />
                </g>
              ))}
            </Stage>

            <Stage id="bilstm" active={stage}>
              <RowLabel y={Y.bilstm + 36} title="BiLSTM" detail="64 → + 64 ← = 128" />
              <defs>
                <marker id="wt-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M0 0 L10 5 L0 10 z" className="fill-fg-muted" />
                </marker>
              </defs>
              <line x1={colX(0) - 18} y1={Y.lstmForward} x2={colX(WINDOW - 1) + 18} y2={Y.lstmForward} className="stroke-fg-muted" strokeWidth={1.2} markerEnd="url(#wt-arrow)" />
              <line x1={colX(WINDOW - 1) + 18} y1={Y.lstmBackward} x2={colX(0) - 18} y2={Y.lstmBackward} className="stroke-fg-muted" strokeWidth={1.2} markerEnd="url(#wt-arrow)" />
              {stage === 'bilstm' && !reducedMotion && (
                <>
                  <circle r={3.5} className="fill-accent">
                    <animateMotion dur="2.4s" repeatCount="indefinite" path={`M${colX(0) - 18},${Y.lstmForward} L${colX(WINDOW - 1) + 18},${Y.lstmForward}`} />
                  </circle>
                  <circle r={3.5} className="fill-accent-2">
                    <animateMotion dur="2.4s" repeatCount="indefinite" path={`M${colX(WINDOW - 1) + 18},${Y.lstmBackward} L${colX(0) - 18},${Y.lstmBackward}`} />
                  </circle>
                </>
              )}
              {w.bilstm.map((row, i) => <FeatureGrid key={i} values={row} x={colX(i) - 20} y={Y.bilstm} scale={scales.bilstm} />)}
            </Stage>

            <Stage id="attention" active={stage}>
              <RowLabel y={Y.attentionBase - 70} title="Self-attention" detail={head === 'avg' ? 'average of 4 heads' : `head ${head + 1} of 4`} />
              <line x1={colX(0) - 18} y1={Y.attentionBase} x2={colX(WINDOW - 1) + 18} y2={Y.attentionBase} className="stroke-line" strokeWidth={1} />
              {(() => {
                // With no residue selected, each residue shows only its 3 strongest links to others in the
                // window, to keep the picture readable; a selected residue shows all of its links.
                const linksOf = (i) => attention.m[i].map((v, j) => ({ i, j, v })).filter((a) => a.j !== i)
                const shown = selected === null
                  ? attention.m.flatMap((_, i) => linksOf(i).sort((a, b) => b.v - a.v).slice(0, 3))
                  : linksOf(selected)
                const top = Math.max(1e-6, ...shown.map((a) => a.v))
                return shown.map(({ i, j, v }) => {
                  const x1 = colX(i), x2 = colX(j)
                  const h = Math.min(90, 10 + Math.abs(i - j) * 7)
                  const rel = v / top
                  return (
                    <path
                      key={`${i}-${j}`}
                      d={`M${x1},${Y.attentionBase} Q${(x1 + x2) / 2},${Y.attentionBase - 2 * h} ${x2},${Y.attentionBase}`}
                      fill="none"
                      className="stroke-accent-2"
                      strokeWidth={selected === null ? 0.6 + 2.4 * rel : 0.8 + 4.2 * rel}
                      strokeOpacity={selected === null ? 0.12 + 0.55 * rel * rel : 0.3 + 0.7 * rel}
                    >
                      <title>{`Residue ${trace.start + i + 1} → ${trace.start + j + 1}: ${(v * 100).toFixed(1)}% of its attention`}</title>
                    </path>
                  )
                })
              })()}
              {attention.m.map((row, i) => (
                <circle key={i} cx={colX(i)} cy={Y.attentionBase} r={2 + 7 * row[i] / Math.max(...attention.m.map((r, k) => r[k]), 1e-6)} className="fill-accent-2" fillOpacity={0.7}>
                  <title>{`Residue ${trace.start + i + 1} attends ${Math.round(row[i] * 100)}% to itself`}</title>
                </circle>
              ))}
            </Stage>

            <Stage id="output" active={stage}>
              <RowLabel y={Y.probs + 20} title="Probabilities" detail="helix, strand, coil" />
              {w.probabilities.map(([pH, pE, pC], i) => {
                const x = colX(i) - 9, total = 48
                return (
                  <g key={i}>
                    <rect x={x} y={Y.probs} width={18} height={pH * total} className="fill-ss-helix" />
                    <rect x={x} y={Y.probs + pH * total} width={18} height={pE * total} className="fill-ss-strand" />
                    <rect x={x} y={Y.probs + (pH + pE) * total} width={18} height={pC * total} className="fill-ss-coil" />
                    <title>{`Helix ${Math.round(pH * 100)}%, strand ${Math.round(pE * 100)}%, coil ${Math.round(pC * 100)}%`}</title>
                  </g>
                )
              })}
              <RowLabel y={Y.predicted + 4} title="Predicted" />
              <RowLabel y={Y.truth + 4} title="True" />
              {[...w.predicted].map((p, i) => {
                const ok = p === w.true[i]
                return (
                  <g key={i}>
                    <rect x={colX(i) - 14} y={Y.predicted - 8} width={28} height={12} rx={3} className={SS_FILL[p]} />
                    <rect x={colX(i) - 14} y={Y.truth - 8} width={28} height={12} rx={3} className={SS_FILL[w.true[i]]} />
                    <text x={colX(i)} y={Y.check + 4} textAnchor="middle" className={`text-[13px] font-semibold ${ok ? 'fill-success' : 'fill-danger'}`}>{ok ? '✓' : '✗'}</text>
                  </g>
                )
              })}
              <text x={0} y={Y.check + 4} className="fill-fg-muted text-[11px]">{correct} of {WINDOW} correct</text>
            </Stage>
          </svg>
        </div>
      )}

      {/* Legend, head picker, selected residue */}
      {w && attention && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3 text-sm text-fg-muted">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-accent" />positive value</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-accent-2" />negative value</span>
              <span>stronger color = larger</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {['H', 'E', 'C'].map((c) => (
                <span key={c} className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded-sm ${{ H: 'bg-ss-helix', E: 'bg-ss-strand', C: 'bg-ss-coil' }[c]}`} />{SS_NAME[c]}</span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="eyebrow mr-1">Attention</span>
              {['avg', 0, 1, 2, 3].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHead(h)}
                  className={`px-2.5 py-1 rounded-md text-xs border ${head === h ? 'bg-accent-2/15 border-accent-2 text-fg' : 'border-line hover:bg-raised'}`}
                >
                  {h === 'avg' ? 'Average' : `Head ${h + 1}`}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-raised border border-line rounded-lg p-4 text-sm" aria-live="polite">
            {selected === null ? (
              <p className="text-fg-muted">Click a residue letter to see its probabilities and only its attention arcs.</p>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="font-medium text-fg">
                  Residue {trace.start + selected + 1} · <span className="font-mono">{w.residues[selected]}</span>
                  <span className="text-fg-muted font-normal"> · true {SS_NAME[w.true[selected]].toLowerCase()}, predicted {SS_NAME[w.predicted[selected]].toLowerCase()}</span>
                </div>
                {['H', 'E', 'C'].map((c, k) => (
                  <div key={c} className="grid grid-cols-[56px_1fr_40px] items-center gap-2">
                    <span className="text-fg-muted">{SS_NAME[c]}</span>
                    <div className="h-2 rounded-full bg-sunken"><div className={`h-2 rounded-full ${{ H: 'bg-ss-helix', E: 'bg-ss-strand', C: 'bg-ss-coil' }[c]}`} style={{ width: `${w.probabilities[selected][k] * 100}%` }} /></div>
                    <span className="text-right font-medium text-fg">{Math.round(w.probabilities[selected][k] * 100)}%</span>
                  </div>
                ))}
                <p className="text-fg-muted">
                  {Math.round(attention.outside[selected] * 100)}% of its attention ({head === 'avg' ? 'average of 4 heads' : `head ${head + 1}`}) goes to residues outside this window.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
