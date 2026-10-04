import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { CHANNELS_BY_ID } from '../data/channels'
import { computeFocusRects, computeGridRects, type Size } from '../layout/computeRects'
import { useAppStore } from '../store/useAppStore'
import { SPRING, Tile } from './Tile'

const GAP = 10
const LONG_PRESS_MS = 400

function useElementSize(ref: React.RefObject<HTMLElement | null>): Size {
  const [size, setSize] = useState<Size>({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = ref.current!
    // Mesure immédiate : le ResizeObserver ne se déclenche pas tant que la fenêtre est masquée.
    const { width, height } = el.getBoundingClientRect()
    setSize({ w: width, h: height })
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ w: width, h: height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
  return size
}

export function Stage() {
  const { layout, selection, focusedId, focus, unfocus, swapChannels, togglePanel } = useAppStore()
  const ref = useRef<HTMLDivElement>(null)
  const size = useElementSize(ref)

  // Un redimensionnement de fenêtre repositionne les tuiles sans animation.
  const lastSize = useRef(size)
  const resized = lastSize.current.w !== size.w || lastSize.current.h !== size.h
  lastSize.current = size

  // Un clic court active le focus ; l'appui long démarre le glisser-déposer.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { delay: LONG_PRESS_MS, tolerance: 6 } }))
  const suppressClick = useRef(false)

  const focusedIndex = focusedId ? selection.indexOf(focusedId) : -1
  const focusMode = focusedIndex >= 0
  const rects = focusMode
    ? computeFocusRects(selection.length, focusedIndex, size, GAP)
    : computeGridRects(layout, size, GAP)

  // Les tuiles sont rendues dans un ordre fixe (par id) : déplacer un <video> ou une
  // <iframe> dans le DOM interromprait le flux. Seule leur position change.
  const rendered = [...selection].sort()

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && over.id !== active.id) swapChannels(String(active.id), String(over.id))
    setTimeout(() => (suppressClick.current = false))
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={() => (suppressClick.current = true)}
      onDragEnd={onDragEnd}
      onDragCancel={() => setTimeout(() => (suppressClick.current = false))}
      autoScroll={false}
    >
      <div className="stage" ref={ref}>
        {size.w > 0 && (
          <AnimatePresence>
            {rendered.map((id) => {
              const index = selection.indexOf(id)
              return (
                <Tile
                  key={id}
                  channel={CHANNELS_BY_ID[id]}
                  position={index + 1}
                  rect={rects[index]}
                  focused={id === focusedId}
                  thumbnail={focusMode && id !== focusedId}
                  instant={resized}
                  onActivate={() => !suppressClick.current && id !== focusedId && focus(id)}
                  onClose={unfocus}
                />
              )
            })}

            {!focusMode &&
              rects.slice(selection.length).map((rect, i) => (
                <motion.button
                  key={`empty-${selection.length + i}`}
                  className="empty-slot"
                  initial={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, opacity: 0 }}
                  animate={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={resized ? { duration: 0 } : { default: SPRING, opacity: { duration: 0.25 } }}
                  onClick={() => togglePanel('channels')}
                >
                  <Plus size={28} />
                  <span>Ajouter une chaîne</span>
                </motion.button>
              ))}
          </AnimatePresence>
        )}
      </div>
    </DndContext>
  )
}
