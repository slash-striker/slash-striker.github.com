import React from 'react';
import { ArrowUp, Bot, ExternalLink, MessageSquare, Youtube } from 'lucide-react';
import { SITE_CONFIG } from '../data/siteConfig';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      if (window.location.hash === href) {
        handleBackToTop();
        return;
      }
      window.location.hash = href;
    }
  };

  return (
    <footer className="cyber-footer">
      <div className="container">
        <div className="cyber-footer__top">
          {/* Brand Column */}
          <div className="cyber-footer__brand">
            <a
              href="#/"
              onClick={(e) => handleNavClick(e, '#/')}
              className="cyber-logo"
            >
              <span className="cyber-logo__emblem" aria-hidden="true">
                <svg viewBox="0 0 40 40" fill="none">
                  <polygon
                    points="20,2 36,11 36,29 20,38 4,29 4,11"
                    stroke="#00F5FF"
                    strokeWidth="1.8"
                    fill="rgba(0, 245, 255, 0.08)"
                  />
                  <path
                    d="M13 13H26L16 20H27L13 28"
                    stroke="#00F5FF"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 31L31 9"
                    stroke="#FF3CAC"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="cyber-logo__text-group">
                <span className="cyber-logo__brand">
                  SLASH<span className="cyber-logo__accent">STR1KER</span>
                </span>
                <span className="cyber-logo__sub">DIGITAL FRONTIER</span>
              </span>
            </a>

            <p className="cyber-footer__tagline">
              {SITE_CONFIG.footer.tagline}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="cyber-footer__nav" aria-label="Footer Navigation">
            <span className="cyber-footer__heading">NAVIGATION</span>
            <ul className="cyber-footer__list">
              {SITE_CONFIG.navigation.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="cyber-footer__link"
                  >
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Direct External Portals */}
          <div className="cyber-footer__portals">
            <span className="cyber-footer__heading">DIRECT PORTALS</span>
            <ul className="cyber-footer__list">
              <li>
                <a
                  href={SITE_CONFIG.links.youtubeChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cyber-footer__link cyber-footer__link--external"
                >
                  <Youtube size={15} aria-hidden="true" />
                  <span>YouTube Channel</span>
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href={SITE_CONFIG.links.slashStr1kerDiscord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cyber-footer__link cyber-footer__link--external"
                >
                  <MessageSquare size={15} aria-hidden="true" />
                  <span>Discord Community</span>
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href={SITE_CONFIG.links.featuredBotInvite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cyber-footer__link cyber-footer__link--external"
                >
                  <Bot size={15} aria-hidden="true" />
                  <span>Bot Invitation Portal</span>
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

          {/* Back to Top Control with Neon Ring Animation */}
          <div className="cyber-footer__top-action">
            <button
              type="button"
              onClick={handleBackToTop}
              className="back-to-top-orb"
              aria-label="Back to top"
            >
              <span className="back-to-top-orb__ring" aria-hidden="true" />
              <ArrowUp size={20} aria-hidden="true" />
              <span className="back-to-top-orb__label">TOP</span>
            </button>
          </div>
        </div>

        {/* Bottom Transmission Banner */}
        <div className="cyber-footer__bottom">
          <p className="cyber-footer__transmission">
            {SITE_CONFIG.footer.endTransmission}
          </p>
          <p className="cyber-footer__copyright">
            &copy; {currentYear} {SITE_CONFIG.brand.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
