const { Octokit } = require('@octokit/rest');
const axios = require('axios');

async function getAccessToken(code) {
  const response = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    },
    { headers: { Accept: 'application/json' } }
  );
  return response.data.access_token;
}

async function getAuthenticatedUser(token) {
  const octokit = new Octokit({ auth: token });
  const { data } = await octokit.users.getAuthenticated();
  return {
    id: data.id,
    login: data.login,
    name: data.name,
    avatar_url: data.avatar_url
  };
}

async function getUserRepos(token) {
  const octokit = new Octokit({ auth: token });
  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: 'updated',
    per_page: 50
  });
  return data.map(r => ({
    id: r.id,
    name: r.name,
    full_name: r.full_name,
    owner: r.owner.login,
    private: r.private,
    updated_at: r.updated_at,
    description: r.description,
    language: r.language,
    stargazers_count: r.stargazers_count
  }));
}

async function getRepoPRs(token, owner, repo) {
  const octokit = new Octokit({ auth: token });
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const prs = await octokit.paginate(octokit.pulls.list, {
    owner,
    repo,
    state: 'all',
    per_page: 100,
    sort: 'updated',
    direction: 'desc'
  });

  return prs.filter(pr => new Date(pr.created_at) >= since);
}

async function getPRDetails(token, owner, repo, pull_number) {
  const octokit = new Octokit({ auth: token });
  const { data } = await octokit.pulls.get({ owner, repo, pull_number });
  return {
    additions: data.additions,
    deletions: data.deletions,
    changed_files: data.changed_files
  };
}

async function getPRReviews(token, owner, repo, pull_number) {
  const octokit = new Octokit({ auth: token });
  const { data } = await octokit.pulls.listReviews({ owner, repo, pull_number });
  return data;
}

async function getPRComments(token, owner, repo, pull_number) {
  const octokit = new Octokit({ auth: token });
  const { data } = await octokit.pulls.listReviewComments({ owner, repo, pull_number });
  return data;
}

module.exports = {
  getAccessToken,
  getAuthenticatedUser,
  getUserRepos,
  getRepoPRs,
  getPRDetails,
  getPRReviews,
  getPRComments
};
