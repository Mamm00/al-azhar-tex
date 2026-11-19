import { useI18n } from '../../lib/i18n'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

export function LangToggle() {
  const { locale, setLocale } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  
  const toggle = (): void => {
    const next = locale === 'ar' ? 'en' : 'ar'
    // preserve scroll and form state: we just swap locale and rewrite path
    const path = location.pathname
    // If path starts with /ar or /en or /al-azhar-tex/ar etc, rewrite
    // Our routes are /:locale/... ; we rewrite first segment
    const base = import.meta.env.BASE_URL || '/'
    let relative = path.startsWith(base) ? path.slice(base.length) : path
    if (!relative.startsWith('/')) relative = '/' + relative
    const parts = relative.split('/').filter(Boolean)
    if (parts[0] === 'ar' || parts[0] === 'en') {
      parts[0] = next
      const newPath = base.replace(/\/$/, '') + '/' + parts.join('/') + location.search + location.hash
      setLocale(next)
      navigate(newPath, { replace: true })
    } else {
      setLocale(next)
      // persist
      try {
        localStorage.setItem('azt:v1:locale', next)
      } catch {}
    }
    // keep scroll
    const y = window.scrollY
    requestAnimationFrame(() => window.scrollTo(0, y))
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle language"
      className="btn btn--ghost btn--sm"
      style={{ minInlineSize: '44px', minBlockSize: '44px' }}
    >
      {locale === 'ar' ? 'EN' : 'العربية'}
    </button>
  )
}
