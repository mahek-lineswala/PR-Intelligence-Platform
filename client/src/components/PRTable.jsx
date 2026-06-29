import { useMemo, useState } from 'react'
import { formatHours, formatRelative } from '../utils/format'

const STATE_STYLES = {
  open: 'bg-green-500/15 text-green-400 border-green-500/30',
  merged: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  closed: 'bg-red-500/15 text-red-400 border-red-500/30',
}

export default function PRTable({ prs }) {
  const [filter, setFilter] = useState('all')
  const [author, setAuthor] = useState('all')

  const authors = useMemo(
    () => Array.from(new Set(prs.map(p => p.author))).sort(),
    [prs]
  )

  const filtered = useMemo(() => {
    return prs.filter(p => {
      if (filter !== 'all' && p.state !== filter) return false
      if (author !== 'all' && p.author !== author) return false
      return true
    })
  }, [prs, filter, author])

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
        <h3 className="font-medium">Pull requests</h3>
        <div className="flex items-center gap-3">
          <select
            value={author}
            onChange={e => setAuthor(e.target.value)}
            className="text-xs px-2 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md"
          >
            <option value="all">All authors</option>
            {authors.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="text-xs px-2 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md"
          >
            <option value="all">All states</option>
            <option value="open">Open</option>
            <option value="merged">Merged</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-[var(--color-muted)] bg-[var(--color-surface-2)]">
            <tr>
              <th className="text-left px-5 py-3 font-medium">PR</th>
              <th className="text-left px-3 py-3 font-medium">Author</th>
              <th className="text-left px-3 py-3 font-medium">State</th>
              <th className="text-right px-3 py-3 font-medium">Size</th>
              <th className="text-right px-3 py-3 font-medium">Reviews</th>
              <th className="text-right px-3 py-3 font-medium">Cycle</th>
              <th className="text-right px-5 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(pr => (
              <tr
                key={pr.number}
                className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/50 transition-colors"
              >
                <td className="px-5 py-3">
                  <a
                    href={pr.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[var(--color-accent)] transition-colors"
                  >
                    <span className="text-[var(--color-muted)] mr-2">#{pr.number}</span>
                    <span className="font-medium">{pr.title}</span>
                  </a>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={pr.avatar_url}
                      alt={pr.author}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="text-[var(--color-muted)]">{pr.author}</span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`text-[10px] uppercase tracking-wider border rounded px-1.5 py-0.5 ${STATE_STYLES[pr.state]}`}
                  >
                    {pr.state}
                  </span>
                </td>
                <td className="px-3 py-3 text-right font-mono text-xs">
                  <span className="text-green-400">+{pr.additions}</span>
                  <span className="text-[var(--color-muted)] mx-1">/</span>
                  <span className="text-red-400">-{pr.deletions}</span>
                </td>
                <td className="px-3 py-3 text-right text-[var(--color-muted)]">
                  {pr.review_count}
                </td>
                <td className="px-3 py-3 text-right text-[var(--color-muted)]">
                  {formatHours(pr.cycle_time_hours)}
                </td>
                <td className="px-5 py-3 text-right text-[var(--color-muted)] text-xs">
                  {formatRelative(pr.created_at)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-[var(--color-muted)]">
                  No pull requests match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
