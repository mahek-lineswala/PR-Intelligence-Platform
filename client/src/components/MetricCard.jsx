export default function MetricCard({ label, value, hint, accent }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
      <div className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-2">
        {label}
      </div>
      <div
        className="text-3xl font-semibold tracking-tight"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </div>
      {hint && (
        <div className="text-xs text-[var(--color-muted)] mt-2">{hint}</div>
      )}
    </div>
  )
}
