"use client";

import { useEffect, useRef } from "react";
import type p5Type from "p5";

/* -------------------------------------------------------------------------
   P5Sketch — box animato/interattivo basato su p5.js.

   Uso nei file .mdx:
     <P5Sketch id="particles" />
     <P5Sketch id="lissajous" width={600} height={300} />

   Gli sketch sono definiti in `lib/sketches.ts`.
   Il prop `id` è una stringa, quindi può essere passato senza problemi
   da un Server Component (come i file .mdx) a questo Client Component.
   ------------------------------------------------------------------------- */
interface P5SketchProps {
  /** ID dello sketch definito in lib/sketches.ts */
  id: string;
  /** Larghezza del canvas in px. Default: 600 */
  width?: number;
  /** Altezza del canvas in px. Default: 300 */
  height?: number;
  /** Classi Tailwind aggiuntive per il contenitore */
  className?: string;
}

export function P5Sketch({ id, width = 600, height = 300, className = "" }: P5SketchProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let instance: p5Type | null = null;

    // Importiamo p5 e il registro in parallelo, entrambi solo lato client
    Promise.all([
      import("p5"),
      import("@/lib/sketches"),
    ]).then(([{ default: p5 }, { sketches }]) => {
      if (!containerRef.current) return;

      const sketchFn = sketches[id];
      if (!sketchFn) {
        console.error(`[P5Sketch] Sketch "${id}" non trovato in lib/sketches.ts`);
        return;
      }

      instance = new p5(sketchFn, containerRef.current);
    });

    return () => {
      instance?.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div
      ref={containerRef}
      style={{ width, height }}
      className={`not-prose overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 my-6 ${className}`}
    />
  );
}
