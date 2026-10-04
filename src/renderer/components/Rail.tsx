import { LayoutGrid, Tv } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export function Rail() {
  const { panel, togglePanel } = useAppStore()

  return (
    <nav className="rail" aria-label="Réglages">
      <button
        className={`rail-btn ${panel === 'channels' ? 'is-active' : ''}`}
        onClick={() => togglePanel('channels')}
        title="Chaînes (C)"
        aria-pressed={panel === 'channels'}
      >
        <Tv size={20} />
        <span>Chaînes</span>
      </button>
      <button
        className={`rail-btn ${panel === 'layout' ? 'is-active' : ''}`}
        onClick={() => togglePanel('layout')}
        title="Disposition (D)"
        aria-pressed={panel === 'layout'}
      >
        <LayoutGrid size={20} />
        <span>Disposition</span>
      </button>
    </nav>
  )
}
