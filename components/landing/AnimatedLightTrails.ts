/**
 * Sinematik landing — Canvas çizim katmanı.
 *
 * Çekirdek ↔ modül ışık izleri, modüller arası yörünge halkası ve serbest
 * parçacık alanı için saf (DOM'suz) çizim yardımcıları. EducationNetworkScene
 * her karede bu fonksiyonları, 3B'den 2B'ye izdüşürülmüş düğümlerle çağırır.
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
  /** Açılış animasyonundaki belirme oranı [0..1]. */
  appear: number;
  /** Derinliğe göre normalize parlaklık [0..1]. */
  depthNorm: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
}

const rgba = (rgb: [number, number, number], a: number) =>
  `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;

/** Serbest parçacık alanı üretir (normalize 0..1 koordinatlar). */
export function createParticles(count: number): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00035,
      vy: (Math.random() - 0.5) * 0.00035 - 0.0001,
      r: Math.random() * 1.4 + 0.4,
      a: Math.random() * 0.35 + 0.08,
    });
  }
  return out;
}

/** Parçacıkları sürükler ve çizer (yumuşak yukarı akış). */
export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  w: number,
  h: number,
): void {
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x += 1;
    else if (p.x > 1) p.x -= 1;
    if (p.y < 0) p.y += 1;
    else if (p.y > 1) p.y -= 1;
    ctx.beginPath();
    ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
    ctx.fillStyle = rgba(TONE_RGB.blue, p.a);
    ctx.fill();
  }
}

/**
 * Çekirdek → modül ışık izlerini, modüller arası yörünge halkasını ve iz
 * üzerinde akan veri parçacıklarını çizer.
 */
export function drawTrails(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  nodes: ProjectedNode[],
  time: number,
): void {
  // 1) Yörünge halkası — komşu düğümleri ince çizgilerle bağla.
  ctx.lineWidth = 1;
  for (let k = 0; k < nodes.length; k += 1) {
    const a = nodes[k];
    const b = nodes[(k + 1) % nodes.length];
    const alpha = 0.05 * Math.min(a.appear, b.appear);
    if (alpha <= 0.002) continue;
    ctx.strokeStyle = rgba(TONE_RGB.blue, alpha);
    ctx.beginPath();
    ctx.moveTo(a.sx, a.sy);
    ctx.lineTo(b.sx, b.sy);
    ctx.stroke();
  }

  // 2) Çekirdek → modül ışık izleri + akan veri parçacığı.
  for (const n of nodes) {
    if (n.appear <= 0.01) continue;
    const rgb = TONE_RGB[NETWORK_MODULES[n.i].tone];
    const baseAlpha = 0.16 * n.appear * (0.55 + 0.45 * n.depthNorm);

    const grad = ctx.createLinearGradient(cx, cy, n.sx, n.sy);
    grad.addColorStop(0, rgba(rgb, baseAlpha * 1.7));
    grad.addColorStop(1, rgba(rgb, 0));
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(n.sx, n.sy);
    ctx.stroke();

    // Akan veri parçacığı (çekirdekten düğüme).
    const p = (time * 0.22 + n.i * 0.137) % 1;
    const px = cx + (n.sx - cx) * p;
    const py = cy + (n.sy - cy) * p;
    const dotR = 1.7 * n.scale;
    const dotGrad = ctx.createRadialGradient(px, py, 0, px, py, dotR * 3);
    dotGrad.addColorStop(0, rgba(rgb, 0.9 * n.appear));
    dotGrad.addColorStop(1, rgba(rgb, 0));
    ctx.fillStyle = dotGrad;
    ctx.beginPath();
    ctx.arc(px, py, dotR * 3, 0, Math.PI * 2);
    ctx.fill();
  }
}
