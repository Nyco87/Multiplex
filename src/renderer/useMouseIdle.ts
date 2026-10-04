import { useEffect } from 'react'

const IDLE_DELAY_MS = 2500

/**
 * Souris inactive depuis 2,5 s : la classe `mouse-idle` est posée sur <html>. Les éléments
 * qui n'apparaissent qu'au survol (étiquette, croix, barre flottante, curseur en plein écran)
 * s'effacent alors, même si la souris reste posée dessus.
 */
export function useMouseIdle(): void {
  useEffect(() => {
    const root = document.documentElement
    let timer: ReturnType<typeof setTimeout>
    const onActivity = () => {
      root.classList.remove('mouse-idle')
      clearTimeout(timer)
      timer = setTimeout(() => root.classList.add('mouse-idle'), IDLE_DELAY_MS)
    }
    onActivity()
    window.addEventListener('mousemove', onActivity)
    window.addEventListener('pointerdown', onActivity)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('mousemove', onActivity)
      window.removeEventListener('pointerdown', onActivity)
      root.classList.remove('mouse-idle')
    }
  }, [])
}
