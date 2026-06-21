"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { ModuleNode } from "@/components/landing/ModuleNode";
import { NETWORK_MODULES, TONE_RGB } from "@/components/landing/cinematic-modules";
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
const BOOT_MS = 3600;
/** Çekirdeğin ateşlendiği (noktadan doğduğu) açılış oranı. */
const IGNITION = 0.16;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const easeOutBack = (x: number) => {
  const t = clamp01(x);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/**
 * Education Network sahnesi (sinematik sürüm).
 *
 * Çekirdek bir singularity noktasından doğar: ateşleme anında bloom flash +
 * iki şok dalgası halkası, ardından overshoot ile büyüme. Modüller sırayla
 * "ateşlenir" (çekirdekten komet + uç patlaması + pop). Işık izleri eğrisel ve
 * premium. 3B→2B perspektif izdüşüm; düğümler ref ile imperatif güncellenir
 * (React re-render yok). Fare paralaksı + yavaş nefes alan kamera.
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
  const flashRef = useRef<HTMLDivElement>(null);
  const shockRef = useRef<HTMLDivElement>(null);
  const shock2Ref = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const core = coreRef.current;
    const flash = flashRef.current;
    const shock = shockRef.current;
    const shock2 = shock2Ref.current;
    if (!container || !canvas || !core || !flash || !shock || !shock2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isMobile =
      window.matchMedia("(max-width: 768px)").matches ||
      window.matchMedia("(pointer: coarse)").matches;
    const particleCount = reduced ? 0 : isMobile ? 24 : 60;
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
      flash: 0,
      ignite: 0,
    }));

    const setCentered = (
      el: HTMLDivElement,
      cx: number,
      cy: number,
      scale: number,
      opacity: number,
    ) => {
      el.style.transform = `translate3d(${cx}px,${cy}px,0) translate(-50%,-50%) scale(${scale.toFixed(
        3,
      )})`;
      el.style.opacity = opacity.toFixed(3);
    };

    const render = (now: number) => {
      const t = (now - start) / 1000;
      const boot = reduced ? 1 : clamp01((now - start) / BOOT_MS);

      if (!readyFired && boot > 0.84) {
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

      // Modüller, ateşleme sonrası bir halka dalgası gibi yavaşça açılır.
      const networkReveal = easeOut(clamp01((boot - IGNITION) / 0.3));

      for (let i = 0; i < N; i += 1) {
        const a = baseAngles[i] + (reduced ? 0 : t * 0.04);
        const r = R * (0.35 + 0.65 * networkReveal); // çekirdekten dışarı açılış
        const bx = Math.cos(a) * r;
        const bz = Math.sin(a) * r;
        let by = Math.sin(a * 2 + i * 0.6) * (r * 0.16);
        if (!reduced) by += Math.sin(t * 0.6 + i) * (R * 0.03);

        const x1 = bx * cosY - bz * sinY;
        const z1 = bx * sinY + bz * cosY;
        const y1 = by * cosX - z1 * sinX;
        const z2 = by * sinX + z1 * cosX;

        const scale = FOCAL / (FOCAL - z2);
        const sx = cx + x1 * scale;
        const sy = cy + y1 * scale;
        const depthNorm = clamp01((z2 + R) / (2 * R));

        // Sıralı ateşlenme: her modül kendi zaman penceresinde doğar.
        const threshold = 0.2 + (i / N) * 0.62;
        const igniteRaw = clamp01((boot - threshold) / 0.13);
        const appear = easeOut(igniteRaw);
        const pop = easeOutBack(igniteRaw);
        const flash =
          igniteRaw > 0 && igniteRaw < 1 ? Math.sin(igniteRaw * Math.PI) : 0;

        const node = projected[i];
        node.sx = sx;
        node.sy = sy;
        node.scale = scale;
        node.z = z2;
        node.appear = appear;
        node.depthNorm = depthNorm;
        node.flash = flash;
        node.ignite = igniteRaw;

        const el = nodeRefs.current[i];
        if (el) {
          const s = scale * (0.4 + 0.6 * pop);
          el.style.transform = `translate3d(${sx}px,${sy}px,0) translate(-50%,-50%) scale(${s.toFixed(
            3,
          )})`;
          el.style.opacity = ((0.4 + 0.6 * depthNorm) * appear).toFixed(3);
          const blur = allowBlur ? (1 - depthNorm) * 3 : 0;
          let filter = blur > 0.25 ? `blur(${blur.toFixed(1)}px)` : "";
          // Ateşlenme anında kartın anlık ışıması.
          if (flash > 0.05) {
            const rgb = TONE_RGB[NETWORK_MODULES[i].tone];
            filter += ` drop-shadow(0 0 ${(10 * flash).toFixed(1)}px rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(0.75 * flash).toFixed(2)}))`;
          }
          el.style.filter = filter.trim() || "none";
          el.style.zIndex = String(1000 + Math.round(z2));
        }
      }

      // Ateşlenen modülün adını çekirdeğin altında kısa süre öne çıkar.
      if (captionRef.current) {
        const cap = captionRef.current;
        let topI = -1;
        let topFlash = 0;
        for (let i = 0; i < N; i += 1) {
          if (projected[i].flash > topFlash) {
            topFlash = projected[i].flash;
            topI = i;
          }
        }
        if (!reduced && boot < 0.97 && topFlash > 0.12 && topI >= 0) {
          if (cap.dataset.idx !== String(topI)) {
            cap.textContent = NETWORK_MODULES[topI].label;
            cap.dataset.idx = String(topI);
          }
          cap.style.opacity = topFlash.toFixed(3);
        } else {
          cap.style.opacity = "0";
        }
      }

      // ---- Çekirdeğin doğuşu --------------------------------------------
      const birth = easeOutBack(clamp01((boot - IGNITION) / 0.34));
      const preGlow = clamp01(boot / IGNITION); // ateşlemeden önce büyüyen nokta

      // CTA nabzı.
      let pulse = 0;
      const ptime = pulseRef.current;
      if (ptime) {
        const dt = (now - ptime) / 650;
        if (dt >= 0 && dt < 1) pulse = Math.sin(dt * Math.PI) * 0.16;
      }
      // Ateşleme anında ek "soluma" + sürekli hafif nabız.
      const idle = reduced ? 0 : Math.sin(t * 1.6) * 0.025;
      const coreScale = (reduced ? 1 : 0.05 + 0.95 * birth) + pulse + idle * boot;
      const coreOpacity = reduced ? 1 : Math.max(preGlow * 0.85, birth);
      setCentered(core, cx, cy, coreScale, coreOpacity);

      // Bloom flash — ateşleme anında beyaz patlama.
      const fl = reduced ? 0 : clamp01(1 - Math.abs(boot - IGNITION) / 0.085);
      setCentered(flash, cx, cy, 0.4 + fl * 2.6, fl * 0.95);

      // İki şok dalgası halkası (gecikmeli) — doğum hissi.
      const drawShock = (el: HTMLDivElement, delay: number) => {
        const sp = clamp01((boot - (IGNITION + delay)) / 0.5);
        const active = !reduced && boot >= IGNITION + delay && sp < 1;
        setCentered(el, cx, cy, 0.1 + sp * 7, active ? (1 - sp) * 0.55 : 0);
      };
      drawShock(shock, 0);
      drawShock(shock2, 0.12);

      // ---- Canvas: ışık izleri + parçacıklar ----------------------------
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      drawTrails(ctx, cx, cy, projected, t);
      if (particleCount > 0) drawParticles(ctx, particles, w, h, t);
      ctx.globalCompositeOperation = "source-over";

      if (!reduced) raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    if (reduced) onReady();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [mouseRef, pulseRef, reduced, onReady]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* Volumetrik ışık blobları (derinlik hissi) */}
      <div className="pointer-events-none absolute left-1/2 top-[44%] h-[62vh] w-[62vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(10,35,66,0.55),transparent_62%)] blur-2xl" />
      <div className="pointer-events-none absolute left-[16%] top-[20%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(178,199,239,0.14),transparent_65%)] blur-3xl" />
      <div className="pointer-events-none absolute right-[12%] bottom-[14%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(214,40,57,0.12),transparent_65%)] blur-3xl" />

      {/* Işık izleri / parçacık canvas'ı */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Ateşleme bloom'u */}
      <div
        ref={flashRef}
        className="pointer-events-none absolute left-0 top-0 h-[220px] w-[220px] opacity-0 will-change-transform"
        style={{ transform: "translate3d(-9999px,-9999px,0)" }}
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,#ffffff,rgba(178,199,239,0.5)_35%,transparent_70%)] blur-[2px]" />
      </div>

      {/* Şok dalgası halkaları */}
      <div
        ref={shockRef}
        className="pointer-events-none absolute left-0 top-0 h-[160px] w-[160px] rounded-full border border-accent/40 opacity-0 will-change-transform"
        style={{ transform: "translate3d(-9999px,-9999px,0)" }}
      />
      <div
        ref={shock2Ref}
        className="pointer-events-none absolute left-0 top-0 h-[160px] w-[160px] rounded-full border border-accent/25 opacity-0 will-change-transform"
        style={{ transform: "translate3d(-9999px,-9999px,0)" }}
      />

      {/* Education Core — akıllı çekirdek */}
      <div
        ref={coreRef}
        className="pointer-events-none absolute left-0 top-0 h-[160px] w-[160px] opacity-0 will-change-transform"
        style={{ transform: "translate3d(-9999px,-9999px,0)" }}
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(178,199,239,0.85),rgba(178,199,239,0.16)_40%,transparent_72%)] blur-[8px]" />
        <div className="absolute inset-[28%] rounded-full bg-[radial-gradient(circle,#ffffff,rgba(178,199,239,0.85)_55%,transparent)] blur-[1px]" />
        <div className="absolute inset-[40%] rounded-full bg-white" />
        <div className="absolute inset-0 animate-[spin_16s_linear_infinite] rounded-full border border-accent/25" />
        <div className="absolute inset-[12%] animate-[spin_24s_linear_infinite_reverse] rounded-full border border-brand/20" />
        <div className="absolute inset-[24%] animate-[spin_30s_linear_infinite] rounded-full border border-dashed border-accent/15" />
      </div>

      {/* Ateşlenen modül adı — çekirdeğin altında kısa vurgu */}
      <div
        ref={captionRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[70%] z-[1] -translate-x-1/2 font-mono text-xs uppercase tracking-[0.4em] text-accent opacity-0 will-change-[opacity] sm:text-sm"
      />

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
