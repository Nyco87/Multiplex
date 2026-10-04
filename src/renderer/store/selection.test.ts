import { describe, expect, it } from 'vitest'
import { fitToCapacity, swap, toggleChannel } from './selection'

describe('toggleChannel', () => {
  it('ajoute à la fin', () => {
    expect(toggleChannel(['a', 'b'], 'c', 4)).toEqual(['a', 'b', 'c'])
  })

  it('retire une chaîne déjà sélectionnée', () => {
    expect(toggleChannel(['a', 'b', 'c'], 'b', 4)).toEqual(['a', 'c'])
  })

  it('refuse de dépasser la capacité du layout', () => {
    const full = ['a', 'b']
    expect(toggleChannel(full, 'c', 2)).toBe(full)
  })
})

describe('fitToCapacity', () => {
  it('garde les N premières chaînes', () => {
    expect(fitToCapacity(['a', 'b', 'c', 'd'], 2)).toEqual(['a', 'b'])
  })

  it('ne touche pas une sélection qui tient déjà', () => {
    expect(fitToCapacity(['a'], 3)).toEqual(['a'])
  })
})

describe('swap', () => {
  it('échange deux chaînes', () => {
    expect(swap(['a', 'b', 'c'], 'a', 'c')).toEqual(['c', 'b', 'a'])
  })

  it('ignore une chaîne inconnue', () => {
    const sel = ['a', 'b']
    expect(swap(sel, 'a', 'z')).toBe(sel)
  })
})
