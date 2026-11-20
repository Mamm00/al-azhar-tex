export type ProviderId = 'pollinations' | 'venice' | 'manual'

export type GenConfig = {
  provider: ProviderId
  apiKey?: string
  model?: string
  steps?: number
}

export function getGenConfig(): GenConfig {
  try {
    const raw = localStorage.getItem('azt:v2:gen')
    if (!raw) return { provider: 'pollinations' }
    const parsed = JSON.parse(raw) as GenConfig
    if (parsed && typeof parsed.provider === 'string') return parsed
    return { provider: 'pollinations' }
  } catch {
    return { provider: 'pollinations' }
  }
}

export function setGenConfig(cfg: GenConfig): void {
  try {
    localStorage.setItem('azt:v2:gen', JSON.stringify(cfg))
  } catch {
    // ignore
  }
}

export function pollinationsUrl(prompt: string, width: number, height: number, seed: number): string {
  const enc = encodeURIComponent(prompt)
  return `https://image.pollinations.ai/prompt/${enc}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`
}

export async function generateVenice(prompt: string, opts: { width: number; height: number; seed: number; model: string; steps: number; apiKey: string }): Promise<string> {
  const res = await fetch('https://api.venice.ai/api/v1/image/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      prompt,
      negative_prompt: 'text, watermark, logo, clutter, mannequin face, oversaturation, distorted weave, curtain, upholstery, home textile, furnishing',
      width: opts.width,
      height: opts.height,
      steps: opts.steps,
      seed: opts.seed,
      format: 'webp',
    }),
  })
  if (!res.ok) {
    throw new Error(`Venice ${res.status} ${res.statusText}`)
  }
  const data = (await res.json()) as { images?: string[]; image?: string }
  const b64 = data.images?.[0] || data.image
  if (!b64) throw new Error('No image in Venice response')
  // if already data url return, else assume base64
  if (b64.startsWith('data:')) return b64
  return `data:image/webp;base64,${b64}`
}

export function maskKey(key: string): string {
  if (!key) return ''
  if (key.length <= 4) return '****'
  return '****' + key.slice(-4)
}
