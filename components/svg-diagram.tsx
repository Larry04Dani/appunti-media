"use client";

import React, { useEffect, useState } from "react";
import katex from "katex";

function renderWithLatex(text: string): React.ReactNode {
  // Riconosce le formule tra $...$ e le compila tramite KaTeX
  const parts = text.split(/(\$[^$]+\$)/g);
  return parts.map((part, i) => {
    if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
      const formula = part.slice(1, -1);
      try {
        const html = katex.renderToString(formula, { throwOnError: false });
        return (
          <span
            key={i}
            className="inline-math inline-block align-baseline mx-0.5"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        return <span key={i}>{part}</span>;
      }
    }
    return <span key={i}>{part}</span>;
  });
}

export type SvgDiagramProps = {
  /** Percorso del file .svg in /public (es: "/images/geometria-1/vettore.svg") */
  src?: string;
  /** In alternativa a `src`, puoi passare direttamente l'elemento <svg> inline come children */
  children?: React.ReactNode;
  /** Testo alternativo per l'accessibilità */
  alt?: string;
  /** Didascalia mostrata sotto al diagramma */
  caption?: string;
  /** Classi CSS aggiuntive per il contenitore */
  className?: string;
  /** Larghezza massima del box (default: "max-w-md") */
  maxWidth?: string;
  /**
   * Se true (default), converte automaticamente i tratti e riempimenti neri hardcoded (#000, black)
   * in `currentColor`, così gli SVG esportati da GeoGebra, Inkscape o Matplotlib
   * si adattano subito al tema scuro e a tutti i temi secondari (Nord, Latte, Rose...).
   */
  adaptive?: boolean;
  /** Se true (default), rimuove eventuali rettangoli di sfondo bianco pieno per rendere il grafico trasparente */
  transparentBackground?: boolean;
};

function transformSvgString(
  rawSvg: string,
  adaptive: boolean,
  transparentBackground: boolean
): string {
  let res = rawSvg;

  // 1. Rimuove rettangolo di sfondo bianco opaco se presente (es. sfondi generati da GeoGebra/Matplotlib)
  if (transparentBackground) {
    res = res.replace(
      /<rect\b([^>]*?)fill=["'](?:#ffffff|#fff|white)["']([^>]*?)\/?>/gi,
      (match) => {
        // Rimuove solo se sembra un rettangolo di canvas/sfondo totale (100% o id background)
        if (/(?:width="100%"|id=".*(?:bg|background).*"|x="0"\s+y="0")/i.test(match)) {
          return "";
        }
        return match;
      }
    );
  }

  // 2. Rende il tag <svg> responsive e pulito (mantenendo o sintetizzando viewBox)
  res = res.replace(/<svg\b([^>]*?)>/i, (match, attrs) => {
    let clean = attrs;
    const wMatch = clean.match(/\bwidth="([\d.]+)(?:px)?"/i);
    const hMatch = clean.match(/\bheight="([\d.]+)(?:px)?"/i);
    const hasViewBox = /\bviewBox=/i.test(clean);

    if (!hasViewBox && wMatch && hMatch) {
      clean += ` viewBox="0 0 ${wMatch[1]} ${hMatch[1]}"`;
    }

    // Rimuove width/height fisse sul tag <svg> per lasciare che le classi Tailwind gestiscano il dimensionamento
    clean = clean.replace(/\bwidth="[^"]*"/gi, "");
    clean = clean.replace(/\bheight="[^"]*"/gi, "");

    return `<svg ${clean} class="w-full h-auto block select-none">`;
  });

  // 3. Se adaptive è attivo, converte i colori neri in `currentColor`
  if (adaptive) {
    // Sostituisce attributi stroke="#000", stroke="black", fill="#000", etc.
    res = res.replace(
      /(stroke|fill)=["'](#000000|#000|black)["']/gi,
      '$1="currentColor"'
    );

    // Sostituisce stili inline (es: style="stroke: #000; fill: black")
    res = res.replace(/style=["']([^"']*)["']/gi, (m, style) => {
      const updated = style
        .replace(/stroke:\s*(#000000|#000|black)/gi, "stroke: currentColor")
        .replace(/fill:\s*(#000000|#000|black)/gi, "fill: currentColor");
      return `style="${updated}"`;
    });
  }

  return res;
}

export function SvgDiagram({
  src,
  children,
  alt,
  caption,
  className = "",
  maxWidth = "max-w-md",
  adaptive = true,
  transparentBackground = true,
}: SvgDiagramProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      return;
    }

    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    fetch(src)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Impossibile caricare il file SVG: ${res.statusText}`);
        }
        return res.text();
      })
      .then((text) => {
        if (!isMounted) return;
        const processed = transformSvgString(text, adaptive, transparentBackground);
        setSvgContent(processed);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [src, adaptive, transparentBackground]);

  return (
    <figure className={`my-6 flex flex-col items-center not-prose ${className}`}>
      <div
        className={`w-full ${maxWidth} rounded-xl border border-gray-200 dark:border-gray-800 bg-foreground/[0.015] p-4 flex items-center justify-center transition-colors shadow-2xs text-foreground`}
        aria-label={alt || caption || "Diagramma SVG"}
      >
        {children ? (
          <div className="w-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto text-foreground">
            {children}
          </div>
        ) : loading ? (
          <div className="w-full h-48 animate-pulse bg-foreground/[0.04] rounded-lg flex items-center justify-center">
            <span className="text-xs text-foreground/40 font-mono">Caricamento diagramma...</span>
          </div>
        ) : error ? (
          <div className="w-full p-4 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-mono text-center">
            {error} ({src})
          </div>
        ) : (
          <div
            className="w-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto text-foreground"
            dangerouslySetInnerHTML={{ __html: svgContent ?? "" }}
          />
        )}
      </div>

      {caption && (
        <figcaption className="text-center text-xs text-foreground/70 mt-2 font-medium px-2 flex items-center justify-center flex-wrap gap-y-1">
          {renderWithLatex(caption)}
        </figcaption>
      )}
    </figure>
  );
}

/** Alias in italiano comodo da usare nei file .mdx */
export const DiagrammaSvg = SvgDiagram;
