import React, { useState } from 'react';
import { Gamepad2, Code2, Users } from 'lucide-react';
import { SITE_CONFIG, AboutFeatureCard } from '../data/siteConfig';
import { RevealOnScroll } from './RevealOnScroll';

interface TiltCardProps {
  card: AboutFeatureCard;
  index: number;
}

const AboutTiltCard: React.FC<TiltCardProps> = ({ card, index }) => {
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = ((x / rect.width - 0.5) * 8).toFixed(2);
    const rotateX = ((0.5 - y / rect.height) * 8).toFixed(2);

    setTiltStyle({
      transform: `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`,
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({});
  };

  const Icon =
    card.iconKey === 'gaming'
      ? Gamepad2
      : card.iconKey === 'development'
      ? Code2
      : Users;

  return (
    <RevealOnScroll delayMs={index * 110}>
      <article
        className={`about-card hud-panel about-card--${card.accent}`}
        style={tiltStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <span className="hud-corner-tl" aria-hidden="true" />
        <span className="hud-corner-br" aria-hidden="true" />

        <div className="about-card__header">
          <span className="about-card__code">{card.code}</span>
          <div className={`about-card__icon-box about-card__icon-box--${card.accent}`}>
            <Icon size={24} aria-hidden="true" />
          </div>
        </div>

        <h3 className="about-card__title">{card.title}</h3>
        <p className="about-card__description">{card.description}</p>

        <div className="about-card__footer" aria-hidden="true">
          <span className="about-card__line" />
          <span className="about-card__tag">ACTIVE PILLAR</span>
        </div>
      </article>
    </RevealOnScroll>
  );
};

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="section-shell about-section">
      <div className="container">
        <RevealOnScroll>
          <div className="section-header">
            <div className="section-eyebrow">
              <span className="section-eyebrow__dot" aria-hidden="true" />
              <span>{SITE_CONFIG.about.sectionTag}</span>
            </div>
            <h2
              className="section-title glitch-title"
              data-text={SITE_CONFIG.about.heading}
            >
              {SITE_CONFIG.about.heading}
            </h2>
            <p className="section-description">
              {SITE_CONFIG.about.description}
            </p>
          </div>
        </RevealOnScroll>

        <div className="about-grid">
          {SITE_CONFIG.about.cards.map((card, index) => (
            <AboutTiltCard key={card.id} card={card} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
