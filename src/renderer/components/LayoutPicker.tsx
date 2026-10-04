import { computeGridRects } from '../layout/computeRects'
import { capacityOf, LAYOUTS } from '../layout/layouts'
import { useAppStore } from '../store/useAppStore'
import { useArrowNav } from './useArrowNav'

const PREVIEW = { w: 120, h: 68 }

export function LayoutPicker() {
  const { layout, selection, setLayout } = useAppStore()
  const nav = useArrowNav<HTMLDivElement>(2)

  return (
    <div className="layout-grid" ref={nav.ref} onKeyDown={nav.onKeyDown}>
      {LAYOUTS.map((l) => {
        const capacity = capacityOf(l.id)
        const dropped = selection.length - capacity
        return (
          <button
            key={l.id}
            data-nav
            className={`layout-option ${layout === l.id ? 'is-active' : ''}`}
            onClick={() => setLayout(l.id)}
            aria-pressed={layout === l.id}
            aria-label={l.label}
            title={dropped > 0 ? `Les ${dropped} dernière(s) chaîne(s) seront retirées` : undefined}
          >
            <div className="layout-preview" style={{ width: PREVIEW.w, height: PREVIEW.h }}>
              {computeGridRects(l.id, PREVIEW, 4).map((r, i) => (
                <span key={i} style={{ left: r.x, top: r.y, width: r.w, height: r.h }} />
              ))}
            </div>
          </button>
        )
      })}
    </div>
  )
}
