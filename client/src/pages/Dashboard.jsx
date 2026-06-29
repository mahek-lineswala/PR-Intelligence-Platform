import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { formatRelative } from '../utils/format'

export default function Dashboard() {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    api.get('/repos')
      .then(res => setRepos(res.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!query) return repos
    const q = query.toLowerCase()
    return repos.filter(r => r.full_name.toLowerCase().includes(q))
  }, [repos, query])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Your repositories</h1>
        <p className="text-[var(--color-muted)] mt-1 text-sm">
          Select a repository to see pull request metrics from the last 90 days.
        </p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Filter repositories…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors"
        />
      </div>

      {loading && (
        <div className="text-[var(--color-muted)]">Loading repositories…</div>
      )}

      {error && (
        <div className="text-[var(--color-danger)] text-sm bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(repo => (
            <Link
              key={repo.id}
              to={`/repo/${repo.owner}/${repo.name}`}
              className="group p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-accent)] transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                  {repo.name}
                </div>
                {repo.private && (
                  <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted)] border border-[var(--color-border)] rounded px-1.5 py-0.5">
                    Private
                  </span>
                )}
              </div>
              <div className="text-xs text-[var(--color-muted)] truncate mb-3">
                {repo.full_name}
              </div>
              {repo.description && (
                <div className="text-sm text-[var(--color-muted)] line-clamp-2 mb-3">
                  {repo.description}
                </div>
              )}
              <div className="flex items-center gap-4 text-xs text-[var(--color-muted)]">
                {repo.language && <span>{repo.language}</span>}
                <span>★ {repo.stargazers_count}</span>
                <span>Updated {formatRelative(repo.updated_at)}</span>
              </div>
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-[var(--color-muted)]">
              No repositories match your filter.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
