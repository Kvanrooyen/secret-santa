// src/components/LandingPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPaperPlane, faSpinner, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

import { fetchAllowedUsersPublic } from '../utils/users';
import { signInWithMagicLink } from '../utils/supabase'; // see note below

const LandingPage = ({ onAuthenticate }) => {
  const [members, setMembers] = useState([]);               // [{id, name, email}]
  const [selectedEmail, setSelectedEmail] = useState('');
  const [listLoading, setListLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);        // sending magic link
  const [error, setError] = useState(null);
  const [sentTo, setSentTo] = useState(null);               // {email, name?}

  // Load dropdown list publicly from Supabase view
  useEffect(() => {
    let active = true;
    (async () => {
      setListLoading(true);
      setError(null);
      try {
        const rows = await fetchAllowedUsersPublic();
        if (!active) return;
        setMembers(rows || []);
        // Preselect first member (optional)
        if (rows?.length) setSelectedEmail(rows[0].email);
      } catch (e) {
        if (!active) return;
        setError('Could not load the family list. Please refresh.');
      } finally {
        if (active) setListLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const selectedMember = useMemo(
    () => members.find(m => m.email === selectedEmail) || null,
    [members, selectedEmail]
  );

  const handleMagicLink = async (e) => {
    e.preventDefault();
    if (!selectedEmail.trim()) return;

    setIsLoading(true);
    setError(null);
    setSentTo(null);
    try {
      const { error: authErr } = await signInWithMagicLink(selectedEmail);
      if (authErr) throw authErr;
      setSentTo({ email: selectedEmail, name: selectedMember?.name });
    } catch (e) {
      setError(e?.message || 'Failed to send magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="landing">
      <div className="landing-content">
        {/* Keep your original header/hero markup intact */}
        <div className="hero-brand">
          <div className="brand-icon">🎄</div>
          <h1 className="hero-title">Secret Santa</h1>
          <p className="hero-subtitle">Pick your name, then we’ll email you a magic link.</p>
        </div>

        <form className="auth-form" onSubmit={handleMagicLink}>
          <div className="form-group">
            <label className="form-label">
              <FontAwesomeIcon icon={faEnvelope} />
              Your Family Email
            </label>

            {listLoading ? (
              <div className="inline-status">
                <FontAwesomeIcon icon={faSpinner} spin /> Loading family list…
              </div>
            ) : (
              <select
                className="form-select"
                value={selectedEmail}
                onChange={(e) => setSelectedEmail(e.target.value)}
                required
                disabled={isLoading || !members.length}
              >
                {!members.length ? (
                  <option value="">No names available</option>
                ) : (
                  members.map(member => (
                    <option key={member.id} value={member.email}>
                      {member.email} ({member.name})
                    </option>
                  ))
                )}
              </select>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-wide"
            disabled={isLoading || listLoading || !selectedEmail.trim()}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Sending…
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faPaperPlane} /> Send magic link
              </>
            )}
          </button>

          {sentTo && (
            <div className="success-note" style={{ marginTop: '1rem' }}>
              Magic link sent to <strong>{sentTo.email}</strong>.
              Open it on this device to view your profile.
            </div>
          )}

          {error && <div className="error-note">{error}</div>}
        </form>

        <div className="privacy-note">
          <div className="privacy-icon">
            <FontAwesomeIcon icon={faShieldAlt} />
          </div>
          <div className="privacy-text">
            <strong>100% Private & Secure</strong><br/>
            Your wishlists and secret assignments are encrypted and only visible to you!
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
