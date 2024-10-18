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
  const { userData, buddies, languages, activities, loading, error } = useGitHubApi(searchTerm);

  return (
    <div className="App">
      <div className="social-links">
        <a href="https://github.com/StarKnightt" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
        <a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
        <a href="https://www.buymeacoffee.com/yourusername" target="_blank" rel="noopener noreferrer"><FaCoffee /></a>
      </div>
      <h1>GitHub Buddy Finder</h1>
      <p className="tagline">Find your true coding companions!</p>
      <Search onSearch={setSearchTerm} />
      {loading && <p>We're finding your true coding😎mates, Keep patience...</p>}
      {error && <p>Error: {error}</p>}
      {userData && (
        <>
          <ProfileDisplay user={userData} />
          <div className="charts-container">
            {languages && <LanguageChart languages={languages} />}
            {activities && <ActivityChart activities={activities} />}
          </div>
          {buddies && buddies.length > 0 ? (
            <BuddyList buddies={buddies} />
          ) : (
            <p>Just wait few more seconds to know your true buddies 💖</p>
          )}
        </>
      )}
    </div>
  );
}

export default App;