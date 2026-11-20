import { useI18n } from '../../lib/i18n'
export function TBDChip() {
  const { t, locale } = useI18n()
  const label = locale === 'ar' ? 'اتصل للسعر' : 'Call for price'
  return (
    <span className="chip chip--tbd" title={label} aria-label={label}>
      TBD <span aria-hidden="true">ⓘ</span>
    </span>
  )
}
