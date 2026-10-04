import { useEffect, useSyncExternalStore } from 'react'
import { Backdrop } from './components/Backdrop'
import { Rail } from './components/Rail'
import { SidePanel } from './components/SidePanel'
import { Splash } from './components/Splash'
import { Stage } from './components/Stage'
import { FloatingActions, WindowActions } from './components/WindowActions'
import { useAppStore, type Panel } from './store/useAppStore'
import { useMouseIdle } from './useMouseIdle'

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
const subscribeSystemTheme = (cb: () => void) => {
  darkQuery.addEventListener('change', cb)
  return () => darkQuery.removeEventListener('change', cb)
}

const SHORTCUT_PANELS: Record<string, Exclude<Panel, null>> = { h: 'help', d: 'layout', c: 'channels' }

function useResolvedTheme(): 'light' | 'dark' {
  const pref = useAppStore((s) => s.theme)
  const systemDark = useSyncExternalStore(subscribeSystemTheme, () => darkQuery.matches)
  return pref === 'system' ? (systemDark ? 'dark' : 'light') : pref
}

export default function App() {
  const theme = useResolvedTheme()
  const fullscreen = useAppStore((s) => s.fullscreen)
  useMouseIdle()

  useEffect(() => {
    const root = document.documentElement
    const apply = () => {
      root.dataset.theme = theme
    }
    // Fondu enchaîné entre les deux thèmes (sauf au démarrage).
    if (root.dataset.theme && root.dataset.theme !== theme && document.startViewTransition) {
      document.startViewTransition(apply)
    } else {
      apply()
    }
    window.multiplex?.setTheme(theme)
  }, [theme])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey || e.repeat) return
      const { panel, closePanel, togglePanel, focusedId, focus, unfocus, selection } = useAppStore.getState()

      if (e.key === 'F11') {
        e.preventDefault()
        window.multiplex?.toggleFullscreen()
        return
      }

      if (e.key === 'Escape') {
        if (panel) closePanel()
        else if (focusedId) unfocus()
        else if (useAppStore.getState().fullscreen) window.multiplex?.toggleFullscreen()
        return
      }

      const shortcut = SHORTCUT_PANELS[e.key.toLowerCase()]
      if (shortcut) {
        e.preventDefault()
        togglePanel(shortcut)
        return
      }

      // 1…6 : affiche en grand le flux à cette position (code physique : indépendant du clavier AZERTY).
      const digit = /^(?:Digit|Numpad)([1-6])$/.exec(e.code)?.[1]
      const id = digit && selection[Number(digit) - 1]
      if (id) {
        e.preventDefault()
        if (panel) closePanel()
        if (id !== focusedId) focus(id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const { setFullscreen } = useAppStore.getState()
    window.multiplex?.isFullscreen().then(setFullscreen)
    return window.multiplex?.onFullscreenChange(setFullscreen)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.fullscreen = String(fullscreen)
  }, [fullscreen])

  // Un panneau refermé ne doit pas laisser le focus sur un de ses boutons (Espace le redéclencherait).
  const panel = useAppStore((s) => s.panel)
  useEffect(() => {
    if (!panel && document.activeElement instanceof HTMLElement) document.activeElement.blur()
  }, [panel])

  return (
    <>
      <Backdrop />
      <div className="app">
        <header className="titlebar">
          <span className="brand-dot" />
          <span className="brand">Multiplex</span>
          {!fullscreen && <WindowActions theme={theme} />}
        </header>
        {fullscreen && <FloatingActions theme={theme} />}
        <div className="workspace">
          {!fullscreen && <Rail />}
          <main className="main">
            <Stage />
            <SidePanel />
          </main>
        </div>
      </div>
      <Splash />
    </>
  )
}
