import { useEffect, useRef } from 'react'
import { useThemeStore } from '../store/themeStore'

interface Particle {
  x: number; y: number
  vx: number; vy: number
  radius: number
  hue: number; hueSpeed: number
  alpha: number; alphaDir: number
  pulsePhase: number
}

const PARTICLE_COUNT = 90
const CONNECTION_DIST = 140
const MOUSE_REPEL = 120
const MOUSE_FORCE = 0.6

export default function MotionBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef  = useRef({ x: -9999, y: -9999 })
  const { isDark } = useThemeStore()

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!
    let raf: number
    let W = 0, H = 0

    // — particles —
    const particles: Particle[] = []

    function resize() {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }

    function spawn(): Particle {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: 1.5 + Math.random() * 2.5,
        hue: Math.random() * 60 + 170,   // 170-230  cyan→blue
        hueSpeed: (Math.random() - 0.5) * 0.4,
        alpha: 0.3 + Math.random() * 0.5,
        alphaDir: Math.random() > 0.5 ? 1 : -1,
        pulsePhase: Math.random() * Math.PI * 2,
      }
    }

    resize()
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(spawn())

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', e => { mouseRef.current = { x: e.clientX, y: e.clientY } })
    window.addEventListener('mouseleave', () => { mouseRef.current = { x: -9999, y: -9999 } })

    let t = 0

    function draw() {
      raf = requestAnimationFrame(draw)
      t += 0.008

      // — background —
      if (isDark) {
        ctx.fillStyle = 'rgba(3,7,18,0.18)'
      } else {
        ctx.fillStyle = 'rgba(240,249,255,0.22)'
      }
      ctx.fillRect(0, 0, W, H)

      // — aurora waves —
      for (let layer = 0; layer < 3; layer++) {
        const grad = ctx.createLinearGradient(0, H * 0.3, 0, H * 0.85)
        const lHue = 180 + layer * 30 + Math.sin(t + layer) * 20
        grad.addColorStop(0,   `hsla(${lHue},80%,55%,0)`)
        grad.addColorStop(0.4, `hsla(${lHue},80%,55%,${isDark ? 0.06 : 0.04})`)
        grad.addColorStop(1,   `hsla(${lHue},80%,55%,0)`)

        ctx.beginPath()
        ctx.moveTo(0, H)
        const points = 8
        for (let i = 0; i <= points; i++) {
          const px = (i / points) * W
          const py = H * 0.55
            + Math.sin(i * 0.9 + t * (1 + layer * 0.3) + layer * 1.2) * 80
            + Math.sin(i * 0.4 + t * 0.5 + layer) * 50
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.lineTo(W, H); ctx.lineTo(0, H)
        ctx.closePath()
        ctx.fillStyle = grad
        ctx.fill()
      }

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      // — update + draw particles —
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // mouse repel
        const dx = p.x - mx
        const dy = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MOUSE_REPEL && dist > 0) {
          const force = (MOUSE_REPEL - dist) / MOUSE_REPEL * MOUSE_FORCE
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }

        // friction + move
        p.vx *= 0.98; p.vy *= 0.98
        p.x += p.vx; p.y += p.vy

        // wrap
        if (p.x < -10) p.x = W + 10
        if (p.x > W + 10) p.x = -10
        if (p.y < -10) p.y = H + 10
        if (p.y > H + 10) p.y = -10

        // animate
        p.hue += p.hueSpeed
        p.alpha += p.alphaDir * 0.003
        if (p.alpha > 0.85 || p.alpha < 0.2) p.alphaDir *= -1
        p.pulsePhase += 0.03
        const r = p.radius + Math.sin(p.pulsePhase) * 0.8

        // glow
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4)
        glow.addColorStop(0,   `hsla(${p.hue},90%,70%,${p.alpha})`)
        glow.addColorStop(0.4, `hsla(${p.hue},80%,60%,${p.alpha * 0.4})`)
        glow.addColorStop(1,   `hsla(${p.hue},70%,50%,0)`)
        ctx.beginPath()
        ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        // core dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue},95%,80%,${p.alpha})`
        ctx.fill()

        // connections
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]
          const ex = p.x - q.x
          const ey = p.y - q.y
          const ed = Math.sqrt(ex * ex + ey * ey)
          if (ed < CONNECTION_DIST) {
            const opacity = (1 - ed / CONNECTION_DIST) * (isDark ? 0.35 : 0.2)
            const midHue  = (p.hue + q.hue) / 2
            const lineGrad = ctx.createLinearGradient(p.x, p.y, q.x, q.y)
            lineGrad.addColorStop(0,   `hsla(${p.hue},80%,65%,${opacity})`)
            lineGrad.addColorStop(0.5, `hsla(${midHue},80%,65%,${opacity * 1.4})`)
            lineGrad.addColorStop(1,   `hsla(${q.hue},80%,65%,${opacity})`)
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = lineGrad
            ctx.lineWidth   = (1 - ed / CONNECTION_DIST) * 1.5
            ctx.stroke()
          }
        }
      }

      // — orbiting rings around mouse —
      if (mx > 0 && mx < W) {
        for (let ring = 0; ring < 2; ring++) {
          const ringR = 40 + ring * 28
          const hue   = 190 + ring * 30 + Math.sin(t * 2) * 20
          ctx.beginPath()
          ctx.arc(mx, my, ringR + Math.sin(t * 3 + ring) * 6, 0, Math.PI * 2)
          ctx.strokeStyle = `hsla(${hue},90%,70%,${0.18 - ring * 0.06})`
          ctx.lineWidth   = 1.5 - ring * 0.4
          ctx.stroke()
        }
      }

      // — shooting stars —
      if (Math.random() < 0.004) {
        const sx = Math.random() * W
        const sy = Math.random() * H * 0.5
        const len = 80 + Math.random() * 120
        const sg  = ctx.createLinearGradient(sx, sy, sx + len, sy + len * 0.3)
        sg.addColorStop(0, `hsla(200,90%,80%,0)`)
        sg.addColorStop(0.3, `hsla(200,90%,80%,0.7)`)
        sg.addColorStop(1, `hsla(200,90%,80%,0)`)
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(sx + len, sy + len * 0.3)
        ctx.strokeStyle = sg
        ctx.lineWidth   = 1.5
        ctx.stroke()
      }
    }

    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [isDark])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10 w-full h-full"
        style={{ background: isDark ? '#030712' : '#f0f9ff' }}
      />
      {/* light mode soft overlay */}
      {!isDark && (
        <div className="fixed inset-0 -z-10 bg-white/70 pointer-events-none" />
      )}
    </>
  )
}
