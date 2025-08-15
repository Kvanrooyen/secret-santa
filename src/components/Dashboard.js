import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import CountdownTimer from './CountdownTimer';
import WishlistSection from './WishlistSection';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faList,
  faGift,
  faClock,
  faLock,
  faUserSecret,
  faHourglassHalf,
  faBars,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

import '../styles/Dashboard-mobile.css';

// Set your real draw date/time in UTC
const DRAW_DATE_UTC = '2025-08-14T18:00:00Z';
const CHRISTMAS_DATE = '2025-12-25T00:00:00Z';

// Check if draw is complete (you can make this dynamic later)
const IS_DRAW_COMPLETE = new Date() >= new Date(DRAW_DATE_UTC);

export default function Dashboard({ session }) {
  // Auth & Profile State
  const [user, setUser] = useState(() => session?.user ?? null);
  const [profile, setProfile] = useState(null);
  const [loadingUser, setLoadingUser] = useState(() => !session?.user);
  const [error, setError] = useState(null);

  // UI State (from old Dashboard)
  const [activeTab, setActiveTab] = useState('mine');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Assignment state (you'll need to implement this with Supabase later)
  const [assignedUser] = useState(null);

  // Ensure we have a Supabase user (magic-link handshake)
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setError(null);

        if (session?.user) {
          setUser(session.user);
          setLoadingUser(false);
          return;
        }

        setLoadingUser(true);
        const { data } = await supabase.auth.getUser();
        if (!active) return;
        setUser(data?.user ?? null);
      } catch (e) {
        if (!active) return;
        setError(e?.message || 'Failed to read current user.');
      } finally {
        if (active) setLoadingUser(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [session?.user]);

  // Load this user's profile
  useEffect(() => {
    let active = true;

    (async () => {
      if (!user?.id) {
        setProfile(null);
        return;
      }

      try {
        setError(null);

        const { data, error: selErr } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('id', user.id)
          .maybeSingle();

        if (!active) return;
        if (selErr) throw selErr;

        setProfile(data || null);
      } catch (e) {
        if (!active) return;
        setError(e?.message || 'Failed to load profile.');
      }
    })();

    return () => {
      active = false;
    };
  }, [user?.id]);

  // Derived display values
  const displayName =
    (profile?.name && profile.name.trim()) ||
    (user?.user_metadata?.name && String(user.user_metadata.name).trim()) ||
    user?.email ||
    '';

  const userId = user?.id || null;
  const userEmail = profile?.email || user?.email || null;

  // Menu handlers from old Dashboard
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Loading skeleton while we confirm auth
  if (loadingUser) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="skeleton skeleton--xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="alert alert--error" role="alert">
            You're not signed in. Please return to the homepage and request a magic link.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header from old Dashboard but with new data */}
      <header className="topbar-compact">
        <div className="container">
          <div className="topbar-content-compact">
            <div className="brand-compact">
              <div className="brand-mark">🎄</div>
              <div className="brand-text-compact">
                <h1>Secret Santa</h1>
              </div>
            </div>
            
            <div className="header-actions">
              {/* Desktop welcome text */}
              <span className="welcome-text-desktop">Welcome, {displayName}</span>
              
              {/* Note: Sign out disabled per your product choice */}
              <span className="btn btn-ghost desktop-only" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                <FontAwesomeIcon icon={faLock} />
                Secure Session
              </span>
              
              {/* Mobile hamburger menu */}
              <button 
                className="menu-toggle mobile-only" 
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
              </button>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          {isMenuOpen && (
            <>
              <div className="menu-overlay" onClick={closeMenu}></div>
              <div className="mobile-menu">
                <div className="mobile-menu-header">
                  <span>Welcome, {displayName}!</span>
                </div>
                <div className="mobile-menu-item" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                  <FontAwesomeIcon icon={faLock} />
                  Secure Session
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="container">
        {/* Error banner */}
        {error && (
          <div className="alert alert--error" role="alert" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Tabs from old Dashboard */}
        <nav className="tabs">
          <button
            className={`tab ${activeTab === 'mine' ? 'active' : ''}`}
            onClick={() => setActiveTab('mine')}
          >
            <FontAwesomeIcon icon={faList} />
            <span className="tab-label">My Wishlist</span>
          </button>
          <button
            className={`tab ${activeTab === 'assigned' ? 'active' : ''}`}
            onClick={() => setActiveTab('assigned')}
            disabled={!IS_DRAW_COMPLETE}
          >
            <FontAwesomeIcon icon={IS_DRAW_COMPLETE ? faGift : faLock} />
            <span className="tab-label">{IS_DRAW_COMPLETE ? 'Assignment' : 'Locked'}</span>
          </button>
          <button
            className={`tab ${activeTab === 'countdowns' ? 'active' : ''}`}
            onClick={() => setActiveTab('countdowns')}
          >
            <FontAwesomeIcon icon={faClock} />
            <span className="tab-label">Countdowns</span>
          </button>
        </nav>

        <div className="main-content">
          {activeTab === 'mine' && (
            <WishlistSection 
              userId={userId} 
              userEmail={userEmail} 
              isOwner={true} 
            />
          )}

          {activeTab === 'assigned' && (
            <div className="grid-2">
              {!assignedUser ? (
                <div className="card">
                  <div className="card-header">
                    <div className="card-icon">
                      <FontAwesomeIcon icon={faLock} />
                    </div>
                    <h3 className="card-title">Assignment Locked</h3>
                  </div>
                  <div className="empty">
                    <div className="empty-icon">
                      <FontAwesomeIcon icon={faHourglassHalf} />
                    </div>
                    <p>Your secret assignment will be revealed after the draw on December 15th!</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="card">
                    <div className="card-header">
                      <div className="card-icon">
                        <FontAwesomeIcon icon={faUserSecret} />
                      </div>
                      <h3 className="card-title">Your Secret Assignment</h3>
                    </div>
                    <div className="text-center" style={{ padding: '2rem 0' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                      <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                        You're buying for:
                      </p>
                      <h2 style={{ 
                        color: 'var(--primary)', 
                        fontSize: '2rem', 
                        fontWeight: '800',
                        margin: '0.5rem 0' 
                      }}>
                        {assignedUser.name}
                      </h2>
                      <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                        🤫 Keep it secret until Christmas!
                      </p>
                    </div>
                  </div>
                  <WishlistSection 
                    userId={assignedUser.id} 
                    userEmail={assignedUser.email}
                    isOwner={false} 
                  />
                </>
              )}
            </div>
          )}

          {activeTab === 'countdowns' && (
            <div className="grid-2">
              <CountdownTimer 
                targetDate={DRAW_DATE_UTC} 
                label="Secret Draw" 
                variant="draw"
              />
              <CountdownTimer 
                targetDate={CHRISTMAS_DATE} 
                label="Christmas Day" 
                variant="christmas"
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}