"use client";

import React, { useState, useRef, useEffect, useId, useCallback } from "react";

// ─── INTERFACCIA DEL COMPONENTE ───────────────────────────────────────────────
type TooltipProps = {
  // Il testo (o JSX) da mostrare nella box al hover
  text: React.ReactNode;
  // Il contenuto "trigger" — quello su cui l'utente passa il mouse
  children: React.ReactNode;
};

// ─── COMPONENTE: Tooltip ──────────────────────────────────────────────────────
// Mostra una box di testo sopra al contenuto quando ci si passa il mouse sopra,
// quando riceve il focus da tastiera (Tab), o al tocco su dispositivi mobili.
//
// UTILIZZO NEI FILE .mdx:
//   <Tooltip text="Questo è un processo NP-completo">
//     algoritmo esponenziale
//   </Tooltip>
//
//   <Tooltip text={<span>Vedi il **Teorema di Bayes** per i dettagli</span>}>
//     probabilità condizionata
//   </Tooltip>
//
// Il `text` può contenere anche JSX semplice oltre al testo puro.
export function Tooltip({ text, children }: TooltipProps) {
  // `isVisible` controlla se la box è visibile (true) o nascosta (false)
  const [isVisible, setIsVisible] = useState(false);

  // `position` serve per calcolare se il tooltip debba spostarsi orizzontalmente
  // nel caso in cui sia troppo vicino al bordo sinistro o destro dello schermo.
  // "center" → centrato sul trigger (default)
  // "left"   → allineato a destra del trigger (si espande verso sinistra per non uscire dallo schermo)
  // "right"  → allineato a sinistra del trigger (si espande verso destra)
  const [position, setPosition] = useState<"center" | "left" | "right">("center");

  // `verticalPosition` controlla se aprire verso l'alto (default) o verso il basso
  // se ci si trova troppo vicini alla navbar o al bordo superiore della finestra.
  const [verticalPosition, setVerticalPosition] = useState<"top" | "bottom">("top");

  // ID univoco per accessibilità (aria-describedby)
  const tooltipId = useId();

  // Timestamp dell'ultimo evento focus per evitare che il tap su mobile
  // (che invia sequenzialmente touchstart -> focus -> click) chiuda immediatamente il tooltip
  const lastFocusTime = useRef(0);

  // Ref al box del tooltip per leggerne le dimensioni e la posizione nel DOM
  const tooltipRef = useRef<HTMLDivElement>(null);
  // Ref al contenitore wrapper per calcolare la sua posizione nella finestra
  const wrapperRef = useRef<HTMLSpanElement>(null);

  // Calcola la posizione orizzontale e verticale in modo deterministico rispetto alla viewport
  const updatePosition = useCallback(() => {
    if (!tooltipRef.current || !wrapperRef.current) return;

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    const triggerCenter = wrapperRect.left + wrapperRect.width / 2;
    const halfTooltipWidth = tooltipRect.width / 2;

    // Se centrato supererebbe il bordo destro della finestra → allinealo a destra del trigger
    if (triggerCenter + halfTooltipWidth > viewportWidth - 16) {
      setPosition("left");
    }
    // Se centrato supererebbe il bordo sinistro della finestra → allinealo a sinistra del trigger
    else if (triggerCenter - halfTooltipWidth < 16) {
      setPosition("right");
    }
    // Altrimenti mantieni la posizione centrata
    else {
      setPosition("center");
    }

    // Se non c'è abbastanza spazio sopra (considerando l'altezza della navbar di ~61px),
    // apri il tooltip verso il basso
    const spaceAbove = wrapperRect.top;
    const tooltipHeight = tooltipRect.height;
    if (spaceAbove - tooltipHeight - 12 < 65) {
      setVerticalPosition("bottom");
    } else {
      setVerticalPosition("top");
    }
  }, []);

  // Aggiorna la posizione quando diventa visibile e gestisce resize/scroll/click outside
  useEffect(() => {
    if (!isVisible) return;

    updatePosition();

    const handleResizeOrScroll = () => {
      updatePosition();
    };

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    window.addEventListener("resize", handleResizeOrScroll);
    window.addEventListener("scroll", handleResizeOrScroll, true);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll, true);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isVisible, updatePosition]);

  // Mappa di classi Tailwind per il posizionamento orizzontale.
  const positionClasses = {
    center: "left-1/2 -translate-x-1/2",
    left: "right-0 translate-x-0",
    right: "left-0 translate-x-0",
  };

  // Mappa di classi Tailwind per il posizionamento verticale.
  const verticalClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
  };

  // Classi per la freccina triangolare.
  const arrowHorizontalClasses = {
    center: "left-1/2 -translate-x-1/2",
    left: "right-4 translate-x-0",
    right: "left-4 translate-x-0",
  };

  const handleFocus = () => {
    lastFocusTime.current = Date.now();
    updatePosition();
    setIsVisible(true);
  };

  const handleTriggerClick = () => {
    // Se il focus è appena avvenuto (es. tap su touchscreen), non chiuderlo
    if (Date.now() - lastFocusTime.current < 300) {
      setIsVisible(true);
      return;
    }
    setIsVisible((prev) => !prev);
  };

  return (
    // `inline-block relative` → il wrapper è inline e serve da ancoraggio
    <span
      ref={wrapperRef}
      className="relative inline-block"
      onMouseEnter={() => {
        updatePosition();
        setIsVisible(true);
      }}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={handleFocus}
      onBlur={() => setIsVisible(false)}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setIsVisible(false);
        }
      }}
    >
      {/* ── CONTENUTO TRIGGER ── */}
      <span
        tabIndex={0}
        aria-describedby={isVisible ? tooltipId : undefined}
        onClick={handleTriggerClick}
        className="border-b border-dashed border-current/70 hover:border-current cursor-help outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-xs transition-colors"
      >
        {children}
      </span>

      {/* ── BOX DEL TOOLTIP ── */}
      <div
        ref={tooltipRef}
        id={tooltipId}
        role="tooltip"
        className={`
          not-prose
          absolute z-50
          w-max max-w-[calc(100vw-2rem)] sm:max-w-xs
          ${verticalClasses[verticalPosition]}
          ${positionClasses[position]}
          ${isVisible
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : verticalPosition === "top"
              ? "opacity-0 translate-y-1 pointer-events-none"
              : "opacity-0 -translate-y-1 pointer-events-none"
          }
          transition-[opacity,transform] duration-200 ease-out
        `}
      >
        {/* Testo del tooltip */}
        <div className="
          bg-gray-900 dark:bg-gray-100
          text-gray-100 dark:text-gray-900
          text-xs font-normal leading-snug
          px-3 py-2 rounded-lg shadow-lg
          max-w-xs break-words
        ">
          {text}
        </div>

        {/* Freccina triangolare: punta verso il basso se top, punta verso l'alto se bottom */}
        <div
          className={`
            absolute ${arrowHorizontalClasses[position]}
            border-4 border-transparent
            ${verticalPosition === "top"
              ? "top-full border-t-gray-900 dark:border-t-gray-100"
              : "bottom-full border-b-gray-900 dark:border-b-gray-100"
            }
          `}
        />
      </div>
    </span>
  );
}
