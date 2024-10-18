import React from 'react';

function BuddyList({ buddies }) {
  const handleBuddyClick = (buddy) => {
    window.open(`https://github.com/${buddy.login}`, '_blank');
  };

  return (
    <div className="buddy-list">
      <h3>Potential Buddies</h3>
      <ul>
        {buddies.map((buddy) => (
          <li key={buddy.id} onClick={() => handleBuddyClick(buddy)}>
            <img src={buddy.avatar_url} alt={buddy.login} />
            <div className="buddy-info">
              <span className="buddy-name">{buddy.login}</span>
              <span className="match-score">Overall Match: {buddy.matchScore.toFixed(2)}%</span>
              <span className="compatibility">Language Compatibility: {buddy.languageCompatibility.toFixed(2)}%</span>
              <span className="compatibility">Activity Compatibility: {buddy.activityCompatibility.toFixed(2)}%</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BuddyList;