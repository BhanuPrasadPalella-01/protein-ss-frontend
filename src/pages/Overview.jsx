import { useNavigate } from 'react-router-dom'

const results = [
  { icon: 'analytics', title: 'Baseline', value: '68.73%', note: 'Q3 accuracy', valueClass: 'text-fg' },
  { icon: 'science', title: '+ PSSM profile', value: '79.30%', note: '+10.57 pts', valueClass: 'text-accent' },
  { icon: 'neurology', title: '+ Self-attention', value: '80.09%', note: '+0.79 pts', valueClass: 'text-accent-2' },
]

const pipeline = [
  { icon: 'dataset', title: 'CullPDB dataset', desc: 'Sequence + PSSM input' },
  { icon: 'schema', title: 'BiLSTM network', desc: 'Contextual extraction' },
  { icon: 'memory', title: 'Attention', desc: 'Global focus' },
]

export default function Overview() {
  const navigate = useNavigate()
  return (
    <div className="pt-16 pb-20 px-gutter md:px-container-padding">
      <header className="text-center mb-14 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-fg mb-4">
          Protein Secondary Structure Prediction
        </h1>
        <p className="text-lg text-fg-muted">
          Deep learning pipeline, from a baseline to an attention-augmented BiLSTM
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-panel-gap mb-14 max-w-5xl mx-auto">
        {results.map((r) => (
          <div key={r.title} className="panel p-6 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-fg-muted text-3xl mb-3">{r.icon}</span>
            <h3 className="text-base font-medium text-fg mb-2">{r.title}</h3>
            <div className={`text-4xl font-semibold tracking-tight mb-2 ${r.valueClass}`}>{r.value}</div>
            <p className="eyebrow">{r.note}</p>
          </div>
        ))}
      </section>

      <section className="max-w-5xl mx-auto mb-14">
        <h2 className="text-xl font-semibold text-center mb-6">Pipeline architecture</h2>
        <div className="panel p-8 flex flex-col md:flex-row justify-between items-center">
          {pipeline.map((step, i) => (
            <div key={step.title} className="contents">
              {i > 0 && <div className="w-px h-10 md:h-px md:w-16 bg-line mx-auto my-4 md:my-0 md:-mt-10 shrink-0"></div>}
              <div className="flex flex-col items-center text-center w-full md:w-1/3">
                <div className="w-14 h-14 rounded-full bg-raised border border-line flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-accent">{step.icon}</span>
                </div>
                <h4 className="text-sm font-medium text-fg mb-0.5">{step.title}</h4>
                <p className="text-sm text-fg-muted">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-center">
        <button onClick={() => navigate('/predict')} className="bg-accent text-accent-fg font-medium px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
          Try live prediction <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </div>
    </div>
  )
}
