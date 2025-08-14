import React from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faGifts, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const CountdownTimer = ({ targetDate, label, variant = 'default' }) => {
  const { expired, days, hours, minutes, seconds } = useCountdown(targetDate);

  const getIcon = () => {
    if (variant === 'christmas') return faGifts;
    return faClock;
  };

  const getGradient = () => {
    if (variant === 'christmas') {
      return 'linear-gradient(135deg, #c41e3a 0%, #228b22 100%)';
    }
    return 'var(--gradient-primary)';
  };

  return (
    <div className="card countdown-card">
      <div className="card-header">
        <div className="card-icon" style={{ background: getGradient() }}>
          <FontAwesomeIcon icon={getIcon()} />
        </div>
        <h3 className="card-title">{label}</h3>
      </div>

      {expired ? (
        <div className="countdown-complete">
          <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '0.5rem' }} />
          Complete! 🎉
        </div>
      ) : (
        <div className="countdown-grid">
          <div className="countdown-unit">
            <span className="countdown-number">{days}</span>
            <span className="countdown-label">Days</span>
          </div>
          <div className="countdown-unit">
            <span className="countdown-number">{hours}</span>
            <span className="countdown-label">Hours</span>
          </div>
          <div className="countdown-unit">
            <span className="countdown-number">{minutes}</span>
            <span className="countdown-label">Minutes</span>
          </div>
          <div className="countdown-unit">
            <span className="countdown-number">{seconds}</span>
            <span className="countdown-label">Seconds</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountdownTimer;