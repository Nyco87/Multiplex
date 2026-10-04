import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CHANNELS_BY_ID } from '../data/channels'
import { capacityOf, LAYOUTS_BY_ID, type LayoutId } from '../layout/layouts'
import { fitToCapacity, swap, toggleChannel } from './selection'

export type ThemePref = 'light' | 'dark' | 'system'
export type Panel = 'layout' | 'channels' | 'help' | null

interface AppState {
  layout: LayoutId
  selection: string[]
  theme: ThemePref
  focusedId: string | null
  panel: Panel
  /** Plein écran de la fenêtre (non mémorisé, reflète l'état natif). */
  fullscreen: boolean

  setLayout: (layout: LayoutId) => void
  toggleChannel: (id: string) => void
  swapChannels: (a: string, b: string) => void
  focus: (id: string) => void
  unfocus: () => void
  setTheme: (theme: ThemePref) => void
  togglePanel: (panel: Exclude<Panel, null>) => void
  closePanel: () => void
  setFullscreen: (fullscreen: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      layout: '4grid',
      selection: ['franceinfo', 'bfmtv', 'france24', 'tv5mondeinfo'],
      theme: 'system',
      focusedId: null,
      panel: null,
      fullscreen: false,

      setLayout: (layout) =>
        set((s) => {
          const selection = fitToCapacity(s.selection, capacityOf(layout))
          return { layout, selection, focusedId: selection.includes(s.focusedId ?? '') ? s.focusedId : null }
        }),
      toggleChannel: (id) =>
        set((s) => {
          const selection = toggleChannel(s.selection, id, capacityOf(s.layout))
          return { selection, focusedId: selection.includes(s.focusedId ?? '') ? s.focusedId : null }
        }),
      swapChannels: (a, b) => set((s) => ({ selection: swap(s.selection, a, b) })),
      focus: (id) => set({ focusedId: id }),
      unfocus: () => set({ focusedId: null }),
      setTheme: (theme) => set({ theme }),
      togglePanel: (panel) => set((s) => ({ panel: s.panel === panel ? null : panel })),
      closePanel: () => set({ panel: null }),
      setFullscreen: (fullscreen) => set({ fullscreen })
    }),
    {
      name: 'multiplex-state',
      version: 1,
      partialize: (s) => ({ layout: s.layout, selection: s.selection, theme: s.theme }),
      // Un état mémorisé peut référencer une chaîne retirée du catalogue ou un layout disparu.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>
        const layout = p.layout && LAYOUTS_BY_ID[p.layout] ? p.layout : current.layout
        const known = (p.selection ?? current.selection).filter((id) => CHANNELS_BY_ID[id])
        return {
          ...current,
          layout,
          selection: fitToCapacity([...new Set(known)], capacityOf(layout)),
          theme: p.theme ?? current.theme
        }
      }
    }
  )
)
