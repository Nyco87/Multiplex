import { useEffect, useState } from 'react'
import { HlsPlayer } from './HlsPlayer'

interface Props {
  videoId: string
  muted: boolean
  onFatal: () => void
}

/** Direct Dailymotion : l'URL HLS signée est résolue par le processus principal, puis lue avec hls.js. */
export function DailymotionPlayer({ videoId, muted, onFatal }: Props) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    window.multiplex
      .resolveDailymotion(videoId)
      .then((resolved) => !cancelled && setUrl(resolved))
      .catch(() => !cancelled && onFatal())
    return () => {
      cancelled = true
    }
  }, [videoId])

  return url ? <HlsPlayer url={url} muted={muted} onFatal={onFatal} /> : null
}
