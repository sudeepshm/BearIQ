'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function NeuralCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 600;
    let H = 610;
    let time = 0;
    let last = 0;
    let pointer = 0;
    let sceneDirty = true;
    let paused = false;
    let animationFrameId: number;

    const resize = () => {
      if (!container) return;
      const r = container.getBoundingClientRect();
      W = r.width || 600;
      H = r.height || 610;
      const d = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * d;
      canvas.height = H * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      sceneDirty = true;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    function project(x: number, y: number, z: number, cx: number, cy: number, scale: number, yaw = 0) {
      const xx = x * Math.cos(yaw) + z * Math.sin(yaw);
      const zz = z * Math.cos(yaw) - x * Math.sin(yaw);
      const p = 900 / (900 + zz * scale);
      return [cx + xx * scale * p, cy - y * scale * p, zz];
    }

    function ellipsoid(pos: number[], r: number[], cx: number, cy: number, s: number, yaw: number, robot = false) {
      if (!ctx) return;
      const glow = ctx.createLinearGradient(0, cy - (pos[1] + r[1]) * s, 0, cy - (pos[1] - r[1]) * s);
      glow.addColorStop(0, robot ? '#77f5ffd0' : '#89e8ffd0');
      glow.addColorStop(0.48, robot ? '#24c9ff9c' : '#279fffad');
      glow.addColorStop(1, robot ? '#3d8fff85' : '#677bff8c');
      ctx.strokeStyle = glow;
      ctx.lineWidth = 0.8;

      for (let a = 0; a < 11; a++) {
        const theta = (Math.PI * a) / 10;
        ctx.beginPath();
        for (let b = 0; b <= 40; b++) {
          const phi = (2 * Math.PI * b) / 40;
          const p = project(
            pos[0] + r[0] * Math.sin(theta) * Math.cos(phi),
            pos[1] + r[1] * Math.cos(theta),
            pos[2] + r[2] * Math.sin(theta) * Math.sin(phi),
            cx,
            cy,
            s,
            yaw
          );
          if (b === 0) ctx.moveTo(p[0], p[1]);
          else ctx.lineTo(p[0], p[1]);
        }
        ctx.stroke();
      }

      ctx.strokeStyle = robot ? 'rgba(85,235,255,.36)' : 'rgba(104,172,255,.37)';
      for (let b = 0; b < 12; b++) {
        ctx.beginPath();
        for (let a = 0; a <= 24; a++) {
          const th = (Math.PI * a) / 24;
          const ph = (2 * Math.PI * b) / 12;
          const p = project(
            pos[0] + r[0] * Math.sin(th) * Math.cos(ph),
            pos[1] + r[1] * Math.cos(th),
            pos[2] + r[2] * Math.sin(th) * Math.sin(ph),
            cx,
            cy,
            s,
            yaw
          );
          a ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
        }
        ctx.stroke();
      }

      const g = ctx.createRadialGradient(cx + pos[0] * s, cy - pos[1] * s, 0, cx + pos[0] * s, cy - pos[1] * s, Math.max(...r) * s);
      g.addColorStop(0, robot ? '#29cfff22' : '#298dff25');
      g.addColorStop(1, '#71e3ff08');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx + pos[0] * s, cy - pos[1] * s, r[0] * s, r[1] * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    function body(cx: number, cy: number, s: number, yaw: number, robot: boolean) {
      if (!ctx) return;
      const parts: [number[], number[]][] = [
        [[0, 2.76, 0], [0.30, 0.39, 0.28]],
        [[0, 2.28, 0], [0.13, 0.16, 0.12]],
        [[0, 1.77, 0], [0.53, 0.53, 0.25]],
        [[0, 1.2, 0], [0.34, 0.29, 0.21]],
        [[0, 0.85, 0], [0.38, 0.23, 0.23]],
      ];
      for (const side of [-1, 1]) {
        parts.push(
          [[side * 0.61, 1.78, 0], [0.16, 0.39, 0.17]],
          [[side * 0.77, 1.19, 0.02], [0.115, 0.30, 0.12]],
          [[side * 0.84, 0.79, 0.03], [0.10, 0.14, 0.085]],
          [[side * 0.23, 0.31, 0], [0.19, 0.43, 0.19]],
          [[side * 0.23, -0.4, 0.03], [0.13, 0.35, 0.13]],
          [[side * 0.23, -0.79, 0.11], [0.14, 0.09, 0.23]]
        );
      }
      for (const p of parts) ellipsoid(p[0], p[1], cx, cy, s, yaw, robot);

      ctx.strokeStyle = '#b0f6ffad';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      const p1 = project(0, 2.18, -0.03, cx, cy, s, yaw);
      ctx.moveTo(p1[0], p1[1]);
      const p2 = project(0, 0.88, -0.03, cx, cy, s, yaw);
      ctx.lineTo(p2[0], p2[1]);
      ctx.stroke();

      if (robot) {
        ctx.fillStyle = '#c9faff';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#42dfff';
        for (const side of [-1, 1]) {
          const pt = project(side * 0.12, 2.8, -0.26, cx, cy, s, yaw);
          ctx.beginPath();
          ctx.ellipse(pt[0], pt[1], 2.3, 1.2, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        const ptBox = project(0, 1.8, -0.25, cx, cy, s, yaw);
        ctx.strokeStyle = '#72eaffb0';
        ctx.strokeRect(ptBox[0] - 5, ptBox[1] - 7, 10, 14);
      }
    }

    function brain(cx: number, cy: number, s: number, yaw: number) {
      if (!ctx) return;
      ctx.shadowColor = '#ffd449';
      ctx.shadowBlur = 20;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        for (let i = 0; i <= 160; i++) {
          const a = (i / 160) * Math.PI * 2;
          const p = project(
            side * 0.105 + 0.105 * Math.cos(a) * (1 + 0.13 * Math.sin(a * 13 + side)),
            2.85 + 0.19 * Math.sin(a),
            -0.015 + 0.065 * Math.sin(a * 9),
            cx,
            cy,
            s,
            yaw
          );
          i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
        }
        ctx.strokeStyle = '#fff2ab';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        for (let j = 0; j < 4; j++) {
          ctx.beginPath();
          for (let i = 0; i < 35; i++) {
            const a = i / 34;
            const p = project(
              side * (0.018 + a * 0.18),
              2.73 + j * 0.07 + 0.025 * Math.sin(a * 14 + j),
              -0.19,
              cx,
              cy,
              s,
              yaw
            );
            i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
          }
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
      ctx.shadowBlur = 0;
    }

    function curve(a: number[], b: number[], c: number[], d: number[], t: number): [number, number] {
      const u = 1 - t;
      return [
        u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
        u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
      ];
    }

    function lightning(x: number, y: number, size: number, opacity: number) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(size, size);
      ctx.globalAlpha = opacity;
      ctx.shadowColor = '#55dcff';
      ctx.shadowBlur = 13;
      const ice = ctx.createLinearGradient(-5, -10, 5, 10);
      ice.addColorStop(0, '#f1ffff');
      ice.addColorStop(0.5, '#a7f2ff');
      ice.addColorStop(1, '#45beff');
      ctx.fillStyle = ice;
      ctx.strokeStyle = '#deffff';
      ctx.lineWidth = 0.65;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(1, -10);
      ctx.lineTo(-7, 2);
      ctx.lineTo(-1, 2);
      ctx.lineTo(-3, 11);
      ctx.lineTo(7, -3);
      ctx.lineTo(1, -3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    function flowRoute(a: number[], b: number[], c: number[], d: number[]) {
      let length = 0;
      const pts = [{ p: a, length: 0 }];
      for (let k = 1; k <= 48; k++) {
        const p = curve(a, b, c, d, k / 48);
        const prev = pts[k - 1].p;
        length += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
        pts.push({ p, length });
      }
      return { pts, length };
    }

    function flowPoint(route: { pts: { p: number[]; length: number }[]; length: number }, phase: number) {
      const target = phase * route.length;
      for (let k = 1; k < route.pts.length; k++) {
        const end = route.pts[k];
        const start = route.pts[k - 1];
        if (end.length >= target) {
          const u = (target - start.length) / (end.length - start.length || 1);
          return [start.p[0] + (end.p[0] - start.p[0]) * u, start.p[1] + (end.p[1] - start.p[1]) * u];
        }
      }
      return route.pts[route.pts.length - 1].p;
    }

    function aura(x: number, y: number, r: number, color: string) {
      if (!ctx) return;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(1, '#0a162000');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      const cx = W * 0.51;
      const cy = H * 0.47;
      const s = H * 0.095;
      const yaw = Math.sin(time * 0.35) * 0.16 + pointer * 0.12;

      const source = project(0, 2.85, 0, cx, cy, s, yaw);
      const robotY = H * 0.825;
      const rs = H * 0.050;
      const robots = [W * 0.19, W * 0.51, W * 0.83];
      const routes: { pts: { p: number[]; length: number }[]; length: number }[] = [];

      aura(cx, cy - s * 1.55, s * 2.25, '#1687ef25');
      aura(source[0], source[1], s * 0.65, '#ffe47621');

      for (let i = 0; i < 3; i++) {
        const x = robots[i];
        const y = robotY;
        aura(x, y - rs * 1.4, rs * 2.3, '#12d9ff19');
        ctx.save();
        ctx.translate(x, y + rs * 0.97);
        ctx.scale(1, 0.22);
        ctx.beginPath();
        ctx.arc(0, 0, rs * 0.72, 0, Math.PI * 2);
        ctx.strokeStyle = '#4ee2ffa0';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, rs * 0.9, 0, Math.PI * 2);
        ctx.strokeStyle = '#369aff45';
        ctx.stroke();
        ctx.restore();

        const dest = [x, y - 2.8 * rs];
        const b = [source[0] + (i - 1) * W * 0.27, source[1] + H * 0.09];
        const c = [x + (i - 1) * W * 0.09, dest[1] - H * 0.12];

        ctx.beginPath();
        ctx.moveTo(source[0], source[1]);
        ctx.bezierCurveTo(b[0], b[1], c[0], c[1], dest[0], dest[1]);
        ctx.strokeStyle = '#56caff12';
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.strokeStyle = '#7bdfff65';
        ctx.lineWidth = 1;
        ctx.stroke();

        routes.push(flowRoute(source, b, c, dest));
        body(x, y, rs, Math.PI * (0.5 - 0.5 * Math.cos(time * 0.65 + i * 0.55)), true);
      }

      body(cx, cy, s, yaw, false);
      brain(cx, cy, s, yaw);

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const phase = (time / 3.8 + j / 3 + i * 0.08) % 1;
          const p = flowPoint(routes[i], phase);
          const fade = Math.min(1, phase / 0.07, (1 - phase) / 0.10);
          lightning(p[0], p[1], Math.max(0.72, Math.min(1, H / 610)), fade * 0.95);
        }
      }

      ctx.strokeStyle = '#65dfff80';
      ctx.beginPath();
      ctx.ellipse(cx, cy + s * 0.94, s * 0.8, s * 0.18, 0, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 30; i++) {
        const x = (Math.sin(i * 73.3) * 0.5 + 0.5) * W;
        const y = (Math.cos(i * 13.7) * 0.5 + 0.5) * H;
        ctx.fillStyle = `rgba(145,215,255,${0.16 + 0.13 * Math.sin(time + i)})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    function tick(ts: number) {
      if (!document.hidden) {
        if (!paused) time += Math.min((ts - last) / 1000, 0.05);
        if (!paused || sceneDirty) {
          draw();
          sceneDirty = false;
        }
      }
      last = ts;
      animationFrameId = requestAnimationFrame(tick);
    }

    animationFrameId = requestAnimationFrame(tick);

    const onPointerMove = (e: PointerEvent) => {
      pointer = (e.clientX - container.getBoundingClientRect().left) / W - 0.5;
      sceneDirty = true;
    };
    const onPointerLeave = () => {
      pointer = 0;
      sceneDirty = true;
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      ro.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[580px] sm:h-[630px] overflow-hidden select-none"
      style={{
        borderRadius: '140px 140px 28px 28px',
        background: 'radial-gradient(ellipse at 50% 32%, #1d4662 0%, #102737 37%, #0a1620 74%)',
        boxShadow: '0 30px 60px -25px rgba(21, 36, 47, 0.55), inset 0 0 80px rgba(5, 13, 25, 0.55)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
      }}
    >
      {/* Background grid overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40" 
        style={{
          backgroundImage: 'linear-gradient(rgba(182, 218, 252, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(182, 218, 252, 0.06) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Top Scene Tags */}
      <span className="absolute top-6 left-0 right-0 text-center font-mono text-[9px] tracking-[2.8px] text-[#c9d9e680] uppercase pointer-events-none">
        BEARIQ / NEURAL ARCHITECTURE
      </span>
      <span className="absolute top-12 left-0 right-0 text-center font-manrope text-[12px] text-[#d5e4ed9c] tracking-wider pointer-events-none">
        One mind. Infinite potential.
      </span>

      {/* HTML5 Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Source Intelligence Badge */}
      <div 
        className="absolute left-[4%] top-[25%] text-[10px] sm:text-[11px] p-3 rounded-lg backdrop-blur-md text-[#e2edf3]"
        style={{
          background: 'linear-gradient(120deg, rgba(177, 209, 239, 0.12), rgba(120, 157, 201, 0.05))',
          border: '1px solid rgba(197, 228, 255, 0.18)',
          boxShadow: '0 8px 25px rgba(2, 11, 22, 0.3)',
        }}
      >
        <span className="font-semibold tracking-wider">◉ YOUR INTELLIGENCE</span>
        <small className="block text-[9px] text-[#90a6b5] mt-1">
          Source layer &nbsp; <b className="text-[#e7d59a] font-medium">● Active</b>
        </small>
      </div>

      {/* Transmission Badge */}
      <div 
        className="absolute right-[4%] top-[45%] text-[10px] p-3 rounded-lg backdrop-blur-md text-[#a5b7ca]"
        style={{
          background: 'linear-gradient(120deg, rgba(177, 209, 239, 0.12), rgba(120, 157, 201, 0.05))',
          border: '1px solid rgba(197, 228, 255, 0.18)',
          boxShadow: '0 8px 25px rgba(2, 11, 22, 0.3)',
        }}
      >
        <span className="tracking-widest uppercase text-[9px]">EXPERTISE TRANSMISSION</span>
        <span className="block text-[#e5d39c] font-semibold text-[11px] mt-1">Human → AI replicas</span>
      </div>

      {/* Robot Replicas Footer */}
      <div className="absolute bottom-[66px] left-[4%] right-[4%] flex justify-around text-[#7f9cb0] text-[9px] tracking-[1.5px] font-mono pointer-events-none">
        <span>REPLICA / 01</span>
        <span>REPLICA / 02</span>
        <span>REPLICA / 03</span>
      </div>

      {/* Footer Controls */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 text-[9px] font-mono text-[#8aa1b0] tracking-[1.2px]">
        <span className="inline-block w-2 h-2 rounded-full bg-[#e7cc73] shadow-[0_0_9px_#e7cc7350]" />
        <span>LIVE INTELLIGENCE FLOW</span>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="ml-2 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/15 text-[#becbd3] text-[9px] transition-colors"
        >
          {isPaused ? 'PLAY' : 'PAUSE'}
        </button>
      </div>
    </div>
  );
}
