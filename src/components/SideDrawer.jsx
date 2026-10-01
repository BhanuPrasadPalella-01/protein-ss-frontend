import { Link, useLocation } from 'react-router-dom'

export default function SideDrawer() {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  const items = [
    { path: '/', icon: 'dashboard', label: 'Overview' },
    { path: '/predict', icon: 'query_stats', label: 'Live Prediction' },
    { path: '/compare', icon: 'compare_arrows', label: 'Model Comparison' },
    { path: '/explorer', icon: 'database', label: 'Sample Explorer' },
    { path: '/about', icon: 'info', label: 'About' },
  ]

  return (
    <nav className="bg-surface/50 backdrop-blur-md h-[calc(100vh-5rem)] w-64 border-r border-white/10 flex-col p-6 gap-6 hidden md:flex sticky top-20 z-40">

      <div className="mb-4">
        <span className="font-headline-md text-lg font-bold text-on-surface block">Protein SS</span>
        <span className="text-[10px] text-primary-fixed-dim uppercase tracking-widest font-bold mt-1 block">BiLSTM · Q3 Prediction</span>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all border ${active
                  ? 'bg-primary-container/10 border-primary-fixed-dim/30 text-primary-fixed-dim glow-border-cyan'
                  : 'border-transparent text-on-surface-variant hover:bg-white/5 hover:text-on-surface hover:border-white/10'
                }`}
            >
              <span className={`material-symbols-outlined ${active ? 'text-primary-fixed-dim' : ''}`} style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              <span className="font-label-caps text-xs uppercase tracking-wider font-semibold">{item.label}</span>
            </Link>
          )
        })}
      </div>

      <div className="mt-auto glass-panel p-4 rounded-xl text-[10px] font-bold uppercase text-on-surface-variant tracking-widest leading-relaxed">
        Trained on CullPDB · Tested on CB513
      </div>
    </nav>
  )
}