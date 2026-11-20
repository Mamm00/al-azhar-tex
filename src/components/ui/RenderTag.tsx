import { useI18n } from '../../lib/i18n'
export function RenderTag() {
  const { locale } = useI18n()
  return <span className="render-tag">{locale === 'ar' ? 'تصوير تقديري' : 'illustrative'}</span>
}
