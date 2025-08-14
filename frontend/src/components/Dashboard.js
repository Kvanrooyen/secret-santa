import React, { useMemo, useState } from 'react';
import { FAMILY_MEMBERS, IS_DRAW_COMPLETE, DRAW_DATE, CHRISTMAS_DATE, LS_KEYS } from '../constants';
import CountdownTimer from './CountdownTimer';
import WishlistSection from './WishlistSection';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignOutAlt, 
  faList, 
  faGift, 
  faClock, 
  faLock,
  faUserSecret,
  faHourglassHalf,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import '../styles/Dashboard-mobile.css';

const loadAssignments = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEYS.ASSIGNMENTS) || '{}');
  } catch {
    return {};
  }
};

// For demo purposes: create stable assignments when draw is complete
const ensureAssignments = (members) => {
  const existing = loadAssignments();
  const ids = Object.keys(members);
  if (!IS_DRAW_COMPLETE) return existing;
  if (Object.keys(existing).length === ids.length) return existing;

  // Round-robin assignment (buyer -> recipient)
  const assignments = {};
  ids.forEach((id, i) => {
    assignments[id] = ids[(i + 1) % ids.length];
  });
  
  localStorage.setItem(LS_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  return assignments;
};

const Dashboard = ({ currentUser, onSignOut }) => {
  const [activeTab, setActiveTab] = useState('mine');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const assignments = useMemo(() => ensureAssignments(FAMILY_MEMBERS), []);
  const assignedUserId = IS_DRAW_COMPLETE ? assignments[currentUser.id] : null;
  const assignedUser = assignedUserId ? FAMILY_MEMBERS[assignedUserId] : null;

  const handleSignOut = () => {
    localStorage.removeItem(LS_KEYS.CURRENT_USER);
    onSignOut();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="dashboard">
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
              {/* Desktop welcome text and sign out */}
              <span className="welcome-text-desktop">Welcome, {currentUser.name}</span>
              <button className="btn btn-ghost desktop-only" onClick={handleSignOut}>
                <FontAwesomeIcon icon={faSignOutAlt} />
                Sign Out
              </button>
              
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
                  <span>Welcome, {currentUser.name}!</span>
                </div>
                <button className="mobile-menu-item" onClick={handleSignOut}>
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="container">
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
            <WishlistSection userId={currentUser.id} isOwner={true} />
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
                    <p>Your secret assignment will be revealed after the draw on December 10th!</p>
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
                  <WishlistSection userId={assignedUser.id} isOwner={false} />
                </>
              )}
            </div>
          )}

          {activeTab === 'countdowns' && (
            <div className="grid-2">
              <CountdownTimer 
                targetDate={DRAW_DATE} 
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
};

export default Dashboard;