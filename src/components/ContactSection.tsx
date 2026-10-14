import React, { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  MessageSquare,
  Radio,
  ShieldCheck,
  Youtube,
} from 'lucide-react';
import { SITE_CONFIG } from '../data/siteConfig';
import { RevealOnScroll } from './RevealOnScroll';

export const ContactSection: React.FC = () => {
  const { contact } = SITE_CONFIG;
  const [copied, setCopied] = useState(false);

  const handleCopyUsername = async () => {
    try {
      await navigator.clipboard.writeText(contact.discordUsername);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback copy method if clipboard API is restricted
      const textarea = document.createElement('textarea');
      textarea.value = contact.discordUsername;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <section id="contact" className="section-shell contact-section">
      <div className="container">
        <RevealOnScroll>
          <div className="section-header">
            <div className="section-eyebrow">
              <span className="section-eyebrow__dot" aria-hidden="true" />
              <span>{contact.sectionTag}</span>
            </div>
            <h2
              className="section-title glitch-title"
              data-text={contact.heading}
            >
              {contact.heading}
            </h2>
            <p className="section-subtitle">{contact.subtitle}</p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delayMs={100}>
          <div className="contact-console hud-panel">
            <span className="hud-corner-tl" aria-hidden="true" />
            <span className="hud-corner-br" aria-hidden="true" />

            <div className="contact-console__header">
              <div className="contact-console__status">
                <Radio size={15} aria-hidden="true" />
                <span>DIRECT COMM-LINK // DIGITAL IDENTIFICATION PANEL</span>
              </div>
              <span className="contact-console__protocol">
                PROTOCOL // DISCORD-ID
              </span>
            </div>

            <div className="contact-console__grid">
              {/* Left: Digital Identification Panel with Copy Button */}
              <div className="contact-id-panel">
                <p className="contact-id-panel__prompt">{contact.promptText}</p>

                <div className="contact-id-badge">
                  <div className="contact-id-badge__meta">
                    <span className="contact-id-badge__platform">
                      PRIMARY PLATFORM: {contact.platform.toUpperCase()}
                    </span>
                    <span className="contact-id-badge__verified">
                      <ShieldCheck size={14} aria-hidden="true" />
                      <span>VERIFIED HANDLE</span>
                    </span>
                  </div>

                  <div className="contact-id-badge__row">
                    <div className="contact-id-badge__handle-wrap">
                      <span className="contact-id-badge__label">USERNAME</span>
                      <code
                        className="contact-id-badge__username"
                        data-testid="discord-username"
                      >
                        {contact.discordUsername}
                      </code>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyUsername}
                      className={`cyber-btn contact-copy-btn ${
                        copied ? 'is-copied' : 'cyber-btn--primary'
                      }`}
                      aria-live="polite"
                    >
                      {copied ? (
                        <>
                          <Check size={17} aria-hidden="true" />
                          <span>{contact.copySuccessText}</span>
                        </>
                      ) : (
                        <>
                          <Copy size={17} aria-hidden="true" />
                          <span>COPY USERNAME</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="contact-id-badge__hint">
                    Copies exact Discord username (<strong>{contact.discordUsername}</strong>) to your clipboard so you can add or message directly on Discord.
                  </p>
                </div>
              </div>

              {/* Right: Direct Community & Channel Portals */}
              <div className="contact-portals-panel">
                <h3 className="contact-portals-panel__title">
                  DIRECT NETWORK CHANNELS
                </h3>
                <p className="contact-portals-panel__desc">
                  Prefer to connect inside the community or follow the latest broadcasts? Jump straight into the official SlashStr1ker channels below.
                </p>

                <div className="contact-portals-panel__actions">
                  <a
                    href={contact.communityUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cyber-btn cyber-btn--discord"
                  >
                    <MessageSquare size={18} aria-hidden="true" />
                    <span>JOIN SLASHSTR1KER DISCORD</span>
                    <ExternalLink size={15} aria-hidden="true" />
                  </a>

                  <a
                    href={contact.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cyber-btn cyber-btn--youtube"
                  >
                    <Youtube size={18} aria-hidden="true" />
                    <span>VISIT YOUTUBE CHANNEL</span>
                    <ExternalLink size={15} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};
