import { Link, useParams } from 'react-router-dom'
import { url } from '../lib/url'
import { useI18n } from '../lib/i18n'
export function NotFound() {
  const { locale: param } = useParams()
  const { locale } = useI18n()
  const l = (param as 'ar' | 'en') || locale
  return (
    <div className="container" style={{ paddingBlock: '80px', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '3rem' }}>404</h1>
      <p>{l === 'ar' ? 'الصفحة غير موجودة' : 'Page not found'}</p>
      <Link to={url(`/${l}/`)} className="btn btn--primary" style={{ marginBlockStart: '1rem', minBlockSize: '44px', minInlineSize: '44px' }}>
        {l === 'ar' ? 'العودة للرئيسية' : 'Back home'}
      </Link>
    </div>
  )
}
