import React from 'react';
import { ClipboardCheck, GitBranch, Sparkles } from 'lucide-react';
import { SITE_CONFIG, CreditEntry } from '../data/siteConfig';
import { RevealOnScroll } from './RevealOnScroll';

interface CreditCardProps {
  entry: CreditEntry;
  index: number;
}

const CreditCard: React.FC<CreditCardProps> = ({ entry, index }) => {
  const Icon = entry.iconKey === 'github' ? GitBranch : ClipboardCheck;

  return (
    <RevealOnScroll delayMs={index * 110}>
      <article
        className={`credit-card hud-panel credit-card--${entry.accent}`}
      >
        <span className="hud-corner-tl" aria-hidden="true" />
        <span className="hud-corner-br" aria-hidden="true" />

        <div className="credit-card__header">
          <span className="credit-card__code">{entry.code}</span>
          <div
            className={`credit-card__icon-box credit-card__icon-box--${entry.accent}`}
          >
            <Icon size={24} aria-hidden="true" />
          </div>
        </div>

        <div className="credit-card__identity">
          <h3 className="credit-card__name">{entry.name}</h3>
          {entry.alias && (
            <span className="credit-card__alias">AKA {entry.alias}</span>
          )}
        </div>

        <span className="credit-card__role">{entry.role}</span>

        <p className="credit-card__description">{entry.description}</p>

        <div className="credit-card__footer">
          <span className="credit-card__line" aria-hidden="true" />
          <span className="credit-card__tag">
            <Sparkles size={12} aria-hidden="true" />
            <span>CREDIT EARNED</span>
          </span>
        </div>
      </article>
    </RevealOnScroll>
  );
};

export const CreditsSection: React.FC = () => {
  const { credits } = SITE_CONFIG;

  return (
    <section id="credits" className="section-shell credits-section">
      <div className="container">
        <RevealOnScroll>
          <div className="section-header">
            <div className="section-eyebrow">
              <span className="section-eyebrow__dot" aria-hidden="true" />
              <span>{credits.sectionTag}</span>
            </div>
            <h2
              className="section-title glitch-title"
              data-text={credits.heading}
            >
              {credits.heading}
            </h2>
            <p className="section-subtitle">{credits.subtitle}</p>
          </div>
        </RevealOnScroll>

        <div className="credits-grid">
          {credits.entries.map((entry, index) => (
            <CreditCard key={entry.id} entry={entry} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
