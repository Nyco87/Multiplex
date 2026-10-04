import { Check } from 'lucide-react'
import { CHANNELS, COUNTRIES } from '../data/channels'
import { capacityOf, LAYOUTS } from '../layout/layouts'
import { useAppStore } from '../store/useAppStore'
import { useArrowNav } from './useArrowNav'

const GROUPS = Object.entries(COUNTRIES)
  .map(([code, label]) => ({ label, channels: CHANNELS.filter((c) => c.country === code) }))
  .filter((g) => g.channels.length > 0)

const MAX_CAPACITY = Math.max(...LAYOUTS.map((l) => capacityOf(l.id)))

/** Compteur « n / capacité », affiché à côté du titre du panneau. */
export function ChannelCount() {
  const { layout, selection } = useAppStore()
  const capacity = capacityOf(layout)
  return (
    <span className={`panel-count ${selection.length >= capacity ? 'is-full' : ''}`}>
      {selection.length} / {capacity}
    </span>
  )
}

export function ChannelPicker() {
  const { layout, selection, toggleChannel, togglePanel } = useAppStore()
  const capacity = capacityOf(layout)
  const full = selection.length >= capacity
  const nav = useArrowNav<HTMLDivElement>()

  return (
    <div className="channel-picker" ref={nav.ref} onKeyDown={nav.onKeyDown}>
      {full && (
        <p className="channel-full">
          Disposition complète. Décochez une chaîne pour en choisir une autre
          {capacity < MAX_CAPACITY && (
            <>
              , ou{' '}
              {/* Un lien plutôt qu'un bouton : un bouton ne se coupe pas en fin de ligne. */}
              <a
                href="#"
                className="text-link"
                onClick={(e) => {
                  e.preventDefault()
                  togglePanel('layout')
                }}
              >
                passez à une disposition plus grande
              </a>
            </>
          )}
          .
        </p>
      )}

      {GROUPS.map((group) => (
        <section key={group.label}>
          <h3>{group.label}</h3>
          <ul>
            {group.channels.map((channel) => {
              const position = selection.indexOf(channel.id)
              const selected = position >= 0
              // aria-disabled plutôt que disabled : la ligne reste atteignable au clavier.
              const disabled = !selected && full
              return (
                <li key={channel.id}>
                  <button
                    data-nav
                    className={`channel-row ${selected ? 'is-selected' : ''}`}
                    aria-disabled={disabled}
                    onClick={() => !disabled && toggleChannel(channel.id)}
                    aria-pressed={selected}
                    title={disabled ? `Maximum ${capacity} chaînes pour cette disposition` : undefined}
                  >
                    <span className={`channel-logo logo-chip ${channel.logoBg === 'dark' ? 'is-dark' : ''}`}>
                      {channel.logo && <img src={channel.logo} alt="" />}
                    </span>
                    <span className="channel-name">{channel.name}</span>
                    <span className="channel-check">{selected ? position + 1 : <Check size={14} />}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
