// Bazli Dynamic Theme & Color Ring Utility

export interface SiteTheme {
  id: string;
  name: string;
  tag: string;
  category: 'luxury' | 'vibrant';
  primary: string; // Main accent (e.g. #f59e0b)
  headerBg: string; // Top navigation bar background (e.g. #09172a)
  accent: string; // Secondary highlight/badge (e.g. #fbbf24)
  light: string; // Soft pastel for tags/active states (e.g. #fef3c7)
  bg: string; // Whole page canvas background (e.g. #f7f3eb)
  isCustom?: boolean;
}

export const PRESET_THEMES: SiteTheme[] = [
  // --- SHINY & LUXURIOUS THEMES ---
  {
    id: 'gold',
    name: '24K Imperial Gold',
    tag: 'Original Luxe',
    category: 'luxury',
    primary: '#f59e0b',
    headerBg: '#09172a',
    accent: '#fbbf24',
    light: '#fef3c7',
    bg: '#f7f3eb'
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold Metallic',
    tag: 'Prestige Metal',
    category: 'luxury',
    primary: '#f43f5e',
    headerBg: '#2a0715',
    accent: '#fb7185',
    light: '#ffe4e6',
    bg: '#fff5f7'
  },
  {
    id: 'platinum',
    name: 'Diamond Platinum',
    tag: 'Ultra Radiant',
    category: 'luxury',
    primary: '#0ea5e9',
    headerBg: '#061a33',
    accent: '#38bdf8',
    light: '#e0f2fe',
    bg: '#f0f9ff'
  },
  {
    id: 'emerald',
    name: 'Royal Emerald',
    tag: 'Gemstone Luxe',
    category: 'luxury',
    primary: '#10b981',
    headerBg: '#04281e',
    accent: '#34d399',
    light: '#d1fae5',
    bg: '#f0fdf4'
  },
  {
    id: 'sapphire',
    name: 'Imperial Sapphire',
    tag: 'Royal Navy',
    category: 'luxury',
    primary: '#3b82f6',
    headerBg: '#081738',
    accent: '#60a5fa',
    light: '#dbeafe',
    bg: '#eff6ff'
  },
  {
    id: 'ruby',
    name: 'Burmese Ruby Crimson',
    tag: 'Lustrous Red',
    category: 'luxury',
    primary: '#e11d48',
    headerBg: '#380614',
    accent: '#fb7185',
    light: '#ffe4e6',
    bg: '#fff1f2'
  },
  {
    id: 'champagne',
    name: 'Champagne Shimmer',
    tag: 'Liquid Gold',
    category: 'luxury',
    primary: '#eab308',
    headerBg: '#2b2003',
    accent: '#fde047',
    light: '#fef9c3',
    bg: '#fefce8'
  },
  {
    id: 'amethyst',
    name: 'Royal Amethyst',
    tag: 'Imperial Violet',
    category: 'luxury',
    primary: '#9333ea',
    headerBg: '#21063d',
    accent: '#c084fc',
    light: '#f3e8ff',
    bg: '#faf5ff'
  },
  {
    id: 'obsidian',
    name: 'Midnight Obsidian',
    tag: 'Stealth Onyx',
    category: 'luxury',
    primary: '#64748b',
    headerBg: '#0b111e',
    accent: '#94a3b8',
    light: '#f1f5f9',
    bg: '#f8fafc'
  },
  {
    id: 'copper-bronze',
    name: 'Burnished Copper Metal',
    tag: 'Liquid Bronze',
    category: 'luxury',
    primary: '#d97706',
    headerBg: '#2a1403',
    accent: '#f59e0b',
    light: '#fef3c7',
    bg: '#fffbf5'
  },
  {
    id: 'peacock-teal',
    name: 'Royal Peacock Sapphire',
    tag: 'Gem Shimmer',
    category: 'luxury',
    primary: '#0284c7',
    headerBg: '#041c2e',
    accent: '#38bdf8',
    light: '#e0f2fe',
    bg: '#f0f9ff'
  },
  {
    id: 'velvet-plum',
    name: 'Imperial Velvet Plum',
    tag: 'Crowned Purple',
    category: 'luxury',
    primary: '#7c3aed',
    headerBg: '#1a0933',
    accent: '#a78bfa',
    light: '#ede9fe',
    bg: '#faf5ff'
  },
  {
    id: 'titanium-silver',
    name: 'Liquid Titanium Mirror',
    tag: 'Chrome Sheen',
    category: 'luxury',
    primary: '#94a3b8',
    headerBg: '#0f172a',
    accent: '#cbd5e1',
    light: '#f1f5f9',
    bg: '#f8fafc'
  },
  {
    id: 'golden-topaz',
    name: 'Honey Topaz Crystal',
    tag: 'Warm Sparkle',
    category: 'luxury',
    primary: '#b45309',
    headerBg: '#241002',
    accent: '#f59e0b',
    light: '#fef3c7',
    bg: '#fefce8'
  },
  // --- VIBRANT & FRESH THEMES ---
  {
    id: 'cyber-cyan',
    name: 'Cyber Neon Cyan',
    tag: 'Electric Glow',
    category: 'vibrant',
    primary: '#06b6d4',
    headerBg: '#04232b',
    accent: '#22d3ee',
    light: '#cffafe',
    bg: '#ecfeff'
  },
  {
    id: 'orange',
    name: 'Sunset Tangerine',
    tag: 'Warm Citrus',
    category: 'vibrant',
    primary: '#f97316',
    headerBg: '#381404',
    accent: '#fb923c',
    light: '#ffedd5',
    bg: '#fff7ed'
  },
  {
    id: 'magenta',
    name: 'Cosmic Magenta',
    tag: 'High Voltage',
    category: 'vibrant',
    primary: '#d946ef',
    headerBg: '#2c0634',
    accent: '#e879f9',
    light: '#fae8ff',
    bg: '#fdf4ff'
  },
  {
    id: 'teal',
    name: 'Aqua Jewel Mint',
    tag: 'Deep Lagoon',
    category: 'vibrant',
    primary: '#0d9488',
    headerBg: '#062b26',
    accent: '#2dd4bf',
    light: '#ccfbf1',
    bg: '#f0fdfa'
  },
  {
    id: 'olive',
    name: 'Tuscan Lime & Olive',
    tag: 'Botanical Gold',
    category: 'vibrant',
    primary: '#84cc16',
    headerBg: '#172a06',
    accent: '#a3e635',
    light: '#ecfccb',
    bg: '#f7fee7'
  }
];

