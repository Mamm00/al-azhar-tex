export type ImageRole =
  | 'hero'
  | 'macro'
  | 'drape'
  | 'shade-flat'
  | 'grade-evidence'
  | 'gallery-floor'
  | 'gallery-frontage'
  | 'founder'
  | 'journal'
  | 'og'
  | 'placeholder'

export const IMAGE_ROLES: Record<ImageRole, { ratio: string; width: number; height: number; style: string; negative: string }> = {
  hero: {
    ratio: '16:9',
    width: 1600,
    height: 900,
    style: 'studio lit apparel fabric, elegant, commercial',
    negative: 'text, watermark, logo, clutter, mannequin face, oversaturation, distorted weave, curtain, upholstery, home textile, furnishing',
  },
  macro: {
    ratio: '4:5',
    width: 1280,
    height: 1600,
    style: 'extreme macro textile weave, sharp focus',
    negative: 'text, watermark, logo, clutter, mannequin face, oversaturation, distorted weave, curtain, upholstery, home textile, furnishing',
  },
  drape: {
    ratio: '3:4',
    width: 1200,
    height: 1600,
    style: 'fabric drape on hanger, soft folds, natural light',
    negative: 'text, watermark, logo, clutter, mannequin face, oversaturation, distorted weave, curtain, upholstery, home textile, furnishing',
  },
  'shade-flat': {
    ratio: '1:1',
    width: 1200,
    height: 1200,
    style: 'flat lay fabric swatch, even lighting, true color',
    negative: 'text, watermark, logo, clutter, mannequin face, oversaturation, distorted weave, curtain, upholstery, home textile, furnishing',
  },
  'grade-evidence': {
    ratio: '4:5',
    width: 1280,
    height: 1600,
    style: 'macro showing grade evidence, honest texture detail',
    negative: 'text, watermark, logo, clutter, mannequin face, oversaturation, distorted weave, curtain, upholstery, home textile, furnishing',
  },
  'gallery-floor': {
    ratio: '3:2',
    width: 1600,
    height: 1067,
    style: 'gallery interior, fabric bolts on shelves, welcoming retail space',
    negative: 'text, watermark, logo, clutter, mannequin face, oversaturation, distorted weave, curtain, upholstery, home textile, furnishing',
  },
  'gallery-frontage': {
    ratio: '3:2',
    width: 1600,
    height: 1067,
    style: 'storefront frontage, street view, signage',
    negative: 'text, watermark, logo, clutter, mannequin face, oversaturation, distorted weave, curtain, upholstery, home textile, furnishing',
  },
  founder: {
    ratio: '4:5',
    width: 1280,
    height: 1600,
    style: 'professional founder portrait, warm, authentic',
    negative: 'text, watermark, logo, clutter, mannequin face, oversaturation, distorted weave, curtain, upholstery, home textile, furnishing',
  },
  journal: {
    ratio: '16:9',
    width: 1600,
    height: 900,
    style: 'editorial journal header, textile story',
    negative: 'text, watermark, logo, clutter, mannequin face, oversaturation, distorted weave, curtain, upholstery, home textile, furnishing',
  },
  og: {
    ratio: '1200:630',
    width: 1200,
    height: 630,
    style: 'open graph banner, brand, clean',
    negative: 'text, watermark, logo, clutter, mannequin face, oversaturation, distorted weave, curtain, upholstery, home textile, furnishing',
  },
  placeholder: {
    ratio: '4:5',
    width: 640,
    height: 800,
    style: 'placeholder textile, minimal',
    negative: 'text, watermark, logo, clutter, mannequin face, oversaturation, distorted weave, curtain, upholstery, home textile, furnishing',
  },
}
