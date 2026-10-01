import { createContext, useContext } from 'react'

// The active theme lives in React state (in App) and is mirrored to <html data-theme="...">,
// which is what the CSS tokens in index.css key off. index.html ships data-theme="dark", so the
// default theme is correct before React loads. Nothing here touches window or storage during
// render, so it is safe to server-render.
export const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} })

export const useTheme = () => useContext(ThemeContext)

export function applyTheme(theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  // Pause CSS transitions for the switch itself, so elements with transition-colors don't
  // briefly animate from their old-theme colors.
  root.dataset.themeSwitching = ''
  root.dataset.theme = theme
  requestAnimationFrame(() => requestAnimationFrame(() => delete root.dataset.themeSwitching))
}

// Reads color tokens (e.g. 'arch-layer' -> --color-arch-layer) for code that can't use CSS
// classes, such as Three.js materials. Call it after applyTheme so it sees the current theme.
export function readColorTokens(names) {
  if (typeof document === 'undefined') return {}
  const style = getComputedStyle(document.documentElement)
  return Object.fromEntries(names.map((name) => [name, style.getPropertyValue(`--color-${name}`).trim()]))
}
