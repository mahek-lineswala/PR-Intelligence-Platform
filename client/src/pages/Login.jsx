import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const error = params.get('error')

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 mb-5 text-white font-bold text-xl">
            PR
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Pull Request Intelligence
          </h1>
          <p className="text-[var(--color-muted)] mt-3">
            Sign in with GitHub to surface quality metrics and engineer insights
            across your repositories.
          </p>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-5 text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 rounded-lg px-3 py-2">
              Authentication failed. Please try again.
            </div>
          )}

          <button
            onClick={login}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium rounded-lg py-3 hover:bg-gray-100 transition-colors disabled:opacity-60"
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            {loading ? 'Checking session…' : 'Continue with GitHub'}
          </button>

          <p className="text-xs text-[var(--color-muted)] text-center mt-5">
            We request <code className="bg-[var(--color-surface-2)] px-1 rounded">repo</code> and{' '}
            <code className="bg-[var(--color-surface-2)] px-1 rounded">read:user</code> scopes.
            Tokens are stored server-side only.
          </p>
        </div>
      </div>
    </div>
  )
}
