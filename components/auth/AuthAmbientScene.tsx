"use client";

import { motion } from "framer-motion";

/**
 * Auth (giriş/kayıt) sayfaları için hafif, 3B-hisli hareketli arka plan.
 *
 * Ana sayfadaki sinematik "Education Network" sahnesinin premium havasını
 * (perspektif ızgara zemini + süzülen ışık blobları + yüzen parçacıklar)
 * canvas/WebGL yükü olmadan, yalnız CSS + Framer Motion ile yeniden yaratır.
 * `prefers-reduced-motion`'a saygılıdır (bkz. `app/globals.css`
 * `.auth-scene-*` medya sorgusu). Salt dekoratif → `aria-hidden`.
 */
export function AuthAmbientScene() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Perspektif ızgara zemini — yavaşça akar (3B derinlik) */}
      <div className="absolute inset-x-0 bottom-0 h-[55vh] [perspective:600px]">
        <div className="auth-scene-grid absolute inset-x-[-50%] bottom-[-10%] top-0 origin-bottom bg-[length:56px_56px] opacity-40 [mask-image:linear-gradient(to_top,black,transparent_80%)] [transform:rotateX(74deg)] bg-[linear-gradient(rgba(178,199,239,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(178,199,239,0.16)_1px,transparent_1px)]" />
      </div>

      {/* Süzülen ışık blobları — yavaş, sakin devinim */}
      <motion.div
        className="absolute -left-24 top-[10%] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(10,35,66,0.6),transparent_62%)] blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-24 top-[28%] h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(178,199,239,0.14),transparent_65%)] blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[6%] left-[28%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(214,40,57,0.1),transparent_65%)] blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Yüzen parçacıklar */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="auth-scene-particle absolute rounded-full bg-accent/40"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.dur,
          }}
        />
      ))}
    </div>
  );
}

/** Sabit (deterministik) parçacık dağılımı — SSR/istemci uyumsuzluğu olmasın. */
const PARTICLES = [
  { left: "12%", top: "22%", size: 4, delay: "0s", dur: "9s" },
  { left: "24%", top: "68%", size: 3, delay: "1.4s", dur: "11s" },
  { left: "38%", top: "34%", size: 5, delay: "0.7s", dur: "10s" },
  { left: "52%", top: "78%", size: 3, delay: "2.1s", dur: "12s" },
  { left: "63%", top: "18%", size: 4, delay: "1s", dur: "9.5s" },
  { left: "74%", top: "56%", size: 3, delay: "2.6s", dur: "11.5s" },
  { left: "84%", top: "30%", size: 5, delay: "0.3s", dur: "10.5s" },
  { left: "90%", top: "72%", size: 3, delay: "1.8s", dur: "13s" },
] as const;
