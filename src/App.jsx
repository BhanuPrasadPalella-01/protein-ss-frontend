import { useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { ThemeContext, applyTheme } from './theme'
import Navigation from './components/Navigation'
import SideDrawer from './components/SideDrawer'
import MobileBottomNav from './components/MobileBottomNav'
import Overview from './pages/Overview'
import Predict from './pages/Predict'
import Compare from './pages/Compare'
import Explorer from './pages/Explorer'
import Architecture from './pages/Architecture'
import About from './pages/About'

export default function App() {
  // Dark by default (index.html ships data-theme="dark"). The choice lasts for the session, across pages.
  const [theme, setTheme] = useState('dark')
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    // Applied before the re-render so anything reading the CSS tokens during it (the 3D scene) sees the new theme.
    applyTheme(next)
    setTheme(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <HashRouter>
        {/* Navigation stays on top; the content area splits underneath. */}
        <div className="flex flex-col min-h-screen bg-canvas text-fg">
          <Navigation />

          {/* pt-16 pushes the content down exactly the height of the fixed navbar */}
          <div className="flex flex-1 pt-16">
            <SideDrawer />

            <main className="flex-1 overflow-x-hidden pb-20 md:pb-0 relative">
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/predict" element={<Predict />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/explorer" element={<Explorer />} />
                <Route path="/architecture" element={<Architecture />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </main>
          </div>

          <MobileBottomNav />
        </div>
      </HashRouter>
    </ThemeContext.Provider>
  )
}
