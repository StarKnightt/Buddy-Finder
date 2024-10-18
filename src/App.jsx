import React, { useState } from 'react';
import Search from './components/Search';
import ProfileDisplay from './components/ProfileDisplay';
import MetricsOverview from './components/MetricsOverview';
import BuddyList from './components/BuddyList';
import useGitHubApi from './hooks/useGitHubApi';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const { userData, buddies, loading, error } = useGitHubApi(searchTerm);

  return (
    <div className="App">
      <h1>GitHub Buddy Finder</h1>
      <Search onSearch={setSearchTerm} />
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {userData && (
        <>
          <ProfileDisplay user={userData} />
          <MetricsOverview user={userData} />
          <BuddyList buddies={buddies} />
        </>
      )}
    </div>
  );
}

export default App;