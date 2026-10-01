import { Link, useLocation } from 'react-router-dom'

export default function SideDrawer() {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  const items = [
    { path: '/', icon: 'dashboard', label: 'Overview' },
    { path: '/predict', icon: 'query_stats', label: 'Live Prediction' },
    { path: '/compare', icon: 'compare_arrows', label: 'Model Comparison' },
    { path: '/explorer', icon: 'database', label: 'Sample Explorer' },
    { path: '/architecture', icon: 'view_in_ar', label: 'Architecture' },
    { path: '/about', icon: 'info', label: 'About' },
  ]

  return (
    <nav className="bg-surface h-[calc(100vh-4rem)] w-60 border-r border-line flex-col px-4 py-6 gap-6 hidden md:flex sticky top-16 z-40">

      <div className="px-3">
        <span className="text-sm font-semibold text-fg block">Protein SS</span>
        <span className="text-xs text-fg-muted mt-0.5 block">BiLSTM · Q3 prediction</span>
      </div>

      <div className="flex flex-col gap-1">
        {items.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active
                  ? 'bg-raised text-fg'
                  : 'text-fg-muted hover:bg-raised hover:text-fg'
                }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${active ? 'text-accent' : ''}`} style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </div>

      <div className="mt-auto px-3 text-xs text-fg-muted leading-relaxed">
        Trained on CullPDB · Tested on CB513
      </div>
    </nav>
  )
}
