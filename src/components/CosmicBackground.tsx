import React, { useEffect, useRef } from 'react';

interface StarNode {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speedY: number;
  speedX: number;
  twinkleSpeed: number;
  color: string;
}

export const CosmicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let animationFrameId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const pointer = {
      x: width * 0.5,
      y: height * 0.35,
      active: false,
    };

    const colors = ['#F5F7FF', '#00F5FF', '#397BFF', '#A855F7', '#FF3CAC'];
    const starCount = Math.min(110, Math.max(45, Math.floor((width * height) / 16000)));

    const stars: StarNode[] = Array.from({ length: starCount }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.65 + 0.25,
      speedY: (Math.random() * 0.18 + 0.04) * (i % 3 === 0 ? 1.4 : 0.8),
      speedX: (Math.random() - 0.5) * 0.08,
      twinkleSpeed: Math.random() * 0.015 + 0.005,
      color: colors[i % colors.length],
    }));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };

    const handleMouseLeave = () => {
      pointer.active = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    let tick = 0;

    const renderFrame = () => {
      tick += 1;
      ctx.clearRect(0, 0, width, height);

      // Draw stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        if (!prefersReducedMotion) {
          s.y -= s.speedY;
          s.x += s.speedX;
          if (s.y < -4) {
            s.y = height + 4;
            s.x = Math.random() * width;
          }
          if (s.x < -4) s.x = width + 4;
          if (s.x > width + 4) s.x = -4;
        }

        const currentAlpha = prefersReducedMotion
          ? s.alpha
          : Math.max(
              0.15,
              Math.min(0.95, s.alpha + Math.sin(tick * s.twinkleSpeed + i) * 0.25)
            );

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();
      }

      // Draw subtle constellation lines among nearby bright stars + pointer
      const constellationNodes = stars.slice(0, 38);
      ctx.lineWidth = 0.7;
      for (let i = 0; i < constellationNodes.length; i++) {
        const a = constellationNodes[i];
        for (let j = i + 1; j < constellationNodes.length; j++) {
          const b = constellationNodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = '#00F5FF';
            ctx.globalAlpha = (1 - dist / 130) * 0.14;
            ctx.stroke();
          }
        }

        if (pointer.active && !prefersReducedMotion) {
          const pdx = a.x - pointer.x;
          const pdy = a.y - pointer.y;
          const pdist = Math.hypot(pdx, pdy);
          if (pdist < 170) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.strokeStyle = '#397BFF';
            ctx.globalAlpha = (1 - pdist / 170) * 0.28;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;

      if (!prefersReducedMotion) {
        animationFrameId = window.requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="cosmic-backdrop" aria-hidden="true">
      {/* Deep space nebulae */}
      <div className="nebula-orb nebula-orb--cyan" />
      <div className="nebula-orb nebula-orb--purple" />
      <div className="nebula-orb nebula-orb--blue" />
      {/* Digital Perspective Grid */}
      <div className="cyber-grid-overlay" />
      {/* Interactive Starfield Canvas */}
      <canvas ref={canvasRef} className="starfield-canvas" />
    </div>
  );
};
