import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { SITE_CONFIG } from '../data/siteConfig';
import { cyberAudio } from '../utils/soundEngine';

interface NavbarProps {
  activeSection: string;
  scrollProgress: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  scrollProgress,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localTime, setLocalTime] = useState<string>('');
  const [scrolled, setScrolled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(() =>
    cyberAudio.getEnabled()
  );

  useEffect(() => {
    return cyberAudio.subscribe(setAudioEnabled);
  }, []);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setLocalTime(formatted);
    };
    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleToggleAudio = async () => {
    await cyberAudio.toggle();
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    cyberAudio.playClickPulse();
    if (href.startsWith('#')) {
      e.preventDefault();
      setMobileMenuOpen(false);
      const id = href.slice(1);
      if (id === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.replaceState(null, '', '#home');
        return;
      }
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.replaceState(null, '', href);
      }
    }
  };

  return (
    <header className={`cyber-nav ${scrolled ? 'cyber-nav--scrolled' : ''}`}>
      {/* Dynamic top scroll progress bar */}
      <div
        className="cyber-nav__progress"
        style={{ transform: `scaleX(${scrollProgress})` }}
        aria-hidden="true"
      />

      <div className="container cyber-nav__inner">
        {/* Clickable Logo returning to homepage */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, '#home')}
          onMouseEnter={() => cyberAudio.playHoverBlip()}
          className="cyber-logo"
          aria-label="SlashStr1ker — Return to Homepage"
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
            <span className="cyber-logo__sub">COMMAND CENTER // OS</span>
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="cyber-nav__links" aria-label="Primary Navigation">
          {SITE_CONFIG.navigation.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                onMouseEnter={() => cyberAudio.playHoverBlip()}
                className={`cyber-nav__link ${isActive ? 'is-active' : ''}`}
              >
                <span className="cyber-nav__link-code">{item.code}</span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Right HUD Controls: Synth Audio Toggle, Clock & Mobile Hamburger */}
        <div className="cyber-nav__meta">
          <button
            type="button"
            onClick={handleToggleAudio}
            className={`cyber-audio-toggle ${audioEnabled ? 'is-active' : ''}`}
            aria-pressed={audioEnabled}
            aria-label={
              audioEnabled
                ? 'Mute HUD audio and ambient space synth'
                : 'Enable HUD audio and ambient space synth'
            }
            title={
              audioEnabled
                ? 'HUD Audio & Space Synth: ON (Click to mute)'
                : 'HUD Audio & Space Synth: MUTED (Click to enable)'
            }
          >
            {audioEnabled ? (
              <Volume2 size={15} aria-hidden="true" />
            ) : (
              <VolumeX size={15} aria-hidden="true" />
            )}
            <span className="cyber-audio-toggle__label">
              {audioEnabled ? 'SYNTH: ON' : 'SYNTH: MUTED'}
            </span>
            {audioEnabled && (
              <span className="cyber-audio-toggle__bars" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            )}
          </button>

          <div
            className="cyber-clock"
            title="Visitor Local Time"
            aria-label={localTime ? `Local time ${localTime}` : 'Local clock'}
          >
            <span className="cyber-clock__dot" aria-hidden="true" />
            <span className="cyber-clock__label">LOC</span>
            <span className="cyber-clock__time">{localTime || '00:00:00'}</span>
          </div>

          <button
            type="button"
            className={`cyber-hamburger ${mobileMenuOpen ? 'is-open' : ''}`}
            onClick={() => {
              cyberAudio.playClickPulse();
              setMobileMenuOpen((prev) => !prev);
            }}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={
              mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
            }
          >
            <span className="cyber-hamburger__bar" />
            <span className="cyber-hamburger__bar" />
            <span className="cyber-hamburger__bar" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div
        id="mobile-nav-drawer"
        className={`cyber-mobile-drawer ${mobileMenuOpen ? 'is-open' : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <nav className="cyber-mobile-drawer__nav" aria-label="Mobile Navigation">
          {SITE_CONFIG.navigation.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`cyber-mobile-drawer__link ${
                  isActive ? 'is-active' : ''
                }`}
              >
                <span className="cyber-mobile-drawer__code">[{item.code}]</span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
