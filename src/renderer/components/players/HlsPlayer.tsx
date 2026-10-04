import Hls from 'hls.js'
import { useEffect, useRef } from 'react'

interface Props {
  url: string
  muted: boolean
  onFatal: () => void
}

const MAX_NETWORK_RETRIES = 3
const STALL_TIMEOUT_MS = 30_000

export function HlsPlayer({ url, muted, onFatal }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onFatalRef = useRef(onFatal)
  onFatalRef.current = onFatal

  useEffect(() => {
    const video = videoRef.current!
    if (!Hls.isSupported()) {
      video.src = url
      return
    }

    // capLevelToPlayerSize : une miniature ne télécharge pas la qualité 1080p.
    const hls = new Hls({ capLevelToPlayerSize: true, liveDurationInfinity: true, backBufferLength: 30 })
    // Un seul signalement d'échec par lecteur, sinon StreamPlayer sauterait une source.
    let failed = false
    const fail = () => {
      if (failed) return
      failed = true
      onFatalRef.current()
    }
    let mediaRecovered = false
    let networkRetries = 0

    hls.on(Hls.Events.ERROR, (_e, data) => {
      if (!data.fatal) return
      // hls.js a déjà épuisé ses propres tentatives : un manifest injoignable est définitif,
      // une coupure en cours de lecture mérite quelques relances.
      const midStream = data.type === Hls.ErrorTypes.NETWORK_ERROR && data.frag != null
      if (data.type === Hls.ErrorTypes.MEDIA_ERROR && !mediaRecovered) {
        mediaRecovered = true
        hls.recoverMediaError()
      } else if (midStream && networkRetries < MAX_NETWORK_RETRIES) {
        networkRetries++
        setTimeout(() => hls.startLoad(), 2000 * networkRetries)
      } else {
        fail()
      }
    })
    hls.on(Hls.Events.FRAG_LOADED, () => {
      networkRetries = 0
    })

    // Chien de garde : un flux qui n'avance plus (ou n'a jamais démarré) passe à la source suivante.
    let lastTime = -1
    let stalledSince = Date.now()
    const watchdog = setInterval(() => {
      if (document.visibilityState !== 'visible' || video.currentTime !== lastTime) {
        lastTime = video.currentTime
        stalledSince = Date.now()
      } else if (Date.now() - stalledSince > STALL_TIMEOUT_MS) {
        clearInterval(watchdog)
        fail()
      }
    }, 2000)

    // Pas de bouton lecture : un flux ne doit jamais rester en pause (Chromium suspend les
    // vidéos muettes quand la fenêtre est masquée). À la reprise, on revient au direct.
    const resume = () => {
      if (document.visibilityState !== 'visible') return
      const live = hls.liveSyncPosition
      if (live != null && live - video.currentTime > 10) video.currentTime = live
      video.play().catch(() => {})
    }
    video.addEventListener('pause', resume)
    document.addEventListener('visibilitychange', resume)

    hls.loadSource(url)
    hls.attachMedia(video)
    video.play().catch(() => {})
    return () => {
      clearInterval(watchdog)
      video.removeEventListener('pause', resume)
      document.removeEventListener('visibilitychange', resume)
      hls.destroy()
    }
  }, [url])

  useEffect(() => {
    const video = videoRef.current!
    video.muted = muted
    if (!muted) {
      video.volume = 1
      video.play().catch(() => {})
    }
  }, [muted])

  return <video ref={videoRef} className="player" autoPlay muted playsInline disablePictureInPicture />
}
