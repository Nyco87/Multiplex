import { AnimatePresence, motion, type Transition } from 'framer-motion'
import { useEffect, useState } from 'react'

// Durée d'affichage avant la sortie : les flux démarrent en dessous pendant ce temps.
const SPLASH_MS = 1700
const EASE: Transition['ease'] = [0.22, 1, 0.36, 1]

/** Habillage d'ouverture « chaîne d'info » qui masque le démarrage des flux. */
export function Splash() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), SPLASH_MS)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="splash"
          aria-hidden
          initial={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          {/* Bandeau rouge qui balaie l'écran, comme un générique de JT. */}
          <div className="splash-sweep" />

          <div className="splash-center">
            <div className="splash-mark">
              {[0, 1, 2, 3].map((i) => (
                <motion.span
                  key={i}
                  className={i === 0 ? 'is-live' : undefined}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.35 + i * 0.08, type: 'spring', stiffness: 420, damping: 22 }}
                />
              ))}
            </div>

            <div className="splash-title">
              <motion.span
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ delay: 0.6, duration: 0.5, ease: EASE }}
              >
                Multiplex
              </motion.span>
            </div>

            <motion.div
              className="splash-ticker"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.45, ease: EASE }}
            >
              <span className="splash-live">
                <i />
                En direct
              </span>
              <motion.span
                className="splash-tagline"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.4 }}
              >
                L'info francophone en continu
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
