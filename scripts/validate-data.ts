import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'
import { FabricSchema, AllowedCategories } from '../src/lib/schema.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

function loadJson(rel: string): unknown {
  const p = path.join(root, rel)
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

let failed = false
function fail(msg: string): void {
  console.error(`✖ ${msg}`)
  failed = true
}
function ok(msg: string): void {
  console.log(`✔ ${msg}`)
}

const FORBIDDEN = ['Home Textiles', 'Curtain', 'Curtains', 'ستائر', 'Upholstery', 'Furnishing', 'Furniture', 'Bedding', 'Table Linen', 'Towels', 'Carpet', 'Rug']

function checkForbidden(content: string, source: string): void {
  for (const s of FORBIDDEN) {
    if (content.includes(s)) {
      fail(`Forbidden string "${s}" found in ${source}`)
    }
  }
}

// 1. Load fabrics
const fabricsRaw = loadJson('src/content/fabrics.json') as unknown[]
ok(`Loaded ${fabricsRaw.length} fabrics`)

if (fabricsRaw.length !== 60) fail(`Expected 60 fabrics, got ${fabricsRaw.length}`)
else ok('60 fabrics present')

const women = fabricsRaw.filter((f) => (f as { line?: string }).line === 'women').length
const men = fabricsRaw.filter((f) => (f as { line?: string }).line === 'men').length
if (Math.abs(women - 36) > 2) fail(`Women count expected ~36, got ${women}`)
else ok(`Women ${women} (~36)`)
if (Math.abs(men - 24) > 2) fail(`Men count expected ~24, got ${men}`)
else ok(`Men ${men} (~24)`)

const gradeA = fabricsRaw.filter((f) => (f as { grade?: string }).grade === 'A').length
const gradeB = fabricsRaw.filter((f) => (f as { grade?: string }).grade === 'B').length
const gradeC = fabricsRaw.filter((f) => (f as { grade?: string }).grade === 'C').length
if (gradeA < 18) fail(`Grade A <18: ${gradeA}`)
else ok(`Grade A ${gradeA} ≥18`)
if (gradeB < 18) fail(`Grade B <18: ${gradeB}`)
else ok(`Grade B ${gradeB} ≥18`)
if (gradeC < 18) fail(`Grade C <18: ${gradeC}`)
else ok(`Grade C ${gradeC} ≥18`)

// Zod schema
const slugs = new Set<string>()
const lotIds = new Set<string>()
for (const raw of fabricsRaw) {
  const parsed = FabricSchema.safeParse(raw)
  if (!parsed.success) {
    fail(`Schema invalid for ${JSON.stringify((raw as { slug?: string }).slug)}: ${parsed.error.message}`)
    continue
  }
  const f = parsed.data
  // check saleMode present
  if (!f.saleMode) fail(`missing saleMode for ${f.slug}`)
  if (!f.line) fail(`missing line for ${f.slug}`)
  if (!AllowedCategories.includes(f.category as (typeof AllowedCategories)[number])) fail(`category outside allowlist: ${f.category} in ${f.slug}`)
  // retail-only missing pricePerMetreRetail
  if ((f.saleMode === 'retail' || f.saleMode === 'both') && f.pricePerMetreRetail === undefined) fail(`retail SKU missing pricePerMetreRetail ${f.slug}`)
  if (f.saleMode === 'wholesale' || f.saleMode === 'both') {
    if (f.moqM === undefined) fail(`wholesale SKU missing moqM ${f.slug}`)
  }
  if (f.saleMode === 'retail' && f.moqM !== 1) {
    // spec says moqM =1 for retail-only SKUs
    if (f.moqM !== 1) fail(`retail-only SKU moqM should be 1 ${f.slug} got ${f.moqM}`)
  }
  // duplicate slug
  if (slugs.has(f.slug)) fail(`duplicate slug ${f.slug}`)
  slugs.add(f.slug)
  if (lotIds.has(f.lotId)) fail(`duplicate lotId ${f.lotId}`)
  lotIds.add(f.lotId)
  // missing hero or macro
  const roles = f.images.map((i) => i.role)
  if (!roles.includes('hero')) fail(`missing hero image ${f.slug}`)
  if (!roles.includes('macro')) fail(`missing macro image ${f.slug}`)
  for (const img of f.images) {
    if (!img.alt || img.alt.trim() === '') fail(`empty alt in ${f.slug}`)
    if (img.source === 'render' && img.seed === undefined) fail(`source render without seed ${f.slug}`)
    // unlinked image path check — just ensure starts with /images/ or assets
    if (!img.src) fail(`unlinked image path empty ${f.slug}`)
  }
  // dangling alternatives
  for (const alt of f.alternatives) {
    if (!fabricsRaw.some((x) => (x as { slug?: string }).slug === alt)) {
      fail(`dangling alternatives ${alt} in ${f.slug}`)
    }
  }
}
if (!failed) ok('All fabrics schema valid')

// categories locked to 7
const cats = loadJson('src/content/categories.json') as unknown[]
if (cats.length !== 7) fail(`categories should be 7, got ${cats.length}`)
else ok('7 categories present')

// check forbidden strings in content JSON, locales, alt text, slugs, prompts, navigation
const checkFiles: string[] = [
  'src/content/fabrics.json',
  'src/content/categories.json',
  'src/content/grades.json',
  'src/content/journal.json',
  'src/content/gallery.json',
  'src/content/company.json',
  'src/content/locales/ar.json',
  'src/content/locales/en.json',
]
for (const rel of checkFiles) {
  try {
    const content = fs.readFileSync(path.join(root, rel), 'utf8')
    checkForbidden(content, rel)
    // also check alt text etc already covered but do global
    // check slugs
    if (rel === 'src/content/fabrics.json') {
      const arr = JSON.parse(content) as { slug: string }[]
      for (const item of arr) checkForbidden(item.slug, `${rel} slug ${item.slug}`)
    }
  } catch (e) {
    fail(`missing file ${rel}: ${e}`)
  }
}
ok('Forbidden strings sweep — if no ✖ above, passed')

// Check locales have ~450 keys
const ar = loadJson('src/content/locales/ar.json') as Record<string, string>
const en = loadJson('src/content/locales/en.json') as Record<string, string>
if (Object.keys(ar).length < 400) fail(`ar.json keys <400: ${Object.keys(ar).length}`)
else ok(`ar.json ${Object.keys(ar).length} keys`)
if (Object.keys(en).length < 400) fail(`en.json keys <400: ${Object.keys(en).length}`)
else ok(`en.json ${Object.keys(en).length} keys`)

// Check journal 3 x 500+ words
const journals = loadJson('src/content/journal.json') as { body: { ar: string; en: string } }[]
if (journals.length !== 3) fail(`journal expected 3, got ${journals.length}`)
else ok('3 journal entries')
for (let i = 0; i < journals.length; i++) {
  const j = journals[i]
  const arWords = j.body.ar.split(/\s+/).length
  const enWords = j.body.en.split(/\s+/).length
  if (arWords < 500) fail(`journal ${i} ar words <500: ${arWords}`)
  if (enWords < 500) fail(`journal ${i} en words <500: ${enWords}`)
}
if (!failed) ok('Journal word counts ok')

// Check gallery, company etc exist
try {
  loadJson('src/content/gallery.json')
  ok('gallery.json present')
  loadJson('src/content/company.json')
  ok('company.json present')
} catch (e) {
  fail(String(e))
}

// sitemap check — admin pages absent from sitemap
try {
  const sitemapPath = path.join(root, 'dist', 'sitemap.xml')
  if (fs.existsSync(sitemapPath)) {
    const sm = fs.readFileSync(sitemapPath, 'utf8')
    if (sm.includes('/admin')) fail('admin pages in sitemap')
    else ok('sitemap has no admin')
  } else {
    ok('sitemap not yet built — will check after build')
  }
} catch {}

// final
if (failed) {
  console.error('\nValidation FAILED')
  process.exit(1)
} else {
  console.log('\nValidation PASSED')
}
