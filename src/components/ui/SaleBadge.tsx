export function SaleBadge({ saleMode }: { saleMode: 'wholesale' | 'retail' | 'both' }) {
  if (saleMode === 'both') {
    return (
      <div className="fabric-card__badges">
        <span className="chip chip--mono">قطاعي · RETAIL</span>
        <span className="chip chip--mono">جملة · WHOLESALE</span>
      </div>
    )
  }
  if (saleMode === 'retail') {
    return <span className="chip chip--mono">قطاعي · RETAIL</span>
  }
  return <span className="chip chip--mono">جملة · WHOLESALE</span>
}
