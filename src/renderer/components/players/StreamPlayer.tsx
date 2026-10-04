import { useEffect, useState } from 'react'
import type { Channel } from '../../data/channels'
import { DailymotionPlayer } from './DailymotionPlayer'
import { HlsPlayer } from './HlsPlayer'
import { YouTubePlayer } from './YouTubePlayer'

interface Props {
  channel: Channel
  muted: boolean
}

const RETRY_DELAY_MS = 60_000

/** Lit la première source qui fonctionne ; si aucune ne répond, réessaie toute la liste plus tard. */
export function StreamPlayer({ channel, muted }: Props) {
  const [sourceIndex, setSourceIndex] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const exhausted = sourceIndex >= channel.sources.length

  useEffect(() => {
    if (!exhausted) return
    const timer = setTimeout(() => {
      setSourceIndex(0)
      setAttempt((a) => a + 1)
    }, RETRY_DELAY_MS)
    return () => clearTimeout(timer)
  }, [exhausted])

  if (exhausted) {
    return (
      <div className="player-unavailable">
        {channel.logo && <img src={channel.logo} alt="" />}
        <span>Flux indisponible</span>
      </div>
    )
  }

  const source = channel.sources[sourceIndex]
  const key = `${attempt}-${sourceIndex}`
  const next = () => setSourceIndex((i) => i + 1)

  switch (source.type) {
    case 'hls':
      return <HlsPlayer key={key} url={source.url} muted={muted} onFatal={next} />
    case 'youtube':
      return <YouTubePlayer key={key} channelId={source.channelId} muted={muted} onFatal={next} />
    case 'dailymotion':
      return <DailymotionPlayer key={key} videoId={source.videoId} muted={muted} onFatal={next} />
  }
}
