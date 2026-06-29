const express = require('express');
const router = express.Router();
const { getAccessToken, getAuthenticatedUser } = require('../services/github');

// Step 1: Redirect user to GitHub login
router.get('/github', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    scope: 'repo read:user'
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

// Step 2: GitHub redirects back here with a code
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const accessToken = await getAccessToken(code);
    const user = await getAuthenticatedUser(accessToken);
    req.session.accessToken = accessToken;
    req.session.user = user;
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  } catch (err) {
    console.error('Auth error:', err);
    res.redirect(`${process.env.CLIENT_URL}?error=auth_failed`);
  }
});

// Get current logged-in user
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.session.user);
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

module.exports = router;