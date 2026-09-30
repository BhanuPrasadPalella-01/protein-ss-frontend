import { Link, useLocation } from 'react-router-dom'

export default function Navigation() {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  const linkClass = (path) =>
    `font-label-caps text-xs tracking-widest flex items-center h-full border-b-2 transition-all px-2 ${isActive(path)
      ? 'text-primary-fixed-dim border-primary-fixed-dim'
      : 'text-on-surface-variant border-transparent hover:text-primary hover:border-primary/50'
    }`

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-surface/85 backdrop-blur-xl border-b border-white/10 glow-border-cyan h-20 flex justify-between items-center px-6 lg:px-8">

      {/* Brand */}
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary-fixed-dim text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>biotech</span>
        <span className="font-headline-md text-xl md:text-2xl font-bold tracking-tight text-primary-fixed-dim hidden sm:block">
          NEURO-PROTEIN
        </span>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center h-full gap-6">
        <Link className={linkClass('/')} to="/">OVERVIEW</Link>
        <Link className={linkClass('/predict')} to="/predict">PREDICT</Link>
        <Link className={linkClass('/compare')} to="/compare">COMPARE</Link>
        <Link className={linkClass('/explorer')} to="/explorer">EXPLORE</Link>
        <Link className={linkClass('/about')} to="/about">ABOUT</Link>
      </div>

      {/* Profile/Settings */}
      <div>
        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-low border border-white/10 hover:border-primary/50 transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors" style={{ fontVariationSettings: "'FILL' 0" }}>account_circle</span>
        </button>
      </div>
    </nav>
  )
}