import { useParams, Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { url } from '../lib/url'
import gallery from '../content/gallery.json'
import fabrics from '../content/fabrics.json'
import type { Fabric } from '../lib/schema'
import { COMPANY } from '../data/company'
import { waRetailGeneric } from '../lib/wa'
import { useState } from 'react'

export function Gallery() {
  const { locale: param } = useParams()
  const { locale } = useI18n()
  const l = (param as 'ar' | 'en') || locale
  const [mapActive, setMapActive] = useState(false)

  const onFloor = (fabrics as unknown as Fabric[]).filter((f) => f.saleMode === 'retail' || f.saleMode === 'both').slice(0, 6)

  return (
    <div>
      <section className="hero" style={{ paddingBlock: '64px' }}>
        <div className="container">
          <h1 className="hero__title">{l === 'ar' ? 'معرض الأزهر تكس' : 'Al Azhar Tex Gallery'}</h1>
          <p className="hero__lead">{l === 'ar' ? gallery.address.ar : gallery.address.en}</p>
          <figure style={{ marginBlockStart: '1.5rem' }}>
            <img src={url((gallery.hero.image as string).replace(/^\//, ''))} alt={l === 'ar' ? gallery.hero.alt.ar : gallery.hero.alt.en} width={1600} height={1067} style={{ inlineSize: '100%', aspectRatio: '3 / 2', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
            <figcaption style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBlockStart: '0.5rem' }}>{l === 'ar' ? 'واجهة المعرض' : 'Gallery frontage'}</figcaption>
          </figure>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBlockStart: '1.5rem' }}>
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1rem' }}>
              <p style={{ fontWeight: 700 }}>{l === 'ar' ? 'العنوان' : 'Address'}</p>
              <p>{l === 'ar' ? gallery.address.ar : gallery.address.en}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{l === 'ar' ? gallery.parkingNote.ar : gallery.parkingNote.en}</p>
            </div>
            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1rem' }}>
              <p style={{ fontWeight: 700 }}>{l === 'ar' ? 'ساعات العمل' : 'Hours'}</p>
              <p>
                <span className="chip chip--tbd">TBD</span> {gallery.hours}
              </p>
              <p>
                <a href={COMPANY.phone1Href} style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {COMPANY.phone1Display}
                </a>{' '}
                (Retail)
              </p>
              <p>
                <a href={COMPANY.phone2Href} style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {COMPANY.phone2Display}
                </a>{' '}
                (Wholesale)
              </p>
            </div>
          </div>

          <div style={{ marginBlockStart: '1.5rem' }}>
            {!mapActive ? (
              <button type="button" className="btn btn--ghost" onClick={() => setMapActive(true)} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
                {l === 'ar' ? 'عرض الخريطة' : 'Show map'}
              </button>
            ) : (
              <iframe title="Map" src={gallery.mapUrl === 'TBD' ? 'https://www.openstreetmap.org/export/embed.html?bbox=31.5%2C30.5%2C31.7%2C30.6&layer=mapnik' : gallery.mapUrl} style={{ inlineSize: '100%', blockSize: '320px', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }} loading="lazy" />
            )}
          </div>

          <div style={{ background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1.2rem', marginBlockStart: '1.5rem' }}>
            <p style={{ fontFamily: 'var(--font-head)', fontStyle: 'italic', fontSize: '1.1rem' }}>{l === 'ar' ? gallery.hero.alt.ar : gallery.hero.alt.en}</p>
            <p>{l === 'ar' ? COMPANY.retailCutNoticeAr : COMPANY.retailCutNoticeEn}</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{l === 'ar' ? 'بنقطع بالمتر من أول متر. اختار القماش، شوفه على الطبيعة، وهنقطعه لك.' : 'We cut by the metre from the first metre. Pick the fabric, see it under real light, and we\'ll cut it.'}</p>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBlockStart: '1rem' }}>
              <a href={waRetailGeneric()} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--sm" style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
                {l === 'ar' ? 'واتساب المعرض (قطاعي)' : 'WhatsApp retail'}
              </a>
              <a href={`https://wa.me/${COMPANY.whatsapp2.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(l === 'ar' ? 'مرحباً الأزهر تكس، عايز أستفسر عن المتاح عندكم.' : 'Hello Al Azhar Tex, inquiry')}`} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm" style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
                {l === 'ar' ? 'واتساب الجملة' : 'WhatsApp wholesale'}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section__title">{l === 'ar' ? 'المتاح اليوم في المعرض' : "What's on the floor today"}</h2>
          <p className="section__sub">{l === 'ar' ? 'من الأقمشة المتاحة قطاعي — مباشر من المخزن' : 'Live retail SKUs — pulled from stock, not hardcoded'}</p>
          <div className="fabrics__grid">
            {onFloor.map((f) => (
              <Link key={f.slug} to={url(`/${l}/fabrics/${f.slug}`)} className="fabric-card" style={{ padding: '1rem' }}>
                <img src={url(f.images[0]?.src.replace(/^\//, '') || 'assets/hero.jpg')} alt={f.images[0]?.alt || f.name.en} width={400} height={267} style={{ inlineSize: '100%', aspectRatio: '3/2', objectFit: 'cover', borderRadius: '12px' }} />
                <h3 style={{ marginBlock: '0.6rem 0.2rem', fontFamily: 'var(--font-head)' }}>{l === 'ar' ? f.name.ar : f.name.en}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>{f.composition} · {f.gsm}gsm</p>
                <span className="chip chip--mono" style={{ marginBlockStart: '0.5rem' }}>
                  {f.code}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
