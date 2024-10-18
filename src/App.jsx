import React, { useState } from 'react';
import Search from './components/Search';
import ProfileDisplay from './components/ProfileDisplay';
import LanguageChart from './components/LanguageChart';
import ActivityChart from './components/ActivityChart';
import BuddyList from './components/BuddyList';
import useGitHubApi from './hooks/useGitHubApi';
import { FaGithub, FaTwitter, FaCoffee } from 'react-icons/fa';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const { userData, buddies, languages, activities, loading, buddiesLoading, error } = useGitHubApi(searchTerm);

  return (
    <div className="App">
      <div className="social-links">
        <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
        <a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
        <a href="https://www.buymeacoffee.com/yourusername" target="_blank" rel="noopener noreferrer"><FaCoffee /></a>
      </div>
      <h1>GitHub Buddy Finder</h1>
      <p className="tagline">Find your true coding companions!</p>
      <Search onSearch={setSearchTerm} />
      {loading && <p>Loading user data... Please wait.</p>}
      {error && <p>Error: {error}</p>}
      {userData && (
        <>
          <ProfileDisplay user={userData} />
          <div className="charts-container">
            {languages && <LanguageChart languages={languages} />}
            {activities && <ActivityChart activities={activities} />}
          </div>
          {buddiesLoading ? (
            <p>Finding potential buddies... This may take a few moments.</p>
          ) : buddies && buddies.length > 0 ? (
            <BuddyList buddies={buddies} />
          ) : (
            <p>No buddies found. Try searching for a different user.</p>
          )}
        </>
      )}
    </div>
  );
}

export default App;