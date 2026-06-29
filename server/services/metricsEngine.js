function hoursBetween(a, b) {
  return (new Date(b) - new Date(a)) / (1000 * 60 * 60);
}

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function computeMetrics(prs) {
  const merged = prs.filter(pr => pr.merged_at);
  const closed = prs.filter(pr => pr.state === 'closed' && !pr.merged_at);
  const open = prs.filter(pr => pr.state === 'open');

  const cycleTimes = merged.map(pr => hoursBetween(pr.created_at, pr.merged_at));

  const firstReviewTimes = prs
    .map(pr => {
      if (!pr.reviews || !pr.reviews.length) return null;
      const earliest = pr.reviews
        .map(r => r.submitted_at)
        .filter(Boolean)
        .sort()[0];
      return earliest ? hoursBetween(pr.created_at, earliest) : null;
    })
    .filter(v => v !== null && v >= 0);

  const prSizes = prs.map(pr => (pr.additions || 0) + (pr.deletions || 0));

  const avgCycleTime = +avg(cycleTimes).toFixed(1);
  const avgReviewDepth = +avg(prs.map(pr => pr.comments.length)).toFixed(1);
  const avgTimeToFirstReview = +avg(firstReviewTimes).toFixed(1);
  const avgPRSize = Math.round(avg(prSizes));
  const mergeRate = prs.length
    ? +((merged.length / prs.length) * 100).toFixed(1)
    : 0;

  // Per-engineer aggregation
  const engineerMap = {};
  prs.forEach(pr => {
    const author = pr.user?.login;
    if (!author) return;
    if (!engineerMap[author]) {
      engineerMap[author] = {
        login: author,
        avatar_url: pr.user.avatar_url,
        prs_opened: 0,
        prs_merged: 0,
        total_comments: 0,
        total_additions: 0,
        total_deletions: 0,
        cycle_times: [],
        reviews_given: 0
      };
    }
    const e = engineerMap[author];
    e.prs_opened++;
    if (pr.merged_at) {
      e.prs_merged++;
      e.cycle_times.push(hoursBetween(pr.created_at, pr.merged_at));
    }
    e.total_comments += pr.comments.length;
    e.total_additions += pr.additions || 0;
    e.total_deletions += pr.deletions || 0;
  });

  // Reviews given by each engineer (across all PRs)
  prs.forEach(pr => {
    (pr.reviews || []).forEach(r => {
      const reviewer = r.user?.login;
      if (!reviewer) return;
      if (!engineerMap[reviewer]) {
        engineerMap[reviewer] = {
          login: reviewer,
          avatar_url: r.user.avatar_url,
          prs_opened: 0,
          prs_merged: 0,
          total_comments: 0,
          total_additions: 0,
          total_deletions: 0,
          cycle_times: [],
          reviews_given: 0
        };
      }
      engineerMap[reviewer].reviews_given++;
    });
  });

  const engineers = Object.values(engineerMap)
    .map(e => ({
      login: e.login,
      avatar_url: e.avatar_url,
      prs_opened: e.prs_opened,
      prs_merged: e.prs_merged,
      reviews_given: e.reviews_given,
      total_comments: e.total_comments,
      total_additions: e.total_additions,
      total_deletions: e.total_deletions,
      avg_cycle_time: +avg(e.cycle_times).toFixed(1),
      merge_rate: e.prs_opened
        ? +((e.prs_merged / e.prs_opened) * 100).toFixed(1)
        : 0
    }))
    .sort((a, b) => b.prs_opened - a.prs_opened);

  // PR list (flat, for the table)
  const prList = prs
    .map(pr => ({
      number: pr.number,
      title: pr.title,
      author: pr.user?.login,
      avatar_url: pr.user?.avatar_url,
      state: pr.merged_at ? 'merged' : pr.state,
      created_at: pr.created_at,
      merged_at: pr.merged_at,
      closed_at: pr.closed_at,
      html_url: pr.html_url,
      additions: pr.additions || 0,
      deletions: pr.deletions || 0,
      changed_files: pr.changed_files || 0,
      review_count: pr.reviews.length,
      comment_count: pr.comments.length,
      cycle_time_hours: pr.merged_at
        ? +hoursBetween(pr.created_at, pr.merged_at).toFixed(1)
        : null
    }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Trend: group PRs opened & merged by week
  const trendMap = {};
  prs.forEach(pr => {
    const week = weekKey(pr.created_at);
    if (!trendMap[week]) trendMap[week] = { week, opened: 0, merged: 0 };
    trendMap[week].opened++;
  });
  merged.forEach(pr => {
    const week = weekKey(pr.merged_at);
    if (!trendMap[week]) trendMap[week] = { week, opened: 0, merged: 0 };
    trendMap[week].merged++;
  });
  const trend = Object.values(trendMap).sort((a, b) =>
    a.week.localeCompare(b.week)
  );

  return {
    summary: {
      total_prs: prs.length,
      merged: merged.length,
      open: open.length,
      closed: closed.length,
      avg_cycle_time_hours: avgCycleTime,
      avg_review_depth: avgReviewDepth,
      avg_time_to_first_review_hours: avgTimeToFirstReview,
      avg_pr_size: avgPRSize,
      merge_rate: mergeRate
    },
    engineers,
    prs: prList,
    trend
  };
}

function weekKey(dateStr) {
  const d = new Date(dateStr);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day;
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
  return monday.toISOString().slice(0, 10);
}

module.exports = { computeMetrics };
