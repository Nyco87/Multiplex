import { useEffect, useRef } from 'react'

interface Props {
  channelId: string
  muted: boolean
  onFatal: () => void
}

// Délai au-delà duquel un direct qui ne démarre pas est considéré indisponible.
const START_TIMEOUT_MS = 30_000
const PLAYING = 1
const PAUSED = 2

/**
 * Direct YouTube d'une chaîne (`live_stream?channel=` suit le direct en cours).
 * Piloté par le protocole postMessage de l'embed, sans charger l'API IFrame
 * (elle exige une origine http, ce que n'est pas l'appli packagée).
 */
export function YouTubePlayer({ channelId, muted, onFatal }: Props) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const mutedRef = useRef(muted)
  mutedRef.current = muted
  const onFatalRef = useRef(onFatal)
  onFatalRef.current = onFatal

  const src =
    `https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(channelId)}` +
    '&autoplay=1&mute=1&controls=0&disablekb=1&fs=0&iv_load_policy=3&rel=0&playsinline=1&enablejsapi=1'

  const command = (func: string, args: unknown[] = []) =>
    frameRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*')

  const applyMute = () => {
    if (mutedRef.current) command('mute')
    else {
      command('unMute')
      command('setVolume', [100])
    }
  }

  useEffect(() => {
    const frame = frameRef.current!
    let started = false
    let failed = false
    const fail = () => {
      if (failed) return
      failed = true
      onFatalRef.current()
    }
    const timeout = setTimeout(() => !started && fail(), START_TIMEOUT_MS)

    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.contentWindow || typeof e.data !== 'string') return
      let msg: { event?: string; info?: { playerState?: number } | number }
      try {
        msg = JSON.parse(e.data)
      } catch {
        return
      }
      if (msg.event === 'onReady' || msg.event === 'initialDelivery') applyMute()
      if (msg.event === 'onError') fail()
      const state = typeof msg.info === 'object' ? msg.info?.playerState : msg.event === 'onStateChange' ? msg.info : undefined
      if (state === PLAYING && !started) {
        started = true
        applyMute()
      }
      // Pas de bouton lecture : un direct mis en pause (fenêtre masquée…) repart aussitôt.
      if (state === PAUSED) command('playVideo')
    }

    // L'embed n'émet ses événements qu'après un message « listening ».
    const onLoad = () => frame.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: channelId }), '*')

    window.addEventListener('message', onMessage)
    frame.addEventListener('load', onLoad)
    return () => {
      clearTimeout(timeout)
      window.removeEventListener('message', onMessage)
      frame.removeEventListener('load', onLoad)
    }
  }, [channelId])

  useEffect(applyMute, [muted])

  return <iframe ref={frameRef} className="player" src={src} allow="autoplay; encrypted-media" title={channelId} />
}
