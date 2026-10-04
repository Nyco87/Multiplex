// Règles de sélection, sans dépendance à React ni au store : faciles à tester.

/** Passer à un layout plus petit conserve les N premières chaînes. */
export function fitToCapacity(selection: string[], capacity: number): string[] {
  return selection.slice(0, capacity)
}

/** Coche ou décoche une chaîne ; une chaîne ajoutée va à la fin, jamais au-delà de la capacité. */
export function toggleChannel(selection: string[], id: string, capacity: number): string[] {
  if (selection.includes(id)) return selection.filter((s) => s !== id)
  if (selection.length >= capacity) return selection
  return [...selection, id]
}

export function swap(selection: string[], a: string, b: string): string[] {
  const i = selection.indexOf(a)
  const j = selection.indexOf(b)
  if (i < 0 || j < 0 || i === j) return selection
  const next = [...selection]
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}
