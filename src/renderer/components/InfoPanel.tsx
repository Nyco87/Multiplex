import { ChevronRight, ExternalLink } from 'lucide-react'
import licenses from 'virtual:licenses'
import appIcon from '../../../build/icon.svg'
import { CHANNELS } from '../data/channels'

// Les liens s'ouvrent dans le navigateur par défaut (voir setWindowOpenHandler, processus principal).
function ExternalAnchor({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  )
}

export function InfoPanel() {
  return (
    <div className="info">
      <header className="info-app">
        <img src={appIcon} alt="" className="info-app-icon" />
        <div>
          <h3>Multiplex</h3>
          <p>Version {__APP_VERSION__}</p>
          <p>© 2026 Nicolas Morellet. Tous droits réservés.</p>
        </div>
      </header>

      <p className="info-text">
        Multiplex affiche simultanément les directs de chaînes d’information francophones du monde entier, dans une
        mosaïque de 2 à 6 flux. Un clic sur un flux l’affiche en grand avec le son.
      </p>

      <section className="info-section">
        <h3>Mentions légales</h3>
        <p className="info-text">
          Multiplex ne stocke ni ne retransmet aucun contenu : chaque flux est lu directement depuis la source officielle
          publiée par la chaîne (son propre serveur, ou son compte YouTube ou Dailymotion).
        </p>
        <p className="info-text">
          Les programmes, flux, noms et logos appartiennent à leurs chaînes respectives, qui en détiennent tous les droits.
          Multiplex n’est affilié à aucune de ces chaînes et n’est approuvé par aucune d’elles.
        </p>
      </section>

      <details className="info-section info-collapsible">
        <summary>
          <h3>Chaînes disponibles</h3>
          <ChevronRight size={14} className="info-chevron" />
        </summary>
        <ul className="info-channels">
          {CHANNELS.map((channel) => (
            <li key={channel.id}>
              <ExternalAnchor href={channel.website} className="channel-row">
                <span className={`channel-logo logo-chip ${channel.logoBg === 'dark' ? 'is-dark' : ''}`}>
                  {channel.logo && <img src={channel.logo} alt="" />}
                </span>
                <span className="channel-name">{channel.name}</span>
                <ExternalLink size={14} className="info-link-icon" />
              </ExternalAnchor>
            </li>
          ))}
        </ul>
      </details>

      <section className="info-section">
        <h3>Logiciels tiers</h3>
        <p className="info-text">
          Multiplex repose sur les bibliothèques open source suivantes. Electron intègre Chromium, dont les licences sont
          fournies avec l’application (fichier LICENSES.chromium.html).
        </p>
        <ul className="info-licenses">
          {licenses.map((lib) => (
            <li key={lib.name}>
              <details>
                <summary>
                  <span className="info-lib-name">{lib.name}</span>
                  <span className="info-lib-meta">
                    {lib.version} · {lib.license}
                  </span>
                </summary>
                {lib.homepage && <ExternalAnchor href={lib.homepage}>{lib.homepage}</ExternalAnchor>}
                <pre>{lib.text}</pre>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
