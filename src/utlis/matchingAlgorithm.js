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

// Add new constants
const RATE_LIMIT_DELAY = 1000; // 1 second base delay
const MAX_RETRIES = 3;
const EVENT_WEIGHTS = {
  PushEvent: 1.0,
  PullRequestEvent: 1.2,
  IssuesEvent: 0.8,
  CreateEvent: 0.6,
  // ... add other event types as needed
};
const GENDER_PREFERENCE_WEIGHT = 0.2; // How much gender preference affects overall score
const DEFAULT_GENDER_RATIO = 0.7; // Percentage of opposite gender recommendations

// Enhanced rate limit handling with exponential backoff
const checkRateLimit = async (octokitInstance, retryCount = 0) => {
  try {
    const { data } = await octokitInstance.rateLimit.get();
    if (data.resources.core.remaining === 0) {
      const delay = RATE_LIMIT_DELAY * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      return checkRateLimit(getOctokit(), retryCount + 1);
    }
    return data.resources.core.remaining;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      return checkRateLimit(getOctokit(), retryCount + 1);
    }
    throw new Error('Rate limit check failed after maximum retries');
  }
};

// Enhanced language stats collection
const getLanguageStats = async (username) => {
  const octokit = getOctokit();
  await checkRateLimit(octokit);

  try {
    const { data: repos } = await octokit.repos.listForUser({ username, per_page: 100 });
    const languageStats = {};
    const languageBytes = {};

    await Promise.all(repos.map(async (repo) => {
      if (repo.fork) return;
      
      try {
        const { data: languages } = await octokit.repos.listLanguages({
          owner: username,
          repo: repo.name,
        });
        
        Object.entries(languages).forEach(([lang, bytes]) => {
          languageStats[lang] = (languageStats[lang] || 0) + 1;
          languageBytes[lang] = (languageBytes[lang] || 0) + bytes;
        });
      } catch (error) {
        console.warn(`Failed to fetch languages for ${repo.name}:`, error);
      }
    }));

    return { languageStats, languageBytes };
  } catch (error) {
    throw new Error(`Failed to fetch language stats for ${username}: ${error.message}`);
  }
};

// Enhanced activity analysis
const getRecentActivity = async (username) => {
  const octokit = getOctokit();
  await checkRateLimit(octokit);

  try {
    const { data: events } = await octokit.activity.listPublicEventsForUser({ 
      username, 
      per_page: 100 
    });

    return events.map(event => ({
      type: event.type,
      created_at: new Date(event.created_at),
      weight: EVENT_WEIGHTS[event.type] || 0.5
    }));
  } catch (error) {
    throw new Error(`Failed to fetch activity for ${username}: ${error.message}`);
  }
};

// Enhanced language compatibility calculation
const calculateLanguageCompatibility = (userLangs, buddyLangs) => {
  const { languageStats: userStats, languageBytes: userBytes } = userLangs;
  const { languageStats: buddyStats, languageBytes: buddyBytes } = buddyLangs;

  const commonLanguages = Object.keys(userStats).filter(lang => buddyStats[lang]);
  const totalUserBytes = Object.values(userBytes).reduce((a, b) => a + b, 0);
  const totalBuddyBytes = Object.values(buddyBytes).reduce((a, b) => a + b, 0);

  let compatibility = 0;
  commonLanguages.forEach(lang => {
    const userPercentage = userBytes[lang] / totalUserBytes;
    const buddyPercentage = buddyBytes[lang] / totalBuddyBytes;
    // Weight more heavily used languages higher
    const usage = (userPercentage + buddyPercentage) / 2;
    compatibility += Math.min(userPercentage, buddyPercentage) * (1 + usage);
  });

  return (compatibility / (1 + compatibility)) * 100; // Normalize to 0-100
};

