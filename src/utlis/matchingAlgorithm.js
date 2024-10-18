export const findBuddies = async (user) => {
    // This is a simplified version. In a real app, you'd implement a more sophisticated algorithm.
    const response = await fetch(`https://api.github.com/users/${user.login}/followers`);
    const followers = await response.json();
  
    return followers.slice(0, 5).map(follower => ({
      ...follower,
      matchScore: Math.random() * 100  // Random score for demonstration
    }));
  };