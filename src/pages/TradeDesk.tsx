import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { KEYS, safeGet, safeSet, dispatchStoreEvent } from '../lib/store'
import { Gate } from '../components/ui/Gate'
import fabrics from '../content/fabrics.json'
import type { Fabric } from '../lib/schema'
import { waRetail, waWholesaleAB, waWholesaleC } from '../lib/wa'
import { MOQStepper } from '../components/ui/MOQSepper'

export function TradeDesk() {
  const { locale: param } = useParams()
  const { locale } = useI18n()
  const l = (param as 'ar' | 'en') || locale
  const [channel, setChannel] = useState<'wholesale' | 'retail'>('wholesale')
  const [tab, setTab] = useState<'saved' | 'sample' | 'quotes' | 'downloads'>('sample')
  const [role, setRole] = useState<'visitor' | 'registered' | 'verified'>('visitor')
  const [wholesaleList, setWholesaleList] = useState<unknown[]>([])
  const [retailList, setRetailList] = useState<unknown[]>([])

  const refresh = (): void => {
    setWholesaleList(safeGet<unknown[]>(KEYS.wholesaleList, []))
    setRetailList(safeGet<unknown[]>(KEYS.retailMetres, []))
    const r = safeGet<string>(KEYS.tradeRole, 'visitor')
    if (r === 'registered' || r === 'verified' || r === 'visitor') setRole(r as 'visitor' | 'registered' | 'verified')
  }

  useEffect(() => {
    refresh()
    const h = (): void => refresh()
    window.addEventListener('azt:store', h)
    return () => window.removeEventListener('azt:store', h)
  }, [])

  const register = (): void => {
    safeSet(KEYS.tradeRole, 'registered')
    dispatchStoreEvent()
    refresh()
  }

  const logout = (): void => {
    safeSet(KEYS.tradeRole, 'visitor')
    dispatchStoreEvent()
    refresh()
  }

  const removeWholesale = (slug: string): void => {
    const next = (wholesaleList as { slug: string }[]).filter((x) => x.slug !== slug)
    safeSet(KEYS.wholesaleList, next)
    dispatchStoreEvent()
    refresh()
  }
  const removeRetail = (slug: string): void => {
    const next = (retailList as { slug: string }[]).filter((x) => x.slug !== slug)
    safeSet(KEYS.retailMetres, next)
    dispatchStoreEvent()
    refresh()
  }

  const getFabric = (slug: string): Fabric | undefined => (fabrics as unknown as Fabric[]).find((f) => f.slug === slug)

  return (
    <div className="container" style={{ paddingBlock: '48px' }}>
      <h1 className="section__title">{l === 'ar' ? 'مكتب التجارة' : 'Trade Desk'}</h1>
      <p className="section__sub">{l === 'ar' ? 'جملة وقطاعي — اختر القناة' : 'Wholesale & retail — pick your channel'}</p>

      <div style={{ display: 'flex', gap: '0.6rem', marginBlock: '1rem' }}>
        <button type="button" className={`btn ${channel === 'wholesale' ? 'btn--primary' : 'btn--ghost'} btn--sm`} onClick={() => setChannel('wholesale')} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
          {l === 'ar' ? 'جملة' : 'Wholesale'} (جملة)
        </button>
        <button type="button" className={`btn ${channel === 'retail' ? 'btn--primary' : 'btn--ghost'} btn--sm`} onClick={() => setChannel('retail')} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
          {l === 'ar' ? 'قطاعي' : 'Retail'} (retail)
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBlockEnd: '1rem' }}>
        <span className="chip chip--mono">Role: {role}</span>
        {role === 'visitor' ? (
          <button type="button" className="btn btn--ghost btn--sm" onClick={register} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
            {l === 'ar' ? 'تسجيل (تجريبي)' : 'Register (mock)'}
          </button>
        ) : (
          <button type="button" className="btn btn--ghost btn--sm" onClick={logout} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
            {l === 'ar' ? 'خروج' : 'Logout'}
          </button>
        )}
      </div>

      {channel === 'retail' ? (
        <div>
          <h2>{l === 'ar' ? 'قائمة الأمتار — قطاعي' : 'My metres list — retail'}</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{l === 'ar' ? 'بدون تسجيل، بدون MOQ — مباشر لواتساب' : 'No login wall — direct to WhatsApp, no MOQ'}</p>
          {retailList.length === 0 ? (
            <p className="empty-state">{l === 'ar' ? 'القائمة فارغة' : 'No items yet'}</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {(retailList as { slug: string; metres: number; grade: 'A' | 'B' | 'C' }[]).map((item) => {
                const f = getFabric(item.slug)
                if (!f) return null
                const name = l === 'ar' ? f.name.ar : f.name.en
                return (
                  <div key={item.slug} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <strong>{name}</strong> <span className="chip chip--mono">{item.grade}</span>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>{f.pricePerMetreRetail === 'TBD' ? 'TBD' : `${(f.pricePerMetreRetail as number) / 100} EGP/m`}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>{l === 'ar' ? 'يُقطع من المعرض بالمتر' : 'Cut by the metre at the gallery'}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <MOQStepper
                        value={item.metres}
                        onChange={(v) => {
                          const next = (retailList as { slug: string; metres: number }[]).map((x) => (x.slug === item.slug ? { ...x, metres: v } : x))
                          safeSet(KEYS.retailMetres, next)
                          dispatchStoreEvent()
                          refresh()
                        }}
                        min={1}
                        step={1}
                      />
                      <a
                        href={waRetail({ code: f.code, name, grade: item.grade }, item.metres)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--primary btn--sm"
                        style={{ minBlockSize: '44px', minInlineSize: '44px' }}
                      >
                        WhatsApp
                      </a>
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => removeRetail(item.slug)} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
                        {l === 'ar' ? 'حذف' : 'Remove'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div style={{ background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1rem', marginBlockStart: '1.5rem' }}>
            <p>{l === 'ar' ? 'تذكير الاستلام من المعرض — لا شحن للقطاعي' : 'Gallery pickup reminder — no shipping for retail'}</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="tabs" role="tablist">
            {(['saved', 'sample', 'quotes', 'downloads'] as const).map((t) => (
              <button key={t} type="button" role="tab" aria-selected={tab === t} className={`tab-btn ${tab === t ? 'is-active' : ''}`} onClick={() => setTab(t)} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
                {t}
              </button>
            ))}
          </div>

          {tab === 'sample' && (
            <div>
              <h3>{l === 'ar' ? 'قائمة العينات — جملة' : 'Sample list — wholesale'}</h3>
              <Gate channel="wholesale">
                {wholesaleList.length === 0 ? (
                  <p className="empty-state">{l === 'ar' ? 'فارغ' : 'Empty'}</p>
                ) : (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {(wholesaleList as { slug: string; metres: number; grade: 'A' | 'B' | 'C' }[]).map((item) => {
                      const f = getFabric(item.slug)
                      if (!f) return null
                      const name = l === 'ar' ? f.name.ar : f.name.en
                      return (
                        <div key={item.slug} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                          <div>
                            <strong>{name}</strong> <span className="chip chip--mono">MOQ {f.moqM}m</span>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>Grade {item.grade}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <MOQStepper
                              value={item.metres}
                              onChange={(v) => {
                                const next = (wholesaleList as { slug: string; metres: number }[]).map((x) => (x.slug === item.slug ? { ...x, metres: v } : x))
                                safeSet(KEYS.wholesaleList, next)
                                dispatchStoreEvent()
                                refresh()
                              }}
                              min={f.moqM}
                              step={5}
                            />
                            <a
                              href={f.grade === 'C' ? waWholesaleC({ code: f.code, name, grade: item.grade }) : waWholesaleAB({ code: f.code, name, grade: item.grade }, item.metres)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn--primary btn--sm"
                              style={{ minBlockSize: '44px', minInlineSize: '44px' }}
                            >
                              {l === 'ar' ? 'اطلب عرض سعر' : 'Request quote'}
                            </a>
                            <button type="button" className="btn btn--ghost btn--sm" onClick={() => removeWholesale(item.slug)} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
                              Remove
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Gate>
            </div>
          )}
          {tab === 'saved' && <p>Saved lots — {wholesaleList.length} items</p>}
          {tab === 'quotes' && <p>{l === 'ar' ? 'عروض الأسعار' : 'Quotes — mock'}</p>}
          {tab === 'downloads' && <p>{l === 'ar' ? 'التحميلات' : 'Downloads — spec sheets'}</p>}
          <div style={{ marginBlockStart: '1rem', background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1rem' }}>
            <h4>MOQ maths</h4>
            <p style={{ fontFamily: 'ui-monospace, monospace' }}>Total metres: {(wholesaleList as { metres: number }[]).reduce((a, b) => a + b.metres, 0)}</p>
            <h4 style={{ marginBlockStart: '1rem' }}>Shipping</h4>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{l === 'ar' ? 'شحن للجملة فقط' : 'Shipping for wholesale lots only'}</p>
          </div>
        </div>
      )}
    </div>
  )
}
