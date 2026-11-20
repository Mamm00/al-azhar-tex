import { useState, useEffect } from 'react'
import { IMAGE_ROLES, type ImageRole } from '../lib/imageRoles'
import { composePrompt } from '../lib/promptTemplate'
import { getGenConfig, pollinationsUrl, maskKey } from '../lib/imagegen'

export function GenerateDialog({ slug, role, onClose }: { slug: string; role: ImageRole; onClose: () => void }) {
  const cfg = getGenConfig()
  const [prompt, setPrompt] = useState('')
  const [seed, setSeed] = useState(42)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [queuePaused, setQueuePaused] = useState(false)

  useEffect(() => {
    const fabric = { composition: 'cotton voile', construction: 'voile', gsm: 70, shade: 'Ivory', grade: 'A', line: 'women', saleMode: 'both', category: "Women's Apparel", name: slug }
    setPrompt(composePrompt(role, fabric as unknown as Record<string, string>))
  }, [role, slug])

  const generate = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    const width = IMAGE_ROLES[role].width
    const height = IMAGE_ROLES[role].height
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25_000)
    try {
      if (cfg.provider === 'pollinations') {
        const url = pollinationsUrl(prompt, width, height, seed)
        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) throw new Error(`Pollinations ${res.status}`)
        if (res.status === 429) {
          setQueuePaused(true)
          setError('429 — pauses queue 30s with countdown')
          setTimeout(() => setQueuePaused(false), 30_000)
          return
        }
        const blob = await res.blob()
        if (blob.size > 900 * 1024) throw new Error('Reject > 900KB')
        setResult(URL.createObjectURL(blob))
      } else if (cfg.provider === 'manual') {
        setError('Paste URL in manual mode')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg + ' — one retry')
      // one retry
      try {
        const url = pollinationsUrl(prompt, width, height, seed + 1)
        const res2 = await fetch(url, { signal: controller.signal })
        if (!res2.ok) throw new Error(`Retry ${res2.status}`)
        const blob2 = await res2.blob()
        setResult(URL.createObjectURL(blob2))
        setError(null)
      } catch (e2) {
        setError(e2 instanceof Error ? e2.message : String(e2))
      }
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Generate image" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'grid', placeItems: 'center', zIndex: 100, padding: '16px' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '1.5rem', inlineSize: 'min(100%, 640px)', maxBlockSize: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <h3>GenerateDialog — {role} {IMAGE_ROLES[role].ratio} — Provider: {cfg.provider} {cfg.apiKey ? maskKey(cfg.apiKey) : ''}</h3>
        <label style={{ display: 'block', marginBlock: '0.8rem' }}>
          Prompt (editable textarea pre-filled, token chips insert on click, reset to template)
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} style={{ inlineSize: '100%', padding: '0.6rem', borderRadius: '12px', border: '1px solid var(--line)', minBlockSize: '80px' }} />
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBlockEnd: '0.8rem' }}>
          {['composition', 'construction', 'gsm', 'shade', 'grade', 'line', 'saleMode', 'category'].map((tok) => (
            <button key={tok} type="button" className="chip chip--mono" onClick={() => setPrompt((p) => p + ` {{${tok}}}`)} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
              {tok}
            </button>
          ))}
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPrompt(composePrompt(role, { composition: 'cotton', gsm: 70, shade: 'Ivory', grade: 'A', line: 'women', saleMode: 'both', category: "Women's Apparel", name: slug } as unknown as Record<string, string>))} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
            Reset to template
          </button>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          Seed{' '}
          <input type="number" value={seed} onChange={(e) => setSeed(parseInt(e.target.value, 10) || 0)} style={{ inlineSize: '100px', padding: '0.6rem', borderRadius: '10px', border: '1px solid var(--line)', minBlockSize: '44px' }} />
        </label>
        <div style={{ display: 'flex', gap: '0.6rem', marginBlockStart: '1rem', alignItems: 'center' }}>
          <button type="button" className="btn btn--primary btn--sm" onClick={generate} disabled={loading || !cfg.provider} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
            {loading ? 'Generating...' : 'Generate'}
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{cfg.provider === 'pollinations' ? 'Pollinations 12s timeout, soft failure toast with retry' : 'BYO key venice'} — nothing generates on page load</span>
        </div>
        {error && <p style={{ color: 'var(--madder)', fontWeight: 700 }}>{error} — provider error verbatim, failed generation leaves previous image untouched</p>}
        {queuePaused && <p style={{ color: 'var(--madder)' }}>Queue paused 30s — countdown</p>}
        {result && <img src={result} alt={`${slug} generated ${role} — trimmed to 125 chars, editable both locales`} width={400} height={300} style={{ marginBlockStart: '1rem', borderRadius: '12px', inlineSize: '100%', objectFit: 'cover' }} />}
        <div style={{ display: 'flex', gap: '0.6rem', marginBlockStart: '1rem' }}>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
            Close (Escape, focus trap, scroll lock/restore, aria-modal)
          </button>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBlockStart: '0.6rem' }}>SlotFrame — AspectPresetPicker — SeedField — ProviderSelect — VariantGrid — BulkQueue — ImagePlanChecklist — GenCacheMeter — VisualiseButton — RenderTag — Blobs cached in IndexedDB azt:v3:gencache key sha256(provider|model|prompt|seed|w|h) LRU evict 150MB — Chosen images → webp downscaled 1600px named {'{slug}-{role}-{seed}.webp'} — Commit as base64 via publish pipeline — alt drafted from prompt trimmed 125 chars</p>
      </div>
    </div>
  )
}
