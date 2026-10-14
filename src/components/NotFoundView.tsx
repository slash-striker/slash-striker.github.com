import React from 'react';
import { Compass, Home } from 'lucide-react';
import { SITE_CONFIG } from '../data/siteConfig';

interface NotFoundViewProps {
  onReturnHome: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onReturnHome }) => {
  return (
    <main className="not-found-shell">
      <div className="container">
        <div className="not-found-card hud-panel">
          <span className="hud-corner-tl" aria-hidden="true" />
          <span className="hud-corner-br" aria-hidden="true" />

          <div className="section-eyebrow">
            <span className="section-eyebrow__dot" aria-hidden="true" />
            <span>ERROR 404 // UNCHARTED SECTOR</span>
          </div>

          <div className="not-found-card__icon" aria-hidden="true">
            <Compass size={48} />
          </div>

          <h1
            className="section-title glitch-title"
            data-text="COORDINATES NOT FOUND"
          >
            COORDINATES NOT FOUND
          </h1>

          <p className="section-description">
            The deep-space coordinates you entered lie outside the mapped{' '}
            {SITE_CONFIG.brand.name} network. Return to the main command center
            to resume navigation.
          </p>

          <div className="not-found-card__actions">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onReturnHome();
              }}
              className="cyber-btn cyber-btn--primary"
            >
              <Home size={18} aria-hidden="true" />
              <span>RETURN TO COMMAND CENTER</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};
