import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

export default function Navigation() {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  const linkClass = (path) =>
    `text-sm font-medium flex items-center h-full border-b-2 transition-colors px-1 ${isActive(path)
      ? 'text-fg border-accent'
      : 'text-fg-muted border-transparent hover:text-fg'
    }`

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-md border-b border-line h-16 flex justify-between items-center px-6 lg:px-8">

      {/* Brand */}
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-accent text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>biotech</span>
        <span className="text-base font-semibold tracking-tight text-fg hidden sm:block">
          NEURO-PROTEIN
        </span>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center h-full gap-6">
        <Link className={linkClass('/')} to="/">Overview</Link>
        <Link className={linkClass('/predict')} to="/predict">Predict</Link>
        <Link className={linkClass('/compare')} to="/compare">Compare</Link>
        <Link className={linkClass('/explorer')} to="/explorer">Explore</Link>
        <Link className={linkClass('/architecture')} to="/architecture">Architecture</Link>
        <Link className={linkClass('/about')} to="/about">About</Link>
      </div>

      <ThemeToggle />
    </nav>
  )
}
