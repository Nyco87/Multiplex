export type LayoutId = '2h' | '2v' | '3top2' | '3top1' | '4grid' | '6grid'

export interface LayoutDef {
  id: LayoutId
  label: string
  /** Nombre de tuiles par rangée, de haut en bas. */
  rows: number[]
}

export const LAYOUTS: LayoutDef[] = [
  { id: '2h', label: '2 côte à côte', rows: [2] },
  { id: '2v', label: '2 l’un sur l’autre', rows: [1, 1] },
  { id: '3top2', label: '2 en haut, 1 en bas', rows: [2, 1] },
  { id: '3top1', label: '1 en haut, 2 en bas', rows: [1, 2] },
  { id: '4grid', label: '4 en grille', rows: [2, 2] },
  { id: '6grid', label: '6 en grille', rows: [3, 3] }
]

export const LAYOUTS_BY_ID = Object.fromEntries(LAYOUTS.map((l) => [l.id, l])) as Record<LayoutId, LayoutDef>

export function capacityOf(layout: LayoutId): number {
  return LAYOUTS_BY_ID[layout].rows.reduce((a, b) => a + b, 0)
}
