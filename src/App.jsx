import React, { useState } from 'react';
import Search from './components/Search';
import ProfileDisplay from './components/ProfileDisplay';
import LanguageChart from './components/LanguageChart';
import ActivityChart from './components/ActivityChart';
import BuddyList from './components/BuddyList';
import useGitHubApi from './hooks/useGitHubApi';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const { userData, buddies, languages, activities, loading, error } = useGitHubApi(searchTerm);

  return (
    <div className="App">
      <h1>GitHub Buddy Finder</h1>
      <Search onSearch={setSearchTerm} />
      {loading && <p>Loading... Please wait.</p>}
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
            <p>No buddies found. Try searching for a different user.</p>
          )}
        </>
      )}
    </div>
  );
}

export default App;