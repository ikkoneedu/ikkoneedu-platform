/**
 * Sinematik landing — Canvas çizim katmanı (premium sürüm).
 *
 * Çekirdek ↔ modül arasında EĞRİSEL (quadratic) ışık izleri, çift katmanlı
 * glow, akan veri parçacıkları, modül ateşlenme kuyruğu (ignition comet) ve
 * uç-nokta patlaması. Tümü additive blend ile yumuşak/volumetrik görünür.
 * Saf (DOM'suz) — EducationNetworkScene her karede çağırır.
 */

import { NETWORK_MODULES, TONE_RGB } from "@/components/landing/cinematic-modules";

/** Bir modülün ekrana izdüşürülmüş hali (paylaşılan tip). */
export interface ProjectedNode {
  i: number;
  sx: number;
  sy: number;
  scale: number;
  /** Derinlik (z) — pozitif = öne yakın. */
  z: number;
  /** Açılışta belirme (yumuşatılmış opaklık) [0..1]. */
  appear: number;
  /** Derinliğe göre normalize parlaklık [0..1]. */
  depthNorm: number;
  /** Ateşlenme anındaki flash yoğunluğu [0..1] (ortada tepe yapar). */
  flash: number;
  /** Ateşlenme ilerlemesi [0..1] — çekirdekten düğüme akan kuyruk için. */
  ignite: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  /** Twinkle faz kayması. */
  tw: number;
}

type RGB = [number, number, number];
const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);

/** Serbest parçacık alanı üretir (normalize 0..1 koordinatlar). */
export function createParticles(count: number): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00032,
      vy: (Math.random() - 0.5) * 0.00032 - 0.0001,
      r: Math.random() * 1.5 + 0.4,
      a: Math.random() * 0.32 + 0.06,
      tw: Math.random() * Math.PI * 2,
    });
  }
  return out;
}

/** Parçacıkları sürükler, hafif twinkle ile çizer (yumuşak yukarı akış). */
export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  w: number,
  h: number,
  time: number,
): void {
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x += 1;
    else if (p.x > 1) p.x -= 1;
    if (p.y < 0) p.y += 1;
    else if (p.y > 1) p.y -= 1;
    const tw = 0.6 + 0.4 * Math.sin(time * 1.6 + p.tw);
    ctx.beginPath();
    ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
    ctx.fillStyle = rgba(TONE_RGB.blue, p.a * tw);
    ctx.fill();
  }
}

/** Yumuşak ışıltılı nokta (radial gradient — şık ve ucuz glow). */
function glowDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  c: RGB,
  alpha: number,
): void {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, rgba(c, alpha));
  g.addColorStop(0.4, rgba(c, alpha * 0.5));
  g.addColorStop(1, rgba(c, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Çekirdek → modül premium ışık izleri + yörünge halkası + akan veri
 * parçacıkları + ateşlenme kuyruğu + uç patlaması.
 */
export function drawTrails(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  nodes: ProjectedNode[],
  time: number,
): void {
  // 1) Yörünge halkası — komşu düğümleri çok ince bağla (derinlik hissi).
  ctx.lineWidth = 1;
  for (let k = 0; k < nodes.length; k += 1) {
    const a = nodes[k];
    const b = nodes[(k + 1) % nodes.length];
    const alpha = 0.045 * Math.min(a.appear, b.appear);
    if (alpha <= 0.002) continue;
    ctx.strokeStyle = rgba(TONE_RGB.blue, alpha);
    ctx.beginPath();
    ctx.moveTo(a.sx, a.sy);
    ctx.lineTo(b.sx, b.sy);
    ctx.stroke();
  }

  // 2) Çekirdek → modül eğrisel ışık izleri.
  for (const n of nodes) {
    if (n.appear <= 0.01 && n.ignite <= 0.01) continue;
    const c = TONE_RGB[NETWORK_MODULES[n.i].tone];
    const vis = Math.max(n.appear, n.ignite);

    // Eğri kontrol noktası — perpendiküler hafif salınım (organik akış).
    const dx = n.sx - cx;
    const dy = n.sy - cy;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const curve = (Math.sin(time * 0.5 + n.i * 1.3) * 0.5 + 0.5) * 0.16 + 0.06;
    const off = len * curve;
    const ctrlX = (cx + n.sx) / 2 + nx * off;
    const ctrlY = (cy + n.sy) / 2 + ny * off;

    const bez = (t: number) => {
      const u = 1 - t;
      return {
        x: u * u * cx + 2 * u * t * ctrlX + t * t * n.sx,
        y: u * u * cy + 2 * u * t * ctrlY + t * t * n.sy,
      };
    };

    const baseAlpha = vis * (0.5 + 0.5 * n.depthNorm);

    // Geniş yumuşak glow katmanı.
    const g1 = ctx.createLinearGradient(cx, cy, n.sx, n.sy);
    g1.addColorStop(0, rgba(c, 0.16 * baseAlpha));
    g1.addColorStop(1, rgba(c, 0));
    ctx.strokeStyle = g1;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(ctrlX, ctrlY, n.sx, n.sy);
    ctx.stroke();

    // İnce parlak çekirdek çizgi.
    const g2 = ctx.createLinearGradient(cx, cy, n.sx, n.sy);
    g2.addColorStop(0, rgba(c, 0.42 * baseAlpha));
    g2.addColorStop(0.7, rgba(c, 0.14 * baseAlpha));
    g2.addColorStop(1, rgba(c, 0));
    ctx.strokeStyle = g2;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(ctrlX, ctrlY, n.sx, n.sy);
    ctx.stroke();

    // Akan veri parçacıkları (2 adet, farklı faz).
    if (n.appear > 0.05) {
      for (let s = 0; s < 2; s += 1) {
        const t = (time * 0.2 + n.i * 0.13 + s * 0.5) % 1;
        const pt = bez(t);
        const pulse = 0.55 + 0.45 * Math.sin(time * 3 + n.i + s);
        glowDot(ctx, pt.x, pt.y, 5 * n.scale, c, 0.5 * n.appear * pulse);
        ctx.fillStyle = rgba(c, 0.9 * n.appear * pulse);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 1.1 * n.scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Ateşlenme kuyruğu — düğüm aktive olurken çekirdekten fırlayan parlak komet.
    if (n.ignite > 0.001 && n.ignite < 0.999) {
      const tc = easeOut(n.ignite);
      const head = bez(tc);
      glowDot(ctx, head.x, head.y, 16 * n.scale, c, 0.85);
      ctx.fillStyle = rgba([255, 255, 255], 0.9);
      ctx.beginPath();
      ctx.arc(head.x, head.y, 1.8 * n.scale, 0, Math.PI * 2);
      ctx.fill();
      // kısa kuyruk
      const tail = bez(Math.max(0, tc - 0.08));
      const tg = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
      tg.addColorStop(0, rgba(c, 0));
      tg.addColorStop(1, rgba(c, 0.7));
      ctx.strokeStyle = tg;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tail.x, tail.y);
      ctx.lineTo(head.x, head.y);
      ctx.stroke();
    }

    // Uç-nokta patlaması — düğüm ateşlendiği an parlar.
    if (n.flash > 0.01) {
      glowDot(ctx, n.sx, n.sy, 22 * n.scale * n.flash, c, 0.7 * n.flash);
    }
  }
}
