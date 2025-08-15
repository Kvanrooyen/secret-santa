import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import { LS_KEYS } from './constants';
import './styles/index.css';
import './styles/App.css';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedUser = localStorage.getItem(LS_KEYS.CURRENT_USER);
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        // Clear corrupted data
        localStorage.removeItem(LS_KEYS.CURRENT_USER);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const handleAuthentication = (user) => {
    try {
      localStorage.setItem(LS_KEYS.CURRENT_USER, JSON.stringify(user));
      setCurrentUser(user);
    } catch (error) {
      console.error('Error saving user session:', error);
    }
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem(LS_KEYS.CURRENT_USER);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="app" style={{ 
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'var(--background)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem',
            animation: 'pulse 2s infinite'
          }}>
            🎄
          </div>
          <p style={{ color: 'var(--text-muted)' }}>Loading Secret Santa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {!currentUser ? (
        <LandingPage onAuthenticate={handleAuthentication} />
      ) : (
        <Dashboard currentUser={currentUser} onSignOut={handleSignOut} />
      )}
    </div>
  );
};

export default App;