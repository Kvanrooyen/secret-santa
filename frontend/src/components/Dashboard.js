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
  faHourglassHalf
} from '@fortawesome/free-solid-svg-icons';

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
  
  const assignments = useMemo(() => ensureAssignments(FAMILY_MEMBERS), []);
  const assignedUserId = IS_DRAW_COMPLETE ? assignments[currentUser.id] : null;
  const assignedUser = assignedUserId ? FAMILY_MEMBERS[assignedUserId] : null;

  const handleSignOut = () => {
    localStorage.removeItem(LS_KEYS.CURRENT_USER);
    onSignOut();
  };

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="container">
          <div className="topbar-content">
            <div className="brand">
              <div className="brand-mark">🎄</div>
              <div className="brand-text">
                <h1>Secret Santa</h1>
                <p>Family Gift Exchange</p>
              </div>
            </div>
            <div className="user-section">
              <span className="welcome-text">Welcome back, {currentUser.name}!</span>
              <button className="btn btn-ghost" onClick={handleSignOut}>
                <FontAwesomeIcon icon={faSignOutAlt} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        <nav className="tabs">
          <button
            className={`tab ${activeTab === 'mine' ? 'active' : ''}`}
            onClick={() => setActiveTab('mine')}
          >
            <FontAwesomeIcon icon={faList} />
            My Wishlist
          </button>
          <button
            className={`tab ${activeTab === 'assigned' ? 'active' : ''}`}
            onClick={() => setActiveTab('assigned')}
            disabled={!IS_DRAW_COMPLETE}
          >
            <FontAwesomeIcon icon={IS_DRAW_COMPLETE ? faGift : faLock} />
            {IS_DRAW_COMPLETE ? 'Secret Assignment' : 'Locked until Draw'}
          </button>
          <button
            className={`tab ${activeTab === 'countdowns' ? 'active' : ''}`}
            onClick={() => setActiveTab('countdowns')}
          >
            <FontAwesomeIcon icon={faClock} />
            Countdowns
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