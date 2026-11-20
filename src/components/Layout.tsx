import { Link, Outlet, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { url } from '../lib/url'
import { useI18n } from '../lib/i18n'
import { LangToggle } from './ui/LangToggle'
import { COMPANY } from '../data/company'
import { KEYS, safeGet } from '../lib/store'

function useStoreCounts(): { wholesale: number; retail: number; combined: number } {
  const [counts, setCounts] = useState({ wholesale: 0, retail: 0, combined: 0 })
  const update = (): void => {
    try {
      const w = safeGet<unknown[]>(KEYS.wholesaleList, [])
      const r = safeGet<unknown[]>(KEYS.retailMetres, [])
      setCounts({ wholesale: Array.isArray(w) ? w.length : 0, retail: Array.isArray(r) ? r.length : 0, combined: (Array.isArray(w) ? w.length : 0) + (Array.isArray(r) ? r.length : 0) })
    } catch {
      setCounts({ wholesale: 0, retail: 0, combined: 0 })
    }
  }
  useEffect(() => {
    update()
    const handler = (): void => update()
    window.addEventListener('azt:store', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('azt:store', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])
  return counts
}

export function Layout() {
  const { locale: paramLocale } = useParams()
  const { locale, setLocale } = useI18n()
  const counts = useStoreCounts()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (paramLocale === 'ar' || paramLocale === 'en') {
      setLocale(paramLocale as 'ar' | 'en')
      document.documentElement.lang = paramLocale
      document.documentElement.dir = paramLocale === 'ar' ? 'rtl' : 'ltr'
    }
  }, [paramLocale, setLocale])

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const l = (paramLocale as 'ar' | 'en') || locale

  const navLinks = [
    { to: url(`/${l}/`), label: l === 'ar' ? 'الرئيسية' : 'Home' },
    { to: url(`/${l}/fabrics`), label: l === 'ar' ? 'الأقمشة' : 'Fabrics' },
    { to: url(`/${l}/grades`), label: l === 'ar' ? 'الدرجات' : 'Grades' },
    { to: url(`/${l}/gallery`), label: l === 'ar' ? 'المعرض' : 'Gallery' },
    { to: url(`/${l}/journal`), label: l === 'ar' ? 'المجلة' : 'Journal' },
    { to: url(`/${l}/api`), label: 'API' },
    { to: url(`/${l}/trade-desk`), label: l === 'ar' ? 'مكتب التجارة' : 'Trade Desk' },
  ]

  return (
    <>
      <a href="#main" className="skip-link">
        {l === 'ar' ? 'تخطي إلى المحتوى' : 'Skip to content'}
      </a>
      <div className="topbar">
        <div className="container topbar__inner">
          <p className="topbar__item">{l === 'ar' ? COMPANY.addressAr : COMPANY.addressEn}</p>
          <p className="topbar__item">{l === 'ar' ? 'جملة وقطاعي' : 'Wholesale & Retail'}</p>
          <p className="topbar__item">{COMPANY.phone1Display} · {COMPANY.phone2Display}</p>
        </div>
      </div>
      <header className={`header ${scrolled ? 'is-scrolled' : ''}`} id="site-header">
        <div className="container header__inner">
          <Link to={url(`/${l}/`)} className="brand" aria-label="Al Azhar Tex — home">
            <img className="brand__logo" src={url('assets/logo.jpg')} alt="Al Azhar Tex logo" width={52} height={52} />
            <span className="brand__text">
              <span className="brand__name">Al Azhar <em>Tex</em></span>
              <span className="brand__tag">Fine Fabrics · Wholesale · Retail</span>
            </span>
          </Link>
          <nav className={`nav ${isOpen ? 'is-open' : ''}`} aria-label="Main navigation">
            <ul className="nav__list" id="nav-menu">
              {navLinks.map((n) => (
                <li key={n.to}>
                  <Link className="nav__link" to={n.to} onClick={() => setIsOpen(false)}>
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to={url(`/${l}/trade-desk`)} className="btn btn--ghost btn--sm" style={{ minInlineSize: '44px', minBlockSize: '44px' }} title={`${counts.wholesale} / ${counts.retail}`}>
                  {counts.combined} <span aria-hidden="true" style={{ opacity: 0.6 }}>({counts.wholesale}/{counts.retail})</span>
                </Link>
              </li>
              <li>
                <LangToggle />
              </li>
            </ul>
          </nav>
          <button className={`nav-toggle ${isOpen ? 'is-open' : ''}`} aria-label="Toggle navigation menu" aria-expanded={isOpen} onClick={() => setIsOpen((v) => !v)} style={{ minInlineSize: '44px', minBlockSize: '44px' }}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container footer__grid">
          <div className="footer__brand">
            <div className="brand brand--footer">
              <img className="brand__logo" src={url('assets/logo.jpg')} alt="" width={52} height={52} />
              <span className="brand__text">
                <span className="brand__name">Al Azhar <em>Tex</em></span>
                <span className="brand__tag">Fine Fabrics</span>
              </span>
            </div>
            <p>{l === 'ar' ? COMPANY.addressAr : COMPANY.addressEn}</p>
            <p>{l === 'ar' ? 'المؤسس' : 'Founder'}: {COMPANY.founder} / {COMPANY.founderAr}</p>
            <p>{l === 'ar' ? 'المعلم' : 'Landmark'}: {l === 'ar' ? COMPANY.landmarkAr : COMPANY.landmarkEn}</p>
          </div>
          <div className="footer__col">
            <h4>{l === 'ar' ? 'روابط' : 'Links'}</h4>
            <ul>
              {navLinks.map((n) => (
                <li key={n.to}>
                  <Link to={n.to}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer__col">
            <h4>{l === 'ar' ? 'تواصل' : 'Contact'}</h4>
            <ul>
              <li>
                <a href={COMPANY.phone1Href}>{COMPANY.phone1Display} (Retail)</a>
              </li>
              <li>
                <a href={COMPANY.phone2Href}>{COMPANY.phone2Display} (Wholesale)</a>
              </li>
              <li>
                <a href={`mailto:sales@alazhartex.com`}>sales@alazhartex.com</a>
              </li>
              <li>
                <LangToggle />
              </li>
            </ul>
          </div>
          <div className="footer__col">
            <h4>{l === 'ar' ? 'ساعات العمل' : 'Hours'}</h4>
            <p>TBD</p>
            <p style={{ marginBlockStart: '1rem' }}>
              <Link to={url(`/${l}/admin`)} className="footer__admin">
                Admin
              </Link>
            </p>
          </div>
        </div>
        <div className="footer__bar">
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <p>© {new Date().getFullYear()} Al Azhar Tex — Fine Fabrics</p>
            <p>
              <strong>{COMPANY.phone1Display}</strong> · <strong>{COMPANY.phone2Display}</strong>
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
