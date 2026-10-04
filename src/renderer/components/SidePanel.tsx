import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { ChannelPicker } from './ChannelPicker'
import { HelpPanel } from './HelpPanel'
import { InfoPanel } from './InfoPanel'
import { LayoutPicker } from './LayoutPicker'

const TITLES = { layout: 'Disposition', channels: 'Chaînes', help: 'Raccourcis clavier', info: 'Information' } as const
const CONTENT = { layout: LayoutPicker, channels: ChannelPicker, help: HelpPanel, info: InfoPanel }

export function SidePanel() {
  const { panel, closePanel } = useAppStore()
  const Content = panel ? CONTENT[panel] : null

  return (
    <AnimatePresence>
      {panel && (
        <>
          <motion.div
            key="backdrop"
            className="panel-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closePanel}
          />
          <motion.aside
            key="panel"
            className="panel"
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          >
            <header className="panel-header">
              <h2>{TITLES[panel]}</h2>
              <button className="icon-btn" onClick={closePanel} aria-label="Fermer le panneau" title="Fermer (Échap)">
                <X size={18} />
              </button>
            </header>
            {/* key : chaque panneau repart de zéro (focus initial, défilement). */}
            <div className="panel-body">{Content && <Content key={panel} />}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
