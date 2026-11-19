import { useParams, Link } from 'react-router-dom'
import fabricsData from '../content/fabrics.json'
import type { Fabric } from '../lib/schema'
import { useI18n, formatPrice } from '../lib/i18n'
import { url } from '../lib/url'
import { GradeChip, GradeStrip } from '../components/ui/GradeChip'
import { TBDChip } from '../components/ui/TBDChip'
import { RenderTag } from '../components/ui/RenderTag'
import { SaleBadge } from '../components/ui/SaleBadge'
import { MOQStepper } from '../components/ui/MOQSepper'
import { useEffect, useState } from 'react'
import { KEYS, safeGet, safeSet, dispatchStoreEvent } from '../lib/store'
import { waRetail, waWholesaleAB, waWholesaleC } from '../lib/wa'
import { COMPANY } from '../data/company'

export function Product() {
  const { slug, locale: param } = useParams()
  const { locale } = useI18n()
  const l = (param as 'ar' | 'en') || locale
  const fabric = (fabricsData as unknown as Fabric[]).find((f) => f.slug === slug)
  const [metres, setMetres] = useState(1)
  const [role, setRole] = useState<'visitor' | 'registered' | 'verified'>('visitor')
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'bench' | 'wash'>('desc')
  const [light, setLight] = useState<'neutral' | 'D50' | 'D65' | 'TL84' | 'horizon' | 'UV'>('neutral')

  useEffect(() => {
    const v = safeGet<string>(KEYS.tradeRole, 'visitor')
    if (v === 'registered' || v === 'verified') setRole(v as 'visitor' | 'registered' | 'verified')
  }, [])

  useEffect(() => {
    if (!fabric) return
    const step = fabric.saleMode === 'retail' ? 1 : 5
    const min = fabric.saleMode === 'retail' ? 1 : fabric.moqM
    setMetres(min)
    // For retail tab, keep min 1, for wholesale min moqM
    // MOQStepper will handle
    void step
  }, [fabric])

  if (!fabric) {
    return (
      <div className="container" style={{ paddingBlock: '64px', textAlign: 'center' }}>
        <h1>{l === 'ar' ? 'غير موجود' : 'Not found'}</h1>
        <Link to={url(`/${l}/fabrics`)} className="btn btn--primary" style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
          {l === 'ar' ? 'العودة' : 'Back to fabrics'}
        </Link>
      </div>
    )
  }

  const name = l === 'ar' ? fabric.name.ar : fabric.name.en
  const isRetail = fabric.saleMode !== 'wholesale'
  const isWholesale = fabric.saleMode !== 'retail'
  const isMensTrouser = fabric.line === 'men' && fabric.gsm >= 240

  const handleAddWholesale = (): void => {
    const list = safeGet<unknown[]>(KEYS.wholesaleList, [])
    const arr = Array.isArray(list) ? list : []
    const existing = arr.findIndex((x) => (x as { slug: string }).slug === fabric.slug)
    const item = { slug: fabric.slug, grade: fabric.grade, metres, addedAt: new Date().toISOString() }
    if (existing >= 0) {
      arr[existing] = item
    } else {
      if (arr.length >= 50) return // capped 50
      arr.push(item)
    }
    safeSet(KEYS.wholesaleList, arr)
    dispatchStoreEvent()
    alert(l === 'ar' ? 'أضيف إلى قائمة العينات' : 'Added to sample list')
  }

  const handleAddRetail = (): void => {
    const list = safeGet<unknown[]>(KEYS.retailMetres, [])
    const arr = Array.isArray(list) ? list : []
    const existing = arr.findIndex((x) => (x as { slug: string }).slug === fabric.slug)
    const item = { slug: fabric.slug, grade: fabric.grade, metres, addedAt: new Date().toISOString() }
    if (existing >= 0) {
      arr[existing] = item
    } else {
      if (arr.length >= 25) return // capped 25
      arr.push(item)
    }
    safeSet(KEYS.retailMetres, arr)
    dispatchStoreEvent()
    alert(l === 'ar' ? 'أضيف إلى قائمة الأمتار' : 'Added to metres list')
  }

  const retailPriceRow = (
    <div className="price-row">
      <span>{l === 'ar' ? 'سعر المتر القطاعي' : 'Retail price per metre'}</span>
      <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}>
        {fabric.pricePerMetreRetail === 'TBD' ? <TBDChip /> : formatPrice(fabric.pricePerMetreRetail as number, l as 'ar' | 'en')}
      </span>
    </div>
  )

  const wholesalePriceRow = (
    <div className="price-row">
      <span>{l === 'ar' ? 'سعر الجملة' : 'Wholesale price'}</span>
      <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}>
        {role === 'visitor' ? (
          <span style={{ color: 'var(--muted)' }}>{l === 'ar' ? 'سجّل لعرض سعر الجملة' : 'Register to see wholesale price'}</span>
        ) : fabric.pricePerLotWholesale === 'TBD' ? (
          <TBDChip />
        ) : (
          formatPrice(fabric.pricePerLotWholesale as number, l as 'ar' | 'en')
        )}
      </span>
    </div>
  )

  const related = (fabricsData as unknown as Fabric[]).filter((f) => f.slug !== fabric.slug && f.line === fabric.line && fabric.alternatives.includes(f.slug)).slice(0, 4)

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    sku: fabric.code,
    category: fabric.category,
    offers: isRetail
      ? {
          '@type': 'Offer',
          priceCurrency: 'EGP',
          price: fabric.pricePerMetreRetail === 'TBD' ? undefined : (fabric.pricePerMetreRetail as number) / 100,
          availability: fabric.availability === 'in-stock' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        }
      : {
          '@type': 'Offer',
          businessFunction: 'http://purl.org/goodrelations/v1#LeaseOut',
          priceCurrency: 'EGP',
          availability: 'https://schema.org/InStock',
        },
  }
  const jsonLdStr = JSON.stringify(jsonLd).replace(/<\/script>/g, '<\\/script>')

  return (
    <div className="container" style={{ paddingBlock: '48px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdStr }} />

      <Link to={url(`/${l}/fabrics`)} className="btn btn--ghost btn--sm" style={{ marginBlockEnd: '1rem', minBlockSize: '44px', minInlineSize: '44px' }}>
        {l === 'ar' ? '‹ العودة للأقمشة' : '‹ Back to fabrics'}
      </Link>

      <div className="product-layout">
        <div className="product-media">
          <div style={{ position: 'relative' }}>
            <img
              src={url(fabric.images[0]?.src.replace(/^\//, '') || 'assets/hero.jpg')}
              alt={fabric.images[0]?.alt || name}
              width={800}
              height={1000}
              style={{ filter: light === 'neutral' ? 'none' : light === 'D50' ? 'brightness(1.05) contrast(1.05)' : light === 'D65' ? 'brightness(1.1)' : light === 'TL84' ? 'sepia(0.2) saturate(1.2)' : light === 'horizon' ? 'brightness(0.95) sepia(0.1)' : 'saturate(1.5) hue-rotate(10deg)' }}
            />
            <button type="button" className="btn btn--ghost btn--sm" style={{ position: 'absolute', insetBlockStart: '12px', insetInlineEnd: '12px', background: 'rgba(255,255,255,0.9)', minBlockSize: '44px', minInlineSize: '44px' }} aria-label="Hold overlay">
              {l === 'ar' ? 'ثبّت' : 'Hold'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBlockStart: '0.8rem', flexWrap: 'wrap' }}>
            {(['neutral', 'D50', 'D65', 'TL84', 'horizon', 'UV'] as const).map((ill) => (
              <button key={ill} type="button" className={`chip ${light === ill ? 'chip--blue' : 'chip--mono'}`} onClick={() => setLight(ill)} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
                {ill}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBlockStart: '0.6rem' }}>
            {l === 'ar' ? 'جرّب الإضاءة قبل الزيارة — عندنا نفس الإضاءة في المعرض' : 'Preview the light before you visit — the gallery matches this setup'}
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', marginBlockStart: '1rem' }}>
            <Link to={url(`/${l}/twin/${fabric.slug}`)} className="btn btn--ghost btn--sm" style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
              {l === 'ar' ? 'تصور' : 'Visualise'}
            </Link>
            {fabric.images[0]?.source === 'render' && <RenderTag />}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <GradeChip grade={fabric.grade} />
            <SaleBadge saleMode={fabric.saleMode} />
            <span className="chip chip--mono">{fabric.lotId}</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-head)', color: 'var(--navy)', fontSize: '2rem', marginBlock: '0.6rem' }}>{name}</h1>
          <p style={{ color: 'var(--muted)' }}>{fabric.composition} · {fabric.gsm}gsm · {fabric.width}cm · {fabric.category}</p>

          <div className="price-block" style={{ marginBlock: '1rem' }}>
            {isRetail && retailPriceRow}
            {isRetail && <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: 0 }}>{l === 'ar' ? 'يُقطع من المعرض بالمتر' : 'Cut by the metre at the gallery'}</p>}
            {isWholesale && wholesalePriceRow}
            {fabric.pricePerMetreRetail === 'TBD' && <p style={{ fontSize: '0.8rem', color: '#92400e' }}>{l === 'ar' ? 'اتصل للسعر' : 'Call for price'}</p>}
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBlockEnd: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBlockEnd: '0.3rem' }}>{l === 'ar' ? 'الكمية (متر)' : 'Quantity (metres)'}</label>
              <MOQStepper value={metres} onChange={setMetres} min={fabric.saleMode === 'retail' ? 1 : fabric.moqM} step={fabric.saleMode === 'retail' ? 1 : 5} label="metres" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBlockEnd: '1.5rem' }}>
            {isRetail && (
              <>
                {fabric.saleMode === 'retail' ? (
                  <a
                    href={waRetail({ code: fabric.code, name, grade: fabric.grade }, metres)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--primary"
                    style={{ minBlockSize: '44px', minInlineSize: '44px' }}
                  >
                    {l === 'ar' ? 'اطلب على واتساب' : 'Order on WhatsApp'} ({metres}m)
                  </a>
                ) : (
                  <Link to={url(`/${l}/gallery?sku=${fabric.slug}`)} className="btn btn--primary" style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
                    {l === 'ar' ? 'زيارة المعرض للشراء' : 'Buy at the gallery'}
                  </Link>
                )}
                <button type="button" className="btn btn--ghost" onClick={handleAddRetail} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
                  {l === 'ar' ? 'أضف لقائمة الأمتار' : 'Add to metres list'}
                </button>
              </>
            )}
            {isWholesale && (
              <>
                <a
                  href={fabric.grade === 'C' ? waWholesaleC({ code: fabric.code, name, grade: fabric.grade }) : waWholesaleAB({ code: fabric.code, name, grade: fabric.grade }, metres)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--primary"
                  style={{ minBlockSize: '44px', minInlineSize: '44px' }}
                >
                  {l === 'ar' ? 'اطلب عرض سعر' : 'Request a quote'}
                </a>
                <button type="button" className="btn btn--ghost" onClick={handleAddWholesale} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
                  {l === 'ar' ? 'أضف للعينات' : 'Add to sample list'}
                </button>
              </>
            )}
          </div>

          <div className="spec-table" style={{ marginBlockEnd: '1rem' }}>
            <table>
              <tbody>
                <tr>
                  <th>{l === 'ar' ? 'التركيب' : 'Composition'}</th>
                  <td>{fabric.composition}</td>
                </tr>
                <tr>
                  <th>GSM</th>
                  <td>{fabric.gsm}</td>
                </tr>
                <tr>
                  <th>{l === 'ar' ? 'العرض' : 'Width'}</th>
                  <td>{fabric.width}cm</td>
                </tr>
                <tr>
                  <th>{l === 'ar' ? 'البنية' : 'Construction'}</th>
                  <td>{fabric.construction}</td>
                </tr>
                <tr>
                  <th>{l === 'ar' ? 'التشطيب' : 'Finish'}</th>
                  <td>{fabric.finish}</td>
                </tr>
                <tr>
                  <th>MOQ</th>
                  <td>{fabric.moqM}m</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1rem', marginBlockEnd: '1rem' }}>
            <h3 style={{ marginBlockStart: 0 }}>{l === 'ar' ? 'ملاحظات الدرجة' : 'Grade Notes'}</h3>
            <p>{l === 'ar' ? fabric.gradeNotes?.ar : fabric.gradeNotes?.en}</p>
            <ul style={{ listStyle: 'disc', paddingInlineStart: '1.2rem', fontSize: '0.9rem' }}>
              <li>{l === 'ar' ? 'فحص يدوي لكل لفة' : 'Hand-inspected per bolt'}</li>
              <li>{l === 'ar' ? 'تصوير ماكرو دليل' : 'Macro evidence documented'}</li>
              <li>{l === 'ar' ? 'تسعير شفاف حسب الدرجة' : 'Transparent pricing by grade'}</li>
            </ul>
            <GradeStrip />
          </div>

          <div className="tabs" role="tablist">
            <button type="button" role="tab" aria-selected={activeTab === 'desc'} className={`tab-btn ${activeTab === 'desc' ? 'is-active' : ''}`} onClick={() => setActiveTab('desc')} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
              {l === 'ar' ? 'الوصف' : 'Description'}
            </button>
            <button type="button" role="tab" aria-selected={activeTab === 'specs'} className={`tab-btn ${activeTab === 'specs' ? 'is-active' : ''}`} onClick={() => setActiveTab('specs')} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
              {l === 'ar' ? 'المواصفات' : 'Specs'}
            </button>
            <button type="button" role="tab" aria-selected={activeTab === 'bench'} className={`tab-btn ${activeTab === 'bench' ? 'is-active' : ''}`} onClick={() => setActiveTab('bench')} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
              Bench
            </button>
            {isMensTrouser && (
              <button type="button" role="tab" aria-selected={activeTab === 'wash'} className={`tab-btn ${activeTab === 'wash' ? 'is-active' : ''}`} onClick={() => setActiveTab('wash')} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
                Wash Lab
              </button>
            )}
          </div>

          {activeTab === 'desc' && <p>{l === 'ar' ? fabric.gradeNotes?.ar : fabric.gradeNotes?.en}</p>}
          {activeTab === 'specs' && <p>{fabric.composition} — {fabric.construction} — {fabric.finish}</p>}
          {activeTab === 'bench' && (
            <div className="chart-wrap">
              <figure>
                <figcaption>Bench — {name} (weight / drape / breathability)</figcaption>
                <svg viewBox="0 0 300 120" role="img" aria-label={`Bench chart for ${name}`}>
                  <rect x="20" y="20" width={(fabric.bench?.weight || 70) * 2} height="20" fill="var(--indigo)" />
                  <rect x="20" y="50" width={(fabric.bench?.drape || 60) * 2} height="20" fill="var(--ok)" />
                  <rect x="20" y="80" width={(fabric.bench?.breathability || 75) * 2} height="20" fill="var(--madder)" />
                  <text x="20" y="14" fontSize="10">Weight</text>
                  <text x="20" y="44" fontSize="10">Drape</text>
                  <text x="20" y="74" fontSize="10">Breathability</text>
                </svg>
                <table>
                  <caption>Bench data for {name}</caption>
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Weight</td>
                      <td>{fabric.bench?.weight}</td>
                    </tr>
                    <tr>
                      <td>Drape</td>
                      <td>{fabric.bench?.drape}</td>
                    </tr>
                    <tr>
                      <td>Breathability</td>
                      <td>{fabric.bench?.breathability}</td>
                    </tr>
                  </tbody>
                </table>
              </figure>
            </div>
          )}
          {activeTab === 'wash' && isMensTrouser && (
            <WashLab fabric={fabric} l={l} />
          )}

          {related.length > 0 && (
            <div style={{ marginBlockStart: '2rem' }}>
              <h3>{l === 'ar' ? 'أقمشة مشابهة (نفس الخط)' : 'Related fabrics (same line)'}</h3>
              <div className="fabrics__grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                {related.map((f) => (
                  <Link key={f.slug} to={url(`/${l}/fabrics/${f.slug}`)} className="fabric-card" style={{ padding: '1rem' }}>
                    <h4 style={{ margin: 0 }}>{l === 'ar' ? f.name.ar : f.name.en}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>{f.composition}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky-bar" role="region" aria-label="Actions">
        {isRetail && <Link to={url(`/${l}/gallery?sku=${fabric.slug}`)} className="btn btn--primary btn--sm" style={{ minBlockSize: '44px', minInlineSize: '44px' }}>{l === 'ar' ? 'زيارة المعرض للشراء' : 'Buy at the gallery'}</Link>}
        {isWholesale && <a href={fabric.grade === 'C' ? waWholesaleC({ code: fabric.code, name, grade: fabric.grade }) : waWholesaleAB({ code: fabric.code, name, grade: fabric.grade }, metres)} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm" style={{ minBlockSize: '44px', minInlineSize: '44px' }}>{l === 'ar' ? 'اطلب عرض سعر' : 'Request a quote'}</a>}
      </div>
    </div>
  )
}

function WashLab({ fabric, l }: { fabric: Fabric; l: string }) {
  const [params, setParams] = useState({ temp: 40, time: 30, detergent: 1, agitation: 2 })
  const [recipes, setRecipes] = useState<Record<string, typeof params>>({})

  useEffect(() => {
    try {
      const raw = localStorage.getItem('azt:v1:wash')
      if (raw) setRecipes(JSON.parse(raw))
    } catch {}
  }, [])

  const saveRecipe = (name: string): void => {
    if (Object.keys(recipes).length >= 4) {
      if (!confirm(l === 'ar' ? 'الحد 4 وصفات — استبدال الأقدم؟' : 'Limit 4 recipes — overwrite oldest?')) return
    }
    const next = { ...recipes, [name]: { ...params } }
    // cap 4, overwrite prompt already handled
    const keys = Object.keys(next)
    if (keys.length > 4) {
      const first = keys[0]
      delete next[first]
    }
    setRecipes(next)
    try {
      localStorage.setItem('azt:v1:wash', JSON.stringify(next))
    } catch {}
  }

  return (
    <div>
      <p>{l === 'ar' ? 'تجربة الغسيل — 4 وصفات محفوظة' : 'Wash Lab — 4 recipes max'}</p>
      <div style={{ display: 'grid', gap: '0.8rem' }}>
        {(['temp', 'time', 'detergent', 'agitation'] as const).map((k) => (
          <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ inlineSize: '120px', fontWeight: 600 }}>{k}</span>
            <input
              type="range"
              min={k === 'temp' ? 20 : k === 'time' ? 5 : 1}
              max={k === 'temp' ? 90 : k === 'time' ? 90 : 5}
              value={params[k]}
              onChange={(e) => setParams((p) => ({ ...p, [k]: parseInt(e.target.value, 10) }))}
              aria-label={k}
              aria-valuetext={`${k} ${params[k]}`}
              style={{ flex: 1 }}
            />
            <span style={{ fontFamily: 'ui-monospace, monospace' }}>{params[k]}</span>
          </label>
        ))}
      </div>
      <div style={{ blockSize: '120px', background: `linear-gradient(90deg, #e8c9d2, #14304d)`, filter: `brightness(${0.9 + params.temp / 200}) contrast(${0.9 + params.agitation / 10})`, borderRadius: 'var(--radius)', marginBlock: '1rem' }} aria-label="Shader preview" />
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => saveRecipe(`Recipe ${Object.keys(recipes).length + 1}`)} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
          {l === 'ar' ? 'حفظ الوصفة' : 'Save recipe'}
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => {
            const blob = new Blob([JSON.stringify(recipes, null, 2)], { type: 'application/json' })
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = 'wash-recipes.json'
            a.click()
            setTimeout(() => URL.revokeObjectURL(a.href), 1000)
          }}
          style={{ minBlockSize: '44px', minInlineSize: '44px' }}
        >
          Export
        </button>
      </div>
      {Object.keys(recipes).length > 0 && (
        <ul style={{ marginBlockStart: '1rem', listStyle: 'disc', paddingInlineStart: '1.2rem' }}>
          {Object.entries(recipes).map(([name, r]) => (
            <li key={name}>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setParams(r)} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
                {name}: {JSON.stringify(r)}
              </button>
            </li>
          ))}
        </ul>
      )}
      <p style={{ marginBlockStart: '1rem', fontSize: '0.9rem', color: 'var(--muted)' }}>{l === 'ar' ? 'شوفها على الطبيعة في المعرض' : 'See it live at the gallery'}</p>
      <div style={{ display: 'flex', gap: '1rem', marginBlockStart: '1rem' }}>
        <div style={{ flex: 1, blockSize: '100px', background: '#d4a5a5', borderRadius: '12px' }} aria-label="Before" />
        <div style={{ flex: 1, blockSize: '100px', background: '#c9b0b0', borderRadius: '12px', filter: `brightness(${0.9 + params.detergent / 10})` }} aria-label="After" />
      </div>
    </div>
  )
}
