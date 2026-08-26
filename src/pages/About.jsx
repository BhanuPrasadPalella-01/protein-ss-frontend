export default function About() {
  const stages = [
    { icon: 'database', title: 'Dataset', desc: 'CullPDB / CB513' },
    { icon: 'cleaning_services', title: 'Preprocess', desc: 'Normalization' },
    { icon: 'memory', title: 'BiLSTM', desc: 'Seq Modeling' },
    { icon: 'visibility', title: 'Attention', desc: 'Global Context' },
    { icon: 'analytics', title: 'Result', desc: '80.1% Q3' },
  ]

  const team = [
    { name: 'Bhanu Prasad Palella', id: 'CB.AI.U4CPS25034' },
    { name: 'Gullanki Bhagya Lakshmi', id: 'CB.AI.U4CPS25018' },
    { name: 'Pavna Preethikha', id: 'CB.AI.U4CPS25024' },
    { name: 'Madhumitha S', id: 'CB.AI.U4CPS25026' },
  ]

  return (
    <div className="flex-1 p-gutter md:p-container-padding flex flex-col gap-12">
      <section className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-headline-md text-primary mb-4 font-bold">Methodology & Research</h1>
        <p className="text-on-surface-variant max-w-2xl mx-auto">Project breakdown of the Neuro-Protein Alpha AI sequencing system.</p>
      </section>

      <div className="glass-panel p-8 rounded-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-12 border-b border-white/10 pb-4">
          <span className="material-symbols-outlined text-primary-fixed-dim">account_tree</span>
          <h2 className="text-2xl font-bold">Architecture Pipeline</h2>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {stages.map((stage, idx) => (
            <div key={idx} className="flex-1 timeline-connector flex flex-col items-center text-center px-4 relative">
              <div className="w-12 h-12 rounded-full bg-surface-container-highest border border-primary-fixed-dim/30 flex items-center justify-center mb-4 z-10">
                <span className="material-symbols-outlined text-primary-fixed-dim text-xl">{stage.icon}</span>
              </div>
              <h3 className="text-xs font-bold uppercase mb-1">{stage.title}</h3>
              <p className="text-[10px] text-on-surface-variant uppercase">{stage.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {team.map((member) => (
          <div key={member.name} className="glass-panel p-6 rounded-xl flex flex-col items-center text-center hover:bg-white/5 transition-all">
            <div className="w-20 h-20 rounded-full bg-surface-container-highest border border-white/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">person</span>
            </div>
            <h4 className="font-bold">{member.name}</h4>
            <p className="text-[10px] uppercase tracking-widest text-primary-fixed-dim mt-2">{member.id}</p>
          </div>
        ))}
      </div>

      <footer className="mt-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 text-xs">
        <p>Dataset Citation: Wang, G., & Dunbrack, R. L. (2003). PISCES Server. Bioinformatics, 19(12).</p>
        <div className="flex gap-4">
          <span>PyTorch</span><span>NumPy</span><span>FastAPI</span><span>scikit-learn</span>
        </div>
      </footer>
    </div>
  )
}
