import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm">
              PR
            </div>
            <span className="font-semibold tracking-tight">PR Intelligence</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            <Link
              to="/dashboard"
              className={`transition-colors ${
                location.pathname === '/dashboard'
                  ? 'text-[var(--color-text)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              Repositories
            </Link>

            {user && (
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="w-7 h-7 rounded-full border border-[var(--color-border)]"
                />
                <span className="text-sm text-[var(--color-muted)] hidden sm:inline">
                  {user.login}
                </span>
                <button
                  onClick={logout}
                  className="text-xs px-3 py-1.5 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-[var(--color-border)] py-4 text-center text-xs text-[var(--color-muted)]">
        PR Intelligence Platform • Senior Full-Stack Engineer Assessment
      </footer>
    </div>
  )
}
