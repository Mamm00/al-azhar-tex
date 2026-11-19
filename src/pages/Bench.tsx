import { useParams, Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import fabrics from '../content/fabrics.json'
import type { Fabric } from '../lib/schema'
import { url } from '../lib/url'
import { useState } from 'react'

export function Bench() {
  const { locale: param } = useParams()
  const { locale } = useI18n()
  const l = (param as 'ar' | 'en') || locale
  const [aSlug, setASlug] = useState<string>((fabrics as unknown as Fabric[])[0].slug)
  const [bSlug, setBSlug] = useState<string>((fabrics as unknown as Fabric[])[1].slug)
  const a = (fabrics as unknown as Fabric[]).find((f) => f.slug === aSlug)!
  const b = (fabrics as unknown as Fabric[]).find((f) => f.slug === bSlug)!

  // Prevent cross-line pairs: restrict same-line
  const sameLineB = (fabrics as unknown as Fabric[]).filter((f) => f.line === a.line)

  return (
    <div className="container" style={{ paddingBlock: '48px' }}>
      <h1 className="section__title">Bench — {l === 'ar' ? 'مقارنة' : 'Comparison overlay'}</h1>
      <p className="section__sub">{l === 'ar' ? 'بدون مكتبة رسوم بيانية — SVG فقط' : 'No chart library — SVG only'}</p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBlock: '1rem' }}>
        <label>
          Fabric A:{' '}
          <select value={aSlug} onChange={(e) => setASlug(e.target.value)} style={{ minBlockSize: '44px', paddingInline: '0.6rem' }}>
            {(fabrics as unknown as Fabric[]).map((f) => (
              <option key={f.slug} value={f.slug}>
                {l === 'ar' ? f.name.ar : f.name.en}
              </option>
            ))}
          </select>
        </label>
        <label>
          Fabric B (same line):{' '}
          <select value={bSlug} onChange={(e) => setBSlug(e.target.value)} style={{ minBlockSize: '44px', paddingInline: '0.6rem' }}>
            {sameLineB.map((f) => (
              <option key={f.slug} value={f.slug}>
                {l === 'ar' ? f.name.ar : f.name.en}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="chart-wrap">
        <figure>
          <figcaption>
            Bench: {a.name.en} vs {b.name.en} — weight / drape / breathability (axes not mirrored in RTL)
          </figcaption>
          <svg viewBox="0 0 400 200" role="img" aria-label={`Bench comparison ${a.name.en} vs ${b.name.en}`}>
            {/* Axes - not mirrored in RTL */}
            <line x1="40" y1="10" x2="40" y2="170" stroke="var(--line)" strokeWidth="2" />
            <line x1="40" y1="170" x2="380" y2="170" stroke="var(--line)" strokeWidth="2" />
            {/* A bars */}
            <rect x="60" y="30" width={(a.bench?.weight || 70) * 1.2} height="20" fill="var(--indigo)" opacity="0.9" />
            <rect x="60" y="60" width={(a.bench?.drape || 60) * 1.2} height="20" fill="var(--ok)" opacity="0.9" />
            {/* B overlay */}
            <rect x="60" y="30" width={(b.bench?.weight || 70) * 1.2} height="20" fill="var(--indigo)" opacity="0.5" />
            <rect x="60" y="90" width={(b.bench?.drape || 60) * 1.2} height="20" fill="var(--madder)" opacity="0.7" />
            <text x="60" y="22" fontSize="10">
              Weight A vs B
            </text>
            <text x="60" y="52" fontSize="10">
              Drape A
            </text>
            <text x="60" y="82" fontSize="10">
              Drape B
            </text>
          </svg>
          <table>
            <caption>Bench data comparison</caption>
            <thead>
              <tr>
                <th>Fabric</th>
                <th>Weight</th>
                <th>Drape</th>
                <th>Breathability</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{a.name.en}</td>
                <td>{a.bench?.weight}</td>
                <td>{a.bench?.drape}</td>
                <td>{a.bench?.breathability}</td>
              </tr>
              <tr>
                <td>{b.name.en}</td>
                <td>{b.bench?.weight}</td>
                <td>{b.bench?.drape}</td>
                <td>{b.bench?.breathability}</td>
              </tr>
            </tbody>
          </table>
        </figure>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{l === 'ar' ? 'محور الرسم لا يُعكس في RTL' : 'Chart axes not mirrored in RTL'}</p>

      <div style={{ marginBlockStart: '1.5rem', display: 'flex', gap: '0.8rem' }}>
        <Link to={url(`/${l}/fabrics/${a.slug}`)} className="btn btn--ghost btn--sm" style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
          View A
        </Link>
        <Link to={url(`/${l}/fabrics/${b.slug}`)} className="btn btn--ghost btn--sm" style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
          View B
        </Link>
      </div>
    </div>
  )
}
