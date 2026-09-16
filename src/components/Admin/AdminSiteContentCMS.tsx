import React, { useState } from 'react';
import { SiteContentConfig } from '../../types';
import { DEFAULT_SITE_CONTENT } from '../../data/initialData';
import {
  Type,
  Sparkles,
  Save,
  RotateCcw,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Store,
  UtensilsCrossed,
  BookOpen,
  Layout,
  Globe,
  Sliders,
  Phone,
  Mail,
  Zap,
  ShoppingBag,
  Flame,
  Download,
  Upload,
  Layers,
  ArrowRight,
  Eye
} from 'lucide-react';

interface AdminSiteContentCMSProps {
  contentConfig: SiteContentConfig;
  onSaveContent: (newContent: SiteContentConfig) => void;
  onResetToDefault?: () => void;
}

export const AdminSiteContentCMS: React.FC<AdminSiteContentCMSProps> = ({
  contentConfig,
  onSaveContent,
  onResetToDefault
}) => {
  const [formData, setFormData] = useState<SiteContentConfig>({ ...contentConfig });
  const [activeSection, setActiveSection] = useState<
    'global' | 'grocery' | 'restaurant' | 'stationery' | 'actions' | 'custom'
  >('global');

  // Custom text override temporary inputs
  const [customKey, setCustomKey] = useState('');
  const [customVal, setCustomVal] = useState('');
  const [customSearchQuery, setCustomSearchQuery] = useState('');
  const [savedSuccessNotice, setSavedSuccessNotice] = useState(false);
  const [confirmResetAll, setConfirmResetAll] = useState(false);

  // Field Updater
  const updateField = (field: keyof SiteContentConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Single field reset
  const resetSingleField = (field: keyof SiteContentConfig) => {
    setFormData(prev => ({
      ...prev,
      [field]: DEFAULT_SITE_CONTENT[field]
    }));
  };

  // Handle Save
  const handleSave = () => {
    onSaveContent(formData);
    setSavedSuccessNotice(true);
    setTimeout(() => setSavedSuccessNotice(false), 3000);
  };

  // Add custom text override
  const handleAddCustomOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKey.trim() || !customVal.trim()) return;
    setFormData(prev => ({
      ...prev,
      customTextOverrides: {
        ...(prev.customTextOverrides || {}),
        [customKey.trim()]: customVal.trim()
      }
    }));
    setCustomKey('');
    setCustomVal('');
  };

  // Remove custom text override
  const handleRemoveCustomOverride = (keyToRemove: string) => {
    setFormData(prev => {
      const nextOverrides = { ...(prev.customTextOverrides || {}) };
      delete nextOverrides[keyToRemove];
      return {
        ...prev,
        customTextOverrides: nextOverrides
      };
    });
  };

  // Apply Seasonal Presets
  const applyPreset = (presetName: string) => {
    if (presetName === 'festive') {
      setFormData(prev => ({
        ...prev,
        headerTickerText: '🪔 Festive Mega Savings: Flat ₹100 OFF with code BAZLIFESTIVE + 10-Min Express Sweets & Delicacies!',
        groceryExploreCategoriesTitle: '✨ Festive Mandi & Celebration Specials',
        groceryHeroHeadline: 'All Your Celebration Needs,',
        groceryHeroHeadlineHighlight: 'Delivered Fresh To Your Doorstep in 10 Mins!',
        groceryHeroSubheadline: 'Pure Desi Ghee, Dry Fruits, Fresh Mithai & Celebration essentials with live bargaining discounts.',
        restaurantSectionTitle: 'Festive Feast & Family Dining Kitchens',
        restaurantHeroSubtitle: 'Authentic royal biryanis, sweets & party platters prepared fresh by top masterchefs.'
      }));
    } else if (presetName === 'monsoon') {
      setFormData(prev => ({
        ...prev,
        headerTickerText: '🌧️ Monsoon Comforts: Hot Chai, Crispy Pakodas, Samosas & Fresh Mandi Veggies in 10 Mins!',
        groceryExploreCategoriesTitle: '🥦 Rain-Fresh Farm Mandi Veggies',
        groceryHeroHeadline: 'Warm Snacks & Daily Mandi,',
        groceryHeroHeadlineHighlight: 'Rain or Shine in 10 Mins.',
        groceryBargainTitle: '🌧️ Monsoon Mandi Bargaining Ticker'
      }));
    } else if (presetName === 'exam') {
      setFormData(prev => ({
        ...prev,
        headerTickerText: '🎓 Exam Sprint Depot: Classmate registers, geometry boxes, gel pens & A4 sheets delivered in 10 mins!',
        stationeryHeroTitle: '📚 Board Exam & Campus Supply Depot',
        stationeryHeroSubtitle: 'Never run out of registers, exam pads, Casio calculators, or blue gel pens before your test.',
        stationeryCategoriesTitle: 'Exam Essentials, Long Registers & Stationery'
      }));
    }
    setSavedSuccessNotice(true);
    setTimeout(() => setSavedSuccessNotice(false), 2500);
  };

  // Export & Import JSON
  const exportConfigJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "bazli-site-content-config.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importConfigJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && typeof parsed === 'object') {
            setFormData(prev => ({ ...prev, ...parsed }));
            setSavedSuccessNotice(true);
            setTimeout(() => setSavedSuccessNotice(false), 2500);
          }
        } catch (err) {
          alert('Invalid JSON file format.');
        }
      };
    }
  };

  const activeOverridesList = Object.entries(formData.customTextOverrides || {}).filter(([k, v]) =>
    String(k).toLowerCase().includes(customSearchQuery.toLowerCase()) ||
    String(v).toLowerCase().includes(customSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Top Banner & Control Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-stone-900 text-white rounded-3xl p-6 sm:p-7 border border-indigo-800/60 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Type className="w-3.5 h-3.5 text-indigo-400" />
              <span>Admin Site-Wide CMS & Content Control</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Site Text, Banners & Headings Manager
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Live manage every portal banner, promo heading, and customer copy in real-time. All updates publish instantly across the platform!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs sm:text-sm transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish Live</span>
            </button>

            {confirmResetAll ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setFormData({ ...DEFAULT_SITE_CONTENT });
                    onResetToDefault?.();
                    setConfirmResetAll(false);
                    setSavedSuccessNotice(true);
                    setTimeout(() => setSavedSuccessNotice(false), 3000);
                  }}
                  className="px-3 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all flex items-center gap-1 cursor-pointer shadow-md"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Confirm Reset?</span>
                </button>
                <button
                  onClick={() => setConfirmResetAll(false)}
                  className="px-2.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setConfirmResetAll(true);
                  setTimeout(() => setConfirmResetAll(false), 5000);
                }}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All</span>
              </button>
            )}
          </div>
        </div>

        {/* Success Alert */}
        {savedSuccessNotice && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Success! Sabhi text changes live website par publish ho gaye hain.</span>
          </div>
        )}
      </div>

      {/* Quick Seasonal Presets Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="font-extrabold text-slate-800">1-Click Campaign Presets:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset('festive')}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold transition-all cursor-pointer"
          >
            🪔 Diwali / Festive Sale
          </button>
          <button
            onClick={() => applyPreset('monsoon')}
            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold transition-all cursor-pointer"
          >
            🌧️ Monsoon Mandi Pack
          </button>
          <button
            onClick={() => applyPreset('exam')}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold transition-all cursor-pointer"
          >
            📚 Student Exam Season
          </button>
          <button
            onClick={exportConfigJson}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1 cursor-pointer"
            title="Export all texts to JSON file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <label className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={importConfigJson} className="hidden" />
          </label>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'global', label: '1. Global & Header Bar', icon: Globe },
          { key: 'grocery', label: '2. Grocery & Mandi Portal', icon: ShoppingBag },
          { key: 'restaurant', label: '3. Hot Restaurant Portal', icon: UtensilsCrossed },
          { key: 'stationery', label: '4. Stationery & Books Portal', icon: BookOpen },
          { key: 'actions', label: '5. Badges, Buttons & Footer', icon: Layout },
          {
            key: 'custom',
            label: `6. Universal Text Replacer (${Object.keys(formData.customTextOverrides || {}).length})`,
            icon: Sliders
          }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================
          SECTION 1: GLOBAL BRANDING & TOP HEADER / TICKER
         ========================================================= */}
      {activeSection === 'global' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Global Header, Ticker & Contact Info</h3>
              <p className="text-xs text-slate-500">Website ke top par dikhne wale brand slogans, announcement bar aur search placeholder</p>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
              Global Header
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Brand Name */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Brand Name</label>
                <button
                  onClick={() => resetSingleField('brandName')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.brandName}
                onChange={e => updateField('brandName', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. BAZLI"
              />
              <p className="text-[11px] text-slate-400">Logo and title displayed on the navbar</p>
            </div>

            {/* Brand Tagline */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Brand Slogan / Tagline</label>
                <button
                  onClick={() => resetSingleField('brandTagline')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.brandTagline}
                onChange={e => updateField('brandTagline', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. 10-Min Hyperlocal Mandi & Express Delivery"
              />
              <p className="text-[11px] text-slate-400">Header tagline under brand logo</p>
            </div>

            {/* Header Announcement Ticker */}
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Top Announcement Ticker Marquee</label>
                <button
                  onClick={() => resetSingleField('headerTickerText')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <textarea
                rows={2}
                value={formData.headerTickerText}
                onChange={e => updateField('headerTickerText', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                placeholder="Announcement bar message..."
              />
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="showTicker"
                  checked={formData.showAnnouncementTicker !== false}
                  onChange={e => updateField('showAnnouncementTicker', e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="showTicker" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Show Top Announcement Bar
                </label>
              </div>
            </div>

            {/* Delivery Time Promise */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Delivery Time Badge Text</label>
                <button
                  onClick={() => resetSingleField('deliveryTimePromise')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.deliveryTimePromise}
                onChange={e => updateField('deliveryTimePromise', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                placeholder="⚡ 10 Mins Delivery"
              />
            </div>

            {/* Search Bar Placeholder */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Universal Search Placeholder</label>
                <button
                  onClick={() => resetSingleField('searchPlaceholder')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.searchPlaceholder}
                onChange={e => updateField('searchPlaceholder', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                placeholder="Search fresh vegetables, dairy..."
              />
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Helpdesk Phone / Helpline</label>
                <button
                  onClick={() => resetSingleField('contactPhone')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={e => updateField('contactPhone', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                placeholder="9871618126"
              />
            </div>

            {/* Contact Email */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Helpdesk Email Address</label>
                <button
                  onClick={() => resetSingleField('contactEmail')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={e => updateField('contactEmail', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                placeholder="sahotraakash3008@gmail.com"
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SECTION 2: GROCERY & MANDI PORTAL HEADINGS & BANNERS
         ========================================================= */}
      {activeSection === 'grocery' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Grocery & Daily Mandi Copy</h3>
              <p className="text-xs text-slate-500">Explore categories heading, hero text, bargaining banner aur daily deals headline</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Grocery Portal
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Explore Categories Heading (Explicitly requested by user) */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-black text-[10px] uppercase">
                    ⭐ User Spotlight
                  </span>
                  <label className="text-xs font-black text-slate-900">
                    "Explore Categories" Section Title
                  </label>
                </div>
                <button
                  onClick={() => resetSingleField('groceryExploreCategoriesTitle')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.groceryExploreCategoriesTitle}
                onChange={e => updateField('groceryExploreCategoriesTitle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-sm font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                placeholder="e.g. Explore Categories or Mandi Fresh Categories"
              />
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Categories Subtitle / Tag</label>
                <input
                  type="text"
                  value={formData.groceryExploreCategoriesSubtitle}
                  onChange={e => updateField('groceryExploreCategoriesSubtitle', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800"
                  placeholder="Fresh Farm Produce, Dairy, Ration & Daily Essentials"
                />
              </div>
            </div>

            {/* Hero Main Heading Line 1 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Hero Main Title (Line 1)</label>
                <button
                  onClick={() => resetSingleField('groceryHeroHeadline')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.groceryHeroHeadline}
                onChange={e => updateField('groceryHeroHeadline', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="Your Daily Needs,"
              />
            </div>

            {/* Hero Highlighted Title Line 2 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Hero Highlighted Text (Line 2)</label>
                <button
                  onClick={() => resetSingleField('groceryHeroHeadlineHighlight')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.groceryHeroHeadlineHighlight}
                onChange={e => updateField('groceryHeroHeadlineHighlight', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="Delivered in 10 Mins."
              />
            </div>

            {/* Hero Subheadline */}
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Hero Description Subheadline</label>
                <button
                  onClick={() => resetSingleField('groceryHeroSubheadline')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <textarea
                rows={2}
                value={formData.groceryHeroSubheadline}
                onChange={e => updateField('groceryHeroSubheadline', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="Fresh farm vegetables, dairy, snacks..."
              />
            </div>

            {/* Hero Badge */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Hero Radar Badge Pill</label>
                <button
                  onClick={() => resetSingleField('groceryHeroBadge')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.groceryHeroBadge}
                onChange={e => updateField('groceryHeroBadge', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="LIVE DARKSTORE NETWORK • 10-Min Fast Delivery"
              />
            </div>

            {/* Hero Shop Button Text */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Hero CTA Button 1</label>
                <button
                  onClick={() => resetSingleField('groceryHeroShopButtonText')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.groceryHeroShopButtonText}
                onChange={e => updateField('groceryHeroShopButtonText', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="Shop Groceries ⚡"
              />
            </div>

            {/* Live Bargaining Showcase Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Live Bazli Bargaining Title</label>
                <button
                  onClick={() => resetSingleField('groceryBargainTitle')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.groceryBargainTitle}
                onChange={e => updateField('groceryBargainTitle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="Live Mandi Price Bargaining"
              />
            </div>

            {/* Live Bargaining Subtitle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Live Bargaining Subtitle</label>
                <button
                  onClick={() => resetSingleField('groceryBargainSubtitle')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.groceryBargainSubtitle}
                onChange={e => updateField('groceryBargainSubtitle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="Negotiate real-time wholesale discounts directly with our Bazli Mandi bot"
              />
            </div>

            {/* Today's Special Deals Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Today's Deals Banner Title</label>
                <button
                  onClick={() => resetSingleField('groceryTodaysDealsTitle')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.groceryTodaysDealsTitle}
                onChange={e => updateField('groceryTodaysDealsTitle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="Today's Special Category Deals"
              />
            </div>

            {/* Products Shelf Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Products Catalog Shelf Title</label>
                <button
                  onClick={() => resetSingleField('groceryProductsShelfTitle')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.groceryProductsShelfTitle}
                onChange={e => updateField('groceryProductsShelfTitle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="Fresh Mandi Harvest & Kitchen Staples"
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SECTION 3: RESTAURANT & HOT FOOD PORTAL
         ========================================================= */}
      {activeSection === 'restaurant' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Hot Food & Restaurant Portal Copy</h3>
              <p className="text-xs text-slate-500">Restaurant hero banner, kitchen section headings, cuisines bar aur menu titles</p>
            </div>
            <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full">
              Restaurant Portal
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Restaurant Portal Hero Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Restaurant Hero Title</label>
                <button
                  onClick={() => resetSingleField('restaurantHeroTitle')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.restaurantHeroTitle}
                onChange={e => updateField('restaurantHeroTitle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="Hot Food & Top Rated Kitchens"
              />
            </div>

            {/* Restaurant Section Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Restaurant Kitchens Section Title</label>
                <button
                  onClick={() => resetSingleField('restaurantSectionTitle')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.restaurantSectionTitle}
                onChange={e => updateField('restaurantSectionTitle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="Top Rated Restaurant Kitchens"
              />
            </div>

            {/* Restaurant Hero Subtitle */}
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Restaurant Hero Subtitle</label>
                <button
                  onClick={() => resetSingleField('restaurantHeroSubtitle')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <textarea
                rows={2}
                value={formData.restaurantHeroSubtitle}
                onChange={e => updateField('restaurantHeroSubtitle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="Authentic dum biryani, cheesy pizzas..."
              />
            </div>

            {/* Restaurant Search Placeholder */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Food Search Placeholder</label>
                <button
                  onClick={() => resetSingleField('restaurantSearchPlaceholder')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.restaurantSearchPlaceholder}
                onChange={e => updateField('restaurantSearchPlaceholder', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="Search biryani, pizza, paneer..."
              />
            </div>

            {/* Restaurant Cuisines Bar Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Cuisines Filter Bar Heading</label>
                <button
                  onClick={() => resetSingleField('restaurantCuisinesTitle')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.restaurantCuisinesTitle}
                onChange={e => updateField('restaurantCuisinesTitle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="Popular Food Cuisines"
              />
            </div>

            {/* Restaurant Menu Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Restaurant Menu Section Heading</label>
                <button
                  onClick={() => resetSingleField('restaurantMenuTitle')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.restaurantMenuTitle}
                onChange={e => updateField('restaurantMenuTitle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="Signature Kitchen Menu"
              />
            </div>

            {/* Restaurant Live Kitchen Badge */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Live Kitchen Badge Tag</label>
                <button
                  onClick={() => resetSingleField('restaurantLiveKitchenBadge')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.restaurantLiveKitchenBadge}
                onChange={e => updateField('restaurantLiveKitchenBadge', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="🔥 Live Cooking"
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SECTION 4: STATIONERY & BOOKS PORTAL
         ========================================================= */}
      {activeSection === 'stationery' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Stationery & Book Depot Copy</h3>
              <p className="text-xs text-slate-500">Book depot hero banner, categories title, verified stationery stores heading</p>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
              Stationery Portal
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Stationery Hero Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Stationery Hero Title</label>
                <button
                  onClick={() => resetSingleField('stationeryHeroTitle')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.stationeryHeroTitle}
                onChange={e => updateField('stationeryHeroTitle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="Stationery, Books & Office Depot"
              />
            </div>

            {/* Stationery Categories Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Stationery Categories Heading</label>
                <button
                  onClick={() => resetSingleField('stationeryCategoriesTitle')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.stationeryCategoriesTitle}
                onChange={e => updateField('stationeryCategoriesTitle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="Stationery & Books Categories"
              />
            </div>

            {/* Stationery Hero Subtitle */}
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Stationery Hero Subtitle</label>
                <button
                  onClick={() => resetSingleField('stationeryHeroSubtitle')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <textarea
                rows={2}
                value={formData.stationeryHeroSubtitle}
                onChange={e => updateField('stationeryHeroSubtitle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="Registers, pens, exam kits, A4 paper reams..."
              />
            </div>

            {/* Verified Stores Heading */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Verified Stores Section Heading</label>
                <button
                  onClick={() => resetSingleField('stationeryShopsTitle')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.stationeryShopsTitle}
                onChange={e => updateField('stationeryShopsTitle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="Local Verified Stationery Stores"
              />
            </div>

            {/* Stationery Products Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Stationery Catalog Title</label>
                <button
                  onClick={() => resetSingleField('stationeryProductsTitle')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.stationeryProductsTitle}
                onChange={e => updateField('stationeryProductsTitle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="All Stationery & Office Supplies"
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SECTION 5: ACTION BUTTONS, BADGES & FOOTER CARDS
         ========================================================= */}
      {activeSection === 'actions' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Action Buttons, Badges & Footer Cards</h3>
              <p className="text-xs text-slate-500">Cart & bargain button labels, threshold notifications aur footer guarantees</p>
            </div>
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
              Global UI
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Bargain Button Text */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Bargain Button Label</label>
                <button
                  onClick={() => resetSingleField('bargainButtonText')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.bargainButtonText}
                onChange={e => updateField('bargainButtonText', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 font-bold"
                placeholder="Bargain Price"
              />
            </div>

            {/* Add to Cart Button Text */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Add to Cart Button Label</label>
                <button
                  onClick={() => resetSingleField('addToCartButtonText')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.addToCartButtonText}
                onChange={e => updateField('addToCartButtonText', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 font-bold"
                placeholder="ADD"
              />
            </div>

            {/* Free Delivery Threshold Text */}
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Free Delivery Threshold Banner Notice</label>
                <button
                  onClick={() => resetSingleField('freeDeliveryThresholdText')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.freeDeliveryThresholdText}
                onChange={e => updateField('freeDeliveryThresholdText', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="Free Delivery on orders above ₹79"
              />
            </div>

            {/* Footer Card 2: Fresh & Verified Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Footer Verified Title</label>
                <button
                  onClick={() => resetSingleField('footerVerifiedTitle')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.footerVerifiedTitle}
                onChange={e => updateField('footerVerifiedTitle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="Fresh & Verified"
              />
            </div>

            {/* Footer Card 2: Fresh & Verified Subtext */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">Footer Verified Description</label>
                <button
                  onClick={() => resetSingleField('footerVerifiedText')}
                  className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <input
                type="text"
                value={formData.footerVerifiedText}
                onChange={e => updateField('footerVerifiedText', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                placeholder="100% genuine local stores, dark stores..."
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SECTION 6: UNIVERSAL CUSTOM TEXT REPLACER (ANY PHRASE)
         ========================================================= */}
      {activeSection === 'custom' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Universal Text & String Overrider</h3>
              <p className="text-xs text-slate-500">
                Replace any word, phrase, or headline across the entire website instantly with your custom text!
              </p>
            </div>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
              Dynamic String Mapper
            </span>
          </div>

          {/* Add New String Override Box */}
          <form onSubmit={handleAddCustomOverride} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Add Custom Text Replacement</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Original Text currently on website (Exact Match or Keyword):
                </label>
                <input
                  type="text"
                  value={customKey}
                  onChange={e => setCustomKey(e.target.value)}
                  placeholder="e.g. Return to Shopping or Flat 30% OFF"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  New Replacement Text to display:
                </label>
                <input
                  type="text"
                  value={customVal}
                  onChange={e => setCustomVal(e.target.value)}
                  placeholder="e.g. Continue Bazaar Shopping or Mega Savings 40% OFF"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Replacement Rule</span>
              </button>
            </div>
          </form>

          {/* Search Active Overrides */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-800">
                Active Custom Text Replacements ({Object.keys(formData.customTextOverrides || {}).length})
              </h4>
              <div className="relative w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customSearchQuery}
                  onChange={e => setCustomSearchQuery(e.target.value)}
                  placeholder="Filter replacements..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            {activeOverridesList.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 font-medium">
                  No active text replacements. Use the form above to specify any text and its live replacement.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {activeOverridesList.map(([key, val]) => (
                  <div key={key} className="p-3.5 bg-white flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] truncate max-w-[200px]">
                          "{key}"
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] truncate">
                          "{val}"
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveCustomOverride(key)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer transition-colors shrink-0"
                      title="Delete this replacement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Bottom Save Action Bar */}
      <div className="sticky bottom-4 z-20 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Eye className="w-4 h-4 text-emerald-400" />
          <span>Save karne par sabhi changes live store par turant dikhenge.</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All Text Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
