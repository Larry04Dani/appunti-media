"use client";

import * as React from "react";
import { Settings, X, Minus, Plus, Type, RotateCcw } from "lucide-react";

const FONT_SIZE_PRESETS = [
  { id: "sm", label: "Piccolo", value: 90 },
  { id: "base", label: "Normale", value: 100 },
  { id: "lg", label: "Grande", value: 115 },
  { id: "xl", label: "Molto grande", value: 130 },
] as const;

const MIN_FONT_SIZE = 80;
const MAX_FONT_SIZE = 140;
const STEP_FONT_SIZE = 5;

function getFontSizeDescription(size: number) {
  if (size < 90) return "Molto compatto";
  if (size < 100) return "Compatto";
  if (size === 100) return "Predefinito (100%)";
  if (size <= 115) return "Grande";
  if (size <= 130) return "Molto grande";
  return "Massimo";
}

export function SettingsSheet() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // We use standard React state + localStorage for the color theme
  // since next-themes handles light/dark specifically.
  const [colorTheme, setColorTheme] = React.useState("blue");
  const [fontSize, setFontSize] = React.useState(100);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const savedTheme = localStorage.getItem("color-theme") || "blue";
    setColorTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    const savedSize = localStorage.getItem("font-size");
    if (savedSize) {
      const parsed = parseInt(savedSize, 10);
      if (!isNaN(parsed) && parsed >= MIN_FONT_SIZE && parsed <= MAX_FONT_SIZE) {
        setFontSize(parsed);
        document.documentElement.style.fontSize = `${parsed}%`;
      }
    }
  }, []);

  const handleColorThemeChange = (newTheme: string) => {
    setColorTheme(newTheme);
    localStorage.setItem("color-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const applyFontSize = (size: number) => {
    const clamped = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, size));
    setFontSize(clamped);
    if (clamped === 100) {
      localStorage.removeItem("font-size");
      document.documentElement.style.fontSize = "";
    } else {
      localStorage.setItem("font-size", String(clamped));
      document.documentElement.style.fontSize = `${clamped}%`;
    }
  };

  const decreaseFontSize = () => applyFontSize(fontSize - STEP_FONT_SIZE);
  const increaseFontSize = () => applyFontSize(fontSize + STEP_FONT_SIZE);
  const resetFontSize = () => applyFontSize(100);

  if (!mounted) return <div className="w-9 h-9" />;

  const colorThemes = [
    { id: "blue", label: "Blue", color: "bg-blue-500" },
    {
      id: "mono",
      label: "Mono",
      color: "bg-[linear-gradient(135deg,#171717_50%,#ffffff_50%)] border border-neutral-400 dark:border-neutral-500",
    },
    { id: "nord", label: "Nord", color: "bg-[#5e81ac]" },
    { id: "rose", label: "Rose", color: "bg-[#d97a96]" },
    { id: "sage", label: "Sage", color: "bg-[#639c76]" },
    { id: "latte", label: "Latte", color: "bg-[#c28851]" },
    { id: "lavender", label: "Lavender", color: "bg-[#9482c9]" },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-md hover:bg-primary/10 hover:text-primary transition-colors text-foreground/70"
        aria-label="Apri impostazioni"
      >
        <Settings className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sheet */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-background border-l border-gray-200 dark:border-gray-800 shadow-xl flex flex-col transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <h2 className="text-lg font-semibold text-foreground">Impostazioni</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-md hover:bg-primary/10 hover:text-primary transition-colors text-foreground/70"
            aria-label="Chiudi impostazioni"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto flex-1">
          {/* Sezione Dimensione Testo */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium text-foreground">
                  Dimensione Testo
                </h3>
              </div>
              {fontSize !== 100 && (
                <button
                  onClick={resetFontSize}
                  className="flex items-center gap-1 text-xs text-foreground/60 hover:text-primary transition-colors cursor-pointer"
                  title="Ripristina dimensione predefinita (100%)"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Ripristina</span>
                </button>
              )}
            </div>

            {/* Stepper principale con - e + */}
            <div className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-foreground/[0.02]">
              <button
                onClick={decreaseFontSize}
                disabled={fontSize <= MIN_FONT_SIZE}
                className="flex items-center justify-center h-9 w-9 rounded-md hover:bg-primary/10 hover:text-primary transition-colors text-foreground disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                aria-label="Riduci dimensione testo"
                title="Riduci dimensione (-5%)"
              >
                <Minus className="h-4 w-4" />
              </button>

              <div className="flex flex-col items-center">
                <span className="text-base font-bold text-foreground">
                  {fontSize}%
                </span>
                <span className="text-[11px] text-foreground/60">
                  {getFontSizeDescription(fontSize)}
                </span>
              </div>

              <button
                onClick={increaseFontSize}
                disabled={fontSize >= MAX_FONT_SIZE}
                className="flex items-center justify-center h-9 w-9 rounded-md hover:bg-primary/10 hover:text-primary transition-colors text-foreground disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                aria-label="Aumenta dimensione testo"
                title="Aumenta dimensione (+5%)"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Preset rapidi */}
            <div className="grid grid-cols-4 gap-1.5">
              {FONT_SIZE_PRESETS.map((preset) => {
                const isActive = fontSize === preset.value;
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyFontSize(preset.value)}
                    className={`py-2 px-1 rounded-md text-xs font-medium border text-center transition-all cursor-pointer ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                        : "border-gray-200 dark:border-gray-800 text-foreground/70 hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    <div>{preset.label}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">
                      {preset.value}%
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Anteprima testo */}
            <div className="p-3 rounded-lg border border-gray-200/80 dark:border-gray-800/80 bg-foreground/[0.02] space-y-1">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-foreground/40 block">
                Anteprima
              </span>
              <p className="text-sm text-foreground/80 leading-relaxed m-0">
                La dimensione del testo influisce sulla leggibilità delle dispense e degli appunti.
              </p>
            </div>
          </div>

          {/* Sezione Temi Colore */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">
              Tema Colore
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {colorThemes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleColorThemeChange(t.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    colorTheme === t.id
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 dark:border-gray-800 hover:border-primary/50"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full mb-2 ${t.color}`} />
                  <span className="text-xs font-medium text-foreground">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
