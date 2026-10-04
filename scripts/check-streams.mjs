// Vérifie que chaque source HLS du catalogue répond avec un manifest valide,
// et que chaque chaîne YouTube a un direct en cours.
import { readFile } from 'node:fs/promises'

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'

const file = process.argv[2] ?? new URL('../src/renderer/data/channels.json', import.meta.url)
const channels = JSON.parse(await readFile(file, 'utf8'))

async function checkHls(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(10000) })
  const body = await res.text()
  if (!res.ok) return `HTTP ${res.status}`
  if (!body.includes('#EXTM3U')) return 'manifest invalide'
  return 'OK'
}

async function checkYoutube(channelId) {
  const res = await fetch(`https://www.youtube.com/channel/${channelId}/live`, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'fr-FR', Cookie: 'CONSENT=YES+1; SOCS=CAI' },
    signal: AbortSignal.timeout(10000)
  })
  const body = await res.text()
  if (!res.ok) return `HTTP ${res.status}`
  return /"isLive(Now)?":true/.test(body) ? 'OK (live)' : 'pas de direct'
}

// Le CDN Dailymotion (Cloudflare) refuse le client HTTP de Node : on vérifie seulement
// que le direct est à l'antenne. Dans l'appli, l'URL est résolue via la pile réseau Chromium.
async function checkDailymotion(videoId) {
  const res = await fetch(`https://api.dailymotion.com/video/${videoId}?fields=onair,allow_embed`, { signal: AbortSignal.timeout(10000) })
  const meta = await res.json()
  return meta.onair ? 'OK (en direct)' : 'hors antenne'
}

const checkers = {
  hls: (src) => checkHls(src.url),
  youtube: (src) => checkYoutube(src.channelId),
  dailymotion: (src) => checkDailymotion(src.videoId)
}

let failures = 0
await Promise.all(
  channels.flatMap((ch) =>
    ch.sources.map(async (src) => {
      let result
      try {
        result = await checkers[src.type](src)
      } catch (e) {
        result = `erreur: ${e.cause?.code ?? e.name}`
      }
      if (!result.startsWith('OK')) failures++
      console.log(`${result.startsWith('OK') ? '✔' : '✘'} ${ch.name.padEnd(18)} ${src.type.padEnd(8)} ${result}`)
    })
  )
)
console.log(failures ? `\n${failures} source(s) en échec` : '\nToutes les sources répondent')
