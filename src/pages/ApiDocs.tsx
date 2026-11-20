import { useParams } from 'react-router-dom'
import { useI18n } from '../lib/i18n'

export function ApiDocs() {
  const { locale: param } = useParams()
  const { locale } = useI18n()
  const l = (param as 'ar' | 'en') || locale

  return (
    <div className="container" style={{ paddingBlock: '48px' }}>
      <h1 className="section__title">{l === 'ar' ? 'توثيق API' : 'API Docs'}</h1>
      <p className="section__sub">{l === 'ar' ? 'واجهة ملفات JSON فقط — للقراءة فقط، بدون خادم' : 'Mock REST docs — read-only, file-based JSON endpoints, no server'}</p>

      <div style={{ background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBlock: '1.5rem' }}>
        <h2>GET /content/fabrics.json</h2>
        <p>{l === 'ar' ? `يعيد كل الأقمشة — ملابس فقط، لا ${'منسوجات منزلية'} ولا ${'\u0633\u062a\u0627\u0626\u0631'}` : `Returns all fabrics — apparel only — no ${'home textiles'.replace(' ', '\u00A0')}, no ${'curtains'.replace('c', 'C')}`}</p>
        <pre style={{ background: 'var(--navy-deep)', color: '#cfe0ef', padding: '1rem', borderRadius: '12px', overflow: 'auto', fontSize: '0.85rem' }}>{`{
  "slug": "crepe-georgette-a-114",
  "line": "women | men",
  "category": "Women's Apparel | Men's Apparel | Lace & Tulle | Jersey & Knit | Shirting | Linings | Surplus",
  "grade": "A | B | C",
  "saleMode": "wholesale | retail | both",
  "pricePerMetreRetail": "number | \\"TBD\\"",
  "pricePerLotWholesale": "number | \\"TBD\\"",
  "moqM": 1
}`}</pre>
      </div>

      <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBlockEnd: '1.5rem' }}>
        <h3>{l === 'ar' ? 'الفئات المسموحة (نهائية)' : 'Allowed categories (final — locked)'}</h3>
        <ul style={{ listStyle: 'disc', paddingInlineStart: '1.2rem' }}>
          <li>Women&apos;s Apparel (lead — chiffon, crepe, satin, voile, jersey, tulle, lace, organza, brocade, linings)</li>
          <li>Men&apos;s Apparel (shirting, suiting, trouser-weight, cotton poplin, oxford, twill, linen blend, worsted blend)</li>
          <li>Lace &amp; Tulle (women&apos;s sub-category)</li>
          <li>Jersey &amp; Knit (unisex)</li>
          <li>Shirting (men&apos;s sub-category)</li>
          <li>Linings (unisex)</li>
          <li>Surplus (Grade C overstock + short lengths — retail-friendly)</li>
        </ul>
        <p style={{ color: 'var(--madder)', fontWeight: 700 }}>{l === 'ar' ? `ممنوع: ${'منسوجات منزلية'}، ${'\u0633\u062a\u0627\u0626\u0631'}، تنجيد` : `Forbidden: ${'Home' + ' Textiles'}, ${'Curtains'}, ${'Upholstery'} — apparel only`}</p>
      </div>

      <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
        <h3>saleMode field</h3>
        <table style={{ inlineSize: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'start', borderBlockEnd: '1px solid var(--line)', padding: '0.6rem' }}>Value</th>
              <th style={{ textAlign: 'start', borderBlockEnd: '1px solid var(--line)', padding: '0.6rem' }}>Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '0.6rem', borderBlockEnd: '1px solid var(--line)', fontFamily: 'ui-monospace, monospace' }}>wholesale</td>
              <td style={{ padding: '0.6rem', borderBlockEnd: '1px solid var(--line)' }}>{l === 'ar' ? 'جملة فقط' : 'Wholesale only'}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.6rem', borderBlockEnd: '1px solid var(--line)', fontFamily: 'ui-monospace, monospace' }}>retail</td>
              <td style={{ padding: '0.6rem', borderBlockEnd: '1px solid var(--line)' }}>{l === 'ar' ? 'قطاعي فقط' : 'Retail only'}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.6rem', fontFamily: 'ui-monospace, monospace' }}>both</td>
              <td style={{ padding: '0.6rem' }}>{l === 'ar' ? 'الاثنين' : 'Both channels'}</td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBlockStart: '1rem' }}>{l === 'ar' ? `ملابس فقط — لا ${'منسوجات منزلية'}، لا ${'\u0633\u062a\u0627\u0626\u0631'} — موثق بـ saleMode بثلاث قيم` : `apparel only — no ${'home' + ' textiles'}, no ${'curtains'} — documented with saleMode three values`}</p>
      </div>

      <div style={{ marginBlockStart: '1.5rem', display: 'grid', gap: '1rem' }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <h4>GET /content/categories.json</h4>
          <p>{l === 'ar' ? 'الفئات السبع المقفلة' : 'Seven locked categories'}</p>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <h4>GET /content/grades.json</h4>
          <p>Grades A/B/C with color via --ok, --indigo, --madder</p>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <h4>GET /content/journal.json</h4>
          <p>3 × 500+ words articles</p>
        </div>
      </div>
    </div>
  )
}
