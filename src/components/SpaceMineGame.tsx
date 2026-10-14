import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Gauge, Gem, Pause, Play, RotateCcw, Zap } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';

/*
 * SPACE MINE — a small arcade mining loop:
 * steer the rig, the laser auto-mines the lowest rock, ore drops, and ore
 * buys upgrades (laser / drill / engine). Progress persists in localStorage.
 * The canvas is intentionally always dark — it is space, after all.
 */

type UpgradeKey = 'laser' | 'drill' | 'engine';

interface Progress {
  ore: number;
  mined: number;
  upgrades: Record<UpgradeKey, number>;
}

interface Rock {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hp: number;
  maxHp: number;
  ore: number;
  rot: number;
  spin: number;
  kind: 'common' | 'iron' | 'crystal';
  shape: number[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Beam {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
}

const STORAGE_KEY = 'ss-spacemine';

const INITIAL_PROGRESS: Progress = {
  ore: 0,
  mined: 0,
  upgrades: { laser: 1, drill: 1, engine: 1 },
};

const UPGRADE_DEFS: {
  key: UpgradeKey;
  label: string;
  desc: string;
  base: number;
}[] = [
  { key: 'laser', label: 'LASER ARRAY', desc: 'Beam damage + fire rate', base: 15 },
  { key: 'drill', label: 'DRILL HEAD', desc: 'Ore yield per rock', base: 20 },
  { key: 'engine', label: 'ION ENGINE', desc: 'Rig movement speed', base: 25 },
];

const upgradeCost = (base: number, level: number): number =>
  Math.floor(base * Math.pow(1.55, level - 1));

const loadProgress = (): Progress => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...INITIAL_PROGRESS, upgrades: { ...INITIAL_PROGRESS.upgrades } };
    const parsed = JSON.parse(raw) as Partial<Progress>;
    const upgrades = {
      ...INITIAL_PROGRESS.upgrades,
      ...(parsed.upgrades || {}),
    };
    return {
      ore:
        typeof parsed.ore === 'number' && Number.isFinite(parsed.ore)
          ? Math.max(0, parsed.ore)
          : 0,
      mined:
        typeof parsed.mined === 'number' && Number.isFinite(parsed.mined)
          ? Math.max(0, parsed.mined)
          : 0,
      upgrades,
    };
  } catch {
    return { ...INITIAL_PROGRESS, upgrades: { ...INITIAL_PROGRESS.upgrades } };
  }
};

const saveProgress = (progress: Progress): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage unavailable — progress stays in memory for this visit.
  }
};

const KIND_STYLE: Record<
  Rock['kind'],
  { fill: string; edge: string; glow: string | null }
> = {
  common: { fill: '#5d6688', edge: '#8f9ac2', glow: null },
  iron: { fill: '#7a5a48', edge: '#c08a5e', glow: null },
  crystal: { fill: '#8a1f52', edge: '#ff3cac', glow: 'rgba(255, 60, 172, 0.65)' },
};

const makeRock = (width: number, depth: number): Rock => {
  const roll = Math.random();
  const kind: Rock['kind'] =
    roll < 0.1 ? 'crystal' : roll < 0.35 ? 'iron' : 'common';
  const r =
    kind === 'iron'
      ? 20 + Math.random() * 8
      : kind === 'crystal'
        ? 10 + Math.random() * 6
        : 12 + Math.random() * 7;
  const hp =
    (kind === 'iron' ? 5 : kind === 'crystal' ? 3 : 2) +
    Math.floor(depth / (kind === 'iron' ? 7 : 10));
  const shape = Array.from({ length: 9 }, () => 0.72 + Math.random() * 0.5);
  return {
    x: r + Math.random() * Math.max(1, width - r * 2),
    y: -r - 10,
    vx: (Math.random() - 0.5) * 36,
    vy: Math.min(120, 26 + depth * 1.6 + Math.random() * 16),
    r,
    hp,
    maxHp: hp,
    ore:
      (kind === 'crystal' ? 9 : kind === 'iron' ? 5 : 2) +
      (Math.random() < 0.4 ? 1 : 0),
    rot: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 1.4,
    kind,
    shape,
  };
};

