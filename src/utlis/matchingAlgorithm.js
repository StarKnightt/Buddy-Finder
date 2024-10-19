import { Octokit } from "@octokit/rest";

// Store all tokens in an array
const tokens = [
  import.meta.env.VITE_GITHUB_TOKEN_1,
  import.meta.env.VITE_GITHUB_TOKEN_2,
  import.meta.env.VITE_GITHUB_TOKEN_3
];

let tokenIndex = 0;

// Function to get the next available Octokit instance with a rotated token
const getOctokit = () => {
  const token = tokens[tokenIndex];
  tokenIndex = (tokenIndex + 1) % tokens.length;  // Rotate to the next token
  return new Octokit({ auth: token });
};

// Function to check the rate limit of the current token
const checkRateLimit = async (octokitInstance) => {
  const { data } = await octokitInstance.rateLimit.get();
  return data.resources.core.remaining;
};

// Function to fetch language statistics for a user
const getLanguageStats = async (username) => {
  const octokit = getOctokit();
  const remaining = await checkRateLimit(octokit);

  if (remaining === 0) {
    console.warn('Token rate limit exceeded, rotating to next token...');
    return getLanguageStats(username);  // Retry with a new token
  }

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

// Function to fetch recent activity for a user
const getRecentActivity = async (username) => {
  const octokit = getOctokit();
  const remaining = await checkRateLimit(octokit);

  if (remaining === 0) {
    console.warn('Token rate limit exceeded, rotating to next token...');
    return getRecentActivity(username);  // Retry with a new token
  }

  const { data: events } = await octokit.activity.listPublicEventsForUser({ username, per_page: 100 });
  return events;
};

// Main function to find buddies based on language and activity compatibility
export const findBuddies = async (user) => {
  const userLanguages = await getLanguageStats(user.login);
  const userEvents = await getRecentActivity(user.login);

  const octokit = getOctokit();
  const { data: followers } = await octokit.users.listFollowersForUser({ username: user.login, per_page: 100 });
  const { data: following } = await octokit.users.listFollowingForUser({ username: user.login, per_page: 100 });

  const potentialBuddies = [...followers, ...following];
  const buddyScores = [];

  for (const buddy of potentialBuddies.slice(0, 10)) {  // Limit to first 10 buddies for performance
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

  return buddyScores.sort((a, b) => b.matchScore - a.matchScore);  // Sort by highest match score
};

// Helper function to calculate language compatibility
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

// Helper function to calculate activity compatibility
const calculateActivityCompatibility = (userEvents, buddyEvents) => {
  const userActivityScore = userEvents.length;
  const buddyActivityScore = buddyEvents.length;
  return (Math.min(userActivityScore, buddyActivityScore) / Math.max(userActivityScore, buddyActivityScore)) * 100;
};
