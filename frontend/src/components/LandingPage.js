import React, { useMemo, useState } from 'react';
import { FAMILY_MEMBERS, LS_KEYS } from '../constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPaperPlane, faSpinner, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

const LandingPage = ({ onAuthenticate }) => {
  const members = useMemo(() => Object.values(FAMILY_MEMBERS), []);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMagicLink = async (e) => {
    e.preventDefault();
    
    if (!selectedEmail.trim()) return;
    
    setIsLoading(true);
    
    // Simulate magic link sending delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo purposes, find user by email and authenticate immediately
    // In production, this would just send the magic link
    const user = Object.values(FAMILY_MEMBERS).find(m => m.email === selectedEmail);
    if (user) {
      localStorage.setItem(LS_KEYS.CURRENT_USER, JSON.stringify(user));
      onAuthenticate(user);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="landing">
      <div className="landing-content">
        <div className="hero-brand">
          <div className="brand-icon">
            🎄
          </div>
          <h1 className="hero-title">Secret Santa</h1>
          <p className="hero-subtitle">
            Your private family gift exchange, made simple and magical
          </p>
        </div>

        <form className="auth-form" onSubmit={handleMagicLink}>
          <div className="form-group">
            <label className="form-label">
              <FontAwesomeIcon icon={faEnvelope} />
              Your Family Email
            </label>
            <select 
              className="form-select"
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              required
              disabled={isLoading}
            >
              <option value="">Choose your email address...</option>
              {members.map(member => (
                <option key={member.id} value={member.email}>
                  {member.email} ({member.name})
                </option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-wide"
            disabled={isLoading || !selectedEmail.trim()}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Sending Magic Link...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faPaperPlane} />
                Send Magic Link
              </>
            )}
          </button>
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