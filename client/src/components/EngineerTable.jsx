import { formatHours, formatNumber } from '../utils/format'

export default function EngineerTable({ engineers }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
      <div className="p-5 border-b border-[var(--color-border)]">
        <h3 className="font-medium">Engineers</h3>
        <p className="text-xs text-[var(--color-muted)] mt-1">
          Activity per contributor over the selected window
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-[var(--color-muted)] bg-[var(--color-surface-2)]">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Engineer</th>
              <th className="text-right px-3 py-3 font-medium">PRs opened</th>
              <th className="text-right px-3 py-3 font-medium">Merged</th>
              <th className="text-right px-3 py-3 font-medium">Merge rate</th>
              <th className="text-right px-3 py-3 font-medium">Reviews given</th>
              <th className="text-right px-3 py-3 font-medium">Avg cycle</th>
              <th className="text-right px-5 py-3 font-medium">Lines changed</th>
            </tr>
          </thead>
          <tbody>
            {engineers.map(e => (
              <tr
                key={e.login}
                className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/50 transition-colors"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={e.avatar_url}
                      alt={e.login}
                      className="w-7 h-7 rounded-full border border-[var(--color-border)]"
                    />
                    <span className="font-medium">{e.login}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-right">{e.prs_opened}</td>
                <td className="px-3 py-3 text-right">{e.prs_merged}</td>
                <td className="px-3 py-3 text-right text-[var(--color-muted)]">
                  {e.prs_opened ? `${e.merge_rate}%` : '—'}
                </td>
                <td className="px-3 py-3 text-right">{e.reviews_given}</td>
                <td className="px-3 py-3 text-right text-[var(--color-muted)]">
                  {formatHours(e.avg_cycle_time)}
                </td>
                <td className="px-5 py-3 text-right font-mono text-xs">
                  <span className="text-green-400">
                    +{formatNumber(e.total_additions)}
                  </span>
                  <span className="text-[var(--color-muted)] mx-1">/</span>
                  <span className="text-red-400">
                    -{formatNumber(e.total_deletions)}
                  </span>
                </td>
              </tr>
            ))}
            {engineers.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-[var(--color-muted)]">
                  No contributor activity yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
