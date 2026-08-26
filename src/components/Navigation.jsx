import { Link, useLocation } from 'react-router-dom'

export default function Navigation() {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  const linkClass = (path) =>
    `font-label-caps text-xs ${
      isActive(path)
        ? 'text-primary-fixed-dim border-b-2 border-primary-fixed-dim'
        : 'text-on-surface-variant hover:text-primary'
    } pb-2 transition-all`

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-white/10 shadow-[0_0_15px_rgba(0,219,233,0.1)] h-20 flex justify-between items-center px-gutter">
      <div className="flex items-center gap-base">
        <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>biotech</span>
        <span className="font-headline-md text-xl md:text-2xl font-bold tracking-tighter text-primary-fixed-dim hidden sm:block">NEURO-PROTEIN ALPHA</span>
      </div>
      <div className="hidden md:flex items-center gap-container-padding">
        <Link className={linkClass('/')} to="/">OVERVIEW</Link>
        <Link className={linkClass('/predict')} to="/predict">LIVE PREDICTION</Link>
        <Link className={linkClass('/compare')} to="/compare">MODEL COMPARISON</Link>
        <Link className={linkClass('/explorer')} to="/explorer">SAMPLE EXPLORER</Link>
        <Link className={linkClass('/about')} to="/about">ABOUT</Link>
      </div>
      <div>
        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors" style={{ fontVariationSettings: "'FILL' 0" }}>account_circle</span>
      </div>
    </nav>
  )
}
