import raw from './channels.json'

export type Source =
  | { type: 'hls'; url: string }
  | { type: 'youtube'; channelId: string }
  | { type: 'dailymotion'; videoId: string }

export interface Channel {
  id: string
  name: string
  country: string
  /** Site officiel de la chaîne (panneau Information). */
  website: string
  logo: string
  /** Logo clair sur fond transparent : à afficher sur une pastille sombre. */
  logoBg?: 'dark'
  sources: Source[]
}

/** Ordre d'affichage des groupes dans la liste des chaînes. */
export const COUNTRIES: Record<string, string> = {
  FR: 'France',
  EU: 'Europe',
  CA: 'Canada',
  AF: 'Afrique',
  MA: 'Maroc',
  MC: 'Monaco',
  IL: 'Israël'
}

const logos = import.meta.glob<string>('../assets/logos/*', { eager: true, import: 'default' })

function logoFor(id: string): string {
  const entry = Object.entries(logos).find(([path]) => path.split('/').pop()!.split('.')[0] === id)
  return entry?.[1] ?? ''
}

export const CHANNELS: Channel[] = (raw as Omit<Channel, 'logo'>[]).map((c) => ({ ...c, logo: logoFor(c.id) }))

export const CHANNELS_BY_ID: Record<string, Channel> = Object.fromEntries(CHANNELS.map((c) => [c.id, c]))
