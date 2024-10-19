import { useState, useEffect } from 'react';
import { findBuddies } from '../utlis/matchingAlgorithm';

const useGitHubApi = (username) => {
  const [userData, setUserData] = useState(null);
  const [buddies, setBuddies] = useState([]);
  const [languages, setLanguages] = useState(null);
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(false);
  const [buddiesLoading, setBuddiesLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) return;

    const fetchData = async () => {
      setLoading(true);
      setBuddiesLoading(true);
      setError(null);

      try {
        // Fetch user data
        const response = await fetch(`https://api.github.com/users/${username}`);
        if (!response.ok) throw new Error('User not found');
        const data = await response.json();
        setUserData(data);
        setLoading(false);

        // Fetch buddies
        const potentialBuddies = await findBuddies(data);
        setBuddies(potentialBuddies);
        setBuddiesLoading(false);
      } catch (err) {
        console.error('Error in useGitHubApi:', err);
        setError(err.message);
        setLoading(false);
        setBuddiesLoading(false);
      }
    };

    fetchData();
  }, [username]);

  return { userData, buddies, languages, activities, loading, buddiesLoading, error };
};

export default useGitHubApi;
