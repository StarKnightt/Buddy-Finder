import { useState, useEffect } from 'react';
import { findBuddies } from '../utlis/matchingAlgorithm';

const useGitHubApi = (username) => {
  const [userData, setUserData] = useState(null);
  const [buddies, setBuddies] = useState([]);
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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  return { userData, buddies, loading, error };
};

export default useGitHubApi;