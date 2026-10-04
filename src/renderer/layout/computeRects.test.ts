import { describe, expect, it } from 'vitest'
import { computeFocusRects, computeGridRects, type Rect } from './computeRects'
import { LAYOUTS, capacityOf } from './layouts'

const AREA = { w: 1600, h: 900 }
const GAP = 8
const EPS = 0.01

const overlaps = (a: Rect, b: Rect) =>
  a.x < b.x + b.w - EPS && b.x < a.x + a.w - EPS && a.y < b.y + b.h - EPS && b.y < a.y + a.h - EPS
const inside = (r: Rect) => r.x >= -EPS && r.y >= -EPS && r.x + r.w <= AREA.w + EPS && r.y + r.h <= AREA.h + EPS

function assertValid(rects: Rect[]) {
  for (const r of rects) {
    expect(r.w / r.h).toBeCloseTo(16 / 9, 5)
    expect(inside(r)).toBe(true)
  }
  rects.forEach((a, i) => rects.slice(i + 1).forEach((b) => expect(overlaps(a, b)).toBe(false)))
}

describe('computeGridRects', () => {
  for (const layout of LAYOUTS) {
    it(`${layout.id} : ${capacityOf(layout.id)} tuiles 16/9 sans chevauchement`, () => {
      const rects = computeGridRects(layout.id, AREA, GAP)
      expect(rects).toHaveLength(capacityOf(layout.id))
      assertValid(rects)
      rects.forEach((r) => expect(r.w).toBeCloseTo(rects[0].w))
    })
  }

  it('centre la tuile seule des layouts à 3', () => {
    const [, , bottom] = computeGridRects('3top2', AREA, GAP)
    expect(bottom.x + bottom.w / 2).toBeCloseTo(AREA.w / 2)
    const [top] = computeGridRects('3top1', AREA, GAP)
    expect(top.x + top.w / 2).toBeCloseTo(AREA.w / 2)
  })

  it('2 côte à côte occupe toute la largeur disponible', () => {
    const [a, b] = computeGridRects('2h', AREA, GAP)
    expect(a.w + b.w + GAP).toBeCloseTo(AREA.w)
    expect(a.y).toBeCloseTo(b.y)
  })
})

describe('computeFocusRects', () => {
  for (const count of [1, 2, 3, 4, 5, 6]) {
    it(`${count} flux : grand à droite, miniatures à gauche`, () => {
      const focused = count - 1
      const rects = computeFocusRects(count, focused, AREA, GAP)
      expect(rects).toHaveLength(count)
      assertValid(rects)
      const main = rects[focused]
      rects.forEach((r, i) => {
        if (i === focused) return
        expect(r.w).toBeLessThan(main.w)
        expect(r.x + r.w).toBeLessThanOrEqual(main.x)
      })
    })
  }

  it('empile les miniatures dans l’ordre de la sélection', () => {
    const rects = computeFocusRects(4, 1, AREA, GAP)
    expect(rects[0].y).toBeLessThan(rects[2].y)
    expect(rects[2].y).toBeLessThan(rects[3].y)
  })
})
