import React, { useState, useEffect, useRef } from 'react';
import { Palette, Check, RotateCcw, Sparkles, X, Crown, Flame, ArrowLeft } from 'lucide-react';
import {
  SiteTheme,
  PRESET_THEMES,
  DEFAULT_THEME,
  getSavedTheme,
  saveTheme,
  applyThemeToDocument,
  generateThemeFromHex
} from '../utils/themeUtils';

interface ColorRingPickerProps {
  currentTheme?: SiteTheme;
  onThemeChange?: (theme: SiteTheme) => void;
}

export const ColorRingPicker: React.FC<ColorRingPickerProps> = ({
  currentTheme: propTheme,
  onThemeChange
}) => {
  const [theme, setTheme] = useState<SiteTheme>(propTheme || DEFAULT_THEME);
  const [isOpen, setIsOpen] = useState(false);
  const [customHex, setCustomHex] = useState(theme.primary);
  const [activeTab, setActiveTab] = useState<'all' | 'luxury' | 'vibrant'>('all');
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Initialize from saved theme
  useEffect(() => {
    const saved = getSavedTheme();
    setTheme(saved);
    setCustomHex(saved.primary);
    applyThemeToDocument(saved);
    if (onThemeChange) {
      onThemeChange(saved);
    }
  }, []);

  // Sync if propTheme changes
  useEffect(() => {
    if (propTheme) {
      setTheme(propTheme);
      setCustomHex(propTheme.primary);
    }
  }, [propTheme]);

  // Click outside listener to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectTheme = (selected: SiteTheme) => {
    setTheme(selected);
    setCustomHex(selected.primary);
    saveTheme(selected);
    applyThemeToDocument(selected);
    if (onThemeChange) {
      onThemeChange(selected);
    }
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setCustomHex(hex);
    const newTheme = generateThemeFromHex(hex);
    setTheme(newTheme);
    saveTheme(newTheme);
    applyThemeToDocument(newTheme);
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  const handleResetToDefault = () => {
    handleSelectTheme(DEFAULT_THEME);
  };

  const visibleThemes = activeTab === 'all'
    ? PRESET_THEMES
    : PRESET_THEMES.filter(t => t.category === activeTab);

  return (
    <div className="relative inline-flex items-center">
      {/* Interactive Rainbow Color Ring Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group p-0.5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer focus:outline-hidden"
        title="Customize Store Theme Color"
        aria-label="Customize Store Theme Color"
      >
        {/* Animated Conic Gradient Rainbow Ring */}
        <div
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full p-[2px] shadow-md transition-transform group-hover:rotate-45"
          style={{
            background: 'conic-gradient(from 0deg, #ef4444, #f59e0b, #10b981, #06b6d4, #2563eb, #8b5cf6, #ec4899, #ef4444)'
          }}
        >
          {/* Inner Circle showing current selected color */}
          <div
            className="w-full h-full rounded-full flex items-center justify-center transition-colors shadow-inner"
            style={{ backgroundColor: theme.primary }}
          >
            <Palette className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-950/80 drop-shadow-xs" />
          </div>
        </div>

        {/* Subtle pulsating status dot */}
        <span
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-950 animate-pulse"
          style={{ backgroundColor: theme.accent }}
        />
      </button>

      {/* Color Palette Centered Modal (English Only, Shiny Luxury Experience) */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
          <div
            ref={modalContentRef}
            className="relative w-full max-w-sm sm:max-w-md bg-slate-900/98 backdrop-blur-2xl border border-slate-700/80 rounded-3xl shadow-2xl p-4 sm:p-5 text-white animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full p-0.5 shadow-md shrink-0"
                  style={{
                    background: 'conic-gradient(from 0deg, #ef4444, #f59e0b, #10b981, #06b6d4, #2563eb, #8b5cf6, #ec4899, #ef4444)'
                  }}
                >
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center shadow-inner"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <Palette className="w-4 h-4 text-slate-950 font-black" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 leading-tight">
                    Store Theme & Color Palette
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Select a luxury scheme to style all portals & storefronts
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700/80 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                title="Back to store"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
                <span>Back</span>
              </button>
            </div>

            {/* Live Theme Preview Pill */}
            <div className="mt-3 px-3 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Palette:</span>
                <span
                  className="w-4 h-4 rounded-full border border-white/30 inline-block shadow-xs"
                  style={{ backgroundColor: theme.headerBg }}
                  title="Header & Navigation Shade"
                />
                <span
                  className="w-4 h-4 rounded-full border border-white/30 inline-block shadow-xs"
                  style={{ backgroundColor: theme.primary }}
                  title="Primary Accent & Button Shade"
                />
              </div>
              <span className="text-[11px] font-extrabold truncate max-w-[170px]" style={{ color: theme.primary }}>
                {theme.name}
              </span>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 mt-3.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] font-bold">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1 px-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Themes ({PRESET_THEMES.length})
              </button>
              <button
                onClick={() => setActiveTab('luxury')}
                className={`flex-1 py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'luxury'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Luxury & Metal</span>
              </button>
              <button
                onClick={() => setActiveTab('vibrant')}
                className={`flex-1 py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'vibrant'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flame className="w-3 h-3 text-cyan-400" />
                <span>Vibrant</span>
              </button>
            </div>

            {/* Preset Color Swatches Grid */}
            <div className="my-3 max-h-56 overflow-y-auto pr-1">
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                {visibleThemes.map(preset => {
                  const isSelected = !theme.isCustom && theme.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectTheme(preset)}
                      className={`flex flex-col items-center p-2 rounded-2xl transition-all cursor-pointer group relative ${
                        isSelected
                          ? 'bg-slate-800/90 border-2 shadow-lg scale-102 ring-1'
                          : 'hover:bg-slate-800/60 border border-slate-800/70'
                      }`}
                      style={{
                        borderColor: isSelected ? preset.primary : undefined,
                        boxShadow: isSelected ? `0 0 14px ${preset.primary}40` : undefined
                      }}
                    >
                      {/* Ring Swatch with Dual Hue Depth */}
                      <div
                        className="w-9 h-9 rounded-full p-0.5 transition-transform group-hover:scale-105 relative shadow-md"
                        style={{
                          backgroundColor: preset.headerBg,
                          border: `2px solid ${preset.primary}`
                        }}
                      >
                        <div
                          className="w-full h-full rounded-full flex items-center justify-center shadow-inner"
                          style={{ backgroundColor: preset.primary }}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4 text-slate-950 font-black" />
                          )}
                        </div>
                      </div>

                      {/* Theme Name */}
                      <span className="text-[10px] sm:text-[10.5px] font-bold text-slate-200 mt-1.5 truncate max-w-full text-center">
                        {preset.name}
                      </span>

                      {/* English Tag */}
                      <span
                        className="text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full mt-0.5 border"
                        style={{
                          backgroundColor: `${preset.primary}18`,
                          color: preset.accent,
                          borderColor: `${preset.primary}33`
                        }}
                      >
                        {preset.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Interactive Color Spectrum Wheel */}
            <div className="pt-2.5 pb-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Custom Color Wheel & Spectrum
                </span>
                {theme.isCustom && (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                    Custom Active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800">
                <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 border-white/20 shadow-md">
                  <input
                    type="color"
                    value={customHex}
                    onChange={handleCustomColorChange}
                    className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer opacity-100"
                    title="Click to pick any color on the color wheel"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] sm:text-xs font-bold text-slate-200">
                    Interactive Spectrum Ring
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {customHex.toUpperCase()} • Generates custom dark header tint
                  </div>
                </div>
                <span className="text-[10px] text-slate-300 font-bold bg-slate-800 px-2.5 py-1 rounded-xl">
                  Pick Color
                </span>
              </div>
            </div>

            {/* Footer Actions (English Only, No bottom back button - back button is at top only) */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-800 mt-2">
              <button
                onClick={handleResetToDefault}
                className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-amber-400 transition-colors py-1.5 px-2.5 rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default 24K Gold</span>
              </button>

              <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Instant Preview</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
