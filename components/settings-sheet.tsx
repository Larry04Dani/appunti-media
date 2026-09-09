"use client";

import * as React from "react";
import { Settings, X } from "lucide-react";

export function SettingsSheet() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // We use standard React state + localStorage for the color theme
  // since next-themes handles light/dark specifically.
  const [colorTheme, setColorTheme] = React.useState("blue");

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const savedTheme = localStorage.getItem("color-theme") || "blue";
    setColorTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const handleColorThemeChange = (newTheme: string) => {
    setColorTheme(newTheme);
    localStorage.setItem("color-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  if (!mounted) return <div className="w-9 h-9" />;

  const colorThemes = [
    { id: "blue", label: "Blue", color: "bg-blue-500" },
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
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-background border-l border-gray-200 dark:border-gray-800 shadow-xl transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-foreground">Impostazioni</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-md hover:bg-primary/10 hover:text-primary transition-colors text-foreground/70"
            aria-label="Chiudi impostazioni"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Sezione Temi Colore */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Tema Colore
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {colorThemes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleColorThemeChange(t.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
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
