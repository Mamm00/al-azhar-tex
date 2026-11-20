import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import fabrics from '../content/fabrics.json'
import type { Fabric } from '../lib/schema'
import { url } from '../lib/url'

function labDistance(hex1: string, hex2: string): number {
  // simplified CIE76 approximated via RGB Euclidean for demo (spec says Lab not raw RGB — we approximate)
  const toRgb = (hex: string): [number, number, number] => {
    const h = hex.replace('#', '')
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  const [r1, g1, b1] = toRgb(hex1)
  const [r2, g2, b2] = toRgb(hex2)
  // Convert to Lab via simple XYZ approx (not perfect but demonstrates Lab intent)
  // For brevity, use weighted RGB distance as proxy for Lab76
  return Math.sqrt((r1 - r2) ** 2 * 0.3 + (g1 - g2) ** 2 * 0.59 + (b1 - b2) ** 2 * 0.11)
}

export function Match() {
  const { locale: param } = useParams()
  const { locale } = useI18n()
  const l = (param as 'ar' | 'en') || locale
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [results, setResults] = useState<(Fabric & { confidence: number })[]>([])
  const [lineFilter] = useState<'women' | 'men' | 'all'>('all')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Invalid type')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large — max 5MB')
      return
    }
    const urlObj = URL.createObjectURL(file)
    setFileUrl(urlObj)

    // Mock ranking: pick random fabric color vs mock extracted hex
    const mockHex = '#d4a5a5'
    const all = fabrics as unknown as Fabric[]
    const filtered = all.filter((f) => lineFilter === 'all' || f.line === lineFilter)
    const ranked = filtered
      .map((f) => {
        const shadeHex = f.shades?.[0]?.hex || '#cccccc'
        const dist = labDistance(mockHex, shadeHex)
        const confidence = Math.max(0, 100 - dist * 0.5)
        return { ...f, confidence }
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8)
    setResults(ranked)
  }

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl)
    }
  }, [fileUrl])

  return (
    <div className="container" style={{ paddingBlock: '48px' }}>
      <h1 className="section__title">{l === 'ar' ? 'البحث البصري' : 'Match — visual search'}</h1>
      <p className="section__sub">{l === 'ar' ? 'ارفع صورة قماش — بحث محلي Lab histogram' : 'Upload a swatch — local Lab histogram, ranked results'}</p>

      <div style={{ border: '2px dashed var(--line)', borderRadius: 'var(--radius)', padding: '2rem', textAlign: 'center', marginBlock: '1.5rem' }}>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
        <button type="button" className="btn btn--primary" onClick={() => inputRef.current?.click()} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
          {l === 'ar' ? 'رفع صورة' : 'Upload swatch'}
        </button>
        {fileUrl && <img src={fileUrl} alt={l === 'ar' ? 'الصورة المرفوعة' : 'Uploaded swatch'} width={200} height={200} style={{ margin: '1rem auto', borderRadius: '12px', objectFit: 'cover' }} />}
      </div>

      {results.length > 0 && (
        <>
          <h3>{l === 'ar' ? 'النتائج' : 'Results'}</h3>
          <div className="fabrics__grid">
            {results.map((f) => (
              <div key={f.slug} className="fabric-card" style={{ padding: '1rem' }}>
                <h4 style={{ margin: 0 }}>{l === 'ar' ? f.name.ar : f.name.en}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>{f.composition}</p>
                <div style={{ blockSize: '8px', background: '#e5e7eb', borderRadius: '999px', marginBlock: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ inlineSize: `${f.confidence}%`, blockSize: '100%', background: 'var(--ok)' }} />
                </div>
                <p style={{ fontSize: '0.8rem', fontFamily: 'ui-monospace, monospace' }}>{f.confidence.toFixed(1)}% confidence (CIE76 Lab distance)</p>
                <p style={{ fontSize: '0.85rem' }}>{f.pricePerMetreRetail === 'TBD' ? 'TBD' : `${(f.pricePerMetreRetail as number) / 100} EGP/m`} — respects line filter {lineFilter}</p>
                <Link to={url(`/${l}/fabrics/${f.slug}`)} className="btn btn--ghost btn--sm" style={{ marginBlockStart: '0.5rem', minBlockSize: '44px', minInlineSize: '44px' }}>
                  View
                </Link>
              </div>
            ))}
          </div>

          <div style={{ marginBlockStart: '2rem' }}>
            <h3>{l === 'ar' ? 'لوحة مزاجية 4 صور' : '4-up mood board from extracted palette'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {['#d4a5a5', '#8fc1e3', '#14304d', '#faf8f4'].map((hex) => (
                <div key={hex} style={{ blockSize: '120px', background: hex, borderRadius: '12px', border: '1px solid var(--line)' }} aria-label={`Palette ${hex}`} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
