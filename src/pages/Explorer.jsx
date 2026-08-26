export default function Explorer() {
  const sampleIds = ['1A0A_A', '1A1X_A', '1A3A_A', '1A4Y_B', '1A5E_A', '1A6G_C']

  return (
    <div className="flex-1 p-gutter md:p-container-padding flex flex-col gap-6">
      <header className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h2 className="text-3xl font-bold">CB513 Explorer</h2>
          <p className="text-on-surface-variant text-sm">Analyze structural predictions against benchmark datasets.</p>
        </div>
        <div className="bg-surface-variant text-[10px] font-bold uppercase px-3 py-1 rounded">513 samples available</div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 h-full flex-1">
        <div className="hidden lg:flex flex-col w-72 glass-panel-real-border p-4 h-[calc(100vh-200px)] overflow-hidden">
          <div className="relative mb-4">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input className="w-full bg-black/30 border-b border-white/20 pl-9 pr-3 py-2 text-sm text-white focus:outline-none" placeholder="Search ID..." />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {sampleIds.map((id, i) => (
              <div key={id} className={`p-3 rounded-md cursor-pointer transition-all border-l-2 ${i === 0 ? 'bg-primary-container/10 border-primary-fixed-dim' : 'border-transparent hover:bg-white/5'}`}>
                <div className="text-sm font-bold">{id}</div>
                <div className="text-[10px] text-on-surface-variant uppercase">Length: {100 + i * 15}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          <div className="glass-panel-real-border p-6 flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-bold tracking-tight">1A0A_A</h2>
              <p className="text-on-surface-variant text-sm">Hemoglobin subunit alpha • Homo sapiens</p>
            </div>
            <div className="bg-tertiary-container/10 border border-tertiary-container/30 px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary-container text-sm">verified</span>
              <span className="text-[10px] font-bold uppercase text-tertiary-container">Benchmark Validated</span>
            </div>
          </div>

          <div className="glass-panel-real-border p-6 flex flex-col gap-8">
            <div className="flex justify-between items-end">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary-fixed-dim">Structural Alignment</h3>
              <div className="flex gap-4 text-[10px] font-bold uppercase">
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-error"></div> Helix</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-yellow-500"></div> Strand</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-slate-500"></div> Coil</div>
              </div>
            </div>

            <div className="bg-black/30 p-6 rounded-xl overflow-x-auto">
              <div className="flex items-center mb-4">
                <div className="w-16 text-[10px] font-bold text-on-surface-variant uppercase">Ground T.</div>
                <div className="flex flex-nowrap gap-[1px]">
                  {[...Array(40)].map((_, i) => (
                    <div key={i} className={`w-3 h-5 rounded-sm ${i % 7 < 4 ? 'bg-error' : (i % 5 === 0 ? 'bg-yellow-500' : 'bg-slate-500')}`}></div>
                  ))}
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-16 text-[10px] font-bold text-primary-fixed-dim uppercase">Predict.</div>
                <div className="flex flex-nowrap gap-[1px]">
                  {[...Array(40)].map((_, i) => (
                    <div key={i} className={`w-3 h-5 rounded-sm ${i === 8 ? 'bg-error border border-white' : (i % 7 < 4 ? 'bg-error' : (i % 5 === 0 ? 'bg-yellow-500' : 'bg-slate-500'))}`}></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 mt-auto">
              <div className="flex items-center gap-4 glass-panel p-4 rounded-xl">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full rotate-[-90deg]">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="175" strokeDashoffset="12" className="text-tertiary-container" />
                  </svg>
                  <span className="absolute text-sm font-bold">93%</span>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-on-surface-variant">Q3 Accuracy</div>
                  <div className="text-sm font-bold">Excellent Match</div>
                </div>
              </div>
              <div className="glass-panel p-4 rounded-xl min-w-[120px]">
                <div className="text-[10px] font-bold uppercase text-on-surface-variant">SOV Score</div>
                <div className="text-xl font-bold">89.4%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
