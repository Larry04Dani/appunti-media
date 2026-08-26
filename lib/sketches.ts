/**
 * Registro globale degli sketch p5.js.
 *
 * Aggiungi qui i tuoi sketch con una chiave univoca.
 * Nei file .mdx li usi semplicemente per nome:
 *
 *   <P5Sketch id="particles" />
 *   <P5Sketch id="lissajous" width={600} height={300} />
 *
 * Questo file è importato SOLO dal client (via P5Sketch),
 * quindi puoi usare qualsiasi API del browser qui dentro.
 */

import type p5Type from "p5";

export type SketchFn = (p: p5Type) => void;

// ─── PARTICELLE INTERATTIVE ───────────────────────────────────────────────────
const particles: SketchFn = (p) => {
  const pts: Array<{ x: number; y: number; vx: number; vy: number; size: number }> = [];

  p.setup = () => {
    p.createCanvas(p.windowWidth > 640 ? 600 : p.windowWidth - 32, 280);
    for (let i = 0; i < 60; i++) {
      pts.push({
        x: p.random(p.width),
        y: p.random(p.height),
        vx: p.random(-1, 1),
        vy: p.random(-1, 1),
        size: p.random(4, 10),
      });
    }
  };

  p.draw = () => {
    p.background(18, 18, 26, 30);
    for (const pt of pts) {
      const dx = p.mouseX - pt.x;
      const dy = p.mouseY - pt.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 120 && d > 0) {
        pt.vx += (dx / d) * 0.3;
        pt.vy += (dy / d) * 0.3;
      }
      pt.vx *= 0.95;
      pt.vy *= 0.95;
      pt.x = (pt.x + pt.vx + p.width) % p.width;
      pt.y = (pt.y + pt.vy + p.height) % p.height;
      p.noStroke();
      p.fill(39, 118, 255, 200);
      p.circle(pt.x, pt.y, pt.size);
    }
  };
};

// ─── CURVA DI LISSAJOUS ───────────────────────────────────────────────────────
const lissajous: SketchFn = (p) => {
  let t = 0;
  const trail: Array<[number, number]> = [];

  p.setup = () => {
    p.createCanvas(p.windowWidth > 640 ? 600 : p.windowWidth - 32, 280);
    p.colorMode(p.HSB, 360, 100, 100, 100);
  };

  p.draw = () => {
    p.background(0, 0, 10, 15);
    const a = 3, b = 2, delta = p.PI / 4;
    const r = Math.min(p.width, p.height) * 0.4;
    const x = p.width / 2 + r * Math.sin(a * t + delta);
    const y = p.height / 2 + r * Math.sin(b * t);
    trail.push([x, y]);
    if (trail.length > 800) trail.shift();
    for (let i = 1; i < trail.length; i++) {
      p.stroke((i / trail.length) * 260, 80, 100, 80);
      p.strokeWeight(1.5);
      p.line(trail[i - 1][0], trail[i - 1][1], trail[i][0], trail[i][1]);
    }
    t += 0.02;
  };
};

// ─── REGISTRO ─────────────────────────────────────────────────────────────────
export const sketches: Record<string, SketchFn> = {
  particles,
  lissajous,
};
