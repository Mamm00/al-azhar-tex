import { IMAGE_ROLES, type ImageRole } from './imageRoles'

type Tokens = {
  composition?: string
  construction?: string
  gsm?: string | number
  shade?: string
  grade?: string
  line?: string
  saleMode?: string
  category?: string
  name?: string
}

const TEMPLATES: Record<ImageRole, string> = {
  hero: 'Apparel fabric {{name}}, {{composition}} {{construction}} {{gsm}}gsm, shade {{shade}}, grade {{grade}}, line {{line}}, {{category}}, sale {{saleMode}} — hero 16:9, elegant drape, studio light',
  macro: 'Macro weave {{composition}} {{construction}} {{gsm}}gsm {{shade}} grade {{grade}} line {{line}} — 4:5 extreme close-up, sharp focus, honest texture',
  drape: 'Drape render {{name}} {{composition}} {{gsm}}gsm {{shade}} grade {{grade}} line {{line}} — 3:4 {{saleMode}} folded/held, hand-feel focus',
  'shade-flat': 'Flat lay swatch {{name}} {{composition}} {{shade}} grade {{grade}} — 1:1 true color, even lighting',
  'grade-evidence': 'Grade evidence {{grade}} {{composition}} {{gsm}}gsm — 4:5 macro honest defect if grade C: slight weave irregularity',
  'gallery-floor': 'Gallery floor retail display {{category}} bolts — 3:2 welcoming showroom',
  'gallery-frontage': 'Storefront Al Azhar Tex gallery — 3:2 street frontage',
  founder: 'Founder portrait — 4:5 warm professional',
  journal: 'Journal header {{name}} — 16:9 editorial',
  og: 'OG banner {{name}} {{line}} — 1200x630 brand',
  placeholder: 'Placeholder {{name}} {{grade}} — 4:5 minimal',
}

export function composePrompt(role: ImageRole, tokens: Tokens): string {
  const tmpl = TEMPLATES[role] || TEMPLATES.placeholder
  let out = tmpl
  for (const [k, v] of Object.entries(tokens)) {
    out = out.replaceAll(`{{${k}}}`, String(v ?? ''))
  }
  // Remove unfilled tokens
  out = out.replaceAll(/\{\{[^}]+\}\}/g, '')
  // Inject line/body context
  if (tokens.line === 'women') {
    out += ', women apparel context, dress/blouse drape'
  } else if (tokens.line === 'men') {
    out += ', men shirting/suiting context, shirt/trouser drape'
  }
  // Grade honesty
  if (tokens.grade === 'C') out += ', slight weave irregularity, honest defect, value grade, not flawless'
  else if (tokens.grade === 'A') out += ', tight even weave, premium finish'
  // Retail drape rule
  if (tokens.saleMode === 'retail' && role === 'drape') {
    out += ', fabric folded and held in hands, hand-feel focus, not on model'
  }
  // Negative auto-append
  const neg = IMAGE_ROLES[role].negative
  out += ` --neg ${neg}`
  return out.trim()
}

export function tokenList(): string[] {
  return ['composition', 'construction', 'gsm', 'shade', 'grade', 'line', 'saleMode', 'category', 'name']
}
