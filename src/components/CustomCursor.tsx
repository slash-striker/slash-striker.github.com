import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [coords, setCoords] = useState({ x: -100, y: -100 });
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (!isFinePointer || prefersReducedMotion) {
      setEnabled(false);
      return;
    }

    setEnabled(true);

    const onMouseMove = (e: MouseEvent) => {
      setCoords({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('a, button, [role="button"]');
        setIsHoveringInteractive(Boolean(interactive));
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      className={`cyber-cursor-glow ${isHoveringInteractive ? 'is-interactive' : ''}`}
      style={{
        transform: `translate3d(${coords.x}px, ${coords.y}px, 0)`,
      }}
      aria-hidden="true"
    >
      <div className="cyber-cursor-ring" />
      <div className="cyber-cursor-dot" />
    </div>
  );
};
