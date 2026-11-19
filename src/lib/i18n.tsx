import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import ar from '../content/locales/ar.json'
import en from '../content/locales/en.json'

export type Locale = 'ar' | 'en'

const DICTS: Record<Locale, Record<string, string>> = {
  ar: ar as Record<string, string>,
  en: en as Record<string, string>,
}

type I18nContextValue = {
  locale: Locale
  t: (key: string) => string
  setLocale: (l: Locale) => void
  dir: 'rtl' | 'ltr'
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'ar',
  t: (k) => k,
  setLocale: () => {},
  dir: 'rtl',
})

export function I18nProvider({ children, initialLocale }: { children: React.ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // window only in useEffect, but we need initial
    if (initialLocale) return initialLocale
    try {
      const v = localStorage.getItem('azt:v1:locale')
      if (v === 'en' || v === 'ar') return v
    } catch {
      // ignore
    }
    return 'ar'
  })

  useEffect(() => {
    try {
      localStorage.setItem('azt:v1:locale', locale)
    } catch {
      // ignore
    }
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  }, [locale])

  const setLocale = (l: Locale): void => {
    setLocaleState(l)
    try {
      localStorage.setItem('azt:v1:locale', l)
    } catch {
      // ignore
    }
  }

  const t = useMemo(() => {
    return (key: string): string => {
      const dict = DICTS[locale]
      if (dict[key] !== undefined) return dict[key]
      // Missing key renders AR string, never raw key
      const arDict = DICTS.ar
      if (arDict[key] !== undefined) return arDict[key]
      // fallback to key only if truly missing, but spec says AR string — so return AR or key with marker
      return arDict[key] ?? DICTS.en[key] ?? key
    }
  }, [locale])

  const dir: 'rtl' | 'ltr' = locale === 'ar' ? 'rtl' : 'ltr'

  const value = useMemo<I18nContextValue>(() => ({ locale, t, setLocale, dir }), [locale, t, dir])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext)
}

export function formatPrice(piastres: number, locale: Locale): string {
  const egp = piastres / 100
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 2,
  }).format(egp)
}

export function formatNumber(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en-EG').format(n)
}
