import { HashRouter, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import SideDrawer from './components/SideDrawer'
import MobileBottomNav from './components/MobileBottomNav'
import Overview from './pages/Overview'
import Predict from './pages/Predict'
import Compare from './pages/Compare'
import Explorer from './pages/Explorer'
import About from './pages/About'

export default function App() {
  return (
    <HashRouter>
      {/* 
        Changed to flex-col overall. 
        Navigation stays on top, the content area splits underneath.
      */}
      <div className="flex flex-col min-h-screen bg-background">
        <Navigation />

        {/* pt-20 pushes the content down exactly the height of the fixed navbar */}
        <div className="flex flex-1 pt-20">
          <SideDrawer />

          <main className="flex-1 overflow-x-hidden pb-20 md:pb-0 relative bio-bg-pattern">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/predict" element={<Predict />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/explorer" element={<Explorer />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
        </div>

        <MobileBottomNav />
      </div>
    </HashRouter>
  )
}