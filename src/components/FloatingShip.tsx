import React, { useEffect, useRef } from 'react';

/*
 * A small ship that drifts between random waypoints across the viewport.
 * Purely decorative: pointer-events are disabled, motion is skipped for
 * users who prefer reduced motion, and the position is written straight to
 * the DOM each frame so React never re-renders.
 */

const SHIP_SIZE = 56;
const MAX_SPEED = 55; // px per second
const ARRIVE_DISTANCE = 14;

interface Point {
  x: number;
  y: number;
}

const randomBetween = (min: number, max: number): number =>
  min + Math.random() * (max - min);

const pickWaypoint = (): Point => {
  const maxX = Math.max(0, window.innerWidth - SHIP_SIZE - 16);
  const maxY = Math.max(0, window.innerHeight - SHIP_SIZE - 16);
  return {
    x: randomBetween(16, maxX),
    y: randomBetween(16, maxY),
  };
};

export const FloatingShip: React.FC = () => {
  const shipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ship = shipRef.current;
    if (!ship) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) {
      ship.style.display = 'none';
      return;
    }

    let position = pickWaypoint();
    let target = pickWaypoint();
    let velocity = { x: 0, y: 0 };
    let heading = 0;
    let pauseUntil = 0;
    let raf = 0;
    let last = performance.now();

    const render = (time: number) => {
      const bob = Math.sin(time / 420) * 3;
      ship.style.transform = `translate3d(${position.x.toFixed(1)}px, ${(
        position.y + bob
      ).toFixed(1)}px, 0) rotate(${heading.toFixed(1)}deg)`;
    };

    const step = (time: number) => {
      raf = window.requestAnimationFrame(step);
      const dt = Math.min(0.05, (time - last) / 1000);
      last = time;

      const dx = target.x - position.x;
      const dy = target.y - position.y;
      const dist = Math.hypot(dx, dy);

      if (dist < ARRIVE_DISTANCE) {
        // Hover briefly at each waypoint, then pick the next one.
        if (pauseUntil === 0) pauseUntil = time + randomBetween(1200, 3200);
        velocity = { x: velocity.x * 0.9, y: velocity.y * 0.9 };
        if (time >= pauseUntil) {
          pauseUntil = 0;
          target = pickWaypoint();
        }
      } else {
        const speed = MAX_SPEED * Math.min(1, dist / 120 + 0.35);
        const desiredX = (dx / dist) * speed;
        const desiredY = (dy / dist) * speed;
        const ease = Math.min(1, dt * 1.6);
        velocity = {
          x: velocity.x + (desiredX - velocity.x) * ease,
          y: velocity.y + (desiredY - velocity.y) * ease,
        };
      }

      position = {
        x: position.x + velocity.x * dt,
        y: position.y + velocity.y * dt,
      };

      if (Math.hypot(velocity.x, velocity.y) > 4) {
        // The ship art points up, so offset the heading by 90 degrees.
        const targetHeading =
          (Math.atan2(velocity.y, velocity.x) * 180) / Math.PI + 90;
        let diff = targetHeading - heading;
        diff = ((diff + 540) % 360) - 180;
        heading += diff * Math.min(1, dt * 3);
      }

      render(time);
    };

    const handleResize = () => {
      position = {
        x: Math.min(position.x, window.innerWidth - SHIP_SIZE - 16),
        y: Math.min(position.y, window.innerHeight - SHIP_SIZE - 16),
      };
    };

    render(last);
    raf = window.requestAnimationFrame(step);
    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={shipRef} className="floating-ship" aria-hidden="true">
      <svg
        width={SHIP_SIZE}
        height={SHIP_SIZE}
        viewBox="0 0 64 64"
        focusable="false"
      >
        <path
          d="M32 4 L50 40 L38 34 L32 44 L26 34 L14 40 Z"
          fill="#101830"
          stroke="#ff2740"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="26" r="4" fill="#00f5ff" />
        <path
          d="M28 46 L32 62 L36 46 Z"
          fill="#ff3cac"
          opacity="0.85"
          className="floating-ship__flame"
        />
      </svg>
    </div>
  );
};
