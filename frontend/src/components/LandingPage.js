import React, { useMemo, useState } from 'react';
import { FAMILY_MEMBERS, LS_KEYS } from '../constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUnlock, faUser } from '@fortawesome/free-solid-svg-icons';

const LandingPage = ({ onAuthenticate }) => {
  const members = useMemo(() => Object.values(FAMILY_MEMBERS), []);
  const [selected, setSelected] = useState(members[0]?.id || '');
  const [pin, setPin] = useState('');

  const login = () => {
    // Frontend-only mock. For Supabase later, replace with real auth.
    if (!selected || !pin.trim()) return;
    const user = FAMILY_MEMBERS[selected];
    localStorage.setItem(LS_KEYS.CURRENT_USER, JSON.stringify(user));
    onAuthenticate(user);
  };

  return (
    <div className="landing">
      <div className="hero card">
        <div className="hero-title">Secret Santa</div>
        <p className="hero-sub">A simple, private gift exchange for our family.</p>
      </div>

      <div className="auth card">
        <h3 className="card-title">Sign in</h3>
        <div className="row">
          <label className="label">
            <FontAwesomeIcon icon={faUser} /> &nbsp;I am
          </label>
          <select className="input" value={selected} onChange={(e) => setSelected(e.target.value)}>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="row">
          <label className="label">PIN</label>
          <input
            className="input"
            type="password"
            placeholder="4–6 digits"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </div>

        <button className="btn primary wide" onClick={login}>
          <FontAwesomeIcon icon={faUnlock} /> Sign in
        </button>

        <p className="muted small">
          This demo accepts any PIN. You’ll replace this with Supabase auth.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;

