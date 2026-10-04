const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ['H'], label: 'Afficher / masquer l’aide' },
  { keys: ['C'], label: 'Choisir les chaînes' },
  { keys: ['D'], label: 'Choisir la disposition' },
  { keys: ['1', '…', '6'], label: 'Flux n° en grand, avec le son' },
  { keys: ['F11'], label: 'Plein écran' },
  { keys: ['Échap'], label: 'Fermer : panneau, grand flux, plein écran' }
]

const IN_PANELS: { keys: string[]; label: string }[] = [
  { keys: ['←', '↑', '→', '↓'], label: 'Se déplacer dans la liste' },
  { keys: ['Entrée'], label: 'Appliquer la disposition' },
  { keys: ['Espace'], label: 'Cocher / décocher' }
]

const MOUSE: { keys: string[]; label: string }[] = [
  { keys: ['Clic'], label: 'Afficher un flux en grand' },
  { keys: ['Appui long'], label: 'Glisser-déposer pour réordonner' }
]

function Section({ title, items }: { title: string; items: typeof SHORTCUTS }) {
  return (
    <section className="help-section">
      <h3>{title}</h3>
      <dl>
        {items.map((s) => (
          <div key={s.label} className="help-row">
            <dt>
              {s.keys.map((k) => (k === '…' ? <span key={k}>…</span> : <kbd key={k}>{k}</kbd>))}
            </dt>
            <dd>{s.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function HelpPanel() {
  return (
    <div className="help">
      <Section title="Général" items={SHORTCUTS} />
      <Section title="Dans les panneaux" items={IN_PANELS} />
      <Section title="Souris" items={MOUSE} />
    </div>
  )
}
