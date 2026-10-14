import React, { useEffect, useState } from 'react';
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
import { SpaceMineGame } from './components/SpaceMineGame';
import { Footer } from './components/Footer';
import { NotFoundView } from './components/NotFoundView';

/*
 * Hash-based router (#/youtube, #/bots, ...). Hash routes work on any static
 * host — GitHub Pages sends unknown real paths straight to the static
 * 404.html, so pathname-based routes would never reach the SPA. Legacy bare
 * anchors from the old one-pager (#about, #credits, ...) resolve to their
 * new pages so old links keep working.
 */
const ROUTE_PATHS = [
  '/',
  '/youtube',
  '/bots',
  '/communities',
  '/game',
  '/contact',
  '/credits',
] as const;

const LEGACY_ANCHORS: Record<string, string> = {
  '': '/',
  home: '/',
  about: '/',
  'index.html': '/',
  youtube: '/youtube',
  bots: '/bots',
  communities: '/communities',
  game: '/game',
  contact: '/contact',
  credits: '/credits',
};

const SKIP_LINK_HASH = '#main-content';

const resolveRoute = (hash: string): string | null => {
  if (hash === SKIP_LINK_HASH) return '/';
  const raw = hash.replace(/^#/, '');
  if (raw.startsWith('/')) {
    const path = `/${raw.replace(/^\/+/, '')}`;
    const normalized =
      path.length > 1 ? path.replace(/\/$/, '') : path;
    return (ROUTE_PATHS as readonly string[]).includes(normalized)
      ? normalized
      : null;
  }
  return Object.prototype.hasOwnProperty.call(LEGACY_ANCHORS, raw)
    ? LEGACY_ANCHORS[raw]
    : null;
};

export const App: React.FC = () => {
  const [route, setRoute] = useState<string | null>(() =>
    resolveRoute(window.location.hash)
  );
  const [pathname, setPathname] = useState<string>(() => window.location.pathname);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const isValidPath =
    pathname === '/' || pathname === '/index.html' || pathname === '';

  const showNotFound = !isValidPath || route === null;

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === SKIP_LINK_HASH) return;
      setRoute(resolveRoute(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

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
        totalScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / totalScroll))
        : 0;
      setScrollProgress(currentProgress);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [route]);

  const handleReturnHome = () => {
    window.history.pushState(null, '', '/');
    setPathname('/');
    if (window.location.hash !== '#/' && window.location.hash !== '') {
      window.location.hash = '#/';
    } else {
      setRoute('/');
      window.scrollTo({ top: 0 });
    }
  };

  const navId = route === '/' || route === null ? 'home' : route.slice(1);

  const renderRouteContent = () => {
    switch (route) {
      case '/':
        return (
          <>
            <HeroSection />

            <div className="section-divider" aria-hidden="true">
              <span className="section-divider__line" />
              <span className="section-divider__tag">SYS.TRANSITION // 01-02</span>
              <span className="section-divider__line" />
            </div>

            <AboutSection />
          </>
        );
      case '/youtube':
        return <YouTubeSection />;
      case '/bots':
        return <BotLabSection />;
      case '/communities':
        return <CommunitiesSection />;
      case '/game':
        return <SpaceMineGame />;
      case '/contact':
        return <ContactSection />;
      case '/credits':
        return <CreditsSection />;
      default:
        return null;
    }
  };

  return (
    <div className="app-root">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <CosmicBackground />
      <CustomCursor />

      <Navbar activeSection={navId} scrollProgress={scrollProgress} />

      {showNotFound ? (
        <NotFoundView onReturnHome={handleReturnHome} />
      ) : (
        <main
          id="main-content"
          className={route === '/' ? undefined : 'page-view'}
        >
          {renderRouteContent()}
        </main>
      )}

      <Footer />
    </div>
  );
};
