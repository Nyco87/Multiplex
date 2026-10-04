import { join, normalize } from 'node:path'
import { app, BrowserWindow, ipcMain, Menu, nativeTheme, net, protocol, session, shell } from 'electron'
import { pathToFileURL } from 'node:url'

// En production, l'appli est servie par un protocole dédié : une origine fixe garde
// le localStorage (état mémorisé) d'un lancement à l'autre.
const APP_SCHEME = 'app'
const APP_ORIGIN = `${APP_SCHEME}://multiplex`
// YouTube refuse les embeds sans Referer http(s) (erreurs 152/153) : on en fournit un.
const EMBED_REFERER = 'https://multiplex.app/'
const RENDERER_DIR = join(__dirname, '../renderer')
const DEV_URL = process.env['ELECTRON_RENDERER_URL']

const THEME_COLORS = {
  dark: { color: '#0a1122', symbolColor: '#e6ecf7' },
  light: { color: '#f1f4f9', symbolColor: '#1b1d24' }
} as const

protocol.registerSchemesAsPrivileged([
  { scheme: APP_SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }
])

function serveApp(): void {
  protocol.handle(APP_SCHEME, (request) => {
    const url = new URL(request.url)
    const relative = normalize(decodeURIComponent(url.pathname)).replace(/^[\\/]+/, '') || 'index.html'
    const file = join(RENDERER_DIR, relative)
    if (!file.startsWith(RENDERER_DIR)) return new Response('Forbidden', { status: 403 })
    return net.fetch(pathToFileURL(file).toString())
  })
}

function configureNetwork(): void {
  const ses = session.defaultSession

  // Certains CDN (BFM notamment) refusent un User-Agent contenant « Electron ».
  ses.setUserAgent(ses.getUserAgent().replace(/\s(Electron|multiplex)\/\S+/gi, ''))

  ses.webRequest.onBeforeSendHeaders(
    { urls: ['https://www.youtube.com/embed/*', 'https://www.youtube-nocookie.com/embed/*', 'https://*.dailymotion.com/*', 'https://*.dmcdn.net/*'] },
    (details, callback) => {
      const headers = details.requestHeaders
      if (/dailymotion\.com|dmcdn\.net/.test(new URL(details.url).host)) {
        // Le CDN Dailymotion refuse (403) les origines tierces comme http://localhost en dev.
        delete headers['Origin']
        delete headers['Referer']
      } else if (!headers['Referer']) {
        headers['Referer'] = EMBED_REFERER
      }
      callback({ requestHeaders: headers })
    }
  )

  // hls.js charge manifests et segments en XHR depuis le document principal : on y autorise
  // le CORS, les CDN des chaînes n'envoyant pas toujours les en-têtes nécessaires.
  // Les iframes (YouTube) ne sont pas concernées.
  ses.webRequest.onHeadersReceived((details, callback) => {
    const fromAppDocument = details.frame != null && details.frame.parent === null
    if (!fromAppDocument || details.resourceType !== 'xhr') return callback({})
    const headers = Object.fromEntries(
      Object.entries(details.responseHeaders ?? {}).filter(([k]) => !k.toLowerCase().startsWith('access-control-'))
    )
    headers['Access-Control-Allow-Origin'] = ['*']
    callback({ responseHeaders: headers })
  })
}

// Dailymotion fournit une URL HLS signée à usage limité : on la résout à la demande
// via la pile réseau Chromium (le CDN rejette les clients non-navigateur).
ipcMain.handle('resolve-dailymotion', async (_e, videoId: string) => {
  const res = await net.fetch(`https://www.dailymotion.com/player/metadata/video/${encodeURIComponent(videoId)}`)
  const meta = await res.json()
  const url: string | undefined = meta?.qualities?.auto?.[0]?.url
  if (!url) throw new Error(meta?.error?.title ?? 'Flux Dailymotion indisponible')
  return url
})

ipcMain.on('set-theme', (e, theme: 'light' | 'dark') => {
  nativeTheme.themeSource = theme
  const win = BrowserWindow.fromWebContents(e.sender)
  win?.setTitleBarOverlay({ ...THEME_COLORS[theme], height: 36 })
  win?.setBackgroundColor(THEME_COLORS[theme].color)
})

// Plein écran piloté par l'interface (bouton et touche F11).
ipcMain.on('toggle-fullscreen', (e) => {
  const win = BrowserWindow.fromWebContents(e.sender)
  win?.setFullScreen(!win.isFullScreen())
})
ipcMain.handle('is-fullscreen', (e) => BrowserWindow.fromWebContents(e.sender)?.isFullScreen() ?? false)

function createWindow(): void {
  const theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    // Minimums modestes : avec une forte mise à l'échelle (ex. 1080p à 175 %), l'écran ne fait
    // que ~590 px de haut, et un minimum supérieur rendrait la fenêtre plus haute que l'écran
    // en plein écran (bas de la grille coupé).
    minWidth: 800,
    minHeight: 480,
    title: 'Multiplex',
    icon: join(__dirname, '../../build/icon.png'),
    backgroundColor: THEME_COLORS[theme].color,
    titleBarStyle: 'hidden',
    titleBarOverlay: { ...THEME_COLORS[theme], height: 36 },
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      autoplayPolicy: 'no-user-gesture-required',
      backgroundThrottling: false,
      sandbox: true
    }
  })
  win.once('ready-to-show', () => {
    win.maximize()
    win.show()
  })
  // Plein écran : l'interface masque sa barre de titre et la barre de gauche.
  win.on('enter-full-screen', () => win.webContents.send('fullscreen', true))
  win.on('leave-full-screen', () => win.webContents.send('fullscreen', false))
  // Liens externes (panneau À propos) : ouverts dans le navigateur, jamais dans l'appli.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })
  win.loadURL(DEV_URL ?? `${APP_ORIGIN}/index.html`)
}

app.whenReady().then(() => {
  // Pas de menu : ses raccourcis (F11 notamment) doubleraient ceux de l'interface.
  Menu.setApplicationMenu(null)
  configureNetwork()
  if (!DEV_URL) serveApp()
  createWindow()
  app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow())
})

app.on('window-all-closed', () => app.quit())
