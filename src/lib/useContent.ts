import { useEffect, useState } from 'react'
import fabricsRaw from '../content/fabrics.json'
import categoriesRaw from '../content/categories.json'
import gradesRaw from '../content/grades.json'
import journalRaw from '../content/journal.json'
import galleryRaw from '../content/gallery.json'
import companyRaw from '../content/company.json'

function deepMerge<T>(base: T, over: unknown): T {
  if (!over || typeof over !== 'object') return base
  // shallow merge for top-level, deep for arrays keyed by id/slug
  const result = { ...(base as Record<string, unknown>) } as Record<string, unknown>
  const o = over as Record<string, unknown>
  for (const k of Object.keys(o)) {
    result[k] = o[k]
  }
  return result as T
}

export function useContent<T>(collection: string, buildData: T): T {
  const [data, setData] = useState<T>(buildData)

  useEffect(() => {
    // Runs in useEffect only as required for storage access
    try {
      const keys: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(`azt:v2:draft:${collection}:`)) keys.push(k)
      }
      if (keys.length === 0) return
      let merged: unknown = buildData
      for (const k of keys) {
        const raw = localStorage.getItem(k)
        if (!raw) continue
        try {
          const parsed = JSON.parse(raw)
          merged = deepMerge(merged as Record<string, unknown>, parsed)
        } catch {
          // corrupt blob → ignore, degrade to base
        }
      }
      setData(merged as T)
    } catch {
      // storage unavailable
    }
  }, [collection, buildData])

  return data
}

export function useFabrics() {
  return useContent('fabrics', fabricsRaw as unknown as import('./schema').Fabric[])
}
export function useCategories() {
  return useContent('categories', categoriesRaw)
}
export function useGrades() {
  return useContent('grades', gradesRaw)
}
export function useJournal() {
  return useContent('journal', journalRaw)
}
export function useGallery() {
  return useContent('gallery', galleryRaw)
}
export function useCompany() {
  return useContent('company', companyRaw)
}
