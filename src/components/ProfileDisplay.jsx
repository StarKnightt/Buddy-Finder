import React from 'react';

function ProfileDisplay({ user }) {
  return (
    <div className="profile">
      <img src={user.avatar_url} alt={user.login} />
      <h2>{user.name}</h2>
      <p>{user.bio}</p>
      <p>Followers: {user.followers}</p>
      <p>Following: {user.following}</p>
      <p>Public Repos: {user.public_repos}</p>
    </div>
  );
}

export default ProfileDisplay;