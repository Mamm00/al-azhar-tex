const BASE = import.meta.env.BASE_URL || '/'

function normalizeBase(b: string): string {
  if (!b.endsWith('/')) return b + '/'
  return b
}

export function url(path: string): string {
  const base = normalizeBase(BASE)
  // path expected to start with / or be empty
  if (!path || path === '/') return base
  const clean = path.startsWith('/') ? path.slice(1) : path
  return base + clean
}

export function withLocale(path: string, locale: string): string {
  const clean = path.startsWith('/') ? path : '/' + path
  return url(`/${locale}${clean}`)
}

export function asset(path: string): string {
  return url(path)
}
