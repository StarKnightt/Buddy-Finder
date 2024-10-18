import { useState, useEffect } from 'react';
import { findBuddies } from '../utlis/matchingAlgorithm';

const useGitHubApi = (username) => {
  const [userData, setUserData] = useState(null);
  const [buddies, setBuddies] = useState([]);
  const [languages, setLanguages] = useState(null);
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        if (!response.ok) throw new Error('User not found');
        const data = await response.json();
        setUserData(data);

        const potentialBuddies = await findBuddies(data);
        setBuddies(potentialBuddies);

        // Fetch languages data
        const languagesResponse = await fetch(`https://api.github.com/users/${username}/repos`);
        const reposData = await languagesResponse.json();
        const languagesData = reposData.reduce((acc, repo) => {
          if (repo.language) {
            acc[repo.language] = (acc[repo.language] || 0) + 1;
          }
          return acc;
        }, {});
        setLanguages(languagesData);

        // Fetch activities data
        const activitiesResponse = await fetch(`https://api.github.com/users/${username}/events/public`);
        const activitiesData = await activitiesResponse.json();
        const activityCounts = activitiesData.reduce((acc, event) => {
          acc[event.type] = (acc[event.type] || 0) + 1;
          return acc;
        }, {});
        setActivities(activityCounts);

      } catch (err) {
        console.error('Error in useGitHubApi:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  return { userData, buddies, languages, activities, loading, error };
};

export default useGitHubApi;