export const DEFAULT_THEME = PRESET_THEMES[0];

const STORAGE_KEY = 'bazli_selected_theme';

// Helper to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16) || 0;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

// Generate dynamic harmonious theme from any user-selected hex color
export function generateThemeFromHex(hex: string): SiteTheme {
  const rgb = hexToRgb(hex);
  
  // Calculate dark header background with same hue (deep dark tinted)
  const darkR = Math.max(6, Math.min(36, Math.round(rgb.r * 0.14)));
  const darkG = Math.max(8, Math.min(38, Math.round(rgb.g * 0.14)));
  const darkB = Math.max(12, Math.min(46, Math.round(rgb.b * 0.14)));
  const headerBg = `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`;

  // Lighter accent
  const accR = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * 0.25));
  const accG = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * 0.25));
  const accB = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * 0.25));
  const accent = `#${accR.toString(16).padStart(2, '0')}${accG.toString(16).padStart(2, '0')}${accB.toString(16).padStart(2, '0')}`;

  // Soft pastel light
  const lightR = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * 0.88));
  const lightG = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * 0.88));
  const lightB = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * 0.88));
  const light = `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`;

  // Very subtle page canvas
  const bgR = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * 0.96));
  const bgG = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * 0.96));
  const bgB = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * 0.96));
  const bg = `#${bgR.toString(16).padStart(2, '0')}${bgG.toString(16).padStart(2, '0')}${bgB.toString(16).padStart(2, '0')}`;

  return {
    id: `custom-${hex.replace('#', '')}`,
    name: `Custom Hue (${hex.toUpperCase()})`,
    tag: 'Custom Spectrum',
    category: 'luxury',
    primary: hex,
    headerBg,
    accent,
    light,
    bg,
    isCustom: true
  };
}

export function getSavedTheme(): SiteTheme {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_THEME;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.primary && parsed.headerBg) {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed reading saved theme', e);
  }
  return DEFAULT_THEME;
}

export function saveTheme(theme: SiteTheme): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  } catch (e) {
    console.warn('Failed storing theme', e);
  }
}

