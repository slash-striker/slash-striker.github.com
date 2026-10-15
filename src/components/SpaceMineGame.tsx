import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Gauge,
  Gem,
  Pause,
  Play,
  Rocket,
  RotateCcw,
  Shield,
  Zap,
} from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';

/*
 * SPACE MINE — an arcade mining run:
 *  - Steer the rig. The laser auto-mines the lowest rock, or tap a rock to
 *    focus fire on it.
 *  - Volatile rocks explode and chain into their neighbours. Rocks that ram
 *    the rig or slip past it cost hull; when hull hits zero the rig is lost.
 *  - Kill streaks build a combo multiplier (up to x5) that boosts ore.
 *  - OVERDRIVE (E or the button) doubles fire rate and damage for a few
 *    seconds, then recharges.
 *  - Spend ore between runs. Hull plating raises max hull.
 *  Progress persists in localStorage. The canvas stays dark — it's space.
 */

type UpgradeKey = 'laser' | 'drill' | 'engine' | 'plating';
type RockKind = 'common' | 'iron' | 'crystal' | 'volatile';

interface Progress {
  ore: number;
  mined: number;
  best: number;
  upgrades: Record<UpgradeKey, number>;
}

interface Rock {
  id: number;
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
  kind: RockKind;
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
  wide: boolean;
}

interface Ring {
  x: number;
  y: number;
  maxR: number;
  life: number;
  maxLife: number;
  color: string;
}

interface Popup {
  x: number;
  y: number;
  text: string;
  life: number;
  maxLife: number;
  color: string;
}

interface Hud {
  hull: number;
  hullMax: number;
  combo: number;
  mult: number;
  abilityLabel: string;
  abilityPct: number;
  abilityReady: boolean;
}

interface Point {
  x: number;
  y: number;
}

const STORAGE_KEY = 'ss-spacemine';
const HULL_BASE = 100;
const HULL_PER_PLATING = 25;
const HULL_REGEN = 0.35; // hull per second while running
const OVERDRIVE_DURATION = 4;
const OVERDRIVE_COOLDOWN = 12;
const COMBO_WINDOW = 3; // seconds without a kill before the streak breaks
const COMBO_MAX_MULT = 5;
const BLAST_RADIUS = 80;
const BLAST_DAMAGE = 2;
const RIG_OFFSET = 42; // distance from the canvas bottom to the rig centre
const ESCAPE_DAMAGE: Record<RockKind, number> = {
  common: 2,
  iron: 4,
  crystal: 2,
  volatile: 10,
};
const RAM_DAMAGE: Record<RockKind, number> = {
  common: 6,
  iron: 10,
  crystal: 6,
  volatile: 15,
};

const INITIAL_UPGRADES: Record<UpgradeKey, number> = {
  laser: 1,
  drill: 1,
  engine: 1,
  plating: 1,
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
  {
    key: 'plating',
    label: 'HULL PLATING',
    desc: `+${HULL_PER_PLATING} max hull per level`,
    base: 30,
  },
];

const upgradeCost = (base: number, level: number): number =>
  Math.floor(base * Math.pow(1.55, level - 1));

const hullMaxFor = (p: Progress): number =>
  HULL_BASE + (p.upgrades.plating - 1) * HULL_PER_PLATING;

const comboMultiplier = (count: number): number =>
  Math.min(COMBO_MAX_MULT, 1 + count * 0.05);

const freshProgress = (): Progress => ({
  ore: 0,
  mined: 0,
  best: 0,
  upgrades: { ...INITIAL_UPGRADES },
});

