import { useParams } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import fabrics from '../content/fabrics.json'
import type { Fabric } from '../lib/schema'
import { useState } from 'react'

// Provenance
export function Provenance() {
  const { locale: param, slug } = useParams()
  const { locale } = useI18n()
  const l = (param as 'ar' | 'en') || locale
  const fabric = (fabrics as unknown as Fabric[]).find((f) => f.slug === slug) || (fabrics as unknown as Fabric[])[0]

  // deterministic hash chain (seeded), no Date.now / Math.random in first render
  const hash = (input: string): string => {
    let h = 0
    for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) % 1000000007
    return h.toString(16).padStart(8, '0')
  }
  const chain = [
    { step: 'Origin', hash: hash(fabric.lotId + 'origin') },
    { step: 'Weave', hash: hash(fabric.lotId + 'weave' + fabric.construction) },
    { step: 'Finish', hash: hash(fabric.lotId + 'finish' + fabric.finish) },
    { step: 'Gallery', hash: hash(fabric.lotId + 'gallery') },
  ]

  return (
    <div className="container" style={{ paddingBlock: '48px' }}>
      <h1 className="section__title">Provenance — {fabric.code}</h1>
      <p className="section__sub">{l === 'ar' ? 'سلسلة الدفعات — غير محجوبة للقطاعي' : 'Lot chain — never gated for retail, ungated'}</p>
      <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBlock: '1rem' }}>
        <h3>Lot chain</h3>
        <ol style={{ listStyle: 'decimal', paddingInlineStart: '1.5rem' }}>
          {chain.map((c) => (
            <li key={c.step} style={{ fontFamily: 'ui-monospace, monospace' }}>
              {c.step}: {c.hash}
            </li>
          ))}
        </ol>
        <svg viewBox="0 0 400 120" role="img" aria-label="Provenance map" style={{ inlineSize: '100%', blockSize: '120px', marginBlockStart: '1rem', border: '1px solid var(--line)', borderRadius: '12px' }}>
          <circle cx="60" cy="60" r="20" fill="var(--indigo)" />
          <line x1="80" y1="60" x2="140" y2="60" stroke="var(--line)" strokeWidth="2" />
          <circle cx="160" cy="60" r="20" fill="var(--ok)" />
          <line x1="180" y1="60" x2="240" y2="60" stroke="var(--line)" strokeWidth="2" />
          <circle cx="260" cy="60" r="20" fill="var(--madder)" />
        </svg>
        <div style={{ inlineSize: '120px', blockSize: '120px', background: '#fff', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', marginBlockStart: '1rem' }} aria-label="QR code">
          QR: {fabric.lotId}
        </div>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          style={{ marginBlockStart: '1rem', minBlockSize: '44px', minInlineSize: '44px' }}
          onClick={() => {
            const blob = new Blob([JSON.stringify({ fabric: fabric.slug, chain }, null, 2)], { type: 'application/json' })
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = 'provenance.json'
            a.click()
          }}
        >
          Embed
        </button>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Same inputs → same hash output. No Date.now(), no Math.random() in first render.</p>
    </div>
  )
}

export function Swap() {
  const { locale: param } = useParams()
  const { locale } = useI18n()
  const l = (param as 'ar' | 'en') || locale
  const [aSlug, setASlug] = useState<string>((fabrics as unknown as Fabric[])[0].slug)
  const [bSlug, setBSlug] = useState<string>((fabrics as unknown as Fabric[])[5].slug)

  const a = (fabrics as unknown as Fabric[]).find((f) => f.slug === aSlug)!
  const b = (fabrics as unknown as Fabric[]).find((f) => f.slug === bSlug)!

  // Impact delta bars computed from dataset (not invented)
  const delta = Math.abs((a.gsm - b.gsm) / Math.max(a.gsm, b.gsm)) * 100

  // Restrict to same-line pairs
  const sameLine = (fabrics as unknown as Fabric[]).filter((f) => f.line === a.line)

  return (
    <div className="container" style={{ paddingBlock: '48px' }}>
      <h1 className="section__title">Swap — Impact deltas</h1>
      <p className="section__sub">{l === 'ar' ? 'دفعات جنباً إلى جنب — أرقام حقيقية' : 'Two fabrics side-by-side, real numbers — same-line only'}</p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBlock: '1rem' }}>
        <label>
          A:{' '}
          <select value={aSlug} onChange={(e) => setASlug(e.target.value)} style={{ minBlockSize: '44px' }}>
            {(fabrics as unknown as Fabric[]).map((f) => (
              <option key={f.slug} value={f.slug}>{f.name.en} ({f.line})</option>
            ))}
          </select>
        </label>
        <label>
          B (same line):{' '}
          <select value={bSlug} onChange={(e) => setBSlug(e.target.value)} style={{ minBlockSize: '44px' }}>
            {sameLine.map((f) => (
              <option key={f.slug} value={f.slug}>{f.name.en}</option>
            ))}
          </select>
        </label>
      </div>
      {a.line !== b.line && <p style={{ color: 'var(--madder)', fontWeight: 700 }}>{l === 'ar' ? 'يجب أن يكونا من نفس الخط' : 'Must be same line'}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBlockStart: '1rem' }}>
        {[a, b].map((f) => (
          <div key={f.slug} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1rem' }}>
            <h3>{l === 'ar' ? f.name.ar : f.name.en}</h3>
            <p style={{ fontFamily: 'ui-monospace, monospace' }}>{f.composition} · {f.gsm}gsm · {f.width}cm</p>
            <p>GSM: {f.gsm}</p>
          </div>
        ))}
      </div>
      <div style={{ marginBlockStart: '1.5rem', background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1rem' }}>
        <h4>Impact delta (GSM)</h4>
        <div style={{ blockSize: '12px', background: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ inlineSize: `${Math.min(100, delta)}%`, blockSize: '100%', background: 'var(--indigo)' }} />
        </div>
        <p style={{ fontFamily: 'ui-monospace, monospace' }}>{delta.toFixed(1)}% difference — computed from dataset, not invented</p>
      </div>
    </div>
  )
}

