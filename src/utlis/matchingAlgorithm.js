import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: import.meta.env.VITE_GITHUB_TOKEN });

const calculateLanguageCompatibility = (userLanguages, buddyLanguages) => {
  const commonLanguages = Object.keys(userLanguages).filter(lang => buddyLanguages[lang]);
  const totalUserRepos = Object.values(userLanguages).reduce((a, b) => a + b, 0);
  const totalBuddyRepos = Object.values(buddyLanguages).reduce((a, b) => a + b, 0);
  
  let compatibility = 0;
  commonLanguages.forEach(lang => {
    const userPercentage = userLanguages[lang] / totalUserRepos;
    const buddyPercentage = buddyLanguages[lang] / totalBuddyRepos;
    compatibility += Math.min(userPercentage, buddyPercentage);
  });

  return compatibility * 100;
};

const getLanguageStats = async (username) => {
  const { data: repos } = await octokit.repos.listForUser({ username, per_page: 100 });
  const languageStats = {};

  for (const repo of repos) {
    if (repo.fork) continue;
    if (repo.language) {
      languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
    }
  }

  return languageStats;
};

const calculateActivityCompatibility = (userEvents, buddyEvents) => {
  const userActivityScore = userEvents.length;
  const buddyActivityScore = buddyEvents.length;
  return Math.min(userActivityScore, buddyActivityScore) / Math.max(userActivityScore, buddyActivityScore) * 100;
};

const getRecentActivity = async (username) => {
  const { data: events } = await octokit.activity.listPublicEventsForUser({ username, per_page: 100 });
  return events;
};

export const findBuddies = async (user) => {
  const userLanguages = await getLanguageStats(user.login);
  const userEvents = await getRecentActivity(user.login);

  const { data: followers } = await octokit.users.listFollowersForUser({ username: user.login, per_page: 100 });
  const { data: following } = await octokit.users.listFollowingForUser({ username: user.login, per_page: 100 });
  
  const potentialBuddies = [...followers, ...following];
  const buddyScores = [];

  for (const buddy of potentialBuddies.slice(0, 10)) {  // Limit to first 10 for performance
    const buddyLanguages = await getLanguageStats(buddy.login);
    const buddyEvents = await getRecentActivity(buddy.login);

    const languageCompatibility = calculateLanguageCompatibility(userLanguages, buddyLanguages);
    const activityCompatibility = calculateActivityCompatibility(userEvents, buddyEvents);

    const overallScore = (languageCompatibility * 0.6) + (activityCompatibility * 0.4);

    buddyScores.push({
      ...buddy,
      matchScore: overallScore,
      languageCompatibility,
      activityCompatibility
    });
  }

  return buddyScores.sort((a, b) => b.matchScore - a.matchScore);
};