import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'
import MetricCard from '../components/MetricCard'
import TrendChart from '../components/TrendChart'
import PRTable from '../components/PRTable'
import EngineerTable from '../components/EngineerTable'
import { formatHours, formatNumber, formatRelative } from '../utils/format'

export default function RepoView() {
  const { owner, repo } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = (refresh = false) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)
    api
      .get(`/metrics/${owner}/${repo}`, { params: refresh ? { refresh: 1 } : {} })
      .then(res => {
        setData(res.data)
        setError(null)
      })
      .catch(err =>
        setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load metrics')
      )
      .finally(() => {
        setLoading(false)
        setRefreshing(false)
      })
  }

  useEffect(() => {
    load(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, repo])

  if (loading) {
    return (
      <div className="text-[var(--color-muted)]">
        Loading metrics for <span className="text-[var(--color-text)]">{owner}/{repo}</span>… This can take a moment for large repos.
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Link to="/dashboard" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]">
          ← Back to repositories
        </Link>
        <div className="mt-6 text-[var(--color-danger)] text-sm bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 rounded-lg px-3 py-2">
          {error}
        </div>
      </div>
    )
  }

  const { summary, engineers, prs, trend, fetched_at, cached } = data

  return (
    <div className="space-y-6">
      <div>
        <Link to="/dashboard" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
          ← Back to repositories
        </Link>
        <div className="mt-3 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {owner}/<span className="text-[var(--color-accent)]">{repo}</span>
            </h1>
            <p className="text-sm text-[var(--color-muted)] mt-1">
              Last 90 days · {summary.total_prs} pull requests
              {fetched_at && (
                <>
                  {' · Updated '}
                  {formatRelative(fetched_at)}
                  {cached && ' (cached)'}
                </>
              )}
            </p>
          </div>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="text-xs px-3 py-2 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors disabled:opacity-50"
          >
            {refreshing ? 'Refreshing…' : 'Refresh data'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total PRs"
          value={summary.total_prs}
          hint={`${summary.open} open · ${summary.merged} merged · ${summary.closed} closed`}
        />
        <MetricCard
          label="Avg cycle time"
          value={formatHours(summary.avg_cycle_time_hours)}
          hint="Open → merge"
          accent="#8b5cf6"
        />
        <MetricCard
          label="Merge rate"
          value={`${summary.merge_rate}%`}
          hint="Merged ÷ total"
          accent="#22c55e"
        />
        <MetricCard
          label="Time to first review"
          value={formatHours(summary.avg_time_to_first_review_hours)}
          hint="PR opened → first review"
          accent="#f59e0b"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Avg review depth"
          value={summary.avg_review_depth}
          hint="Comments per PR"
        />
        <MetricCard
          label="Avg PR size"
          value={formatNumber(summary.avg_pr_size)}
          hint="Lines added + deleted"
        />
        <MetricCard
          label="Contributors"
          value={engineers.length}
          hint="Authors + reviewers"
        />
      </div>

      <TrendChart data={trend} />

      <EngineerTable engineers={engineers} />

      <PRTable prs={prs} />
    </div>
  )
}