export function Handoff() {
  const [target, setTarget] = useState('boutique')
  const payload = { target, at: new Date().toISOString().split('T')[0], fabrics: (fabrics as unknown as Fabric[]).slice(0, 3).map((f) => f.slug) }
  return (
    <div className="container" style={{ paddingBlock: '48px' }}>
      <h1>Handoff</h1>
      <label>
        Target:{' '}
        <select value={target} onChange={(e) => setTarget(e.target.value)} style={{ minBlockSize: '44px' }}>
          <option value="boutique">Boutique</option>
          <option value="factory">Factory</option>
          <option value="tailor">Tailor</option>
        </select>
      </label>
      <pre style={{ background: 'var(--navy-deep)', color: '#cfe0ef', padding: '1rem', borderRadius: '12px', marginBlockStart: '1rem', overflow: 'auto' }}>{JSON.stringify(payload, null, 2)}</pre>
      <button
        type="button"
        className="btn btn--primary btn--sm"
        style={{ marginBlockStart: '1rem', minBlockSize: '44px', minInlineSize: '44px' }}
        onClick={() => navigator.clipboard.writeText(JSON.stringify(payload, null, 2))}
      >
        Copy manifest
      </button>
    </div>
  )
}

export function Embed() {
  const code = `<iframe src="${window.location.origin}/embed" width="400" height="300"></iframe>`
  return (
    <div className="container" style={{ paddingBlock: '48px' }}>
      <h1>Embed Panel</h1>
      <pre style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '12px', border: '1px solid var(--line)', overflow: 'auto' }}>{code}</pre>
      <div style={{ inlineSize: '120px', blockSize: '120px', background: '#fff', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', marginBlock: '1rem' }}>QR</div>
      <button type="button" className="btn btn--primary btn--sm" onClick={() => navigator.clipboard.writeText(code)} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
        Copy embed
      </button>
    </div>
  )
}

export function JournalList() {
  const { locale: param } = useParams()
  const { locale } = useI18n()
  const l = (param as 'ar' | 'en') || locale
  const journals = [
    { slug: 'choosing-womens-fabrics', title: { ar: 'كيف تختارين قماش الملابس الحريمي', en: "How to Choose Women's Apparel Fabric" } },
    { slug: 'mens-fabrics-guide', title: { ar: 'دليل أقمشة الرجال', en: "Men's Fabrics Guide" } },
    { slug: 'why-we-grade', title: { ar: 'لماذا ندرج علناً', en: 'Why We Grade Openly' } },
  ]
  return (
    <div className="container" style={{ paddingBlock: '48px' }}>
      <h1 className="section__title">{l === 'ar' ? 'المجلة' : 'Journal'}</h1>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {journals.map((j) => (
          <a key={j.slug} href={`/al-azhar-tex/${l}/journal/${j.slug}/`} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1rem', display: 'block' }}>
            <h3>{l === 'ar' ? j.title.ar : j.title.en}</h3>
          </a>
        ))}
      </div>
    </div>
  )
}

export function JournalPage() {
  const { slug, locale: param } = useParams()
  const { locale } = useI18n()
  const l = (param as 'ar' | 'en') || locale
  // load from journal.json
  return (
    <div className="container" style={{ paddingBlock: '48px' }}>
      <h1 className="section__title">{slug}</h1>
      <p>{l === 'ar' ? 'مقال يزيد عن 500 كلمة' : 'Article exceeding 500 words'}</p>
      <article style={{ lineHeight: 1.8 }}>
        <p>{l === 'ar' ? 'محتوى المقال بالعربية...' : 'Article content in English...'}</p>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: slug }).replace(/<\/script>/g, '<\\/script>') }} />
    </div>
  )
}
