"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { ModuleNode } from "@/components/landing/ModuleNode";
import { NETWORK_MODULES } from "@/components/landing/cinematic-modules";
import {
  createParticles,
  drawParticles,
  drawTrails,
  type ProjectedNode,
} from "@/components/landing/AnimatedLightTrails";

export interface MousePos {
  x: number;
  y: number;
}

interface SceneProps {
  mouseRef: MutableRefObject<MousePos>;
  /** Son CTA "pulse" zaman damgası (performance.now). */
  pulseRef: MutableRefObject<number>;
  reduced: boolean;
  /** Açılış animasyonu büyük ölçüde tamamlanınca tetiklenir. */
  onReady: () => void;
}

const FOCAL = 600;
const BOOT_MS = 3200;
const easeOut = (x: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/**
 * Education Network sahnesi.
 *
 * 3B yörüngedeki modülleri perspektif izdüşümle 2B'ye çevirir; cam düğüm
 * kartlarını ref ile imperatif konumlandırır (React re-render yok), ışık
 * izlerini/parçacıkları canvas'a çizer. Fare paralaksı + yavaş "nefes alan"
 * kamera + tek tek beliren modüllerle sinematik açılış sağlar.
 */
export function EducationNetworkScene({
  mouseRef,
  pulseRef,
  reduced,
  onReady,
}: SceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const core = coreRef.current;
    if (!container || !canvas || !core) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isMobile =
      window.matchMedia("(max-width: 768px)").matches ||
      window.matchMedia("(pointer: coarse)").matches;
    const particleCount = reduced ? 0 : isMobile ? 22 : 56;
    const allowBlur = !isMobile && !reduced;

    let w = 0;
    let h = 0;
    const resize = () => {
      w = container.clientWidth;
      h = container.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const particles = createParticles(particleCount);
    const N = NETWORK_MODULES.length;
    const baseAngles = NETWORK_MODULES.map((_, i) => (i / N) * Math.PI * 2);

    const start = performance.now();
    let rotX = 0.34;
    let rotY = 0;
    let readyFired = false;
    let raf = 0;

    const projected: ProjectedNode[] = NETWORK_MODULES.map((_, i) => ({
      i,
      sx: 0,
      sy: 0,
      scale: 1,
      z: 0,
      appear: 0,
      depthNorm: 0.5,
    }));

    const render = (now: number) => {
      const t = (now - start) / 1000;
      const boot = reduced ? 1 : clamp01((now - start) / BOOT_MS);
      const bootEase = easeOut(boot);

      if (!readyFired && boot > 0.82) {
        readyFired = true;
        onReady();
      }

      // Kamera: fare paralaksı + yavaş nefes; yumuşak takip.
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const breatheY = reduced ? 0 : Math.sin(t * 0.18) * 0.1;
      const breatheX = reduced ? 0 : Math.sin(t * 0.13) * 0.04;
      const targetY = mx * 0.34 + breatheY;
      const targetX = 0.34 - my * 0.16 + breatheX;
      rotY += (targetY - rotY) * 0.05;
      rotX += (targetX - rotX) * 0.05;

      const cx = w / 2;
      const cy = h * 0.46;
      const R = Math.min(Math.min(w, h) * (isMobile ? 0.36 : 0.32), 360);

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      for (let i = 0; i < N; i += 1) {
        const a = baseAngles[i] + (reduced ? 0 : t * 0.04);
        const bx = Math.cos(a) * R;
        const bz = Math.sin(a) * R;
        let by = Math.sin(a * 2 + i * 0.6) * (R * 0.16);
        if (!reduced) by += Math.sin(t * 0.6 + i) * (R * 0.03);

        // rotateY → rotateX
        const x1 = bx * cosY - bz * sinY;
        const z1 = bx * sinY + bz * cosY;
        const y1 = by * cosX - z1 * sinX;
        const z2 = by * sinX + z1 * cosX;

        const scale = FOCAL / (FOCAL - z2);
        const sx = cx + x1 * scale;
        const sy = cy + y1 * scale;
        const depthNorm = clamp01((z2 + R) / (2 * R));

        const threshold = 0.12 + (i / N) * 0.66;
        const appear = easeOut(clamp01((boot - threshold) / 0.14));

        const node = projected[i];
        node.sx = sx;
        node.sy = sy;
        node.scale = scale;
        node.z = z2;
        node.appear = appear;
        node.depthNorm = depthNorm;

        const el = nodeRefs.current[i];
        if (el) {
          const s = scale * (0.72 + 0.28 * appear);
          el.style.transform = `translate3d(${sx}px,${sy}px,0) translate(-50%,-50%) scale(${s.toFixed(
            3,
          )})`;
          el.style.opacity = (
            (0.4 + 0.6 * depthNorm) *
            appear
          ).toFixed(3);
          const blur = allowBlur ? (1 - depthNorm) * 3 : 0;
          el.style.filter = blur > 0.25 ? `blur(${blur.toFixed(1)}px)` : "none";
          el.style.zIndex = String(1000 + Math.round(z2));
        }
      }

      // Çekirdek — küçük noktadan büyür; CTA hover'da nabız atar.
      let pulse = 0;
      const pt = pulseRef.current;
      if (pt) {
        const dt = (now - pt) / 650;
        if (dt >= 0 && dt < 1) pulse = Math.sin(dt * Math.PI) * 0.16;
      }
      const coreScale = (reduced ? 1 : 0.06 + 0.94 * bootEase) + pulse;
      core.style.transform = `translate3d(${cx}px,${cy}px,0) translate(-50%,-50%) scale(${coreScale.toFixed(
        3,
      )})`;
      core.style.opacity = (reduced ? 1 : bootEase).toFixed(3);

      // Canvas: ışık izleri + parçacıklar.
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      drawTrails(ctx, cx, cy, projected, t);
      if (particleCount > 0) drawParticles(ctx, particles, w, h);
      ctx.globalCompositeOperation = "source-over";

      if (!reduced) raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    // Hareket azaltılmışsa: tek kare statik çiz + hazır bildir.
    if (reduced) onReady();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [mouseRef, pulseRef, reduced, onReady]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* Volumetrik ışık blobları (derinlik hissi) */}
      <div className="pointer-events-none absolute left-1/2 top-[44%] h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(10,35,66,0.55),transparent_62%)] blur-2xl" />
      <div className="pointer-events-none absolute left-[18%] top-[22%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(178,199,239,0.14),transparent_65%)] blur-3xl" />
      <div className="pointer-events-none absolute right-[14%] bottom-[16%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(214,40,57,0.12),transparent_65%)] blur-3xl" />

      {/* Işık izleri / parçacık canvas'ı */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Education Core — akıllı çekirdek */}
      <div
        ref={coreRef}
        className="pointer-events-none absolute left-0 top-0 h-[150px] w-[150px] opacity-0 will-change-transform"
        style={{ transform: "translate3d(-9999px,-9999px,0)" }}
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(178,199,239,0.9),rgba(178,199,239,0.18)_38%,transparent_70%)] blur-[6px]" />
        <div className="absolute inset-[34%] rounded-full bg-[radial-gradient(circle,#ffffff,rgba(178,199,239,0.7)_60%,transparent)]" />
        <div className="absolute inset-0 animate-[spin_14s_linear_infinite] rounded-full border border-accent/25" />
        <div className="absolute inset-[14%] animate-[spin_22s_linear_infinite_reverse] rounded-full border border-brand/20" />
      </div>

      {/* Modül düğümleri (cam kartlar) */}
      {NETWORK_MODULES.map((m, i) => (
        <ModuleNode
          key={m.id}
          module={m}
          ref={(el) => {
            nodeRefs.current[i] = el;
          }}
        />
      ))}
    </div>
  );
}
