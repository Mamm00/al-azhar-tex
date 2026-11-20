import { Link, useParams } from 'react-router-dom'
import { url } from '../lib/url'
import { useI18n } from '../lib/i18n'
import fabrics from '../content/fabrics.json'
import { FabricCard } from '../components/FabricCard'
import { waGeneric, waRetailGeneric } from '../lib/wa'

export function Home() {
  const { locale: param } = useParams()
  const { locale } = useI18n()
  const l = (param as 'ar' | 'en') || locale

  const featured = (fabrics as unknown as { featured?: boolean }[]).filter((f) => (f as unknown as { featured?: boolean }).featured).slice(0, 6) as unknown as typeof fabrics

  return (
    <>
      <section className="hero" id="home">
        <div className="container hero__inner">
          <div className="hero__content">
            <p className="eyebrow">
              {l === 'ar' ? 'تأسس 2006 · الزقازيق، مصر' : 'Est. 2006 · Zagazig, Egypt'}
            </p>
            <h1 className="hero__title">
              {l === 'ar' ? (
                <>
                  أقمشة فاخرة <span className="text-red">للملابس الحريمي والرجالي</span> — جملة وقطاعي
                </>
              ) : (
                <>
                  Fine <span className="text-red">women&apos;s &amp; men&apos;s apparel</span> fabrics — wholesale &amp; retail
                </>
              )}
            </h1>
            <p className="hero__kicker">جملة · قطاعي · درجة A/B/C / Wholesale · Retail · Grade A/B/C</p>
            <p className="hero__lead">
              {l === 'ar'
                ? 'الأزهر تكس — بيت الأقمشة في الزقازيق. نبيع جملة للورش والمصانع وقطاعي بالمتر من المعرض. كل درجة موضحة، كل سعر واضح.'
                : 'Al Azhar Tex — fabric house in Zagazig. Wholesale for workshops and factories, retail by the metre from the gallery. Every grade shown, every price clear.'}
            </p>
            <div className="hero__actions">
              <Link to={url(`/${l}/gallery`)} className="btn btn--primary" style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
                {l === 'ar' ? 'زيارة المعرض' : 'Visit the gallery'}
              </Link>
              <a href={waGeneric()} target="_blank" rel="noopener noreferrer" className="btn btn--ghost" style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
                {l === 'ar' ? 'اتسعّر على واتساب' : 'Get a quote on WhatsApp'}
              </a>
            </div>
            <ul className="hero__ticks">
              <li>{l === 'ar' ? 'سعر المتر ظاهر' : 'Retail price visible'}</li>
              <li>{l === 'ar' ? 'درجات A/B/C موضحة' : 'Grades A/B/C explained'}</li>
              <li>{l === 'ar' ? 'نقطع بالمتر' : 'Cut by the metre'}</li>
            </ul>
          </div>
          <figure className="hero__media">
            <img src={url('assets/hero.jpg')} alt={l === 'ar' ? 'أقمشة فاخرة معروضة في معرض الأزهر تكس' : 'Stacked bolts of premium apparel fabrics at Al Azhar Tex gallery'} width={720} height={620} loading="eager" />
            <figcaption className="hero__badge">
              <span className="hero__badge-num">20</span>
              <span className="hero__badge-label">{l === 'ar' ? 'سنة خبرة' : 'Years of fabric expertise'}</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <h2 className="section__title">{l === 'ar' ? 'أقمشة مختارة' : 'Featured fabrics'}</h2>
            <p className="section__sub">{l === 'ar' ? 'من نفس المخزن — جملة وقطاعي' : 'From the same stock — wholesale & retail'}</p>
          </div>
          <div className="fabrics__grid">
            {(featured as unknown as import('../lib/schema').Fabric[]).map((f) => (
              <FabricCard key={f.slug} fabric={f} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginBlockStart: '2rem' }}>
            <Link to={url(`/${l}/fabrics`)} className="btn btn--primary" style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
              {l === 'ar' ? 'تصفح كل الأقمشة' : 'Browse all fabrics'}
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--tinted">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
          <div>
            <h2 className="section__title" style={{ textAlign: 'start' }}>
              {l === 'ar' ? 'جملة وقطاعي — الاثنين أولوية' : 'Wholesale & Retail — both first-class'}
            </h2>
            <p>{l === 'ar' ? 'بنقطع بالمتر من أول متر. اختار القماش، شوفه على الطبيعة، وهنقطعه لك.' : 'We cut by the metre from the first metre. Pick the fabric, see it under real light, and we\'ll cut it.'}</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBlockStart: '1rem' }}>
              <Link to={url(`/${l}/fabrics`)} className="btn btn--ghost btn--sm" style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
                {l === 'ar' ? 'تسوق قطاعي' : 'Shop retail'}
              </Link>
              <a href={waGeneric()} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm" style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
                {l === 'ar' ? 'تواصل جملة' : 'Contact wholesale'}
              </a>
            </div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
            <h3>{l === 'ar' ? 'العنوان' : 'Address'}</h3>
            <p>{l === 'ar' ? 'مصر، الشرقية، الزقازيق، الزراعة، بعد موقف أبو حماد — أمام موقف أبو حماد.' : 'Al Azhar Tex Gallery, Ziraa, Zagazig, Sharkia, Egypt — opposite Abu Hammad car station — in front of the Abu Hammad car station.'}</p>
            <p>
              <a href={waRetailGeneric()} target="_blank" rel="noopener noreferrer">
                {l === 'ar' ? 'واتساب المعرض (قطاعي)' : 'WhatsApp retail'} →
              </a>
            </p>
            <p>
              <a href={waGeneric()} target="_blank" rel="noopener noreferrer">
                {l === 'ar' ? 'واتساب الجملة' : 'WhatsApp wholesale'} →
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
