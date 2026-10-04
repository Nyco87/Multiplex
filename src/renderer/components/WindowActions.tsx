import { LayoutGrid, Maximize2, Minimize2, Moon, Sun, Tv } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

interface Props {
  theme: 'light' | 'dark'
}

/** Boutons thème et plein écran : dans la barre de titre, ou flottants en plein écran. */
export function WindowActions({ theme }: Props) {
  const setTheme = useAppStore((s) => s.setTheme)
  const fullscreen = useAppStore((s) => s.fullscreen)
  const themeLabel = theme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'
  const fullscreenLabel = fullscreen ? 'Quitter le plein écran (F11)' : 'Plein écran (F11)'

  return (
    <div className="window-actions">
      <button
        className="titlebar-btn"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        title={themeLabel}
        aria-label={themeLabel}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <button
        className="titlebar-btn"
        onClick={() => window.multiplex?.toggleFullscreen()}
        title={fullscreenLabel}
        aria-label={fullscreenLabel}
      >
        {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>
    </div>
  )
}

/**
 * Plein écran : la barre (panneaux, thème, sortie) apparaît en haut à droite quand la souris
 * bouge, puis s'efface avec le curseur après un moment d'inactivité (voir useMouseIdle).
 */
export function FloatingActions({ theme }: Props) {
  const panel = useAppStore((s) => s.panel)
  const togglePanel = useAppStore((s) => s.togglePanel)


  return (
    <div className="floating-actions">
      <div className="window-actions">
        <button
          className={`titlebar-btn ${panel === 'channels' ? 'is-active' : ''}`}
          onClick={() => togglePanel('channels')}
          title="Chaînes (C)"
          aria-label="Chaînes"
          aria-pressed={panel === 'channels'}
        >
          <Tv size={16} />
        </button>
        <button
          className={`titlebar-btn ${panel === 'layout' ? 'is-active' : ''}`}
          onClick={() => togglePanel('layout')}
          title="Disposition (D)"
          aria-label="Disposition"
          aria-pressed={panel === 'layout'}
        >
          <LayoutGrid size={16} />
        </button>
      </div>
      <span className="floating-separator" />
      <WindowActions theme={theme} />
    </div>
  )
}
