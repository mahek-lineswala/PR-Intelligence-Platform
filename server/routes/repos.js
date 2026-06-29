const express = require('express');
const router = express.Router();
const { getUserRepos } = require('../services/github');

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

// Get all repos for logged-in user
router.get('/', requireAuth, async (req, res) => {
  try {
    const repos = await getUserRepos(req.session.accessToken);
    res.json(repos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch repos' });
  }
});

module.exports = router;