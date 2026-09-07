export function FireBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none bg-[#0a0c10]" aria-hidden="true">
      <svg className="w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0a0c10" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#dc2626" stopOpacity="0.35" />
            <stop offset="75%" stopColor="#ea580c" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
          </linearGradient>
          <pattern id="fireGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.07" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#fireGrad)" />
        <rect width="100%" height="100%" fill="url(#fireGrid)" />
      </svg>

      <div className="absolute bottom-0 inset-x-0 flex justify-around items-end h-80 opacity-75">
        {[15, 30, 48, 65, 82].map((left, idx) => (
          <div key={left} className="w-36 h-64 bg-gradient-to-t from-red-600 via-orange-500 to-amber-400 rounded-t-full blur-xl animate-pulse"
            style={{
              animationDuration: `${1.4 + (idx % 3) * 0.4}s`,
              transform: `scaleY(${1 + (idx % 2) * 0.3})`,
            }} />
        ))}
      </div>

      <div className="absolute inset-0">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 blur-[1px] animate-ping"
            style={{
              left: `${(i * 7 + 3) % 96}%`,
              bottom: `${(i * 11 + 5) % 85}%`,
              animationDuration: `${2.0 + (i % 3) * 0.5}s`,
              opacity: 0.8,
            }} />
        ))}
      </div>
    </div>
  )
}
