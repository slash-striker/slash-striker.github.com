import React, { useEffect, useState } from 'react';
import { SITE_CONFIG } from './data/siteConfig';
import { CosmicBackground } from './components/CosmicBackground';
import { CustomCursor } from './components/CustomCursor';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { YouTubeSection } from './components/YouTubeSection';
import { BotLabSection } from './components/BotLabSection';
import { CommunitiesSection } from './components/CommunitiesSection';
import { ContactSection } from './components/ContactSection';
import { CreditsSection } from './components/CreditsSection';
import { Footer } from './components/Footer';
import { NotFoundView } from './components/NotFoundView';

export const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [pathname, setPathname] = useState<string>(() => window.location.pathname);

  const isNotFound =
    pathname !== '/' && pathname !== '/index.html' && pathname !== '';

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress =
        totalScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / totalScroll)) : 0;
      setScrollProgress(currentProgress);

      const sectionIds = SITE_CONFIG.navigation.map((n) => n.id);
      let current = 'home';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 180) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleReturnHome = () => {
    window.history.pushState(null, '', '/');
    setPathname('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-root">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <CosmicBackground />
      <CustomCursor />

      <Navbar activeSection={activeSection} scrollProgress={scrollProgress} />

      {isNotFound ? (
        <NotFoundView onReturnHome={handleReturnHome} />
      ) : (
        <main id="main-content">
          <HeroSection />

          <div className="section-divider" aria-hidden="true">
            <span className="section-divider__line" />
            <span className="section-divider__tag">SYS.TRANSITION // 01-02</span>
            <span className="section-divider__line" />
          </div>

          <AboutSection />

          <div className="section-divider" aria-hidden="true">
            <span className="section-divider__line" />
            <span className="section-divider__tag">SYS.TRANSITION // 02-03</span>
            <span className="section-divider__line" />
          </div>

          <YouTubeSection />

          <div className="section-divider" aria-hidden="true">
            <span className="section-divider__line" />
            <span className="section-divider__tag">SYS.TRANSITION // 03-04</span>
            <span className="section-divider__line" />
          </div>

          <BotLabSection />

          <div className="section-divider" aria-hidden="true">
            <span className="section-divider__line" />
            <span className="section-divider__tag">SYS.TRANSITION // 04-05</span>
            <span className="section-divider__line" />
          </div>

          <CommunitiesSection />

          <div className="section-divider" aria-hidden="true">
            <span className="section-divider__line" />
            <span className="section-divider__tag">SYS.TRANSITION // 05-06</span>
            <span className="section-divider__line" />
          </div>

          <ContactSection />

          <div className="section-divider" aria-hidden="true">
            <span className="section-divider__line" />
            <span className="section-divider__tag">SYS.TRANSITION // 06-07</span>
            <span className="section-divider__line" />
          </div>

          <CreditsSection />
        </main>
      )}

      <Footer />
    </div>
  );
};
