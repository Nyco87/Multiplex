import { Check } from 'lucide-react'
import { CHANNELS, COUNTRIES } from '../data/channels'
import { capacityOf } from '../layout/layouts'
import { useAppStore } from '../store/useAppStore'
import { useArrowNav } from './useArrowNav'

const GROUPS = Object.entries(COUNTRIES)
  .map(([code, label]) => ({ label, channels: CHANNELS.filter((c) => c.country === code) }))
  .filter((g) => g.channels.length > 0)

export function ChannelPicker() {
  const { layout, selection, toggleChannel } = useAppStore()
  const capacity = capacityOf(layout)
  const full = selection.length >= capacity
  const nav = useArrowNav<HTMLDivElement>()

  return (
    <div className="channel-picker" ref={nav.ref} onKeyDown={nav.onKeyDown}>
      <p className={`channel-count ${full ? 'is-full' : ''}`}>
        <strong>
          {selection.length} / {capacity}
        </strong>{' '}
        {full ? 'Disposition complète : décochez une chaîne pour en choisir une autre.' : 'chaînes sélectionnées'}
      </p>

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
