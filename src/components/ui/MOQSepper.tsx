import { useState, useEffect } from 'react'

type Props = {
  value: number
  onChange: (v: number) => void
  min: number
  step: number
  label?: string
}
export function MOQStepper({ value, onChange, min, step, label }: Props) {
  const [input, setInput] = useState(String(value))

  useEffect(() => {
    setInput(String(value))
  }, [value])

  const clamp = (n: number): number => {
    if (n < min) return min
    return n
  }

  const commit = (raw: string): void => {
    const stripped = raw.replace(/\D/g, '')
    let n = parseInt(stripped || String(min), 10)
    if (isNaN(n)) n = min
    // enforce step alignment
    if (step > 1) {
      const offset = n - min
      const steps = Math.round(offset / step)
      n = min + steps * step
    }
    n = clamp(n)
    onChange(n)
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      <button
        type="button"
        className="btn btn--ghost btn--sm"
        aria-label="decrease"
        style={{ minInlineSize: '44px', minBlockSize: '44px' }}
        onClick={() => onChange(clamp(value - step))}
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        aria-label={label || 'metres'}
        aria-valuetext={`${value} metres`}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onBlur={() => commit(input)}
        onPaste={(e) => {
          const text = e.clipboardData.getData('text')
          if (/\D/.test(text)) {
            e.preventDefault()
            const stripped = text.replace(/\D/g, '')
            setInput(stripped)
            commit(stripped)
          }
        }}
        style={{
          inlineSize: '80px',
          textAlign: 'center',
          padding: '0.5rem',
          border: '1px solid var(--line)',
          borderRadius: '12px',
          minBlockSize: '44px',
        }}
      />
      <button
        type="button"
        className="btn btn--ghost btn--sm"
        aria-label="increase"
        style={{ minInlineSize: '44px', minBlockSize: '44px' }}
        onClick={() => onChange(clamp(value + step))}
      >
        +
      </button>
    </div>
  )
}