export const SpaceMineGame: React.FC = () => {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [running, setRunning] = useState(false);
  const [depth, setDepth] = useState(0);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const progressRef = useRef<Progress>(progress);
  const runningRef = useRef(false);
  const startedRef = useRef(false);

  const rocksRef = useRef<Rock[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const beamsRef = useRef<Beam[]>([]);
  const starsRef = useRef<{ x: number; y: number; s: number; tw: number }[]>([]);
  const shipRef = useRef({ x: 0, targetX: 0 });
  const keysRef = useRef<Set<string>>(new Set());
  const sizeRef = useRef({ w: 720, h: 440 });
  const spawnRef = useRef(1.2);
  const fireRef = useRef(0);
  const depthRef = useRef(0);
  const depthTickRef = useRef(0);
  const saveTickRef = useRef(0);

  const applyProgress = useCallback((next: Progress) => {
    progressRef.current = next;
    setProgress(next);
  }, []);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const setRunningBoth = useCallback((value: boolean) => {
    runningRef.current = value;
    setRunning(value);
    if (value) startedRef.current = true;
  }, []);

  /* ------------------------------------------------------------------ */
  /* Sizing                                                             */
  /* ------------------------------------------------------------------ */
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const w = Math.max(240, stage.clientWidth);
    const h = Math.round(Math.min(560, Math.max(340, w * 0.62)));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const prev = sizeRef.current;
    sizeRef.current = { w, h };
    if (shipRef.current.x === 0) {
      shipRef.current = { x: w / 2, targetX: w / 2 };
    } else {
      shipRef.current.x = Math.min(
        Math.max(shipRef.current.x * (w / Math.max(1, prev.w)), 24),
        w - 24
      );
      shipRef.current.targetX = Math.min(
        Math.max(shipRef.current.targetX * (w / Math.max(1, prev.w)), 24),
        w - 24
      );
    }
    // Regenerate starfield for the new canvas box.
    starsRef.current = Array.from({ length: 90 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      s: Math.random() < 0.85 ? 1 : 2,
      tw: Math.random() * Math.PI * 2,
    }));
  }, []);

  /* ------------------------------------------------------------------ */
  /* Drawing                                                            */
  /* ------------------------------------------------------------------ */
  const draw = useCallback((time: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const { w, h } = sizeRef.current;

    // Deep space background
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#04050c');
    bg.addColorStop(0.6, '#080c1c');
    bg.addColorStop(1, '#0b0716');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Stars
    for (const star of starsRef.current) {
      const alpha = 0.35 + 0.45 * Math.abs(Math.sin(time / 900 + star.tw));
      ctx.fillStyle = `rgba(245, 247, 255, ${alpha.toFixed(2)})`;
      ctx.fillRect(star.x, star.y, star.s, star.s);
      star.y += 0.05;
      if (star.y > h) star.y = 0;
    }

    // Rocks
    for (const rock of rocksRef.current) {
      const style = KIND_STYLE[rock.kind];
      ctx.save();
      ctx.translate(rock.x, rock.y);
      ctx.rotate(rock.rot);
      ctx.beginPath();
      rock.shape.forEach((mul, i) => {
        const ang = (i / rock.shape.length) * Math.PI * 2;
        const px = Math.cos(ang) * rock.r * mul;
        const py = Math.sin(ang) * rock.r * mul;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      if (style.glow) {
        ctx.shadowColor = style.glow;
        ctx.shadowBlur = 16;
      }
      ctx.fillStyle = style.fill;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = style.edge;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Damage cracks
      const dmg = 1 - rock.hp / rock.maxHp;
      if (dmg > 0) {
        ctx.strokeStyle = `rgba(4, 5, 12, ${0.55 + dmg * 0.3})`;
        ctx.lineWidth = 1.4;
        const cracks = Math.ceil(dmg * 4);
        for (let c = 0; c < cracks; c += 1) {
          const a = (c / cracks) * Math.PI * 2 + rock.rot;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * rock.r * 0.2, Math.sin(a) * rock.r * 0.2);
          ctx.lineTo(Math.cos(a + 0.4) * rock.r * 0.95, Math.sin(a + 0.4) * rock.r * 0.95);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // Mining beams
    for (const beam of beamsRef.current) {
      const a = Math.max(0, beam.life / 0.14);
      ctx.strokeStyle = `rgba(255, 39, 64, ${a.toFixed(2)})`;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(beam.x1, beam.y1);
      ctx.lineTo(beam.x2, beam.y2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255, 240, 240, ${(a * 0.9).toFixed(2)})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    // Particles
    for (const p of particlesRef.current) {
      const a = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.globalAlpha = 1;
    }

    // Mining rig
    const ship = shipRef.current;
    const shipY = h - 42;
    const flicker = 6 + Math.sin(time / 60) * 3;
    ctx.save();
    ctx.translate(ship.x, shipY);
    // Engine flame
    const flame = ctx.createLinearGradient(0, 8, 0, 22 + flicker);
    flame.addColorStop(0, 'rgba(255, 60, 172, 0.9)');
    flame.addColorStop(1, 'rgba(0, 245, 255, 0)');
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.moveTo(-6, 8);
    ctx.lineTo(6, 8);
    ctx.lineTo(0, 20 + flicker);
    ctx.closePath();
    ctx.fill();
    // Hull
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(14, 12);
    ctx.lineTo(4, 7);
    ctx.lineTo(0, 12);
    ctx.lineTo(-4, 7);
    ctx.lineTo(-14, 12);
    ctx.closePath();
    ctx.fillStyle = '#101830';
    ctx.fill();
    ctx.strokeStyle = '#ff2740';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(255, 39, 64, 0.8)';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;
    // Cockpit
    ctx.beginPath();
    ctx.arc(0, -5, 3.6, 0, Math.PI * 2);
    ctx.fillStyle = '#00f5ff';
    ctx.shadowColor = 'rgba(0, 245, 255, 0.9)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }, []);

  /* ------------------------------------------------------------------ */
  /* Simulation + main loop                                             */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    let last = performance.now();

    const step = (time: number) => {
      raf = requestAnimationFrame(step);
      const dt = Math.min(0.05, (time - last) / 1000);
      last = time;
      const { w, h } = sizeRef.current;
      const ship = shipRef.current;

      if (runningRef.current) {
        const p = progressRef.current;

        // Depth (difficulty) tick
        depthTickRef.current += dt;
        if (depthTickRef.current >= 2.5) {
          depthTickRef.current = 0;
          depthRef.current += 1;
          setDepth(depthRef.current);
        }

        // Periodic safety save
        saveTickRef.current += dt;
        if (saveTickRef.current >= 5) {
          saveTickRef.current = 0;
          saveProgress(p);
        }

        // Ship control — keyboard
        const kbSpeed = 170 + p.upgrades.engine * 60;
        let kbDir = 0;
        if (keysRef.current.has('ArrowLeft') || keysRef.current.has('a')) kbDir -= 1;
        if (keysRef.current.has('ArrowRight') || keysRef.current.has('d')) kbDir += 1;
        if (kbDir !== 0) {
          ship.targetX = ship.x;
          ship.x += kbDir * kbSpeed * dt;
        } else {
          // Pointer / touch follow
          const follow = Math.min(1, dt * (7 + p.upgrades.engine * 2));
          ship.x += (ship.targetX - ship.x) * follow;
        }
        ship.x = Math.min(Math.max(ship.x, 22), w - 22);

        // Spawn rocks
        spawnRef.current -= dt;
        if (spawnRef.current <= 0) {
          const interval = Math.max(
            0.4,
            1.5 - depthRef.current * 0.035
          );
          spawnRef.current = interval * (0.7 + Math.random() * 0.6);
          rocksRef.current.push(makeRock(w, depthRef.current));
        }

        // Auto-mining laser on the lowest rock
        fireRef.current -= dt;
        if (fireRef.current <= 0) {
          let target: Rock | null = null;
          for (const rock of rocksRef.current) {
            if (!target || rock.y > target.y) target = rock;
          }
          if (target) {
            fireRef.current = Math.max(0.16, 0.42 - (p.upgrades.laser - 1) * 0.03);
            const noseX = ship.x;
            const noseY = h - 42 - 18;
            beamsRef.current.push({
              x1: noseX,
              y1: noseY,
              x2: target.x,
              y2: target.y,
              life: 0.14,
            });
            target.hp -= 1 + p.upgrades.laser;
            for (let i = 0; i < 3; i += 1) {
              particlesRef.current.push({
                x: target.x + (Math.random() - 0.5) * target.r,
                y: target.y + (Math.random() - 0.5) * target.r,
                vx: (Math.random() - 0.5) * 90,
                vy: (Math.random() - 0.5) * 90,
                life: 0.35,
                maxLife: 0.35,
                color: KIND_STYLE[target.kind].edge,
                size: 2.5,
              });
            }
          } else {
            fireRef.current = 0.12;
          }
        }

        // Rock movement + break/escape handling
        const survivors: Rock[] = [];
        for (const rock of rocksRef.current) {
          rock.x += rock.vx * dt;
          rock.y += rock.vy * dt;
          rock.rot += rock.spin * dt;
          if (rock.x < rock.r) {
            rock.x = rock.r;
            rock.vx = Math.abs(rock.vx);
          } else if (rock.x > w - rock.r) {
            rock.x = w - rock.r;
            rock.vx = -Math.abs(rock.vx);
          }
          if (rock.hp <= 0) {
            const earned = Math.max(
              1,
              Math.floor(rock.ore * (1 + (p.upgrades.drill - 1) * 0.5))
            );
            const next: Progress = {
              ore: progressRef.current.ore + earned,
              mined: progressRef.current.mined + 1,
              upgrades: progressRef.current.upgrades,
            };
            applyProgress(next);
            saveProgress(next);
            const style = KIND_STYLE[rock.kind];
            const bits = rock.kind === 'crystal' ? 18 : 12;
            for (let i = 0; i < bits; i += 1) {
              particlesRef.current.push({
                x: rock.x,
                y: rock.y,
                vx: (Math.random() - 0.5) * 240,
                vy: (Math.random() - 0.5) * 240,
                life: 0.55 + Math.random() * 0.35,
                maxLife: 0.9,
                color: Math.random() < 0.5 ? style.edge : style.fill,
                size: 2 + Math.random() * 3,
              });
            }
          } else if (rock.y < h + rock.r + 30) {
            survivors.push(rock);
          }
        }
        rocksRef.current = survivors;

        // Particles / beams bookkeeping
        particlesRef.current = particlesRef.current
          .map((pt) => ({
            ...pt,
            x: pt.x + pt.vx * dt,
            y: pt.y + pt.vy * dt,
            vy: pt.vy + 140 * dt,
            life: pt.life - dt,
          }))
          .filter((pt) => pt.life > 0);
        beamsRef.current = beamsRef.current
          .map((bm) => ({ ...bm, life: bm.life - dt }))
          .filter((bm) => bm.life > 0);
      } else {
        // Idle: keep particles/beams settled so resume looks clean
        particlesRef.current = particlesRef.current
          .map((pt) => ({ ...pt, life: pt.life - dt }))
          .filter((pt) => pt.life > 0);
        beamsRef.current = [];
      }

      draw(time);
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      saveProgress(progressRef.current);
    };
  }, [applyProgress, draw, resize]);

  /* ------------------------------------------------------------------ */
  /* Input                                                              */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const isTypingTarget = (el: EventTarget | null): boolean => {
      const node = el as HTMLElement | null;
      return !!node && (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA');
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (['ArrowLeft', 'ArrowRight', ' ', 'a', 'd'].includes(e.key)) {
        if (!(e.key === ' ' && (e.target as HTMLElement)?.tagName === 'BUTTON')) {
          e.preventDefault();
        }
      }
      keysRef.current.add(e.key);
      if (e.key === ' ' && !startedRef.current) setRunningBoth(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };
    const onBlur = () => keysRef.current.clear();
    const onVisibility = () => {
      if (document.hidden) setRunningBoth(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [setRunningBoth]);

  const pointerToTarget = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const { w } = sizeRef.current;
    const x = ((clientX - rect.left) / Math.max(1, rect.width)) * w;
    shipRef.current.targetX = Math.min(Math.max(x, 22), w - 22);
  }, []);

  const handleStagePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointerToTarget(e.clientX);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    if (!runningRef.current) setRunningBoth(true);
  };

  const handleStagePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointerToTarget(e.clientX);
  };

  const handleStageTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    if (touch) pointerToTarget(touch.clientX);
  };

  /* ------------------------------------------------------------------ */
  /* Actions                                                            */
  /* ------------------------------------------------------------------ */
  const handleStartPause = () => setRunningBoth(!runningRef.current);

  const handleBuy = (key: UpgradeKey) => {
    const current = progressRef.current;
    const def = UPGRADE_DEFS.find((u) => u.key === key);
    if (!def) return;
    const level = current.upgrades[key];
    const cost = upgradeCost(def.base, level);
    if (current.ore < cost) return;
    const next: Progress = {
      ...current,
      ore: current.ore - cost,
      upgrades: { ...current.upgrades, [key]: level + 1 },
    };
    applyProgress(next);
    saveProgress(next);
  };

  const handleReset = () => {
    if (!window.confirm('Wipe your mining progress and start over?')) return;
    const next: Progress = {
      ore: 0,
      mined: 0,
      upgrades: { laser: 1, drill: 1, engine: 1 },
    };
    applyProgress(next);
    saveProgress(next);
    rocksRef.current = [];
    particlesRef.current = [];
    beamsRef.current = [];
    depthRef.current = 0;
    depthTickRef.current = 0;
    setDepth(0);
    setRunningBoth(false);
  };

  return (
    <section id="game" className="section-shell space-mine-section">
      <div className="container">
        <RevealOnScroll>
          <div className="section-header">
            <div className="section-eyebrow">
              <span className="section-eyebrow__dot" aria-hidden="true" />
              <span>ARCADE MINING RIG // 07</span>
            </div>
            <h2 className="section-title glitch-title" data-text="SPACE MINE">
              SPACE MINE
            </h2>
            <p className="section-subtitle">
              Grind rocks. Upgrade the rig. Dig deeper into the dark.
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delayMs={80}>
          <div className="smine-hud hud-panel">
            <span className="hud-corner-tl" aria-hidden="true" />
            <span className="hud-corner-br" aria-hidden="true" />

            <div className="smine-hud__stats">
              <div className="smine-stat">
                <span className="smine-stat__label">ORE</span>
                <span className="smine-stat__value">{progress.ore}</span>
              </div>
              <div className="smine-stat">
                <span className="smine-stat__label">ROCKS MINED</span>
                <span className="smine-stat__value">{progress.mined}</span>
              </div>
              <div className="smine-stat">
                <span className="smine-stat__label">DEPTH</span>
                <span className="smine-stat__value">{depth}</span>
              </div>
            </div>

            <div className="smine-hud__controls">
              <button
                type="button"
                className="cyber-btn cyber-btn--ghost smine-control-btn"
                onClick={handleStartPause}
              >
                {running ? (
                  <>
                    <Pause size={15} aria-hidden="true" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play size={15} aria-hidden="true" />
                    <span>{startedRef.current ? 'RESUME' : 'START'}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                className="cyber-btn cyber-btn--ghost smine-control-btn"
                onClick={handleReset}
              >
                <RotateCcw size={15} aria-hidden="true" />
                <span>RESET</span>
              </button>
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delayMs={140}>
          <div className="smine-stage" ref={stageRef}>
            <canvas
              ref={canvasRef}
              className="smine-canvas"
              aria-label="Space mining game area — steer with arrow keys or touch"
              onPointerDown={handleStagePointerDown}
              onPointerMove={handleStagePointerMove}
              onTouchMove={handleStageTouchMove}
            />
            {!running && (
              <div className="smine-overlay">
                <span className="smine-overlay__badge">
                  {startedRef.current ? 'RIG PAUSED' : 'RIG OFFLINE'}
                </span>
                <button
                  type="button"
                  onClick={handleStartPause}
                  className="cyber-btn cyber-btn--primary"
                >
                  <Play size={17} aria-hidden="true" />
                  <span>{startedRef.current ? 'RESUME MINING' : 'START MINING'}</span>
                </button>
                <span className="smine-overlay__hint">
                  ARROW KEYS / A-D TO STEER — TOUCH &amp; DRAG ON MOBILE — THE
                  LASER AUTO-MINES THE LOWEST ROCK
                </span>
              </div>
            )}
          </div>
        </RevealOnScroll>

        <RevealOnScroll delayMs={200}>
          <div className="smine-shop hud-panel">
            <span className="hud-corner-tl" aria-hidden="true" />
            <span className="hud-corner-br" aria-hidden="true" />
            <div className="smine-shop__title">
              <Zap size={15} aria-hidden="true" />
              <span>RIG UPGRADE BAY</span>
            </div>

            <div className="smine-shop__grid">
              {UPGRADE_DEFS.map((def) => {
                const level = progress.upgrades[def.key];
                const cost = upgradeCost(def.base, level);
                const affordable = progress.ore >= cost;
                const Icon =
                  def.key === 'laser' ? Zap : def.key === 'drill' ? Gem : Gauge;
                return (
                  <button
                    key={def.key}
                    type="button"
                    className={`smine-upg ${affordable ? 'is-affordable' : ''}`}
                    onClick={() => handleBuy(def.key)}
                    disabled={!affordable}
                    aria-label={`Upgrade ${def.label} to level ${level + 1} for ${cost} ore`}
                  >
                    <span className="smine-upg__head">
                      <Icon size={17} aria-hidden="true" />
                      <span className="smine-upg__label">{def.label}</span>
                      <span className="smine-upg__level">LV {level}</span>
                    </span>
                    <span className="smine-upg__desc">{def.desc}</span>
                    <span className="smine-upg__cost">
                      {affordable ? `${cost} ORE` : `NEED ${cost - progress.ore} MORE ORE`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};
