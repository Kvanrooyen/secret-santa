import React from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faGifts } from '@fortawesome/free-solid-svg-icons';

const CountdownTimer = ({ targetDate, label, variant = 'default' }) => {
  const { expired, days, hours, minutes, seconds } = useCountdown(targetDate);

  return (
    <div className={`countdown-card ${variant} ${expired ? 'completed' : ''}`}>
      <div className="countdown-header">
        <FontAwesomeIcon icon={variant === 'christmas' ? faGifts : faClock} className="countdown-icon" />
        <h3 className="countdown-title">{label}</h3>
      </div>

      {expired ? (
        <div className="countdown-complete">Complete!</div>
      ) : (
        <div className="time-grid">
          <div className="time-unit">
            <span className="number">{days}</span>
            <span className="label">Days</span>
          </div>
          <div className="time-unit">
            <span className="number">{hours}</span>
            <span className="label">Hours</span>
          </div>
          <div className="time-unit">
            <span className="number">{minutes}</span>
            <span className="label">Minutes</span>
          </div>
          <div className="time-unit">
            <span className="number">{seconds}</span>
            <span className="label">Seconds</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountdownTimer;

