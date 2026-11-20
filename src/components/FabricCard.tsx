import { Link } from 'react-router-dom'
import type { Fabric } from '../lib/schema'
import { GradeChip } from './ui/GradeChip'
import { SaleBadge } from './ui/SaleBadge'
import { TBDChip } from './ui/TBDChip'
import { RenderTag } from './ui/RenderTag'
import { url } from '../lib/url'
import { useI18n, formatPrice } from '../lib/i18n'
import { useEffect, useState } from 'react'
import { KEYS, safeGet } from '../lib/store'

export function FabricCard({ fabric }: { fabric: Fabric }) {
  const { locale } = useI18n()
  const [role, setRole] = useState<string>('visitor')
  useEffect(() => {
    try {
      const v = safeGet<string>(KEYS.tradeRole, 'visitor')
      setRole(v)
    } catch {}
  }, [])
  const name = locale === 'ar' ? fabric.name.ar : fabric.name.en
  const priceRetail = fabric.pricePerMetreRetail
  const showWholesale = role !== 'visitor'
  const isRetail = fabric.saleMode !== 'wholesale'

  // Determine swatch class
  const swatchClass = fabric.images[0]?.source === 'render' ? 'swatch--general' : 'swatch--general'

  return (
    <article className="fabric-card" aria-label={name}>
      <div className={`fabric-card__swatch ${swatchClass}`} aria-hidden="true" />
      <div className="fabric-card__body">
        <div className="fabric-card__top">
          <h3 className="fabric-card__name">{name}</h3>
          <GradeChip grade={fabric.grade} />
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--blue-mid)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', margin: 0 }}>{fabric.composition} · {fabric.gsm}gsm</p>
        <SaleBadge saleMode={fabric.saleMode} />
        {fabric.images[0]?.source === 'render' && <RenderTag />}
        <div style={{ display: 'grid', gap: '0.4rem' }}>
          {isRetail && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.9rem', fontWeight: 700 }}>
                {priceRetail === 'TBD' ? <TBDChip /> : formatPrice(priceRetail as number, locale as 'ar' | 'en')}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{locale === 'ar' ? 'يُقطع من المعرض بالمتر' : 'Cut by the metre at the gallery'}</span>
            </div>
          )}
          {fabric.saleMode !== 'retail' && (
            <div style={{ fontSize: '0.85rem' }}>
              {showWholesale ? (
                fabric.pricePerLotWholesale === 'TBD' ? <TBDChip /> : <span style={{ fontFamily: 'ui-monospace, monospace' }}>{formatPrice(fabric.pricePerLotWholesale as number, locale as 'ar' | 'en')} lot</span>
              ) : (
                <span style={{ color: 'var(--muted)' }}>{locale === 'ar' ? 'سجّل لعرض سعر الجملة' : 'Register to see wholesale price'}</span>
              )}
            </div>
          )}
        </div>
        <p className="fabric-card__meta" style={{ margin: 0 }}>{fabric.width}cm · {fabric.construction}</p>
        <Link
          to={url(`/${locale}/fabrics/${fabric.slug}`)}
          className="btn btn--ghost btn--sm"
          style={{ marginBlockStart: '0.6rem', minBlockSize: '44px', minInlineSize: '44px' }}
          aria-label={`View ${name}`}
        >
          {locale === 'ar' ? 'عرض' : 'View'} <span aria-hidden="true" style={{ marginInlineStart: '0.25rem' }}>{locale === 'ar' ? '‹' : '›'}</span>
        </Link>
      </div>
    </article>
  )
}
