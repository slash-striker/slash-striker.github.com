import React from 'react';
import { Youtube, MessageSquare, Bot, ChevronDown, Sparkles, Shield, Cpu, Globe } from 'lucide-react';
import { SITE_CONFIG } from '../data/siteConfig';

export const HeroSection: React.FC = () => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  return (
    <section id="home" className="hero-section">
      {/* Cyberpunk City Skyline & Holographic Horizon */}
      <div className="hero-city-horizon" aria-hidden="true">
        <svg
          className="hero-city-svg"
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="cityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a1228" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#050610" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="cityStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#00F5FF" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path
            d="M0,220 L0,165 L45,165 L45,120 L85,120 L85,150 L120,150 L120,90 L165,90 L165,140 L210,140 L210,70 L250,70 L270,50 L290,70 L290,135 L340,135 L340,105 L395,105 L395,155 L440,155 L440,85 L495,85 L495,130 L550,130 L550,60 L585,40 L620,60 L620,145 L680,145 L680,95 L740,95 L740,140 L795,140 L795,75 L850,75 L850,125 L910,125 L910,55 L960,55 L960,135 L1020,135 L1020,95 L1080,95 L1080,145 L1140,145 L1140,80 L1195,80 L1195,130 L1255,130 L1255,100 L1315,100 L1315,150 L1375,150 L1375,115 L1440,115 L1440,220 Z"
            fill="url(#cityFill)"
            stroke="url(#cityStroke)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className="container hero-grid">
        {/* Left Column: Main Command Center Copy & Actions */}
        <div className="hero-content">
          <div className="hero-hud-badge">
            <span className="hero-hud-badge__pulse" aria-hidden="true" />
            <span>MAIN COMMAND CENTER // SECTOR 01</span>
          </div>

          <p className="hero-preheading">{SITE_CONFIG.brand.heroMainHeading}</p>

          <h1
            className="hero-brand-heading glitch-title"
            data-text={SITE_CONFIG.brand.upperName}
          >
            {SITE_CONFIG.brand.upperName}
          </h1>

          <p className="hero-tagline">{SITE_CONFIG.brand.tagline}</p>

          <p className="hero-description">
            {SITE_CONFIG.brand.heroDescription}
          </p>

          {/* 3 Prominent CTA Buttons */}
          <div className="hero-cta-group">
            <a
              href={SITE_CONFIG.links.youtubeChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="cyber-btn cyber-btn--youtube"
            >
              <Youtube size={18} aria-hidden="true" />
              <span>EXPLORE MY CHANNEL</span>
            </a>

            <a
              href={SITE_CONFIG.links.slashStr1kerDiscord}
              target="_blank"
              rel="noopener noreferrer"
              className="cyber-btn cyber-btn--discord"
            >
              <MessageSquare size={18} aria-hidden="true" />
              <span>JOIN THE DISCORD</span>
            </a>

            <button
              type="button"
              onClick={() => scrollToSection('bots')}
              className="cyber-btn cyber-btn--primary"
            >
              <Bot size={18} aria-hidden="true" />
              <span>DISCOVER MY BOTS</span>
            </button>
          </div>
        </div>

        {/* Right Column: Animated 3D Orbital Planet + HUD Telemetry */}
        <div className="hero-visual-column">
          <div className="orbital-planet-stage" aria-hidden="true">
            <div className="orbital-ring orbital-ring--outer" />
            <div className="orbital-ring orbital-ring--middle" />
            <div className="orbital-ring orbital-ring--inner" />

            <div className="cyber-planet">
              <div className="cyber-planet__atmosphere" />
              <div className="cyber-planet__grid" />
              <div className="cyber-planet__core-glow" />
            </div>

            <div className="orbital-hud-tag orbital-hud-tag--top">
              <span>ORBIT // FRONTIER-IX</span>
            </div>
            <div className="orbital-hud-tag orbital-hud-tag--bottom">
              <span>HOLOGRAPHIC CORE // ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Status Panel */}
      <div className="container">
        <div
          className="status-panel hud-panel"
          role="region"
          aria-label="Command Center Thematic Status Panel"
        >
          <span className="hud-corner-tl" aria-hidden="true" />
          <span className="hud-corner-br" aria-hidden="true" />

          <div className="status-panel__header">
            <span className="status-panel__title">
              <Sparkles size={14} aria-hidden="true" />
              <span>COMMAND DECK // OVERVIEW MODULES</span>
            </span>
            <span className="status-panel__note">
              INTERFACE THEME // DIGITAL STATION
            </span>
          </div>

          <div className="status-panel__grid">
            {SITE_CONFIG.heroStatusPanel.map((item, idx) => {
              const IconComponent =
                idx === 0
                  ? Sparkles
                  : idx === 1
                  ? Cpu
                  : idx === 2
                  ? Shield
                  : Globe;

              return (
                <div
                  key={item.id}
                  className={`status-card status-card--${item.accent}`}
                >
                  <div className="status-card__top">
                    <span className="status-card__category">
                      {item.category}
                    </span>
                    <span
                      className={`status-card__dot status-card__dot--${item.accent}`}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="status-card__body">
                    <IconComponent
                      size={18}
                      className="status-card__icon"
                      aria-hidden="true"
                    />
                    <span className="status-card__label">{item.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scroll to Explore Indicator */}
      <div className="scroll-indicator-wrap">
        <button
          type="button"
          onClick={() => scrollToSection('about')}
          className="scroll-indicator-btn"
          aria-label="Scroll to About section"
        >
          <span className="scroll-indicator-btn__text">
            {SITE_CONFIG.brand.scrollPrompt}
          </span>
          <span className="scroll-indicator-btn__chevron">
            <ChevronDown size={18} aria-hidden="true" />
          </span>
        </button>
      </div>
    </section>
  );
};
