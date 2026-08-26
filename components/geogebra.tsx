"use client";

import { useEffect, useRef } from "react";

/* -------------------------------------------------------------------------
   GeoGebra — embed di applet GeoGebra negli appunti MDX.

   Modalità d'uso nei file .mdx:

   1. Embed di una costruzione salvata su GeoGebra.org:
      <GeoGebra materialId="xC4Bnbap" />

   2. App interattiva vuota (es. calcolatrice grafica):
      <GeoGebra appName="graphing" height={400} />

   3. App pre-caricata con comandi GeoGebra:
      <GeoGebra
        appName="graphing"
        commands={["f(x) = x^2", "g(x) = 2x + 1", "A = Intersect(f, g)"]}
        showToolBar={false}
      />

   Tipi di app disponibili (appName):
   - "graphing"  → Calcolatrice grafica 2D (default)
   - "geometry"  → Geometria interattiva
   - "3d"        → Calcolatrice 3D
   - "cas"       → Computer Algebra System
   - "suite"     → Suite completa
   - "classic"   → GeoGebra Classic
   ------------------------------------------------------------------------- */

// GGBApplet iniettato da deployggb.js non ha tipi ufficiali
declare global {
  interface Window {
    GGBApplet: new (params: Record<string, unknown>, useBrowserForJS: boolean) => {
      inject: (containerId: string) => void;
    };
  }
}

export type GeoGebraAppName = "graphing" | "geometry" | "3d" | "cas" | "suite" | "classic";

interface GeoGebraProps {
  /** ID di un materiale salvato su geogebra.org (es. "xC4Bnbap") */
  materialId?: string;
  /** Tipo di app. Default: "graphing" */
  appName?: GeoGebraAppName;
  /** Comandi GeoGebra da eseguire all'avvio (solo senza materialId) */
  commands?: string[];
  /** Larghezza in px. Default: 700 */
  width?: number;
  /** Altezza in px. Default: 450 */
  height?: number;
  /** Mostra la toolbar. Default: true */
  showToolBar?: boolean;
  /** Mostra la barra di input algebra. Default: true */
  showAlgebraInput?: boolean;
  /** Mostra il menu. Default: false */
  showMenuBar?: boolean;
  /** Classi Tailwind aggiuntive per il contenitore */
  className?: string;
}

// Contatore per generare ID univoci quando ci sono più applet nella stessa pagina
let instanceCount = 0;

export function GeoGebra({
  materialId,
  appName = "graphing",
  commands,
  width = 700,
  height = 450,
  showToolBar = true,
  showAlgebraInput = true,
  showMenuBar = false,
  className = "",
}: GeoGebraProps) {
  const containerId = useRef(`ggb-${++instanceCount}`).current;
  const scriptLoaded = useRef(false);

  useEffect(() => {
    const initApplet = () => {
      if (!window.GGBApplet) return;

      const params: Record<string, unknown> = {
        appName,
        width,
        height,
        showToolBar,
        showAlgebraInput,
        showMenuBar,
        enableRightClick: false,
        enableLabelDrags: true,
        enableShiftDragZoom: true,
        showResetIcon: true,
        language: "it",
      };

      if (materialId) {
        params.material_id = materialId;
      }

      // Se ci sono comandi iniziali, li eseguiamo tramite la callback appletOnLoad
      if (commands && commands.length > 0) {
        params.appletOnLoad = (api: { evalCommand: (cmd: string) => void }) => {
          for (const cmd of commands) {
            api.evalCommand(cmd);
          }
        };
      }

      const applet = new window.GGBApplet(params, true);
      applet.inject(containerId);
    };

    // Se lo script è già stato caricato da un'istanza precedente, usiamo direttamente
    if (document.querySelector('script[data-ggb]')) {
      initApplet();
      return;
    }

    // Caricamento lazy dello script GeoGebra (solo al primo utilizzo nella pagina)
    const script = document.createElement("script");
    script.src = "https://www.geogebra.org/apps/deployggb.js";
    script.dataset.ggb = "1";
    script.onload = () => {
      scriptLoaded.current = true;
      initApplet();
    };
    document.head.appendChild(script);

    // Nota: non rimuoviamo lo script al cleanup perché potrebbe servire ad altre istanze
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`not-prose my-6 ${className}`}>
      <div
        id={containerId}
        style={{ width, height }}
        className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm"
      />
    </div>
  );
}
