import { useParams } from 'react-router-dom'
import grades from '../content/grades.json'
import { useI18n } from '../lib/i18n'

export function Grades() {
  const { locale: param } = useParams()
  const { locale } = useI18n()
  const l = (param as 'ar' | 'en') || locale

  return (
    <div className="container" style={{ paddingBlock: '48px' }}>
      <h1 className="section__title">{l === 'ar' ? 'نظام الدرجات' : 'Grading System'}</h1>
      <p className="section__sub">{l === 'ar' ? 'شفافية كاملة — كل درجة موضحة' : 'Full transparency — every grade explained'}</p>

      <nav aria-label="In-page" style={{ position: 'sticky', insetBlockStart: '80px', background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '999px', padding: '0.6rem', display: 'flex', gap: '0.6rem', justifyContent: 'center', marginBlock: '1.5rem', maxBlockSize: '30vh' }}>
        {grades.map((g) => (
          <a key={g.id} href={`#grade-${g.id}`} className="chip chip--mono" style={{ minBlockSize: '44px', minInlineSize: '44px', display: 'inline-flex', alignItems: 'center' }}>
            Grade {g.id}
          </a>
        ))}
      </nav>

      {grades.map((g) => (
        <section key={g.id} id={`grade-${g.id}`} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBlockEnd: '1.5rem', borderInlineStart: `6px solid var(${g.colorVar})` }}>
          <h2 style={{ color: `var(${g.colorVar})`, fontFamily: 'var(--font-head)' }}>
            {l === 'ar' ? g.name.ar : g.name.en} — {l === 'ar' ? g.tag.ar : g.tag.en}
          </h2>
          <p>{l === 'ar' ? g.description.ar : g.description.en}</p>
          <ul style={{ listStyle: 'disc', paddingInlineStart: '1.2rem' }}>
            <li>{l === 'ar' ? 'فحص يدوي' : 'Hand inspected'}</li>
            <li>{l === 'ar' ? 'ماكرو دليل مصور' : 'Macro evidence photographed'}</li>
            <li>{l === 'ar' ? 'تسعير عادل' : 'Fair pricing'}</li>
            <li>{l === 'ar' ? g.id === 'C' ? 'الأكثر ملاءمة للقطاعي' : g.id === 'A' ? 'للبوتيكات والتصدير' : 'للورش' : g.id === 'C' ? 'Most retail-friendly band' : g.id === 'A' ? 'For boutiques and export' : 'For workshops'}</li>
          </ul>
          <div style={{ blockSize: '80px', background: `var(${g.colorVar})`, opacity: 0.15, borderRadius: '12px', marginBlockStart: '1rem' }} aria-hidden="true" />
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBlockStart: '0.5rem' }}>{l === 'ar' ? 'التأثير على السعر: ' : 'Price implication: '}{g.id === 'A' ? 'Premium' : g.id === 'B' ? 'Mid' : 'Value'}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{l === 'ar' ? 'سعر المتر يختلف حسب الدرجة — الدرجة C سعر تصفية' : 'Price per metre varies by grade — Grade C at clearance'}</p>
        </section>
      ))}

      <div style={{ background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBlockStart: '2rem' }}>
        <h3>{l === 'ar' ? 'لماذا ندرج علناً' : 'Why we grade openly'}</h3>
        <p style={{ fontStyle: 'italic', fontFamily: 'var(--font-head)' }}>
          {l === 'ar' ? '— شادي أنور، المؤسس: نحن نؤمن أن الشفافية هي أساس الثقة. كل قماش له قصته ودرجته، ونحن نرويها.' : '— Shady Anwar, founder: We believe transparency is trust. Every fabric has its story and grade, and we tell it.'}
        </p>
        <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{l === 'ar' ? 'الدرجة C ليست عيباً — هي ميزة للقطاعي' : 'Grade C is not a flaw — it is a feature for retail'}</p>
      </div>

      <div className="grade-strip" aria-hidden="true">
        <div className="gA">A · FIRST</div>
        <div className="gB">B · SECOND</div>
        <div className="gC">C · VALUE</div>
      </div>
    </div>
  )
}
