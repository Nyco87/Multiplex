import { useEffect, useRef, type KeyboardEvent } from 'react'

const NAV_SELECTOR = '[data-nav]'

/**
 * Navigation aux flèches entre les éléments `[data-nav]` d'un conteneur.
 * Le focus suit la sélection : Espace/Entrée déclenchent le bouton focalisé.
 * `columns` > 1 pour une grille (gauche/droite et haut/bas).
 */
export function useArrowNav<T extends HTMLElement>(columns = 1) {
  const ref = useRef<T>(null)

  // À l'ouverture, on focalise l'élément actif (ou le premier).
  useEffect(() => {
    const items = ref.current?.querySelectorAll<HTMLElement>(NAV_SELECTOR)
    if (!items?.length) return
    const active = [...items].find((el) => el.getAttribute('aria-pressed') === 'true')
    ;(active ?? items[0]).focus()
  }, [])

  const onKeyDown = (e: KeyboardEvent<T>) => {
    const steps: Record<string, number> = {
      ArrowDown: columns,
      ArrowUp: -columns,
      ...(columns > 1 ? { ArrowRight: 1, ArrowLeft: -1 } : {})
    }
    const items = [...(ref.current?.querySelectorAll<HTMLElement>(NAV_SELECTOR) ?? [])]
    if (!items.length) return
    const current = items.indexOf(document.activeElement as HTMLElement)

    let next: number
    if (e.key in steps) next = current < 0 ? 0 : current + steps[e.key]
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = items.length - 1
    else return

    e.preventDefault()
    items[Math.max(0, Math.min(items.length - 1, next))].focus()
  }

  return { ref, onKeyDown }
}
