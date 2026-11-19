import { z } from 'zod'

export const AllowedCategories = [
  "Women's Apparel",
  "Men's Apparel",
  'Lace & Tulle',
  'Jersey & Knit',
  'Shirting',
  'Linings',
  'Surplus',
] as const

export const LineEnum = z.enum(['women', 'men'])
export const SaleModeEnum = z.enum(['wholesale', 'retail', 'both'])
export const GradeEnum = z.enum(['A', 'B', 'C'])

export const ImageSchema = z.object({
  role: z.enum(['hero', 'macro', 'drape', 'shade-flat', 'grade-evidence', 'gallery-floor', 'gallery-frontage', 'founder', 'journal', 'og', 'placeholder']),
  src: z.string().min(1),
  alt: z.string().min(1, 'alt text never empty').max(125),
  source: z.enum(['photo', 'render']),
  seed: z.number().optional(),
})

export const FabricSchema = z.object({
  slug: z.string().min(1),
  code: z.string().min(1),
  name: z.object({ ar: z.string().min(1), en: z.string().min(1) }),
  line: LineEnum,
  category: z.enum(AllowedCategories as unknown as [string, ...string[]]),
  grade: GradeEnum,
  saleMode: SaleModeEnum,
  composition: z.string().min(1),
  gsm: z.number().int().positive(),
  width: z.number().positive(),
  construction: z.string().min(1),
  finish: z.string().min(1),
  availability: z.enum(['in-stock', 'low-stock', 'out-of-stock']),
  moqM: z.number().int().min(1),
  pricePerMetreRetail: z.union([z.number().int().nonnegative(), z.literal('TBD')]),
  pricePerLotWholesale: z.union([z.number().int().nonnegative(), z.literal('TBD')]),
  lotId: z.string().min(1),
  shades: z.array(z.object({ name: z.string().min(1), hex: z.string().min(1) })).optional(),
  images: z.array(ImageSchema).min(1),
  alternatives: z.array(z.string()).default([]),
  featured: z.boolean().optional(),
  constructionDetail: z.string().optional(),
  gradeNotes: z.object({ ar: z.string().min(1), en: z.string().min(1) }).optional(),
  bench: z
    .object({
      weight: z.number(),
      drape: z.number(),
      breathability: z.number(),
    })
    .optional(),
})

export const CategorySchema = z.object({
  slug: z.string().min(1),
  name: z.object({ ar: z.string().min(1), en: z.string().min(1) }),
})

export const GradeSchema = z.object({
  id: z.enum(['A', 'B', 'C']),
  name: z.object({ ar: z.string().min(1), en: z.string().min(1) }),
  tag: z.object({ ar: z.string().min(1), en: z.string().min(1) }),
  description: z.object({ ar: z.string().min(1), en: z.string().min(1) }),
  colorVar: z.string().min(1),
})

export const JournalSchema = z.object({
  slug: z.string().min(1),
  title: z.object({ ar: z.string().min(1), en: z.string().min(1) }),
  excerpt: z.object({ ar: z.string().min(1), en: z.string().min(1) }),
  body: z.object({ ar: z.string().min(1), en: z.string().min(1) }),
  date: z.string().min(1),
  image: z.string().min(1),
})

export const GallerySchema = z.object({
  hero: z.object({
    image: z.string().min(1),
    alt: z.object({ ar: z.string().min(1), en: z.string().min(1) }),
  }),
  floorImages: z.array(z.string()),
  hours: z.string(),
  address: z.object({ ar: z.string().min(1), en: z.string().min(1) }),
  mapUrl: z.string().url().or(z.literal('TBD')),
  parkingNote: z.object({ ar: z.string().min(1), en: z.string().min(1) }),
})

export const CompanySchema = z.object({
  name: z.string().min(1),
  founder: z.string().min(1),
  address: z.object({ ar: z.string().min(1), en: z.string().min(1) }),
  landmark: z.object({ ar: z.string().min(1), en: z.string().min(1) }),
  phones: z.array(z.object({ label: z.string(), display: z.string(), href: z.string(), wa: z.string() })).length(2),
  email: z.string().email(),
  galleryHours: z.string(),
  admin: z.object({ passwordHash: z.string().min(1) }),
  retailCutNotice: z.object({ ar: z.string().min(1), en: z.string().min(1) }),
})

export type Fabric = z.infer<typeof FabricSchema>
export type Category = z.infer<typeof CategorySchema>
