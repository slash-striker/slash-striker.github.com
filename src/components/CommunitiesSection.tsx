import React from 'react';
import { ExternalLink, MessageSquare } from 'lucide-react';
import { SITE_CONFIG, CommunityCard } from '../data/siteConfig';
import { RevealOnScroll } from './RevealOnScroll';

const ServerEmblem: React.FC<{ type: CommunityCard['theme']['emblemType'] }> = ({
  type,
}) => {
  if (type === 'command-crest') {
    return (
      <svg viewBox="0 0 96 96" className="community-emblem-svg" fill="none">
        <polygon
          points="48,6 88,28 88,68 48,90 8,68 8,28"
          stroke="#00F5FF"
          strokeWidth="2.5"
          fill="rgba(0, 245, 255, 0.1)"
        />
        <polygon
          points="48,18 76,34 76,62 48,78 20,62 20,34"
          stroke="#397BFF"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M32 32H62L38 48H64L32 66"
          stroke="#00F5FF"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24 72L72 24"
          stroke="#FF3CAC"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === 'nexus-core') {
    return (
      <svg viewBox="0 0 96 96" className="community-emblem-svg" fill="none">
        <circle
          cx="48"
          cy="48"
          r="38"
          stroke="#A855F7"
          strokeWidth="2.2"
          fill="rgba(168, 85, 247, 0.1)"
        />
        <ellipse
          cx="48"
          cy="48"
          rx="36"
          ry="16"
          transform="rotate(30 48 48)"
          stroke="#FF3CAC"
          strokeWidth="2"
        />
        <ellipse
          cx="48"
          cy="48"
          rx="36"
          ry="16"
          transform="rotate(-30 48 48)"
          stroke="#00F5FF"
          strokeWidth="2"
        />
        <circle cx="48" cy="48" r="10" fill="#A855F7" />
        <circle cx="48" cy="48" r="5" fill="#F5F7FF" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 96 96" className="community-emblem-svg" fill="none">
      <rect
        x="14"
        y="14"
        width="68"
        height="68"
        rx="16"
        stroke="#397BFF"
        strokeWidth="2.5"
        fill="rgba(57, 123, 255, 0.1)"
      />
      <polygon
        points="48,22 72,36 72,60 48,74 24,60 24,36"
        stroke="#00F5FF"
        strokeWidth="2.2"
        fill="rgba(0, 245, 255, 0.08)"
      />
      <path
        d="M24 36L48 50L72 36M48 50V74"
        stroke="#397BFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="35" r="4" fill="#00F5FF" />
    </svg>
  );
};

export const CommunitiesSection: React.FC = () => {
  const { communities } = SITE_CONFIG;

  return (
    <section id="communities" className="section-shell communities-section">
      <div className="container">
        <RevealOnScroll>
          <div className="section-header">
            <div className="section-eyebrow">
              <span className="section-eyebrow__dot" aria-hidden="true" />
              <span>{communities.sectionTag}</span>
            </div>
            <h2
              className="section-title glitch-title"
              data-text={communities.heading}
            >
              {communities.heading}
            </h2>
            <p className="section-subtitle">{communities.subtitle}</p>
          </div>
        </RevealOnScroll>

        <div className="communities-grid">
          {communities.servers.map((server, idx) => (
            <RevealOnScroll key={server.id} delayMs={idx * 120}>
              <article
                className={`community-card hud-panel community-card--${server.id}`}
                style={
                  {
                    '--card-primary': server.theme.primary,
                    '--card-secondary': server.theme.secondary,
                    '--card-glow': server.theme.glow,
                    '--card-badge-bg': server.theme.badgeBg,
                  } as React.CSSProperties
                }
              >
                <span className="hud-corner-tl" aria-hidden="true" />
                <span className="hud-corner-br" aria-hidden="true" />

                <div className="community-card__top">
                  <span className="community-card__code">{server.code}</span>
                  <span className="community-card__sector">
                    {server.sectorTag}
                  </span>
                </div>

                {/* Unique Abstract Holographic Emblem */}
                <div className="community-card__emblem-wrap" aria-hidden="true">
                  <div className="community-card__emblem-glow" />
                  <ServerEmblem type={server.theme.emblemType} />
                </div>

                <div className="community-card__body">
                  <span className="community-card__subtitle">
                    {server.subtitleTag}
                  </span>
                  <h3 className="community-card__title">{server.name}</h3>
                  <p className="community-card__description">
                    {server.description}
                  </p>
                </div>

                <div className="community-card__footer">
                  <a
                    href={server.inviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`cyber-btn community-join-btn community-join-btn--${server.id}`}
                  >
                    <MessageSquare size={17} aria-hidden="true" />
                    <span>{server.buttonText}</span>
                    <ExternalLink size={15} aria-hidden="true" />
                  </a>
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};
