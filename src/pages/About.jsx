import React from 'react'

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
    <div className="flex-1 p-gutter md:p-container-padding flex flex-col gap-10 max-w-6xl">
      <section className="text-center pt-6">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-fg mb-3">Methodology & research</h1>
        <p className="text-fg-muted max-w-2xl mx-auto">How the protein secondary structure prediction pipeline was built and evaluated.</p>
      </section>

      <div className="panel p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8 border-b border-line pb-4">
          <span className="material-symbols-outlined text-accent">account_tree</span>
          <h2 className="text-xl font-semibold text-fg">Architecture pipeline</h2>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 md:gap-0">
          {stages.map((stage, idx) => (
            <React.Fragment key={idx}>
              <div className="flex-1 flex flex-col items-center text-center px-4">
                <div className="w-12 h-12 rounded-full bg-raised border border-line flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-accent text-xl">{stage.icon}</span>
                </div>
                <h3 className="text-sm font-medium text-fg mb-0.5">{stage.title}</h3>
                <p className="text-sm text-fg-muted">{stage.desc}</p>
              </div>
              {idx < stages.length - 1 && (
                <div className="w-px h-8 md:h-px md:w-8 bg-line mx-auto my-2 md:my-0 shrink-0 md:-mt-8"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-panel-gap">
        {team.map((member) => (
          <div key={member.name} className="panel p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-raised border border-line flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-fg-muted">person</span>
            </div>
            <h4 className="font-medium text-fg">{member.name}</h4>
            <p className="text-xs font-mono text-fg-muted mt-1">{member.id}</p>
          </div>
        ))}
      </div>

      <footer className="mt-auto border-t border-line pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-fg-muted">
        <p>Dataset citation: Wang, G., & Dunbrack, R. L. (2003). PISCES Server. Bioinformatics, 19(12).</p>
        <div className="flex gap-4">
          <span>PyTorch</span><span>NumPy</span><span>FastAPI</span><span>scikit-learn</span>
        </div>
      </footer>
    </div>
  )
}
