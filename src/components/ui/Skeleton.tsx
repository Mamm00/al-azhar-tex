export function Skeleton() {
  return <div className="skeleton" aria-hidden="true" />
}
export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="fabrics__grid">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={`sk-${i}`} />
      ))}
    </div>
  )
}