const loadProgress = (): Progress => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshProgress();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    const num = (v: unknown): number =>
      typeof v === 'number' && Number.isFinite(v) ? Math.max(0, v) : 0;
    return {
      ore: num(parsed.ore),
      mined: num(parsed.mined),
      best: num(parsed.best),
      upgrades: { ...INITIAL_UPGRADES, ...(parsed.upgrades || {}) },
    };
  } catch {
    return freshProgress();
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
  RockKind,
  { fill: string; edge: string; glow: string | null }
> = {
  common: { fill: '#5d6688', edge: '#8f9ac2', glow: null },
  iron: { fill: '#7a5a48', edge: '#c08a5e', glow: null },
  crystal: { fill: '#8a1f52', edge: '#ff3cac', glow: 'rgba(255, 60, 172, 0.65)' },
  volatile: { fill: '#6b3a10', edge: '#ffb020', glow: 'rgba(255, 176, 32, 0.8)' },
};

let rockSeq = 0;

const pickKind = (depth: number): RockKind => {
  // Volatile rocks only appear once the run is a few layers deep.
  const volatileChance = depth >= 3 ? Math.min(0.22, 0.07 + depth * 0.005) : 0;
  const crystalChance = Math.min(0.2, 0.1 + depth * 0.002);
  const ironChance = 0.25;
  const roll = Math.random();
  if (roll < volatileChance) return 'volatile';
  if (roll < volatileChance + crystalChance) return 'crystal';
  if (roll < volatileChance + crystalChance + ironChance) return 'iron';
  return 'common';
};

const makeRock = (width: number, depth: number): Rock => {
  const kind = pickKind(depth);
  const r =
    kind === 'iron'
      ? 20 + Math.random() * 8
      : kind === 'crystal'
        ? 10 + Math.random() * 6
        : kind === 'volatile'
          ? 13 + Math.random() * 4
          : 12 + Math.random() * 7;
  const hpBase = kind === 'iron' ? 5 : kind === 'crystal' ? 3 : 2;
  const hpDepthDivisor = kind === 'iron' ? 7 : kind === 'volatile' ? 12 : 10;
  const hp = hpBase + Math.floor(depth / hpDepthDivisor);
  const ore =
    kind === 'crystal'
      ? 9
      : kind === 'iron'
        ? 5
        : kind === 'volatile'
          ? 1
          : 2 + (Math.random() < 0.4 ? 1 : 0);
  const shape = Array.from({ length: 9 }, () => 0.72 + Math.random() * 0.5);
  return {
    id: ++rockSeq,
    x: r + Math.random() * Math.max(1, width - r * 2),
    y: -r - 10,
    vx: (Math.random() - 0.5) * (kind === 'crystal' ? 70 : 36),
    vy:
      Math.min(120, 26 + depth * 1.6 + Math.random() * 16) *
      (kind === 'crystal' ? 1.25 : 1),
    r,
    hp,
    maxHp: hp,
    ore,
    rot: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 1.4,
    kind,
    shape,
  };
};

export const SpaceMineGame: React.FC = () => {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [running, setRunning] = useState(false);
  const [wrecked, setWrecked] = useState(false);
  const [depth, setDepth] = useState(0);
  const [hud, setHud] = useState<Hud>({
    hull: HULL_BASE,
    hullMax: HULL_BASE,
    combo: 0,
    mult: 1,
    abilityLabel: 'READY',
    abilityPct: 100,
    abilityReady: true,
  });

  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const progressRef = useRef<Progress>(progress);
  const runningRef = useRef(false);
  const wreckedRef = useRef(false);
  const startedRef = useRef(false);

  const rocksRef = useRef<Rock[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const beamsRef = useRef<Beam[]>([]);
  const ringsRef = useRef<Ring[]>([]);
  const popupsRef = useRef<Popup[]>([]);
  const starsRef = useRef<{ x: number; y: number; s: number; tw: number }[]>([]);
  const shipRef = useRef({ x: 0, targetX: 0 });
  const keysRef = useRef<Set<string>>(new Set());
  const sizeRef = useRef({ w: 720, h: 440 });
  const spawnRef = useRef(1.2);
  const fireRef = useRef(0);
  const depthRef = useRef(0);
  const depthTickRef = useRef(0);
  const saveTickRef = useRef(0);
  const hudTickRef = useRef(0);
  const hullRef = useRef(HULL_BASE);
  const overdriveRef = useRef({ active: 0, cooldown: 0 });
  const comboRef = useRef({ count: 0, timer: 0 });
  const focusRef = useRef<number | null>(null);
  const flashRef = useRef(0);

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

  const triggerOverdrive = useCallback(() => {
    const od = overdriveRef.current;
    if (!runningRef.current || od.cooldown > 0) return;
    od.active = OVERDRIVE_DURATION;
    od.cooldown = OVERDRIVE_COOLDOWN;
    flashRef.current = Math.max(flashRef.current, 0.2);
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
        ctx.shadowBlur =
          rock.kind === 'volatile'
            ? 10 + 8 * Math.abs(Math.sin(time / 200))
            : 16;
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
          ctx.lineTo(
            Math.cos(a + 0.4) * rock.r * 0.95,
            Math.sin(a + 0.4) * rock.r * 0.95
          );
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // Focus reticle on the rock being targeted by hand
    const focusId = focusRef.current;
    const focus =
      focusId !== null ? rocksRef.current.find((r) => r.id === focusId) : undefined;
    if (focus) {
      ctx.save();
      ctx.translate(focus.x, focus.y);
      ctx.rotate(time / 900);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#00f5ff';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, focus.r + 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Mining beams
    for (const beam of beamsRef.current) {
      const a = Math.max(0, beam.life / 0.14);
      ctx.strokeStyle = `rgba(255, 39, 64, ${a.toFixed(2)})`;
      ctx.lineWidth = beam.wide ? 6 : 3.5;
      ctx.beginPath();
      ctx.moveTo(beam.x1, beam.y1);
      ctx.lineTo(beam.x2, beam.y2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255, 240, 240, ${(a * 0.9).toFixed(2)})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    // Blast shockwaves
    for (const rg of ringsRef.current) {
      const t = 1 - rg.life / rg.maxLife;
      ctx.globalAlpha = Math.max(0, rg.life / rg.maxLife);
      ctx.strokeStyle = rg.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(rg.x, rg.y, rg.maxR * t, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Particles
    for (const p of particlesRef.current) {
      const a = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.globalAlpha = 1;
    }

    // Floating ore popups
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    for (const pp of popupsRef.current) {
      ctx.globalAlpha = Math.max(0, pp.life / pp.maxLife);
      ctx.fillStyle = pp.color;
      ctx.fillText(pp.text, pp.x, pp.y);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';

    // Mining rig
    const ship = shipRef.current;
    const overdriveOn = overdriveRef.current.active > 0;
    const shipY = h - RIG_OFFSET;
    const flicker = 6 + Math.sin(time / 60) * 3;
    ctx.save();
    ctx.translate(ship.x, shipY);
    if (overdriveOn) {
      ctx.beginPath();
      ctx.arc(0, 0, 26 + Math.sin(time / 80) * 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.55)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
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
    ctx.beginPath();
    ctx.arc(0, -5, 3.6, 0, Math.PI * 2);
    ctx.fillStyle = '#00f5ff';
    ctx.shadowColor = 'rgba(0, 245, 255, 0.9)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Hull hit flash
    if (flashRef.current > 0) {
      ctx.fillStyle = `rgba(255, 39, 64, ${(flashRef.current * 0.35).toFixed(3)})`;
      ctx.fillRect(0, 0, w, h);
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* Simulation + main loop                                             */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    hullRef.current = hullMaxFor(progressRef.current);
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    let last = performance.now();

    const pickTarget = (): Rock | null => {
      const rocks = rocksRef.current;
      if (focusRef.current !== null) {
        const focused = rocks.find((r) => r.id === focusRef.current);
        if (focused) return focused;
        focusRef.current = null;
      }
      let target: Rock | null = null;
      for (const rock of rocks) {
        if (!target || rock.y > target.y) target = rock;
      }
      return target;
    };

    // Banks ore for a destroyed rock and advances the kill streak.
    const award = (rock: Rock) => {
      const combo = comboRef.current;
      combo.count += 1;
      combo.timer = COMBO_WINDOW;
      const mult = comboMultiplier(combo.count);
      const cur = progressRef.current;
      const earned = Math.max(
        1,
        Math.floor(rock.ore * (1 + (cur.upgrades.drill - 1) * 0.5) * mult)
      );
      const next: Progress = {
        ...cur,
        ore: cur.ore + earned,
        mined: cur.mined + 1,
      };
      applyProgress(next);
      saveProgress(next);

      const style = KIND_STYLE[rock.kind];
      popupsRef.current.push({
        x: rock.x,
        y: rock.y,
        text: `+${earned}`,
        life: 0.9,
        maxLife: 0.9,
        color: style.edge,
      });
      const bits = rock.kind === 'crystal' || rock.kind === 'volatile' ? 18 : 12;
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
    };

    const buildHud = (): Hud => {
      const od = overdriveRef.current;
      const count = comboRef.current.count;
      let abilityLabel: string;
      let abilityPct: number;
      let abilityReady = false;
      if (od.active > 0) {
        abilityLabel = `ACTIVE ${od.active.toFixed(1)}S`;
        abilityPct = (od.active / OVERDRIVE_DURATION) * 100;
      } else if (od.cooldown > 0) {
        abilityLabel = `RECHARGE ${od.cooldown.toFixed(1)}S`;
        abilityPct = (1 - od.cooldown / OVERDRIVE_COOLDOWN) * 100;
      } else {
        abilityLabel = 'READY';
        abilityPct = 100;
        abilityReady = true;
      }
      return {
        hull: Math.max(0, hullRef.current),
        hullMax: hullMaxFor(progressRef.current),
        combo: count,
        mult: comboMultiplier(count),
        abilityLabel,
        abilityPct,
        abilityReady,
      };
    };

    const wreck = () => {
      hullRef.current = 0;
      wreckedRef.current = true;
      runningRef.current = false;
      setRunning(false);
      setWrecked(true);
      const cur = progressRef.current;
      const best = Math.max(cur.best, depthRef.current);
      const next: Progress = { ...cur, best };
      applyProgress(next);
      saveProgress(next);
    };

    const step = (time: number) => {
      raf = window.requestAnimationFrame(step);
      const dt = Math.min(0.05, (time - last) / 1000);
      last = time;
      const { w, h } = sizeRef.current;
      const ship = shipRef.current;
      const rigY = h - RIG_OFFSET;

      // Cosmetics always advance so pauses look clean.
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
      ringsRef.current = ringsRef.current
        .map((rg) => ({ ...rg, life: rg.life - dt }))
        .filter((rg) => rg.life > 0);
      popupsRef.current = popupsRef.current
        .map((pp) => ({ ...pp, y: pp.y - 28 * dt, life: pp.life - dt }))
        .filter((pp) => pp.life > 0);
      flashRef.current = Math.max(0, flashRef.current - dt * 2.5);

      if (runningRef.current) {
        const p = progressRef.current;
        const od = overdriveRef.current;
        const combo = comboRef.current;

        // Depth (difficulty) tick
        depthTickRef.current += dt;
        if (depthTickRef.current >= 2.5) {
          depthTickRef.current = 0;
          depthRef.current += 1;
          setDepth(depthRef.current);
          if (depthRef.current > progressRef.current.best) {
            applyProgress({ ...progressRef.current, best: depthRef.current });
          }
        }

        // Periodic safety save
        saveTickRef.current += dt;
        if (saveTickRef.current >= 5) {
          saveTickRef.current = 0;
          saveProgress(progressRef.current);
        }

        // Ship control — keyboard
        const kbSpeed = 170 + p.upgrades.engine * 60;
        let kbDir = 0;
        if (keysRef.current.has('ArrowLeft') || keysRef.current.has('a')) kbDir -= 1;
        if (keysRef.current.has('ArrowRight') || keysRef.current.has('d')) kbDir += 1;
        if (kbDir !== 0) {
          shipRef.current.targetX = ship.x;
          ship.x += kbDir * kbSpeed * dt;
        } else {
          // Pointer / touch follow
          const follow = Math.min(1, dt * (7 + p.upgrades.engine * 2));
          ship.x += (ship.targetX - ship.x) * follow;
        }
        ship.x = Math.min(Math.max(ship.x, 22), w - 22);

        // Timers
        od.active = Math.max(0, od.active - dt);
        od.cooldown = Math.max(0, od.cooldown - dt);
        combo.timer = Math.max(0, combo.timer - dt);
        if (combo.timer === 0) combo.count = 0;
        const overdriveOn = od.active > 0;
        hullRef.current = Math.min(
          hullMaxFor(p),
          hullRef.current + HULL_REGEN * dt
        );

        // Spawn rocks
        spawnRef.current -= dt;
        if (spawnRef.current <= 0) {
          const interval = Math.max(0.4, 1.5 - depthRef.current * 0.035);
          spawnRef.current = interval * (0.7 + Math.random() * 0.6);
          rocksRef.current.push(makeRock(w, depthRef.current));
        }

        // Laser: focus target if one is set, otherwise the lowest rock
        fireRef.current -= dt;
        if (fireRef.current <= 0) {
          const target = pickTarget();
          if (target) {
            const base = Math.max(0.16, 0.42 - (p.upgrades.laser - 1) * 0.03);
            fireRef.current = base / (overdriveOn ? 2.2 : 1);
            beamsRef.current.push({
              x1: ship.x,
              y1: rigY - 18,
              x2: target.x,
              y2: target.y,
              life: 0.14,
              wide: overdriveOn,
            });
            target.hp -= (1 + p.upgrades.laser) * (overdriveOn ? 2 : 1);
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

        // Movement, rig collisions, escapes
        const blasts: Point[] = [];
        const queue: Rock[] = []; // laser kills, awarded below
        let pool: Rock[] = [];
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

          // Ram: the rock hits the rig
          if (
            rock.y + rock.r >= rigY - 8 &&
            rock.y < rigY + 20 &&
            Math.abs(rock.x - ship.x) < rock.r + 14
          ) {
            hullRef.current -= RAM_DAMAGE[rock.kind];
            combo.count = 0;
            flashRef.current = 0.35;
            for (let i = 0; i < 10; i += 1) {
              particlesRef.current.push({
                x: rock.x,
                y: rigY,
                vx: (Math.random() - 0.5) * 200,
                vy: -Math.random() * 180,
                life: 0.5,
                maxLife: 0.5,
                color: '#ff2740',
                size: 2.5,
              });
            }
            if (rock.kind === 'volatile') blasts.push({ x: rock.x, y: rock.y });
            continue;
          }

          // Escape: the rock got past the rig
          if (rock.y - rock.r > h + 10) {
            hullRef.current -= ESCAPE_DAMAGE[rock.kind];
            combo.count = 0;
            flashRef.current = Math.max(flashRef.current, 0.15);
            continue;
          }

          if (rock.hp <= 0) {
            queue.push(rock);
          } else {
            pool.push(rock);
          }
        }

        // Resolve kills and chain explosions until nothing else is pending
        let cursor = 0;
        let blastCursor = 0;
        while (cursor < queue.length || blastCursor < blasts.length) {
          while (cursor < queue.length) {
            const rock = queue[cursor];
            cursor += 1;
            award(rock);
            if (rock.kind === 'volatile') blasts.push({ x: rock.x, y: rock.y });
          }
          while (blastCursor < blasts.length) {
            const blast = blasts[blastCursor];
            blastCursor += 1;
            ringsRef.current.push({
              x: blast.x,
              y: blast.y,
              maxR: BLAST_RADIUS,
              life: 0.45,
              maxLife: 0.45,
              color: '#ffb020',
            });
            pool = pool.filter((other) => {
              if (Math.hypot(other.x - blast.x, other.y - blast.y) >= BLAST_RADIUS) {
                return true;
              }
              other.hp -= BLAST_DAMAGE;
              if (other.hp <= 0) {
                queue.push(other);
                return false;
              }
              return true;
            });
          }
        }
        rocksRef.current = pool;

        if (hullRef.current <= 0) wreck();
      } else {
        beamsRef.current = [];
      }

      // HUD refreshes at 10 Hz to keep React renders light
      hudTickRef.current += dt;
      if (hudTickRef.current >= 0.1) {
        hudTickRef.current = 0;
        setHud(buildHud());
      }

      draw(time);
    };

    raf = window.requestAnimationFrame(step);
    return () => {
      window.cancelAnimationFrame(raf);
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
      if (e.key.toLowerCase() === 'e' && !e.repeat) triggerOverdrive();
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
  }, [setRunningBoth, triggerOverdrive]);

  const pointerToTarget = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const { w } = sizeRef.current;
    const x = ((clientX - rect.left) / Math.max(1, rect.width)) * w;
    shipRef.current.targetX = Math.min(Math.max(x, 22), w - 22);
  }, []);

  const handleStagePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Tapping a rock focuses fire on it; tapping empty space clears focus.
      const rect = canvas.getBoundingClientRect();
      const { w, h } = sizeRef.current;
      const px = ((e.clientX - rect.left) / Math.max(1, rect.width)) * w;
      const py = ((e.clientY - rect.top) / Math.max(1, rect.height)) * h;
      let hit: Rock | null = null;
      let bestDist = Infinity;
      for (const rock of rocksRef.current) {
        const d = Math.hypot(rock.x - px, rock.y - py);
        if (d < rock.r + 12 && d < bestDist) {
          hit = rock;
          bestDist = d;
        }
      }
      focusRef.current = hit ? hit.id : null;
    }
    pointerToTarget(e.clientX);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    if (!runningRef.current && !wreckedRef.current) setRunningBoth(true);
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
  const handleStartPause = () => {
    if (wreckedRef.current) return;
    setRunningBoth(!runningRef.current);
  };

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
    if (key === 'plating') {
      // New plating also patches the hull immediately.
      hullRef.current = Math.min(
        hullMaxFor(next),
        hullRef.current + HULL_PER_PLATING
      );
    }
  };

  // Clears the field and starts a fresh rig. Ore and upgrades are kept.
  const resetRun = () => {
    wreckedRef.current = false;
    hullRef.current = hullMaxFor(progressRef.current);
    rocksRef.current = [];
    particlesRef.current = [];
    beamsRef.current = [];
    ringsRef.current = [];
    popupsRef.current = [];
    overdriveRef.current = { active: 0, cooldown: 0 };
    comboRef.current = { count: 0, timer: 0 };
    focusRef.current = null;
    depthRef.current = 0;
    depthTickRef.current = 0;
    setDepth(0);
    setWrecked(false);
  };

  const handleRebuild = () => {
    resetRun();
    setRunningBoth(true);
  };

  const handleReset = () => {
    if (!window.confirm('Wipe all mining progress, including your best depth?')) return;
    const next = freshProgress();
    applyProgress(next);
    saveProgress(next);
    resetRun();
    startedRef.current = false;
    setRunningBoth(false);
  };

  const hullPct = Math.max(0, Math.min(100, (hud.hull / hud.hullMax) * 100));

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
              Grind rocks. Chain explosions. Upgrade the rig. Dig deeper into the dark.
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delayMs={80}>
          <div className="smine-hud hud-panel">
            <span className="hud-corner-tl" aria-hidden="true" />
            <span className="hud-corner-br" aria-hidden="true" />

            <div className="smine-hud__main">
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
                <div className="smine-stat">
                  <span className="smine-stat__label">BEST DEPTH</span>
                  <span className="smine-stat__value">{progress.best}</span>
                </div>
                <div className="smine-stat">
                  <span className="smine-stat__label">COMBO</span>
                  <span className="smine-stat__value">x{hud.mult.toFixed(1)}</span>
                </div>
              </div>

              <div className="smine-hud__meters">
                <div className="smine-meter">
                  <span className="smine-meter__label">
                    HULL {Math.ceil(hud.hull)} / {hud.hullMax}
                  </span>
                  <div className="smine-meter__track">
                    <div
                      className={`smine-meter__fill ${hullPct < 35 ? 'is-critical' : ''}`}
                      style={{ width: `${hullPct.toFixed(1)}%` }}
                    />
                  </div>
                </div>
                <div className="smine-meter">
                  <span className="smine-meter__label">
                    OVERDRIVE // {hud.abilityLabel}
                  </span>
                  <div className="smine-meter__track">
                    <div
                      className={`smine-meter__fill is-ability ${hud.abilityReady ? 'is-ready' : ''}`}
                      style={{ width: `${hud.abilityPct.toFixed(1)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="smine-hud__controls">
              <button
                type="button"
                className="cyber-btn cyber-btn--ghost smine-control-btn"
                onClick={handleStartPause}
                disabled={wrecked}
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
                className={`cyber-btn cyber-btn--ghost smine-control-btn ${hud.abilityReady ? 'is-ready' : ''}`}
                onClick={triggerOverdrive}
                disabled={!running || !hud.abilityReady}
              >
                <Rocket size={15} aria-hidden="true" />
                <span>OVERDRIVE [E]</span>
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
              aria-label="Space mining game area — steer with arrow keys or drag, tap a rock to focus fire, press E for overdrive"
              onPointerDown={handleStagePointerDown}
              onPointerMove={handleStagePointerMove}
              onTouchMove={handleStageTouchMove}
            />
            {!running && (
              <div className="smine-overlay">
                <span className="smine-overlay__badge">
                  {wrecked
                    ? 'RIG DESTROYED'
                    : startedRef.current
                      ? 'RIG PAUSED'
                      : 'RIG OFFLINE'}
                </span>
                {wrecked ? (
                  <>
                    <span className="smine-overlay__summary">
                      Run ended at depth {depth}. Your ore is banked.
                    </span>
                    <button
                      type="button"
                      onClick={handleRebuild}
                      className="cyber-btn cyber-btn--primary"
                    >
                      <RotateCcw size={17} aria-hidden="true" />
                      <span>REBUILD RIG</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartPause}
                    className="cyber-btn cyber-btn--primary"
                  >
                    <Play size={17} aria-hidden="true" />
                    <span>{startedRef.current ? 'RESUME MINING' : 'START MINING'}</span>
                  </button>
                )}
                <span className="smine-overlay__hint">
                  ARROWS / A-D STEER — DRAG ON MOBILE — TAP A ROCK TO FOCUS FIRE —
                  E FOR OVERDRIVE — VOLATILE ROCKS CHAIN-EXPLODE
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
                  def.key === 'laser'
                    ? Zap
                    : def.key === 'drill'
                      ? Gem
                      : def.key === 'engine'
                        ? Gauge
                        : Shield;
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
