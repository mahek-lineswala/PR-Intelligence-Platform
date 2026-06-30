const express = require('express');
const router = express.Router();
const {
  getRepoPRs,
  getPRDetails,
  getPRReviews,
  getPRComments
} = require('../services/github');
const { computeMetrics } = require('../services/metricsEngine');
const cache = require('../services/cache');

const CACHE_TTL_SECONDS = 900; // 15 minutes

function requireAuth(req, res, next) {
  if (!req.session.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

router.get('/:owner/:repo', requireAuth, async (req, res) => {
  const { owner, repo } = req.params;
  const { refresh } = req.query;
  const cacheKey = `metrics:${owner}/${repo}`;

  if (!refresh) {
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ ...cached, cached: true });
  }

  try {
    const token = req.session.accessToken;
    const prs = await getRepoPRs(token, owner, repo);

    // Enrich each PR with reviews, comments, and size details — parallelised.
    const enrichedPRs = await Promise.all(
      prs.map(async (pr) => {
        const [reviews, comments, details] = await Promise.all([
          getPRReviews(token, owner, repo, pr.number),
          getPRComments(token, owner, repo, pr.number),
          getPRDetails(token, owner, repo, pr.number)
        ]);
        return { ...pr, ...details, reviews, comments };
      })
    );

    const metrics = computeMetrics(enrichedPRs);
    metrics.fetched_at = new Date().toISOString();
    await cache.set(cacheKey, metrics, CACHE_TTL_SECONDS);
    res.json({ ...metrics, cached: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compute metrics', message: err.message });
  }
});

module.exports = router;
