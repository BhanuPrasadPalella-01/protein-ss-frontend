import { useState } from 'react'

export default function Predict() {
  const [sequence, setSequence] = useState('')

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
        <div className="flex justify-between items-center z-10">
          <button className="text-on-surface-variant text-[10px] font-bold uppercase flex items-center gap-2 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-sm">swap_horiz</span> Switch to Best Model
          </button>
          <button className="bg-primary-container text-on-primary-container text-[10px] font-bold uppercase px-8 py-3 rounded-lg shadow-[0_0_15px_rgba(0,219,233,0.4)] flex items-center gap-2 hover:brightness-110">
            <span className="material-symbols-outlined text-sm">play_arrow</span> Predict
          </button>
        </div>
      </section>

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
          <div className="h-full bg-surface-bright" style={{ width: '15%' }}></div>
          <div className="h-full bg-error" style={{ width: '25%' }}></div>
          <div className="h-full bg-surface-bright" style={{ width: '10%' }}></div>
          <div className="h-full bg-tertiary-container" style={{ width: '20%' }}></div>
          <div className="h-full bg-surface-bright" style={{ width: '5%' }}></div>
          <div className="h-full bg-error" style={{ width: '15%' }}></div>
          <div className="h-full bg-surface-bright" style={{ width: '10%' }}></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-panel px-4 py-3 rounded-lg text-center flex flex-col gap-1">
            <span className="text-2xl font-bold text-white">42%</span>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant">Helix</span>
          </div>
          <div className="glass-panel px-4 py-3 rounded-lg text-center flex flex-col gap-1">
            <span className="text-2xl font-bold text-white">24%</span>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant">Strand</span>
          </div>
          <div className="glass-panel px-4 py-3 rounded-lg text-center flex flex-col gap-1">
            <span className="text-2xl font-bold text-white">34%</span>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant">Coil</span>
          </div>
        </div>
      </section>
    </div>
  )
}
