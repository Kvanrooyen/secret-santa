import React, { useMemo, useState } from 'react';
import { FAMILY_MEMBERS, IS_DRAW_COMPLETE, DRAW_DATE, CHRISTMAS_DATE, LS_KEYS } from '../constants';
import CountdownTimer from './CountdownTimer';
import WishlistSection from './WishlistSection';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket, faGift, faListUl, faClock } from '@fortawesome/free-solid-svg-icons';

const loadAssignments = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEYS.ASSIGNMENTS) || '{}');
  } catch {
    return {};
  }
};

// For demo purposes only:
// If draw is complete and there are no assignments yet, create a stable round-robin
const ensureAssignments = (members) => {
  const existing = loadAssignments();
  const ids = Object.keys(members);
  if (!IS_DRAW_COMPLETE) return existing;
  if (Object.keys(existing).length === ids.length) return existing;

  // round-robin assignment (buyer -> recipient)
  const next = {};
  ids.forEach((id, i) => (next[id] = ids[(i + 1) % ids.length]));
  localStorage.setItem(LS_KEYS.ASSIGNMENTS, JSON.stringify(next));
  return next;
};

const Dashboard = ({ currentUser, onSignOut }) => {
  const [tab, setTab] = useState('mine'); // 'mine' | 'assigned' | 'countdowns'
  const assignments = useMemo(() => ensureAssignments(FAMILY_MEMBERS), []);
  const assignedId = IS_DRAW_COMPLETE ? assignments[currentUser.id] : null;
  const assignedUser = assignedId ? FAMILY_MEMBERS[assignedId] : null;

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">🎄</div>
          <div className="brand-text">
            <div className="brand-title">Secret Santa</div>
            <div className="brand-sub">Private family gift exchange</div>
          </div>
        </div>

        <div className="top-actions">
          <span className="welcome">Hi, {currentUser.name}</span>
          <button className="btn ghost" onClick={onSignOut} title="Sign out">
            <FontAwesomeIcon icon={faRightFromBracket} /> Sign out
          </button>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${tab === 'mine' ? 'active' : ''}`}
          onClick={() => setTab('mine')}
        >
          <FontAwesomeIcon icon={faListUl} /> My Wishlist
        </button>
        <button
          className={`tab ${tab === 'assigned' ? 'active' : ''}`}
          onClick={() => setTab('assigned')}
          disabled={!IS_DRAW_COMPLETE}
          title={!IS_DRAW_COMPLETE ? 'Available after the draw' : undefined}
        >
          <FontAwesomeIcon icon={faGift} /> Assigned Person
        </button>
        <button
          className={`tab ${tab === 'countdowns' ? 'active' : ''}`}
          onClick={() => setTab('countdowns')}
        >
          <FontAwesomeIcon icon={faClock} /> Countdowns
        </button>
      </nav>

      <main className="content">
        {tab === 'mine' && <WishlistSection userId={currentUser.id} isOwner={true} />}

        {tab === 'assigned' && (
          <section className="grid-2">
            {!assignedUser ? (
              <div className="card">
                <div className="empty">Assignments will appear here once the draw is complete.</div>
              </div>
            ) : (
              <>
                <div className="card">
                  <h3 className="card-title">
                    You’re buying for <span className="accent">{assignedUser.name}</span>
                  </h3>
                  <p className="muted">Keep it secret 🤫</p>
                </div>
                <WishlistSection userId={assignedUser.id} isOwner={false} />
              </>
            )}
          </section>
        )}

        {tab === 'countdowns' && (
          <section className="grid-2">
            <CountdownTimer targetDate={DRAW_DATE} label="Time until the Draw" variant="draw" />
            <CountdownTimer targetDate={CHRISTMAS_DATE} label="Time until Christmas" variant="christmas" />
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

