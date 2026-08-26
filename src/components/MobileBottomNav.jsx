import { Link } from 'react-router-dom'

export default function MobileBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-surface/90 backdrop-blur-xl border-t border-white/10 flex justify-around p-4 z-50">
      <Link to="/" className="flex flex-col items-center text-on-surface-variant hover:text-primary">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
        <span className="text-[10px] font-label-caps mt-1">Home</span>
      </Link>
      <Link to="/predict" className="flex flex-col items-center text-on-surface-variant hover:text-primary">
        <span className="material-symbols-outlined">query_stats</span>
        <span className="text-[10px] font-label-caps mt-1">Predict</span>
      </Link>
      <Link to="/explorer" className="flex flex-col items-center text-on-surface-variant hover:text-primary">
        <span className="material-symbols-outlined">database</span>
        <span className="text-[10px] font-label-caps mt-1">Explore</span>
      </Link>
    </nav>
  )
}
