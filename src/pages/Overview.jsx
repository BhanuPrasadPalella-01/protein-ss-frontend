import { useNavigate } from 'react-router-dom'

export default function Overview() {
  const navigate = useNavigate()
  return (
    <div className="bio-bg-pattern dna-bg min-h-screen pt-28 pb-20 px-gutter">
      <header className="text-center mb-16 relative">
        <div className="absolute inset-0 -z-10 flex justify-center items-center opacity-20 blur-3xl">
          <div className="w-64 h-64 bg-primary-fixed-dim rounded-full"></div>
          <div className="w-64 h-64 bg-secondary-fixed-dim rounded-full -ml-16"></div>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline-md text-on-surface mb-base tracking-tight font-bold">
          Protein Secondary Structure Prediction
        </h1>
        <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto font-body-md">
          Deep Learning Pipeline — Baseline to Attention-Augmented BiLSTM
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-panel-gap mb-16 max-w-7xl mx-auto">
        <div className="glass-panel rounded-xl p-6 flex flex-col items-center text-center hover:glow-border-cyan transition-all">
          <span className="material-symbols-outlined text-outline-variant text-4xl mb-4">analytics</span>
          <h3 className="text-xl font-bold mb-2">Baseline</h3>
          <div className="text-4xl font-bold text-outline mb-2">68.73%</div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-outline">Q3 ACCURACY</p>
        </div>
        <div className="glass-panel rounded-xl p-6 flex flex-col items-center text-center hover:glow-border-cyan transition-all border-primary-fixed-dim/30">
          <span className="material-symbols-outlined text-primary-fixed-dim text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>science</span>
          <h3 className="text-xl font-bold mb-2">+ PSSM Profile</h3>
          <div className="text-4xl font-bold text-primary-fixed-dim mb-2">79.30%</div>
          <div className="bg-tertiary-fixed-dim/10 border border-tertiary-fixed-dim/30 text-tertiary-fixed-dim text-[10px] px-3 py-1 rounded-full">+10.57 pts</div>
        </div>
        <div className="glass-panel rounded-xl p-6 flex flex-col items-center text-center hover:glow-border-violet transition-all border-secondary/30">
          <span className="material-symbols-outlined text-secondary text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>neurology</span>
          <h3 className="text-xl font-bold mb-2">+ Self-Attention</h3>
          <div className="text-4xl font-bold text-secondary mb-2">80.09%</div>
          <div className="bg-tertiary-fixed-dim/10 border border-tertiary-fixed-dim/30 text-tertiary-fixed-dim text-[10px] px-3 py-1 rounded-full">+0.79 pts</div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Pipeline Architecture</h2>
        <div className="relative glass-panel rounded-xl p-8 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0">
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-[2px] bg-outline-variant -translate-y-1/2 z-0 opacity-30"></div>
          <div className="flex flex-col items-center text-center relative z-10 w-full md:w-1/3">
            <div className="w-16 h-16 rounded-full bg-surface-container-highest border border-outline flex items-center justify-center mb-4"><span className="material-symbols-outlined text-outline">dataset</span></div>
            <h4 className="text-[10px] font-bold uppercase mb-1">CULLPDB DATASET</h4>
            <p className="text-[10px] text-outline">Sequence Input (One-Hot)</p>
          </div>
          <div className="flex flex-col items-center text-center relative z-10 w-full md:w-1/3">
            <div className="w-16 h-16 rounded-full bg-surface-container border border-primary-fixed-dim shadow-[0_0_15px_rgba(0,219,233,0.3)] flex items-center justify-center mb-4"><span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>schema</span></div>
            <h4 className="text-[10px] font-bold uppercase mb-1">BiLSTM NETWORK</h4>
            <p className="text-[10px] text-outline">Contextual Extraction</p>
          </div>
          <div className="flex flex-col items-center text-center relative z-10 w-full md:w-1/3">
            <div className="w-16 h-16 rounded-full bg-surface-container border border-secondary shadow-[0_0_15px_rgba(228,181,255,0.3)] flex items-center justify-center mb-4"><span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>memory</span></div>
            <h4 className="text-[10px] font-bold uppercase mb-1">ATTENTION</h4>
            <p className="text-[10px] text-outline">Global Focus</p>
          </div>
        </div>
      </section>

      <div className="flex justify-center">
        <button onClick={() => navigate('/predict')} className="bg-primary-container text-on-primary-container font-bold px-8 py-4 rounded-lg flex items-center gap-2 hover:brightness-110 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all">
          Try Live Prediction <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  )
}
