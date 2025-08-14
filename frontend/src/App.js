import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import { LS_KEYS } from './constants';
import './styles/App.css';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);

  // Restore session from localStorage (demo)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEYS.CURRENT_USER);
      if (raw) setCurrentUser(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const handleAuth = (user) => setCurrentUser(user);

  const handleSignOut = () => {
    localStorage.removeItem(LS_KEYS.CURRENT_USER);
    setCurrentUser(null);
  };

  return (
    <div className="app">
      {!currentUser ? (
        <LandingPage onAuthenticate={handleAuth} />
      ) : (
        <Dashboard currentUser={currentUser} onSignOut={handleSignOut} />
      )}
    </div>
  );
};

export default App;

