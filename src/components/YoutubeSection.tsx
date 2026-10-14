import React, { useEffect, useState } from 'react';
import {
  Clock,
  Eye,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Radio,
  Tv,
  Youtube,
} from 'lucide-react';
import { SITE_CONFIG, YouTubeVideoItem } from '../data/siteConfig';
import { RevealOnScroll } from './RevealOnScroll';
import { cyberAudio } from '../utils/soundEngine';

export const YouTubeSection: React.FC = () => {
  const [recentVideos, setRecentVideos] = useState<YouTubeVideoItem[]>(
    () => [...SITE_CONFIG.youtube.fallbackVideos]
  );
  const [activeVideo, setActiveVideo] = useState<YouTubeVideoItem>(
    () => SITE_CONFIG.youtube.fallbackVideos[0]
  );
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'live' | 'cached'>(
    'syncing'
  );

  const fetchLatestVideos = async () => {
    setSyncStatus('syncing');
    try {
      const res = await fetch('/api/youtube-latest');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      if (
        payload?.ok &&
        Array.isArray(payload.recentVideos) &&
        payload.recentVideos.length > 0
      ) {
        setRecentVideos(payload.recentVideos);
        setActiveVideo(payload.recentVideos[0]);
        setSyncStatus('live');
        return;
      }
      setSyncStatus('cached');
    } catch {
      setSyncStatus('cached');
    }
  };

  useEffect(() => {
    fetchLatestVideos();
  }, []);

  const handleRefresh = async () => {
    cyberAudio.playClickPulse();
    await fetchLatestVideos();
  };

  const handleGoWatch = () => {
    cyberAudio.playClickPulse();
    window.open(activeVideo.url, '_blank', 'noopener,noreferrer');
  };

  const currentIndex =
    recentVideos.findIndex((v) => v.videoId === activeVideo.videoId);
  const nextVideo =
    currentIndex < recentVideos.length - 1
      ? recentVideos[currentIndex + 1]
      : recentVideos[0];

  const handleNextSneak = () => {
    setActiveVideo(nextVideo);
    cyberAudio.playClickPulse();
  };

  return (
    <section id="youtube" className="section-shell youtube-section">
      <div className="container">
        <RevealOnScroll>
          <div className="section-header">
            <div className="section-eyebrow">
              <span className="section-eyebrow__dot" aria-hidden="true" />
              <span>{SITE_CONFIG.youtube.sectionTag}</span>
            </div>
            <h2
              className="section-title glitch-title"
              data-text={SITE_CONFIG.youtube.heading}
            >
              {SITE_CONFIG.youtube.heading}
            </h2>
            <p className="section-subtitle">{SITE_CONFIG.youtube.subheading}</p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delayMs={100}>
          <div className="yt-broadcast-card hud-panel">
            <span className="hud-corner-tl" aria-hidden="true" />
            <span className="hud-corner-br" aria-hidden="true" />

            {/* Top Signal Bar */}
            <div className="yt-broadcast-card__topbar">
              <div className="yt-signal-badge">
                <Radio size={15} className="yt-signal-badge__icon" aria-hidden="true" />
                <span>DEEP SPACE TRANSMISSION // SNEAK-PEEK YOUTUBE FEED</span>
              </div>

              <div className="yt-topbar-right">
                <span className={`yt-sync-pill yt-sync-pill--${syncStatus}`}>
                  <span className="yt-sync-pill__dot" aria-hidden="true" />
                  <span>
                    {syncStatus === 'live'
                      ? 'AUTO-FEED: LIVE SNEAK PREVIEW'
                      : syncStatus === 'syncing'
                      ? 'SCANNING CHANNEL...'
                      : 'SNEAK-PEEK: LAST KNOWN TRANSMISSION'}
                  </span>
                </span>

                <button type="button" onClick={handleRefresh} className="yt-refresh-btn" title="Refresh latest YouTube uploads" aria-label="Refresh latest YouTube uploads">
                  <RefreshCw size={14} className={syncStatus === 'syncing' ? 'is-spinning' : ''} aria-hidden="true" />
                </button>

                <div className="yt-frequency-bars" aria-hidden="true">
                  <span /><span /><span /><span /><span />
                </div>
              </div>
            </div>

            <div className="yt-broadcast-card__grid">
              {/* Left Visual: Sneak Peek Teaser */}
              <div className="yt-latest-deck">
                <div className="yt-latest-deck__header">
                  <span className="yt-latest-deck__badge">
                    <Tv size={14} aria-hidden="true" />
                    <span>
                      {activeVideo.videoId === recentVideos[0]?.videoId
                        ? 'LATEST TRANSMISSION // SNEAK PREVIEW'
                        : 'SELECTED TRANSMISSION'}
                    </span>
                  </span>
                  {activeVideo.publishedAgo && (
                    <span className="yt-latest-deck__time">
                      <Clock size={12} aria-hidden="true" />
                      <span>{activeVideo.publishedAgo}</span>
                    </span>
                  )}
                </div>

                {/* Thumbnail + title + views. No title click, no iframe. */}
                <div className="yt-sneak-peek-card">
                  <div className="yt-sneak-peek-card__img-wrap">
                    <img
                      src={activeVideo.thumbnail}
                      alt={activeVideo.title}
                      className="yt-sneak-peek-card__img"
                      loading="lazy"
                    />
                    <div className="yt-sneak-peek-card__overlay" />
                    <span className="yt-sneak-peek-card__duration">{activeVideo.duration}</span>
                  </div>
                  <div className="yt-sneak-peek-card__body">
                    <span className="yt-sneak-peek-card__label">SNEAK PREVIEW // TRANSMISSION THUMBNAIL</span>
                    <h4 className="yt-sneak-peek-card__title">{activeVideo.title}</h4>
                  </div>
                  <div className="yt-sneak-peek-card__meta">
                    {activeVideo.views && (
                      <span className="yt-sneak-peek-card__stat">
                        <Eye size={12} aria-hidden="true" />
                        <span>{activeVideo.views}</span>
                      </span>
                    )}
                    <span className="yt-sneak-peek-card__note">Preview only — watch the full transmission on YouTube</span>
                  </div>
                </div>

                {/* Sneak Preview Navigation */}
                <div className="yt-sneak-preview-nav">
                  <button type="button" onClick={handleNextSneak} className="yt-sneak-preview-nav__btn" aria-label="Cycle to next sneak preview title">
                    <svg className="yt-sneak-preview-nav__arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M15 3L8 10V21H16L9 14.5M6 3L15 12M15 3L9 10M8 10H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>NEXT SNEAK PREVIEW</span>
                  </button>
                </div>

                <button type="button" onClick={handleGoWatch} className="yt-direct-watch-link">
                  <Youtube size={15} aria-hidden="true" />
                  <span>WATCH THIS TRANSMISSION ON YOUTUBE</span>
                  <ExternalLink size={14} aria-hidden="true" />
                </button>
              </div>

              {/* Right Content: Channel Details & Subscribe CTA */}
              <div className="yt-broadcast-content">
                <div className="yt-channel-tag">
                  <Youtube size={16} aria-hidden="true" />
                  <span>
                    CHANNEL // {SITE_CONFIG.youtube.channelName.toUpperCase()} ({SITE_CONFIG.youtube.channelHandle})
                  </span>
                </div>

                <h3 className="yt-broadcast-title">
                  ENTER THE {SITE_CONFIG.youtube.channelName.toUpperCase()} BROADCAST
                </h3>

                <p className="yt-broadcast-description">{SITE_CONFIG.youtube.description}</p>

                <div className="yt-telemetry-row">
                  {SITE_CONFIG.youtube.highlights.map((item) => (
                    <div key={item.label} className="yt-telemetry-item">
                      <span className="yt-telemetry-item__label">{item.label}</span>
                      <span className="yt-telemetry-item__value">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="yt-actions">
                  <a href={SITE_CONFIG.youtube.channelUrl} target="_blank" rel="noopener noreferrer" className="cyber-btn cyber-btn--youtube">
                    <Youtube size={18} aria-hidden="true" />
                    <span>{SITE_CONFIG.youtube.primaryButtonText}</span>
                    <ExternalLink size={15} aria-hidden="true" />
                  </a>

                  <a href={SITE_CONFIG.youtube.discordUrl} target="_blank" rel="noopener noreferrer" className="cyber-btn cyber-btn--discord">
                    <MessageSquare size={18} aria-hidden="true" />
                    <span>{SITE_CONFIG.youtube.secondaryButtonText}</span>
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
