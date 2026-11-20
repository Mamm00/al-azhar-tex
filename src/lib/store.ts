// ONE module src/lib/store.ts with versioned keys azt:v1:*, try/catch on every read, quota guard, schema check, corrupt blob → []

const PREFIX = 'azt:v1:'

export const KEYS = {
  locale: `${PREFIX}locale` as const,
  wholesaleList: `${PREFIX}wholesale-list` as const,
  retailMetres: `${PREFIX}retail-metres` as const,
  tradeRole: `${PREFIX}trade-role` as const,
  gen: `azt:v2:gen` as const,
  gencache: `azt:v3:gencache` as const,
  session: `${PREFIX}session` as const,
} as const

export type StoreKey = (typeof KEYS)[keyof typeof KEYS] | `azt:v2:draft:${string}:${string}` | `azt:visitor-gen`

function isQuotaError(e: unknown): boolean {
  if (e instanceof DOMException) {
    return e.code === 22 || e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
  }
  return false
}

export function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    const parsed = JSON.parse(raw) as unknown
    return parsed as T
  } catch {
    return fallback
  }
}

export function safeSet(key: string, value: unknown): boolean {
  try {
    const serialized = JSON.stringify(value)
    localStorage.setItem(key, serialized)
    return true
  } catch (e) {
    if (isQuotaError(e)) {
      // quota guard: try to clear oldest cache entries
      try {
        // attempt to remove gencache if present
        localStorage.removeItem('azt:v3:gencache')
        localStorage.setItem(key, JSON.stringify(value))
        return true
      } catch {
        return false
      }
    }
    return false
  }
}

export function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export function safeGetSession<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function safeSetSession(key: string, value: unknown): boolean {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (e) {
    if (isQuotaError(e)) return false
    return false
  }
}

// Typed helpers for sample lists
export type WholesaleItem = { slug: string; grade: 'A' | 'B' | 'C'; metres: number; addedAt: string }
export type RetailItem = { slug: string; grade: 'A' | 'B' | 'C'; metres: number; addedAt: string }

export function getWholesaleList(): WholesaleItem[] {
  const v = safeGet<unknown>(KEYS.wholesaleList, [])
  if (!Array.isArray(v)) return []
  // schema check minimal
  return v.filter(
    (x): x is WholesaleItem =>
      typeof x === 'object' &&
      x !== null &&
      typeof (x as Record<string, unknown>).slug === 'string' &&
      ['A', 'B', 'C'].includes((x as Record<string, unknown>).grade as string) &&
      typeof (x as Record<string, unknown>).metres === 'number'
  )
}

export function getRetailList(): RetailItem[] {
  const v = safeGet<unknown>(KEYS.retailMetres, [])
  if (!Array.isArray(v)) return []
  return v.filter(
    (x): x is RetailItem =>
      typeof x === 'object' &&
      x !== null &&
      typeof (x as Record<string, unknown>).slug === 'string' &&
      ['A', 'B', 'C'].includes((x as Record<string, unknown>).grade as string) &&
      typeof (x as Record<string, unknown>).metres === 'number'
  )
}

export function dispatchStoreEvent(): void {
  try {
    window.dispatchEvent(new CustomEvent('azt:store'))
  } catch {
    // ignore
  }
}
