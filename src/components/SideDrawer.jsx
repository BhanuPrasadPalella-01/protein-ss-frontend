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
    <nav className="bg-surface/90 backdrop-blur-2xl h-screen w-72 border-r border-white/10 flex-col p-container-padding gap-base hidden md:flex sticky top-0 z-40">
      <div className="mb-8 mt-4">
        <span className="font-headline-md text-xl font-bold text-primary-fixed-dim block">SEQUENCER V2.1</span>
        <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">Neural Protein System</span>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              isActive(item.path)
                ? 'bg-primary-container/20 text-primary-fixed-dim shadow-[0_0_10px_rgba(0,219,233,0.2)]'
                : 'text-on-surface-variant hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-label-caps text-xs uppercase tracking-wider">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
