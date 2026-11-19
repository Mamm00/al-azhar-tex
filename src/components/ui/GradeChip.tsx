import { useI18n } from '../../lib/i18n'

export function GradeChip({ grade }: { grade: 'A' | 'B' | 'C' }) {
  const { locale } = useI18n()
  const map = {
    A: { ar: 'أ · أول', en: 'A · FIRST', cls: 'chip--ok' as const },
    B: { ar: 'ب · ثاني', en: 'B · SECOND', cls: 'chip--indigo' as const },
    C: { ar: 'ج · تصفية', en: 'C · VALUE', cls: 'chip--madder' as const },
  }
  const v = map[grade]
  return <span className={`chip ${v.cls}`} aria-label={`Grade ${grade}`}>{locale === 'ar' ? v.ar : v.en}</span>
}

export function GradeStrip() {
  return (
    <div className="grade-strip" role="img" aria-label="Grade comparison A B C">
      <div className="gA">A · FIRST</div>
      <div className="gB">B · SECOND</div>
      <div className="gC">C · VALUE</div>
    </div>
  )
}
