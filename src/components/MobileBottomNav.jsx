import { Link } from 'react-router-dom'

const linkClass = 'flex flex-col items-center text-fg-muted hover:text-fg transition-colors'

export default function MobileBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-surface/95 backdrop-blur-md border-t border-line flex justify-around px-4 py-3 z-50">
      <Link to="/" className={linkClass}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
        <span className="text-xs mt-1">Home</span>
      </Link>
      <Link to="/predict" className={linkClass}>
        <span className="material-symbols-outlined">query_stats</span>
        <span className="text-xs mt-1">Predict</span>
      </Link>
      <Link to="/explorer" className={linkClass}>
        <span className="material-symbols-outlined">database</span>
        <span className="text-xs mt-1">Explore</span>
      </Link>
      <Link to="/architecture" className={linkClass}>
        <span className="material-symbols-outlined">view_in_ar</span>
        <span className="text-xs mt-1">Model</span>
      </Link>
    </nav>
  )
}
