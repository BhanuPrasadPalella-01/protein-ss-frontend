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
      <div className="flex flex-col md:flex-row min-h-screen">
        <Navigation />
        <SideDrawer />
        <main className="flex-1 mt-20 md:mt-0 md:pt-20 pb-32 md:pb-0 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <MobileBottomNav />
      </div>
    </HashRouter>
  )
}