// Enhanced activity compatibility calculation
const calculateActivityCompatibility = (userEvents, buddyEvents) => {
  const now = new Date();
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

  const calculateScore = (events) => {
    return events.reduce((score, event) => {
      const age = now - event.created_at;
      const recencyFactor = Math.max(0, 1 - (age / maxAge));
      return score + (event.weight * recencyFactor);
    }, 0);
  };

  const userScore = calculateScore(userEvents);
  const buddyScore = calculateScore(buddyEvents);

  return (Math.min(userScore, buddyScore) / Math.max(userScore, buddyScore)) * 100;
};

// Add new helper function to estimate gender (Note: this is a simplified approach)
const estimateGender = async (octokit, username) => {
  try {
    const { data: user } = await octokit.users.getByUsername({ username });
    
    // Use pronouns if available in bio
    const bio = (user.bio || '').toLowerCase();
    if (bio.includes('she/her') || bio.includes('she/they')) return 'F';
    if (bio.includes('he/him') || bio.includes('he/they')) return 'M';
    
    // If no pronouns, use name-based estimation (optional)
    const firstName = user.name ? user.name.split(' ')[0].toLowerCase() : '';
    // You could integrate with a name-gender API here
    
    return 'U'; // Unknown/Unspecified
  } catch (error) {
    console.warn(`Failed to estimate gender for ${username}:`, error);
    return 'U';
  }
};

// Main function to find buddies based on language and activity compatibility
export const findBuddies = async (user, preferredGender = null) => {
  const userLanguages = await getLanguageStats(user.login);
  const userEvents = await getRecentActivity(user.login);
  const octokit = getOctokit();
  
  // Get user's gender
  const userGender = await estimateGender(octokit, user.login);

  const { data: followers } = await octokit.users.listFollowersForUser({ 
    username: user.login, 
    per_page: 100 
  });
  const { data: following } = await octokit.users.listFollowingForUser({ 
    username: user.login, 
    per_page: 100 
  });

  const potentialBuddies = [...followers, ...following];
  const buddyScores = [];

  // Process buddies in parallel with a limit
  await Promise.all(potentialBuddies.slice(0, 20).map(async (buddy) => {
    const buddyGender = await estimateGender(octokit, buddy.login);
    const buddyLanguages = await getLanguageStats(buddy.login);
    const buddyEvents = await getRecentActivity(buddy.login);

    const languageCompatibility = calculateLanguageCompatibility(userLanguages, buddyLanguages);
    const activityCompatibility = calculateActivityCompatibility(userEvents, buddyEvents);

    // Calculate gender preference score
    let genderScore = 1.0;
    if (userGender !== 'U' && buddyGender !== 'U') {
      if (preferredGender) {
        // If user has explicit preference
        genderScore = buddyGender === preferredGender ? 1.2 : 0.8;
      } else {
        // Default behavior: slightly favor opposite gender
        genderScore = userGender !== buddyGender ? 1.2 : 0.8;
      }
    }

    const overallScore = (
      languageCompatibility * 0.5 + 
      activityCompatibility * 0.3 + 
      genderScore * GENDER_PREFERENCE_WEIGHT
    );

    buddyScores.push({
      ...buddy,
      matchScore: overallScore,
      languageCompatibility,
      activityCompatibility,
      gender: buddyGender
    });
  }));

  // Sort by score and apply gender ratio
  const sortedScores = buddyScores.sort((a, b) => b.matchScore - a.matchScore);
  
  // Split results by gender
  const oppositeGender = sortedScores.filter(b => 
    b.gender !== 'U' && b.gender !== userGender
  );
  const sameGender = sortedScores.filter(b => 
    b.gender === userGender || b.gender === 'U'
  );

  // Combine results with desired ratio
  const numOpposite = Math.ceil(sortedScores.length * DEFAULT_GENDER_RATIO);
  const numSame = sortedScores.length - numOpposite;

  return [
    ...oppositeGender.slice(0, numOpposite),
    ...sameGender.slice(0, numSame)
  ];
};