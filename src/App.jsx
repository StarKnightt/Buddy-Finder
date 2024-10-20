import React, { useState } from 'react';
import Search from './components/Search';
import ProfileDisplay from './components/ProfileDisplay';
import LanguageChart from './components/LanguageChart';
import ActivityChart from './components/ActivityChart';
import BuddyList from './components/BuddyList';
import useGitHubApi from './hooks/useGitHubApi';
import { FaGithub, FaTwitter, FaCoffee, FaMoon, FaSun, FaSearch, FaUsers, FaCode } from 'react-icons/fa';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const { userData, buddies, languages, activities, loading, buddiesLoading, error } = useGitHubApi(searchTerm);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };

  const handleHeaderClick = () => {
    setSearchTerm('');
  };

  return (
    <div className="App">
      <div className="social-links">
        <a href="https://github.com/StarKnightt/Buddy-Finder" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
        <a href="https://twitter.com/Star_Knight12" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
        <a href="https://www.buymeacoffee.com/prasen" target="_blank" rel="noopener noreferrer"><FaCoffee /></a>
      </div>
      <header className="header">
        <h1 onClick={handleHeaderClick}>GitHub Buddy Finder</h1>
        <button className="mode-toggle" onClick={toggleDarkMode}>
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </header>
      <p className="tagline">Find your true coding Friends 💗</p>
      
      {!searchTerm && (
        <div className="landing-page">
          <h2>Welcome to GitHub Buddy Finder</h2>
          <p>Discover like-minded developers and expand your coding network</p>
          
          <div className="search-section">
            <Search onSearch={setSearchTerm} />
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <FaSearch className="feature-icon" />
              <h3 className="feature-title">Easy Search</h3>
              <p>Find potential coding buddies with just a GitHub username</p>
            </div>
            <div className="feature-item">
              <FaUsers className="feature-icon" />
              <h3 className="feature-title">Match Algorithm</h3>
              <p>Our smart algorithm suggests buddies based on coding habits and interests</p>
            </div>
            <div className="feature-item">
              <FaCode className="feature-icon" />
              <h3 className="feature-title">Skill Insights</h3>
              <p>Visualize language preferences and coding activity patterns</p>
            </div>
          </div>
        </div>
      )}

      {loading && <p>Loading user data... Please wait.</p>}
      {error && <p>Error: {error}</p>}
      {userData && (
        <>
          <ProfileDisplay user={userData} />
          <div className="charts-container">
            {languages && <LanguageChart languages={languages} />}
            {activities && <ActivityChart activities={activities} />}
          </div>
          <BuddyList buddies={buddies} loading={buddiesLoading} />
        </>
      )}
    </div>
  );
}

export default App;