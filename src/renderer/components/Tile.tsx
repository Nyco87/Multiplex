import { useDraggable, useDroppable } from '@dnd-kit/core'
import { motion, type Transition } from 'framer-motion'
import { Volume2, X } from 'lucide-react'
import type { Channel } from '../data/channels'
import type { Rect } from '../layout/computeRects'
import { StreamPlayer } from './players/StreamPlayer'

export const SPRING: Transition = { type: 'spring', stiffness: 260, damping: 32, mass: 0.9 }
const INSTANT: Transition = { duration: 0 }

interface Props {
  channel: Channel
  /** Position dans la sélection (1…6), aussi raccourci clavier. */
  position: number
  rect: Rect
  focused: boolean
  thumbnail: boolean
  instant: boolean
  onActivate: () => void
  onClose: () => void
}

export function Tile({ channel, position, rect, focused, thumbnail, instant, onActivate, onClose }: Props) {
  const drag = useDraggable({ id: channel.id })
  const drop = useDroppable({ id: channel.id })
  const delta = drag.isDragging && drag.transform ? drag.transform : { x: 0, y: 0 }

  // Pendant le glisser, la tuile suit le pointeur sans ressort ; au dépôt, elle repart en
  // ressort depuis sa position courante vers son nouvel emplacement.
  const box = { left: rect.x + delta.x, top: rect.y + delta.y, width: rect.w, height: rect.h }

  const className = [
    'tile',
    focused && 'is-focused',
    thumbnail && 'is-thumb',
    drag.isDragging && 'is-dragging',
    drop.isOver && !drag.isDragging && 'is-drop-target'
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <motion.div
      ref={drop.setNodeRef}
      className={className}
      initial={{ ...box, opacity: 0, scale: 0.94 }}
      animate={{ ...box, opacity: 1, scale: drag.isDragging ? 1.03 : 1 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
      transition={
        drag.isDragging || instant
          ? { default: INSTANT, scale: SPRING }
          : { default: SPRING, opacity: { duration: 0.25 } }
      }
      style={{ zIndex: drag.isDragging ? 30 : focused ? 10 : 1 }}
    >
      <div className="tile-media">
        <StreamPlayer channel={channel} muted={!focused} />
      </div>

      {/* Les iframes avalent les événements souris : ce calque capte clic et appui long. */}
      <div
        ref={drag.setNodeRef}
        className="tile-hit"
        {...drag.listeners}
        {...drag.attributes}
        role="button"
        aria-label={focused ? channel.name : `Afficher ${channel.name} en grand`}
        onClick={onActivate}
      />

      <div className="tile-label">
        <kbd className="tile-number">
          {position}
        </kbd>
        {channel.logo && (
          <img className={`logo-chip ${channel.logoBg === 'dark' ? 'is-dark' : ''}`} src={channel.logo} alt="" />
        )}
        <span>{channel.name}</span>
        {focused && <Volume2 size={14} aria-label="Son activé" />}
      </div>

      {focused && (
        <button
          className="tile-close"
          title="Revenir au multiplex (Échap)"
          aria-label="Revenir au multiplex"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onClose}
        >
          <X size={18} />
        </button>
      )}
    </motion.div>
  )
}
