import React, { useMemo, useState } from 'react';
import {
  Bot,
  Check,
  Copy,
  Cpu,
  ExternalLink,
  Layers,
  Search,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { SITE_CONFIG, BotSystemCard } from '../data/siteConfig';
import { RevealOnScroll } from './RevealOnScroll';
import { cyberAudio } from '../utils/soundEngine';

interface BotCardProps {
  bot: BotSystemCard;
  featured?: boolean;
}

const HolographicBotCard: React.FC<BotCardProps> = ({
  bot,
  featured = false,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    bot.commandCategories[0]?.id || 'economy'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const totalCommandCount = useMemo(
    () =>
      bot.commandCategories.reduce(
        (sum, cat) => sum + cat.commands.length,
        0
      ),
    [bot.commandCategories]
  );

  const activeCategory = useMemo(
    () =>
      bot.commandCategories.find((c) => c.id === selectedCategoryId) ||
      bot.commandCategories[0],
    [bot.commandCategories, selectedCategoryId]
  );

  const displayedCommands = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return (activeCategory?.commands || []).map((cmd) => ({
        ...cmd,
        categoryLabel: activeCategory?.shortLabel || '',
      }));
    }
    return bot.commandCategories.flatMap((cat) =>
      cat.commands
        .filter(
          (cmd) =>
            cmd.name.toLowerCase().includes(q) ||
            cmd.desc.toLowerCase().includes(q)
        )
        .map((cmd) => ({
          ...cmd,
          categoryLabel: cat.shortLabel,
        }))
    );
  }, [activeCategory, bot.commandCategories, searchQuery]);

  const handleCopyCommand = async (cmdName: string) => {
    cyberAudio.playClickPulse();
    try {
      await navigator.clipboard.writeText(cmdName);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = cmdName;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedCommand(cmdName);
    window.setTimeout(() => {
      setCopiedCommand((prev) => (prev === cmdName ? null : prev));
    }, 2000);
  };

  return (
    <article
      className={`bot-lab-card hud-panel ${
        featured ? 'bot-lab-card--featured' : ''
      }`}
    >
      <span className="hud-corner-tl" aria-hidden="true" />
      <span className="hud-corner-br" aria-hidden="true" />

      {/* Animated Background Grid & Circuit Pattern */}
      <div className="bot-lab-card__grid-bg" aria-hidden="true" />

      {/* Top Interface Header Labels */}
      <div className="bot-lab-card__hud-bar">
        <div className="bot-lab-card__labels">
          {bot.systemLabels.map((lbl) => (
            <span key={lbl} className="bot-hud-pill">
              {lbl}
            </span>
          ))}
        </div>

        <div className="bot-status-indicator">
          <span className="bot-status-indicator__dot" aria-hidden="true" />
          <span>{bot.statusBadge}</span>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="bot-lab-card__main">
        {/* Left: Holographic Avatar Frame & Quick Telemetry */}
        <div className="bot-avatar-column">
          <div className="bot-holo-frame" aria-hidden="true">
            <div className="bot-holo-frame__ring bot-holo-frame__ring--outer" />
            <div className="bot-holo-frame__ring bot-holo-frame__ring--inner" />
            <div className="bot-holo-frame__avatar">
              {/* Customizable SVG Bot Emblem */}
              <svg viewBox="0 0 120 120" className="bot-avatar-svg" fill="none">
                <defs>
                  <linearGradient id="botGrad" x1="0" y1="0" x2="120" y2="120">
                    <stop offset="0%" stopColor="#00F5FF" />
                    <stop offset="55%" stopColor="#397BFF" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                </defs>
                <polygon
                  points="60,8 106,34 106,86 60,112 14,86 14,34"
                  stroke="url(#botGrad)"
                  strokeWidth="3"
                  fill="rgba(0, 245, 255, 0.08)"
                />
                <rect
                  x="32"
                  y="38"
                  width="56"
                  height="44"
                  rx="10"
                  stroke="#00F5FF"
                  strokeWidth="2.5"
                  fill="rgba(5, 6, 16, 0.85)"
                />
                <circle cx="48" cy="58" r="6" fill="#00F5FF" />
                <circle cx="72" cy="58" r="6" fill="#00F5FF" />
                <path
                  d="M46 72H74"
                  stroke="#397BFF"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M60 22V38"
                  stroke="#FF3CAC"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="60" cy="20" r="4" fill="#FF3CAC" />
              </svg>
            </div>
            <div className="bot-holo-frame__scanline" />
          </div>

          <div className="bot-avatar-meta">
            <span className="bot-avatar-meta__code">
              UNIT // DRAGON-CODE CORE
            </span>
            <span className="bot-avatar-meta__tag">
              {totalCommandCount} VERIFIED SLASH COMMANDS
            </span>
          </div>
        </div>

        {/* Right: Bot Identity, Core Systems, Interactive Command Explorer & Invite CTA */}
        <div className="bot-details-column">
          <div className="bot-title-row">
            <h3 className="bot-lab-card__title">{bot.name}</h3>
            <span className="bot-lab-card__client-tag">
              {bot.commandCategories.length} SECTORS // {totalCommandCount}{' '}
              COMMANDS
            </span>
          </div>

          <p className="bot-lab-card__description">{bot.description}</p>

          {/* 4 Core System Pillars */}
          <div className="bot-features-grid">
            {bot.featurePlaceholders.map((feat) => (
              <div key={feat.slot} className="bot-feature-slot">
                <div className="bot-feature-slot__header">
                  <Cpu size={14} aria-hidden="true" />
                  <span>{feat.slot}</span>
                </div>
                <h4 className="bot-feature-slot__title">{feat.title}</h4>
                <p className="bot-feature-slot__detail">{feat.detail}</p>
              </div>
            ))}
          </div>

          {/* Interactive Neural Command Terminal */}
          <div className="bot-command-explorer">
            <div className="bot-command-explorer__top">
              <div className="bot-command-explorer__title-group">
                <Terminal size={16} aria-hidden="true" />
                <span>NEURAL COMMAND DIRECTORY // CLICK COMMAND TO COPY</span>
              </div>

              <div className="bot-command-search">
                <Search
                  size={14}
                  className="bot-command-search__icon"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search /mine, /blackjack, /profile..."
                  className="bot-command-search__input"
                  aria-label="Search bot slash commands"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div
              className="bot-category-tabs"
              role="tablist"
              aria-label="Bot Command Categories"
            >
              {bot.commandCategories.map((cat) => {
                const isSelected =
                  !searchQuery.trim() && cat.id === selectedCategoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => {
                      cyberAudio.playClickPulse();
                      setSelectedCategoryId(cat.id);
                      setSearchQuery('');
                    }}
                    onMouseEnter={() => cyberAudio.playHoverBlip()}
                    className={`bot-category-tab ${
                      isSelected ? 'is-active' : ''
                    }`}
                  >
                    <span>{cat.shortLabel}</span>
                    <span className="bot-category-tab__count">
                      {cat.commands.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Category Header */}
            <div className="bot-command-sector-bar">
              <span>
                {searchQuery.trim()
                  ? `SEARCH RESULTS FOR "${searchQuery.toUpperCase()}" (${displayedCommands.length})`
                  : `${activeCategory?.name} (${displayedCommands.length} COMMANDS)`}
              </span>
              {copiedCommand && (
                <span className="bot-command-copied-toast" role="status">
                  COPIED {copiedCommand} TO CLIPBOARD
                </span>
              )}
            </div>

            {/* Commands Grid */}
            <div className="bot-commands-grid">
              {displayedCommands.map((cmd) => {
                const isCopied = copiedCommand === cmd.name;
                return (
                  <button
                    key={`${cmd.categoryLabel}-${cmd.name}`}
                    type="button"
                    onClick={() => handleCopyCommand(cmd.name)}
                    onMouseEnter={() => cyberAudio.playHoverBlip()}
                    className={`bot-cmd-item ${isCopied ? 'is-copied' : ''}`}
                    title={`Click to copy ${cmd.name}`}
                  >
                    <div className="bot-cmd-item__top">
                      <code className="bot-cmd-item__name">{cmd.name}</code>
                      <span className="bot-cmd-item__action">
                        {isCopied ? (
                          <>
                            <Check size={13} aria-hidden="true" />
                            <span>COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} aria-hidden="true" />
                            <span>COPY</span>
                          </>
                        )}
                      </span>
                    </div>
                    <p className="bot-cmd-item__desc">{cmd.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prominent Invitation Portal Bar */}
          <div className="bot-invite-portal">
            <div className="bot-invite-portal__info">
              <span className="bot-invite-portal__label">
                INVITATION PORTAL // DIRECT AUTHORIZATION
              </span>
              <span className="bot-invite-portal__sub">
                Deploy {bot.name} directly to your Discord server via official
                Discord OAuth2.
              </span>
            </div>

            <a
              href={bot.inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cyber-btn cyber-btn--primary bot-invite-btn"
            >
              <Bot size={18} aria-hidden="true" />
              <span>{bot.buttonText}</span>
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};

export const BotLabSection: React.FC = () => {
  const { botLab } = SITE_CONFIG;

  return (
    <section id="bots" className="section-shell bot-lab-section">
      <div className="container">
        <RevealOnScroll>
          <div className="section-header">
            <div className="section-eyebrow">
              <span className="section-eyebrow__dot" aria-hidden="true" />
              <span>{botLab.sectionTag}</span>
            </div>
            <h2
              className="section-title glitch-title"
              data-text={botLab.heading}
            >
              {botLab.heading}
            </h2>
            <p className="section-subtitle">{botLab.subtitle}</p>
          </div>
        </RevealOnScroll>

        {/* Featured Bot Card */}
        <RevealOnScroll delayMs={90}>
          <HolographicBotCard bot={botLab.featuredBot} featured />
        </RevealOnScroll>

        {/* Optional Additional Bots (Scalable Architecture) */}
        {botLab.additionalBots.length > 0 && (
          <div className="bot-additional-grid">
            {botLab.additionalBots.map((bot, idx) => (
              <RevealOnScroll key={bot.id} delayMs={idx * 100}>
                <HolographicBotCard bot={bot} />
              </RevealOnScroll>
            ))}
          </div>
        )}

        {/* MORE SYSTEMS COMING SOON Expansion Bay */}
        <RevealOnScroll delayMs={160}>
          <div className="bot-coming-soon hud-panel">
            <div className="bot-coming-soon__icon">
              <Layers size={24} aria-hidden="true" />
            </div>
            <div className="bot-coming-soon__content">
              <div className="bot-coming-soon__badge">
                <Sparkles size={13} aria-hidden="true" />
                <span>EXPANSION BAY // MODULAR ARCHITECTURE</span>
              </div>
              <h3 className="bot-coming-soon__title">
                {botLab.comingSoonTitle}
              </h3>
              <p className="bot-coming-soon__desc">
                {botLab.comingSoonDescription}
              </p>
            </div>
            <div className="bot-coming-soon__slots" aria-hidden="true">
              <div className="expansion-slot">BAY 02 // STANDBY</div>
              <div className="expansion-slot">BAY 03 // STANDBY</div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};
