import { LAYOUTS_BY_ID, type LayoutId } from './layouts'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface Size {
  w: number
  h: number
}

const RATIO = 16 / 9

/** Position de chaque emplacement du layout : tuiles 16/9 de même taille, rangées centrées. */
export function computeGridRects(layout: LayoutId, area: Size, gap: number): Rect[] {
  const rows = LAYOUTS_BY_ID[layout].rows
  const cols = Math.max(...rows)
  const w = Math.max(
    0,
    Math.min((area.w - gap * (cols - 1)) / cols, ((area.h - gap * (rows.length - 1)) / rows.length) * RATIO)
  )
  const h = w / RATIO
  const blockH = rows.length * h + (rows.length - 1) * gap
  const top = (area.h - blockH) / 2

  return rows.flatMap((count, r) => {
    const rowW = count * w + (count - 1) * gap
    const left = (area.w - rowW) / 2
    return Array.from({ length: count }, (_, c) => ({ x: left + c * (w + gap), y: top + r * (h + gap), w, h }))
  })
}

/** Plus grand rectangle 16/9 centré dans la zone donnée. */
function fit(x: number, y: number, w: number, h: number): Rect {
  const fw = Math.max(0, Math.min(w, h * RATIO))
  const fh = fw / RATIO
  return { x: x + (w - fw) / 2, y: y + (h - fh) / 2, w: fw, h: fh }
}

export const THUMB_COLUMN_RATIO = 0.2

/**
 * Mode focus : le flux `focusedIndex` occupe la droite, les autres sont empilés
 * en miniatures dans une colonne à gauche (dans l'ordre de la sélection).
 */
export function computeFocusRects(count: number, focusedIndex: number, area: Size, gap: number): Rect[] {
  const thumbs = count - 1
  if (thumbs <= 0) return [fit(0, 0, area.w, area.h)]

  const colW = Math.min(area.w * THUMB_COLUMN_RATIO, ((area.h - gap * (thumbs - 1)) / thumbs) * RATIO)
  const thumbH = colW / RATIO
  const stackH = thumbs * thumbH + (thumbs - 1) * gap
  const top = (area.h - stackH) / 2

  const main = fit(colW + gap, 0, area.w - colW - gap, area.h)
  let t = 0
  return Array.from({ length: count }, (_, i) => {
    if (i === focusedIndex) return main
    const rect = { x: 0, y: top + t * (thumbH + gap), w: colW, h: thumbH }
    t++
    return rect
  })
}
