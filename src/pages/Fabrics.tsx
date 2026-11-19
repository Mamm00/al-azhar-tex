import { useMemo, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import fabricsData from '../content/fabrics.json'
import type { Fabric } from '../lib/schema'
import { FabricCard } from '../components/FabricCard'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonGrid } from '../components/ui/Skeleton'
import { useI18n } from '../lib/i18n'

export function Fabrics() {
  const { locale: param } = useParams()
  const { locale } = useI18n()
  const l = (param as 'ar' | 'en') || locale
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [line, setLine] = useState<'all' | 'women' | 'men'>('all')
  const [saleMode, setSaleMode] = useState<'all' | 'wholesale' | 'retail' | 'both'>('all')
  const [grade, setGrade] = useState<'all' | 'A' | 'B' | 'C'>('all')
  const [retailOnly, setRetailOnly] = useState(false)
  const [gradeCOnly, setGradeCOnly] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 150)
    return () => clearTimeout(t)
  }, [query])

  const fabrics = fabricsData as unknown as Fabric[]

  const filtered = useMemo(() => {
    return fabrics
      .filter((f) => {
        if (line !== 'all' && f.line !== line) return false
        if (saleMode !== 'all' && f.saleMode !== saleMode) return false
        if (grade !== 'all' && f.grade !== grade) return false
        if (retailOnly && f.saleMode === 'wholesale') return false
        if (gradeCOnly && f.grade !== 'C') return false
        if (debounced) {
          const hay = `${f.name.en} ${f.name.ar} ${f.composition} ${f.category}`.toLowerCase()
          if (!hay.includes(debounced.toLowerCase())) return false
        }
        return true
      })
      .sort((a, b) => a.slug.localeCompare(b.slug))
  }, [fabrics, line, saleMode, grade, retailOnly, gradeCOnly, debounced])

  // Facet counts: from unfiltered set minus that facet's own selection
  const facetCounts = useMemo(() => {
    const base = fabrics
    const countBy = (fn: (f: Fabric) => boolean): number => base.filter(fn).length
    return {
      women: countBy((f) => f.line === 'women'),
      men: countBy((f) => f.line === 'men'),
      wholesale: countBy((f) => f.saleMode === 'wholesale'),
      retail: countBy((f) => f.saleMode === 'retail'),
      both: countBy((f) => f.saleMode === 'both'),
      A: countBy((f) => f.grade === 'A'),
      B: countBy((f) => f.grade === 'B'),
      C: countBy((f) => f.grade === 'C'),
    }
  }, [fabrics])

  const reset = (): void => {
    setLine('all')
    setSaleMode('all')
    setGrade('all')
    setRetailOnly(false)
    setGradeCOnly(false)
    setQuery('')
  }

  return (
    <div className="container" style={{ paddingBlock: '48px' }}>
      <h1 className="section__title">{l === 'ar' ? 'كتالوج الأقمشة' : 'Fabric catalog'}</h1>
      <p className="section__sub">{l === 'ar' ? 'اختر الخط قبل الفلترة — جملة أو قطاعي' : 'Pick a line before filtering deeper — wholesale or retail'}</p>

      <div className="quick-chips" aria-label="Retail quick filters">
        <button type="button" className={`chip ${retailOnly ? 'chip--blue' : 'chip--mono'}`} onClick={() => setRetailOnly((v) => !v)} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
          {l === 'ar' ? 'قطاعي فقط' : 'Retail only'} ({facetCounts.retail + facetCounts.both})
        </button>
        <button type="button" className={`chip ${gradeCOnly ? 'chip--madder' : 'chip--mono'}`} onClick={() => setGradeCOnly((v) => !v)} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
          {l === 'ar' ? 'درجة C' : 'Grade C'} ({facetCounts.C})
        </button>
        <span className="chip chip--mono">{filtered.length} fabrics</span>
      </div>

      <div className="catalog-layout">
        <aside className="filters-rail" aria-label="Filters">
          <div className="filter-group">
            <h4>{l === 'ar' ? 'الخط' : 'Line'}</h4>
            <div className="filter-chips">
              {(['all', 'women', 'men'] as const).map((v) => (
                <button key={v} className={`chip ${line === v ? 'chip--blue' : 'chip--mono'}`} onClick={() => setLine(v)} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
                  {v} {v !== 'all' && `(${v === 'women' ? facetCounts.women : facetCounts.men})`}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <h4>{l === 'ar' ? 'جملة / قطاعي' : 'Sale mode'}</h4>
            <div className="filter-chips">
              {(['all', 'wholesale', 'retail', 'both'] as const).map((v) => (
                <button key={v} className={`chip ${saleMode === v ? 'chip--blue' : 'chip--mono'}`} onClick={() => setSaleMode(v)} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
                  {v} {v !== 'all' && `(${facetCounts[v as keyof typeof facetCounts] || 0})`}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <h4>{l === 'ar' ? 'الدرجة' : 'Grade'}</h4>
            <div className="filter-chips">
              {(['all', 'A', 'B', 'C'] as const).map((v) => (
                <button key={v} className={`chip ${grade === v ? 'chip--blue' : 'chip--mono'}`} onClick={() => setGrade(v as 'all' | 'A' | 'B' | 'C')} style={{ minBlockSize: '44px', minInlineSize: '44px' }}>
                  {v} {v !== 'all' && `(${facetCounts[v as 'A' | 'B' | 'C']})`}
                </button>
              ))}
            </div>
          </div>
          <div className="fabrics__toolbar" style={{ marginBlockStart: '1rem' }}>
            <label className="fabrics__search" aria-label="Search fabrics">
              <span aria-hidden="true">⌕</span>
              <input
                id="fabric-search"
                type="search"
                placeholder={l === 'ar' ? 'ابحث...' : 'Search...'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ minBlockSize: '44px' }}
              />
            </label>
          </div>
          <button className="btn btn--ghost btn--sm" onClick={reset} style={{ marginBlockStart: '1rem', minBlockSize: '44px', minInlineSize: '44px' }}>
            {l === 'ar' ? 'إعادة تعيين' : 'Reset'}
          </button>
        </aside>

        <div>
          {loading ? (
            <SkeletonGrid count={6} />
          ) : filtered.length === 0 ? (
            <EmptyState onReset={reset} />
          ) : (
            <div className="fabrics__grid" id="fabrics-grid">
              {filtered.map((f) => (
                <FabricCard key={f.slug} fabric={f} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
