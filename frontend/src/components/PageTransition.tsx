import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function PageTransition() {
  const location = useLocation()
  const [visible, setVisible] = useState(false)
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 2450)
    return () => clearTimeout(t)
  }, [location.pathname])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden overlay-fade">
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400/60 via-sky-200/40 to-transparent" />

      {/* Road */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gray-700">
        {/* Dashed center line */}
        <div
          className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 road-slide"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, #fbbf24 0, #fbbf24 50px, transparent 50px, transparent 100px)',
            backgroundSize: '100px 100%',
          }}
        />
        {/* Road edge lines */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20" />
      </div>

      {/* Dust clouds behind truck */}
      <div className="absolute bottom-14" style={{ left: '8%' }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="absolute rounded-full bg-gray-400/50 dust-puff"
            style={{
              width: 20 + i * 10,
              height: 20 + i * 10,
              animationDelay: `${i * 0.15}s`,
              left: -i * 15,
              bottom: i * 4,
            }}
          />
        ))}
      </div>

      {/* Truck */}
      <div className="absolute bottom-[18px] truck-drive">
        <svg viewBox="0 0 260 90" width="260" height="90" xmlns="http://www.w3.org/2000/svg">
          {/* Trailer body */}
          <rect x="2" y="18" width="160" height="52" rx="5" fill="#004B57" />
          <rect x="2" y="18" width="160" height="8"  rx="5" fill="#006b7a" />
          {/* Trailer door lines */}
          <line x1="82" y1="26" x2="82" y2="70" stroke="#003840" strokeWidth="2" />
          <line x1="42" y1="26" x2="42" y2="70" stroke="#003840" strokeWidth="2" />
          <line x1="122" y1="26" x2="122" y2="70" stroke="#003840" strokeWidth="2" />
          {/* QOLDA text */}
          <text x="20" y="55" fontSize="20" fontWeight="900" fill="white" fontFamily="Arial, sans-serif" letterSpacing="2">QOLDA</text>

          {/* Cab */}
          <rect x="162" y="28" width="78" height="42" rx="6" fill="#005f6e" />
          {/* Cab roof curve */}
          <path d="M162 34 Q180 14 220 18 L240 28 L162 28 Z" fill="#006b7a" />
          {/* Windshield */}
          <rect x="195" y="32" width="38" height="24" rx="4" fill="#bae6fd" opacity="0.85" />
          {/* Windshield reflection */}
          <path d="M197 34 L208 34 L204 54 L197 54 Z" fill="white" opacity="0.2" />
          {/* Door */}
          <rect x="165" y="36" width="28" height="30" rx="3" fill="#005565" />
          {/* Door window */}
          <rect x="168" y="39" width="22" height="14" rx="2" fill="#7dd3fc" opacity="0.75" />
          {/* Headlight */}
          <rect x="234" y="38" width="18" height="10" rx="3" fill="#fde68a" />
          <rect x="236" y="40" width="14" height="6"  rx="2" fill="#fbbf24" />
          {/* Side mirror */}
          <rect x="238" y="30" width="10" height="7" rx="2" fill="#004B57" />
          {/* Exhaust pipe */}
          <rect x="152" y="10" width="6" height="22" rx="3" fill="#374151" />
          {/* Smoke from exhaust */}
          <circle cx="155" cy="8"  r="5" fill="#9ca3af" opacity="0.6" />
          <circle cx="158" cy="3"  r="4" fill="#9ca3af" opacity="0.4" />
          <circle cx="153" cy="0"  r="3" fill="#9ca3af" opacity="0.2" />

          {/* Wheel group left-back */}
          <g transform="translate(38, 72)">
            <circle r="16" fill="#1f2937" className="wheel-spin" style={{transformOrigin:'0 0'}} />
            <circle r="10" fill="#374151" className="wheel-spin" style={{transformOrigin:'0 0'}} />
            <circle r="4"  fill="#9ca3af" />
            {[0,60,120,180,240,300].map(a => (
              <line key={a}
                x1={Math.cos(a*Math.PI/180)*5} y1={Math.sin(a*Math.PI/180)*5}
                x2={Math.cos(a*Math.PI/180)*10} y2={Math.sin(a*Math.PI/180)*10}
                stroke="#6b7280" strokeWidth="2"
              />
            ))}
          </g>

          {/* Wheel group right-back */}
          <g transform="translate(115, 72)">
            <circle r="16" fill="#1f2937" />
            <circle r="10" fill="#374151" />
            <circle r="4"  fill="#9ca3af" />
            {[0,60,120,180,240,300].map(a => (
              <line key={a}
                x1={Math.cos(a*Math.PI/180)*5} y1={Math.sin(a*Math.PI/180)*5}
                x2={Math.cos(a*Math.PI/180)*10} y2={Math.sin(a*Math.PI/180)*10}
                stroke="#6b7280" strokeWidth="2"
              />
            ))}
          </g>

          {/* Wheel cab */}
          <g transform="translate(212, 72)">
            <circle r="16" fill="#1f2937" />
            <circle r="10" fill="#374151" />
            <circle r="4"  fill="#9ca3af" />
            {[0,60,120,180,240,300].map(a => (
              <line key={a}
                x1={Math.cos(a*Math.PI/180)*5} y1={Math.sin(a*Math.PI/180)*5}
                x2={Math.cos(a*Math.PI/180)*10} y2={Math.sin(a*Math.PI/180)*10}
                stroke="#6b7280" strokeWidth="2"
              />
            ))}
          </g>

          {/* Undercarriage / axle */}
          <rect x="22" y="70" width="130" height="4" rx="2" fill="#111827" />
          <rect x="196" y="70" width="32"  height="4" rx="2" fill="#111827" />
        </svg>
      </div>

      {/* Speed lines */}
      {[15, 30, 45, 60, 75].map((pct, i) => (
        <div
          key={i}
          className="absolute bg-white/20 rounded-full truck-drive"
          style={{
            bottom: 26 + i * 6,
            height: 2,
            width: 40 + i * 10,
            animationDuration: `${0.9 + i * 0.05}s`,
            animationDelay: `${i * 0.02}s`,
          }}
        />
      ))}
    </div>
  )
}
