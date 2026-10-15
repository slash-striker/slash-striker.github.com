import React, { useEffect, useState } from 'react';

/*
 * Loading feedback in two forms:
 *  - BootLoader: full-screen boot sequence shown until the page is ready.
 *  - RouteLoadingBar: a thin bar that sweeps across the top on every route
 *    change. Render it with a `key` tied to the route so it replays.
 */

const MIN_BOOT_MS = 900;
const MAX_BOOT_MS = 2600;
const FADE_OUT_MS = 500;

const bootStatus = (progress: number): string => {
  if (progress < 30) return 'INITIALIZING SIGNAL';
  if (progress < 60) return 'LOADING ASSETS';
  if (progress < 90) return 'CALIBRATING RIG';
  return 'SYSTEMS ONLINE';
};

export const BootLoader: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    let fadeTimer = 0;
    let cancelled = false;

    const tick = (now: number) => {
      if (cancelled) return;
      const elapsed = now - start;
      const loaded = document.readyState === 'complete';
      const ready =
        (loaded && elapsed >= MIN_BOOT_MS) || elapsed >= MAX_BOOT_MS;

      // Climb steadily while waiting, capped at 92% until the page is ready.
      const timeTarget = Math.min(92, (elapsed / MIN_BOOT_MS) * 92);
      const next = ready ? 100 : timeTarget;

      setProgress((prev) => {
        const eased = prev + (next - prev) * 0.18;
        return ready && eased > 99.5 ? 100 : eased;
      });

      if (ready && elapsed >= MIN_BOOT_MS) {
        // Hold briefly at 100%, then fade out and unmount.
        setProgress(100);
        setLeaving(true);
        fadeTimer = window.setTimeout(() => {
          if (!cancelled) setGone(true);
        }, FADE_OUT_MS);
        return;
      }
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      window.clearTimeout(fadeTimer);
    };
  }, []);

  if (gone) return null;

  const percent = Math.round(progress);

  return (
    <div
      className={`boot-loader ${leaving ? 'is-leaving' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={`Loading ${percent} percent`}
    >
      <div className="boot-loader__brand">SLASHSTR1KER</div>

      <div className="boot-loader__track" aria-hidden="true">
        <div
          className="boot-loader__fill"
          style={{ width: `${progress.toFixed(1)}%` }}
        />
      </div>

      <div className="boot-loader__meta" aria-hidden="true">
        <span className="boot-loader__status">{bootStatus(progress)}</span>
        <span className="boot-loader__pct">{String(percent).padStart(3, '0')}%</span>
      </div>
    </div>
  );
};

export const RouteLoadingBar: React.FC = () => (
  <div className="route-bar" aria-hidden="true" />
);
