import { contextBridge, ipcRenderer } from 'electron'

const api = {
  resolveDailymotion: (videoId: string): Promise<string> => ipcRenderer.invoke('resolve-dailymotion', videoId),
  setTheme: (theme: 'light' | 'dark'): void => ipcRenderer.send('set-theme', theme),
  toggleFullscreen: (): void => ipcRenderer.send('toggle-fullscreen'),
  isFullscreen: (): Promise<boolean> => ipcRenderer.invoke('is-fullscreen'),
  onFullscreenChange: (callback: (fullscreen: boolean) => void): (() => void) => {
    const listener = (_e: Electron.IpcRendererEvent, fullscreen: boolean) => callback(fullscreen)
    ipcRenderer.on('fullscreen', listener)
    return () => ipcRenderer.removeListener('fullscreen', listener)
  }
}

export type MultiplexApi = typeof api

contextBridge.exposeInMainWorld('multiplex', api)
