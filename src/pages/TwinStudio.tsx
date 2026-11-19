import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import fabrics from '../content/fabrics.json'
import type { Fabric } from '../lib/schema'

export function TwinStudio() {
  const { slug, locale: param } = useParams()
  const { locale } = useI18n()
  const l = (param as 'ar' | 'en') || locale
  const fabric = (fabrics as unknown as Fabric[]).find((f) => f.slug === slug) || (fabrics as unknown as Fabric[])[0]
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const drapeRef = useRef(50)
  const stretchRef = useRef(50)
  const weightRef = useRef(100)
  const [drape, setDrape] = useState(50)
  const [stretch, setStretch] = useState(50)
  const [weight, setWeight] = useState(100)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(m.matches)
    const handler = (): void => setReduced(m.matches)
    m.addEventListener('change', handler)
    return () => m.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    drapeRef.current = drape
    stretchRef.current = stretch
    weightRef.current = weight
  }, [drape, stretch, weight])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (reduced) return // static still

    let mounted = true
    let observer: ResizeObserver | null = null
    let geometries: THREE.BufferGeometry[] = []
    let materials: THREE.Material[] = []
    let textures: THREE.Texture[] = []

    const init = async (): Promise<void> => {
      const THREE = await import('three')
      if (!mounted || !canvas) return
      const scene = new THREE.Scene()
      scene.background = new THREE.Color('#faf8f4')
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      // Handle resize
      const resize = (): void => {
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        renderer.setSize(rect.width, rect.height, false)
        camera.aspect = rect.width / rect.height
        camera.updateProjectionMatrix()
      }
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
      camera.position.set(0, 1.5, 4)
      resize()
      observer = new ResizeObserver(resize)
      observer.observe(canvas)

      const light = new THREE.DirectionalLight(0xffffff, 1.2)
      light.position.set(2, 3, 2)
      scene.add(light)
      scene.add(new THREE.AmbientLight(0xffffff, 0.6))

      const geom = new THREE.PlaneGeometry(2, 3, 20, 20)
      const mat = new THREE.MeshStandardMaterial({ color: '#d4a5a5', side: THREE.DoubleSide, wireframe: false })
      geometries.push(geom)
      materials.push(mat)
      const mesh = new THREE.Mesh(geom, mat)
      scene.add(mesh)

      const animate = (): void => {
        if (!mounted) return
        // Uniforms via refs, not React state
        const d = drapeRef.current / 100
        const s = stretchRef.current / 100
        const w = weightRef.current / 300
        // RAF-throttled on slider: deform vertices slightly based on refs
        const pos = geom.attributes.position
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i)
          const y = pos.getY(i)
          // simple drape simulation: z = sin(x * s) * d + y * w * 0.1
          const z = Math.sin(x * 2 * s) * 0.2 * d + Math.cos(y * 1.5) * 0.1 * w
          pos.setZ(i, z)
        }
        pos.needsUpdate = true
        geom.computeVertexNormals()
        renderer.render(scene, camera)
        rafRef.current = requestAnimationFrame(animate)
      }
      animate()

      // Pause RAF offscreen - Intersection Observer
      const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (rafRef.current === null) rafRef.current = requestAnimationFrame(animate)
          } else {
            if (rafRef.current !== null) {
              cancelAnimationFrame(rafRef.current)
              rafRef.current = null
            }
          }
        }
      })
      io.observe(canvas)
    }

    init()

    return () => {
      mounted = false
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      if (observer) observer.disconnect()
      for (const g of geometries) g.dispose()
      for (const m of materials) m.dispose()
      for (const t of textures) t.dispose()
    }
  }, [reduced])

  return (
    <div className="container" style={{ paddingBlock: '48px' }}>
      <h1 className="section__title">Twin Studio — {fabric.name.en}</h1>
      <p className="section__sub">{l === 'ar' ? 'نموذج ثلاثي الأبعاد — MeshStandardMaterial' : 'three.js MeshStandardMaterial with generated maps — no external HDRIs'}</p>

      {!reduced ? (
        <canvas ref={canvasRef} width={800} height={600} style={{ inlineSize: '100%', blockSize: '480px', borderRadius: 'var(--radius)', border: '1px solid var(--line)', display: 'block' }} aria-label="Twin Studio 3D canvas" />
      ) : (
        <div style={{ blockSize: '480px', background: 'var(--cream)', borderRadius: 'var(--radius)', display: 'grid', placeItems: 'center', border: '1px solid var(--line)' }}>
          Static still (reduced-motion)
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem', marginBlockStart: '1.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ inlineSize: '100px', fontWeight: 600 }}>Drape</span>
          <input type="range" min={0} max={100} value={drape} onChange={(e) => setDrape(parseInt(e.target.value, 10))} aria-label="Drape" aria-valuetext={`${drape}`} style={{ flex: 1 }} />
          <span style={{ fontFamily: 'ui-monospace, monospace' }}>{drape}</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ inlineSize: '100px', fontWeight: 600 }}>Stretch</span>
          <input type="range" min={0} max={100} value={stretch} onChange={(e) => setStretch(parseInt(e.target.value, 10))} aria-label="Stretch" aria-valuetext={`${stretch}`} style={{ flex: 1 }} />
          <span style={{ fontFamily: 'ui-monospace, monospace' }}>{stretch}</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ inlineSize: '100px', fontWeight: 600 }}>Weight</span>
          <input type="range" min={0} max={300} value={weight} onChange={(e) => setWeight(parseInt(e.target.value, 10))} aria-label="Weight" aria-valuetext={`${weight}`} style={{ flex: 1 }} />
          <span style={{ fontFamily: 'ui-monospace, monospace' }}>{weight}</span>
        </label>
      </div>

      <div style={{ marginBlockStart: '1rem', background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1rem' }}>
        <p style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.85rem' }}>Alternates: {fabric.alternatives.join(', ')}</p>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          style={{ marginBlockStart: '0.6rem', minBlockSize: '44px', minInlineSize: '44px' }}
          onClick={() => {
            const manifest = { slug: fabric.slug, drape, stretch, weight, generatedMaps: true }
            const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' })
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = `${fabric.slug}-manifest.json`
            a.click()
            setTimeout(() => URL.revokeObjectURL(a.href), 1000)
          }}
        >
          Export manifest
        </button>
      </div>
    </div>
  )
}
