// Licences des bibliothèques tierces embarquées dans l'application, exposées au renderer par
// le module virtuel « virtual:licenses » (panneau Information). Collectées à chaque build depuis
// node_modules : la liste suit d'elle-même les mises à jour de dépendances.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'

export interface ThirdPartyLicense {
  name: string
  version: string
  license: string
  homepage?: string
  text: string
}

// Paquets importés par le renderer : eux et leurs dépendances finissent dans le bundle.
const BUNDLED = ['react', 'react-dom', 'framer-motion', 'hls.js', 'lucide-react', 'zustand', '@dnd-kit/core']
// Electron est livré tel quel, mais ses propres dépendances ne servent qu'à l'installation.
const SHIPPED = ['electron']

const VIRTUAL_ID = 'virtual:licenses'
const RESOLVED_ID = '\0' + VIRTUAL_ID

export function collectLicenses(root: string): ThirdPartyLicense[] {
  const found = new Map<string, ThirdPartyLicense>()

  const visit = (name: string, withDependencies: boolean): void => {
    if (found.has(name)) return
    const dir = join(root, 'node_modules', name)
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
    const files = readdirSync(dir)
    const licenseFile = files.find((f) => /^licen[cs]e/i.test(f))
    if (!licenseFile) throw new Error(`Fichier de licence introuvable pour ${name}`)
    // Apache-2.0 : un éventuel fichier NOTICE doit accompagner la licence.
    const noticeFile = files.find((f) => /^notice/i.test(f))
    const text = [licenseFile, noticeFile]
      .filter((f): f is string => !!f)
      .map((f) => readFileSync(join(dir, f), 'utf8').trim())
      .join('\n\n')
    found.set(name, { name, version: pkg.version, license: pkg.license, homepage: pkg.homepage, text })
    if (withDependencies) for (const dep of Object.keys(pkg.dependencies ?? {})) visit(dep, true)
  }

  BUNDLED.forEach((name) => visit(name, true))
  SHIPPED.forEach((name) => visit(name, false))
  return [...found.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export function licensesPlugin(root: string): Plugin {
  return {
    name: 'multiplex-licenses',
    resolveId: (id) => (id === VIRTUAL_ID ? RESOLVED_ID : undefined),
    load: (id) => (id === RESOLVED_ID ? `export default ${JSON.stringify(collectLicenses(root))}` : undefined)
  }
}