// Injects / updates document CSS variables and dynamic classes across ALL portals
export function applyThemeToDocument(theme: SiteTheme): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty('--bazli-primary', theme.primary);
  root.style.setProperty('--bazli-header-bg', theme.headerBg);
  root.style.setProperty('--bazli-accent', theme.accent);
  root.style.setProperty('--bazli-light', theme.light);
  root.style.setProperty('--bazli-bg', theme.bg);

  const rgb = hexToRgb(theme.primary);
  root.style.setProperty('--bazli-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);

  // Inject or update dynamic style tag for global theme reactivity
  let styleEl = document.getElementById('bazli-theme-styles') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'bazli-theme-styles';
    document.head.appendChild(styleEl);
  }

  // Update dynamic theme CSS rules
  styleEl.textContent = `
    :root {
      --bazli-primary: ${theme.primary};
      --bazli-header-bg: ${theme.headerBg};
      --bazli-accent: ${theme.accent};
      --bazli-light: ${theme.light};
      --bazli-bg: ${theme.bg};
      --bazli-primary-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};
    }

    /* Dynamic header background across all sub-portals */
    header.theme-active-header {
      background-color: ${theme.headerBg} !important;
      border-bottom-color: ${theme.primary}55 !important;
    }

    /* Dynamic accent button overrides */
    .theme-btn-primary {
      background-color: ${theme.primary} !important;
      color: #0b0f19 !important;
    }
    .theme-btn-primary:hover {
      background-color: ${theme.accent} !important;
    }

    /* Dynamic text & borders */
    .theme-text-primary {
      color: ${theme.primary} !important;
    }
    .theme-border-primary {
      border-color: ${theme.primary} !important;
    }

    /* Theme ring glow */
    .theme-ring-glow {
      box-shadow: 0 0 20px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.45);
    }

    ${theme.id !== 'gold' ? `
    /* =========================================================================
       GLOBAL THEME OVERRIDE ACROSS ALL SUB-PORTALS & COMPONENTS
       ========================================================================= */

    /* 1. All Header & Dark Section Backgrounds in Grocery, Restaurant, Stationery & Admin */
    .bg-\\[\\#0a192f\\],
    [class*="bg-[#0a192f]"],
    [class*="bg-[#0f2744]"],
    [class*="bg-[#10243e]"],
    [class*="bg-[#163359]"],
    [class*="bg-[#09172a]"],
    [class*="bg-[#061224]"],
    [class*="bg-[#7a1a0d]"],
    [class*="bg-[#8a1e10]"],
    [class*="bg-[#501007]"],
    [class*="bg-[#6b180a]"],
    [class*="bg-[#2e1065]"],
    [class*="bg-[#3b0764]"],
    [class*="bg-[#1e1b4b]"] {
      background-color: ${theme.headerBg} !important;
    }

    /* 2. All Navy/Dark Text -> User Selected Theme Primary Color */
    .text-\\[\\#0a192f\\],
    [class*="text-[#0a192f]"] {
      color: ${theme.primary} !important;
    }

    /* 3. Dark Section Borders -> Theme Primary Tint Border */
    .border-\\[\\#1e3a5f\\],
    .border-\\[\\#0a192f\\],
    [class*="border-[#1e3a5f]"],
    [class*="border-[#0a192f]"],
    [class*="border-orange-800/60"],
    [class*="border-indigo-900/60"] {
      border-color: ${theme.primary}55 !important;
    }

    /* 4. Dark Section Gradients */
    .from-\\[\\#0a192f\\],
    .from-\\[\\#7a1a0d\\],
    .from-\\[\\#2e1065\\],
    [class*="from-[#0a192f]"],
    [class*="from-[#7a1a0d]"],
    [class*="from-[#2e1065]"] {
      --tw-gradient-from: ${theme.headerBg} var(--tw-gradient-from-position, 0%) !important;
      --tw-gradient-to: ${theme.headerBg} var(--tw-gradient-to-position, 100%) !important;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
    }

    .via-\\[\\#0f2744\\],
    .via-\\[\\#10243e\\],
    .via-\\[\\#8a1e10\\],
    .via-\\[\\#3b0764\\],
    [class*="via-[#0f2744]"],
    [class*="via-[#10243e]"],
    [class*="via-[#8a1e10]"],
    [class*="via-[#3b0764]"] {
      --tw-gradient-to: ${theme.headerBg} var(--tw-gradient-to-position, 100%) !important;
      --tw-gradient-stops: var(--tw-gradient-from), ${theme.primary}33 var(--tw-gradient-via-position, 50%), var(--tw-gradient-to) !important;
    }

    .to-\\[\\#0a192f\\],
    .to-\\[\\#071322\\],
    .to-\\[\\#501007\\],
    .to-\\[\\#1e1b4b\\],
    [class*="to-[#0a192f]"],
    [class*="to-[#071322]"],
    [class*="to-[#501007]"],
    [class*="to-[#1e1b4b]"] {
      --tw-gradient-to: ${theme.headerBg} var(--tw-gradient-to-position, 100%) !important;
    }

    /* 5. Rings */
    .ring-\\[\\#0a192f\\],
    [class*="ring-[#0a192f]"] {
      --tw-ring-color: ${theme.primary} !important;
    }

    /* 6. Hover & Group-Hover States */
    .hover\\:bg-\\[\\#132f54\\]:hover,
    [class*="hover:bg-[#132f54]"]:hover,
    [class*="hover:bg-[#6b180a]"]:hover,
    [class*="hover:bg-[#3b0764]"]:hover {
      background-color: ${theme.primary} !important;
      color: #ffffff !important;
    }

    .hover\\:text-\\[\\#0a192f\\]:hover,
    [class*="hover:text-[#0a192f]"]:hover {
      color: ${theme.primary} !important;
    }

    .group:hover .group-hover\\:text-\\[\\#0a192f\\],
    [class*="group"]:hover [class*="group-hover:text-[#0a192f]"] {
      color: ${theme.primary} !important;
    }
    ` : ''}
  `;
}
