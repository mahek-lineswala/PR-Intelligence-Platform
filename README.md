# Pull Request Intelligence Platform

A web app that connects to GitHub, pulls pull-request data for the repositories you select, and surfaces quality metrics at both the PR and engineer level.

Built for the **Senior Full-Stack Engineer Assessment**.

---

## Stack

- **Frontend** — React 19 · React Router · Recharts · Tailwind CSS v4 · Vite
- **Backend** — Node.js · Express · `@octokit/rest` · `express-session` · `node-cache`
- **Auth** — GitHub OAuth 2.0 (server-side session)
- **Deploy** — Vercel (frontend static build + Express as serverless functions)

---

## Metrics computed

| Metric | Definition |
|---|---|
| **Cycle time** | PR opened → merged (hours) |
| **Time to first review** | PR opened → first review submitted |
| **Review depth** | Avg review comments per PR |
| **Merge rate** | Merged PRs / total PRs |
| **PR size** | Lines added + deleted |
| **Engineer activity** | PRs opened, merged, reviewed, lines changed, avg cycle time, per contributor |
| **Trend** | Weekly opened vs. merged counts |

All metrics are computed in `server/services/metricsEngine.js` as pure functions over the enriched GitHub payload, so they're unit-testable in isolation.

---

## Local setup

### 1. Register a GitHub OAuth App

Go to **https://github.com/settings/developers → OAuth Apps → New OAuth App**

| Field | Value |
|---|---|
| Application name | `PR Intelligence (local)` |
| Homepage URL | `http://localhost:5173` |
| **Authorization callback URL** | `http://localhost:3000/api/auth/callback` |

Copy the **Client ID** and generate a **Client Secret**.

### 2. Configure environment

Create `server/.env` (already in `.gitignore`):

```dotenv
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
SESSION_SECRET=any_long_random_string
CLIENT_URL=http://localhost:5173
PORT=3000
```

### 3. Install & run

```bash
# Backend
cd server
npm install
npm run dev      # -> http://localhost:3000

# Frontend (new terminal)
cd client
npm install
npm run dev      # -> http://localhost:5173
```

Open **http://localhost:5173**, click **Continue with GitHub**, and pick a repository.

---

## How it works

```
Browser -----> Vite dev server (:5173) --- /api/* proxy ------> Express (:3000)
                                                                   |
                                                  GitHub OAuth <---|
                                                                   |
                                                  Octokit REST <---|
                                                                   |
                                          15-min in-memory cache --|
```

1. **Login** — `/api/auth/github` redirects to GitHub; the callback exchanges `code` for an access token and stores it in a server-side session. The token never reaches the browser.
2. **Repo list** — `GET /api/repos` lists the user's repositories (sorted by recent activity).
3. **Metrics** — `GET /api/metrics/:owner/:repo` paginates all PRs from the last 90 days, parallel-fetches reviews / review comments / PR details for each, then runs the metrics engine. Result is cached for 15 minutes; `?refresh=1` busts the cache.

---

## Project structure

```
pr-intelligence-platform/
├── client/                          # Vite + React app
│   └── src/
│       ├── components/              # Layout, MetricCard, TrendChart, PRTable, EngineerTable
│       ├── context/AuthContext.jsx  # Session state
│       ├── pages/                   # Login, Dashboard, RepoView
│       └── utils/                   # api (axios), format helpers
└── server/                          # Express API
    ├── routes/                      # auth.js, repos.js, metrics.js
    ├── services/                    # github.js (Octokit), metricsEngine.js
    └── index.js                     # CORS, session, route wiring
```

---

## Tradeoffs (MVP scope)

- **In-memory cache, not Postgres** — simpler for the MVP; data is lost on restart. Production upgrade path: Redis + Postgres for persistence beyond the 90-day API window.
- **On-demand fetch, not webhooks** — first load per repo is slow (parallelised, but bounded by GitHub API). Webhooks + background workers are the obvious next step.
- **GitHub only** — adding GitLab/Bitbucket means another OAuth flow and a normalisation layer; deferred.
- **REST, not GraphQL** — faster to ship; GraphQL would cut over-fetching at scale.

See `Fullstack Assessment.docx` for the full design rationale and scalability path.
