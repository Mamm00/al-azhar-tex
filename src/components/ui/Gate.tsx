import { useEffect, useState } from 'react'
import { KEYS, safeGet } from '../../lib/store'
import { useI18n } from '../../lib/i18n'
import { url } from '../../lib/url'

export type Role = 'visitor' | 'registered' | 'verified'

export function useRole(): Role {
  const [role, setRole] = useState<Role>('visitor')
  useEffect(() => {
    const v = safeGet<string>(KEYS.tradeRole, 'visitor')
    if (v === 'registered' || v === 'verified') setRole(v)
  }, [])
  return role
}

export function Gate({ children, allowRetail = false, channel }: { children: React.ReactNode; allowRetail?: boolean; channel?: 'retail' | 'wholesale' }) {
  const role = useRole()
  const { locale } = useI18n()
  // Retail tab is ungated
  if (allowRetail || channel === 'retail') {
    return <>{children}</>
  }
  if (role === 'visitor') {
    return (
      <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1.5rem', background: 'var(--cream)', textAlign: 'center' }}>
        <p>{locale === 'ar' ? 'سجّل لعرض التفاصيل الكاملة' : 'Register to see full details'}</p>
        <a href={url(`/${locale}/trade-desk`)} className="btn btn--primary btn--sm" style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
          {locale === 'ar' ? 'التسجيل' : 'Register'}
        </a>
      </div>
    )
  }
  return <>{children}</>
}
