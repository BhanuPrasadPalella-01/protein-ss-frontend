import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

// Tracks the OS "reduce motion" setting, including changes while the page is open.
export default function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia(QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const onChange = (e) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}
