// Fond décoratif « plateau d'info internationale » : globe filaire, méridiens et halos,
// volontairement très discret pour ne jamais concurrencer les flux.

const MERIDIANS = [0.17, 0.42, 0.64, 0.82, 0.95]
const PARALLELS = [-0.72, -0.42, -0.14, 0.14, 0.42, 0.72]

function Globe({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} />
      {MERIDIANS.map((k) => (
        <ellipse key={`m${k}`} cx={cx} cy={cy} rx={r * k} ry={r} />
      ))}
      {PARALLELS.map((k) => {
        const y = cy + r * k
        const half = r * Math.sqrt(1 - k * k)
        return <line key={`p${k}`} x1={cx - half} y1={y} x2={cx + half} y2={y} />
      })}
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} />
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} />
    </g>
  )
}

export function Backdrop() {
  return (
    <div className="backdrop" aria-hidden>
      <div className="backdrop-glow" />
      <svg className="backdrop-lines" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="backdrop-dots" width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" className="backdrop-dot" />
          </pattern>
          <radialGradient id="backdrop-fade" cx="0.8" cy="0.85" r="0.75">
            <stop offset="0" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="backdrop-mask">
            <rect width="1600" height="1000" fill="url(#backdrop-fade)" />
          </mask>
        </defs>
        <rect width="1600" height="1000" fill="url(#backdrop-dots)" mask="url(#backdrop-mask)" />
        <g className="backdrop-globe">
          <Globe cx={1330} cy={860} r={520} />
        </g>
        <g className="backdrop-globe is-faint">
          <Globe cx={120} cy={60} r={260} />
        </g>
        {/* Orbites, comme les habillages des chaînes d'info en continu */}
        <g className="backdrop-orbit">
          <ellipse cx={1330} cy={860} rx={760} ry={210} transform="rotate(-14 1330 860)" />
          <ellipse cx={1330} cy={860} rx={690} ry={330} transform="rotate(22 1330 860)" />
        </g>
      </svg>
    </div>
  )
}
