import React, { useState } from 'react';
import { CustomDeal } from '../../types';
import {
  X,
  Sparkles,
  Flame,
  Tag,
  Percent,
  Calendar,
  Image as ImageIcon,
  Zap,
  CheckCircle2,
  Gift,
  Plus,
  UploadCloud,
  Loader2
} from 'lucide-react';
import { uploadCmsAsset } from '../../lib/storageService';

interface AdminAddDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDeal: (dealData: Partial<CustomDeal>) => Promise<void> | void;
  initialDeal?: CustomDeal | null;
}

const PRESET_CATEGORIES = [
  'Fruits & Vegetables',
  'Dairy & Eggs',
  'Atta, Rice & Dal',
  'Oil & Ghee',
  'Masala & Spices',
  'Snacks & Namkeen',
  'Biscuits & Bakery',
  'Beverages',
  'Breakfast & Cereals',
  'Instant Food',
  'Household Cleaning',
  'Personal Care',
  'All Store Specials'
];

const GRADIENT_PRESETS = [
  { name: 'Emerald Farm', value: 'from-emerald-600 via-teal-500 to-green-600', preview: 'bg-gradient-to-r from-emerald-600 to-green-600' },
  { name: 'Royal Blue', value: 'from-blue-600 via-sky-500 to-indigo-600', preview: 'bg-gradient-to-r from-blue-600 to-indigo-600' },
  { name: 'Golden Harvest', value: 'from-amber-600 via-orange-500 to-yellow-600', preview: 'bg-gradient-to-r from-amber-600 to-yellow-600' },
  { name: 'Sunset Crimson', value: 'from-rose-600 via-red-500 to-amber-600', preview: 'bg-gradient-to-r from-rose-600 to-amber-600' },
  { name: 'Midnight Purple', value: 'from-purple-600 via-fuchsia-500 to-pink-600', preview: 'bg-gradient-to-r from-purple-600 to-pink-600' },
  { name: 'Teal Ocean', value: 'from-cyan-600 via-blue-500 to-teal-600', preview: 'bg-gradient-to-r from-cyan-600 to-teal-600' },
  { name: 'Cyber Dark', value: 'from-slate-900 via-slate-800 to-emerald-900', preview: 'bg-gradient-to-r from-slate-900 to-emerald-900' }
];

const PRESET_DEAL_TEMPLATES = [
  {
    title: 'Farm Fresh Organic Harvest Mela',
    category: 'Fruits & Vegetables',
    icon: '🥦',
    badge: "40% OFF TODAY'S DEAL",
    description: 'Flat 40% OFF on fresh farm picked tomatoes, potatoes, onions, exotic veggies and seasonal fruits!',
    discountPercent: 40,
    gradient: 'from-emerald-600 via-teal-500 to-green-600',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Morning Dairy, Milk & Fresh Paneer Fest',
    category: 'Dairy & Eggs',
    icon: '🥛',
    badge: "30% OFF TODAY'S DEAL",
    description: 'Special Daily Offer: Flat 30% OFF on Fresh Amul Milk, Malai Paneer, Butter, Curd & Bakery items!',
    discountPercent: 30,
    gradient: 'from-blue-600 via-sky-500 to-indigo-600',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Pantry Essential Atta, Basmati & Dals',
    category: 'Atta, Rice & Dal',
    icon: '🌾',
    badge: "35% OFF SUPER SAVER",
    description: 'Mega Wholesale Discounts on 5kg/10kg Chakki Atta, Premium Aged Basmati Rice, and Unpolished Dals!',
    discountPercent: 35,
    gradient: 'from-amber-600 via-orange-500 to-yellow-600',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Pure Desi Ghee & Healthy Edible Oils',
    category: 'Oil & Ghee',
    icon: '🛢️',
    badge: "25% OFF MEGA DEAL",
    description: 'Pure Vedic Cow Bilona Ghee, Mustard Oil, Refined Sunflower Oils with authentic purity guarantee!',
    discountPercent: 25,
    gradient: 'from-yellow-600 via-amber-500 to-orange-600',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Midnight Munchies & Cold Drinks Flash Sale',
    category: 'Snacks & Namkeen',
    icon: '🥤',
    badge: "⚡ 50% FLASH SALE",
    description: 'Late night cravings sorted! Flat 50% OFF on chips, namkeen, chocolates, ice creams & chilled beverages!',
    discountPercent: 50,
    gradient: 'from-purple-600 via-fuchsia-500 to-pink-600',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=800'
  }
];

export const AdminAddDealModal: React.FC<AdminAddDealModalProps> = ({
  isOpen,
  onClose,
  onSaveDeal,
  initialDeal
}) => {
  const [title, setTitle] = useState(initialDeal?.title || '');
  const [category, setCategory] = useState(initialDeal?.category || PRESET_CATEGORIES[0]);
  const [icon, setIcon] = useState(initialDeal?.icon || '🔥');
  const [badge, setBadge] = useState(initialDeal?.badge || "30% OFF TODAY'S DEAL");
  const [description, setDescription] = useState(initialDeal?.description || '');
  const [discountPercent, setDiscountPercent] = useState<number>(initialDeal?.discountPercent || 30);
  const [gradient, setGradient] = useState(initialDeal?.gradient || GRADIENT_PRESETS[0].value);
  const [image, setImage] = useState(initialDeal?.image || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=800');
  const [isActive, setIsActive] = useState(initialDeal?.isActive !== undefined ? initialDeal.isActive : true);
  const [isFlashSale, setIsFlashSale] = useState(initialDeal?.isFlashSale || false);
  const [expiryHours, setExpiryHours] = useState<number>(24);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl: typeof PRESET_DEAL_TEMPLATES[0]) => {
    setTitle(tpl.title);
    setCategory(tpl.category);
    setIcon(tpl.icon);
    setBadge(tpl.badge);
    setDescription(tpl.description);
    setDiscountPercent(tpl.discountPercent);
    setGradient(tpl.gradient);
    setImage(tpl.image);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || discountPercent <= 0) return;

    setIsSubmitting(true);
    try {
      const dealPayload: Partial<CustomDeal> = {
        id: initialDeal?.id || `deal-${Date.now()}`,
        title,
        category,
        categoryAliases: [category],
        icon,
        badge,
        description: description || `Special Deal: ${discountPercent}% OFF on ${category}!`,
        discountPercent: Number(discountPercent),
        gradient,
        image,
        isActive,
        isFlashSale,
        expiryDate: new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString(),
        createdAt: initialDeal?.createdAt || new Date().toISOString()
      };

      await onSaveDeal(dealPayload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="admin-add-deal-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {initialDeal ? 'Edit Deal / Flash Sale' : 'Create New Deal / Flash Sale'}
              </h3>
              <p className="text-xs text-slate-400">
                Launch instant store offers, category discounts, and hero carousel banners
              </p>
            </div>
          </div>
          <button
            id="close-add-deal-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Quick Presets / Templates */}
          {!initialDeal && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Preset Deal Templates</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_DEAL_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="p-2.5 text-left rounded-xl bg-slate-800/80 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-500/40 transition-all text-xs group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-slate-200 group-hover:text-amber-300 truncate">
                      <span>{tpl.icon}</span>
                      <span className="truncate">{tpl.category}</span>
                    </div>
                    <div className="text-[10px] text-amber-400 font-semibold mt-0.5">{tpl.discountPercent}% OFF</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Preview Card */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Live Banner Preview (How Customers See It)
            </label>
            <div className={`p-4 rounded-2xl bg-gradient-to-r ${gradient} text-white shadow-lg relative overflow-hidden border border-white/10`}>
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="space-y-1 max-w-[70%]">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-black/40 backdrop-blur-md text-amber-300 border border-amber-300/30">
                    <span>{icon}</span> {badge || "TODAY'S DEAL"}
                  </span>
                  <h4 className="text-sm sm:text-base font-black leading-tight text-white drop-shadow-sm">
                    {title || 'Deal Headline Goes Here'}
                  </h4>
                  <p className="text-[11px] text-white/90 line-clamp-2">
                    {description || 'Deal description will be shown here...'}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/20 shrink-0 bg-white/10 shadow-md">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>

          {/* Deal Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Title */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Deal Title / Campaign Name *
              </label>
              <input
                id="deal-title-input"
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Weekend Mega Dairy Harvest / Diwali Dhamaka 40% OFF"
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Target Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Target Category *
              </label>
              <select
                id="deal-category-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
              >
                {PRESET_CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Discount Percentage */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Discount Percentage (%) *</span>
                <span className="text-amber-400 font-bold">{discountPercent}% OFF</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  id="deal-discount-range"
                  type="range"
                  min="5"
                  max="70"
                  step="5"
                  value={discountPercent}
                  onChange={e => setDiscountPercent(Number(e.target.value))}
                  className="flex-1 accent-amber-500 cursor-pointer"
                />
                <input
                  id="deal-discount-number"
                  type="number"
                  min="5"
                  max="90"
                  value={discountPercent}
                  onChange={e => setDiscountPercent(Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-sm text-center text-amber-400 font-black focus:outline-none"
                />
              </div>
            </div>

            {/* Badge Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Badge / Tag Text
              </label>
              <input
                id="deal-badge-input"
                type="text"
                value={badge}
                onChange={e => setBadge(e.target.value)}
                placeholder="e.g. 30% OFF TODAY'S DEAL / ⚡ FLASH SALE"
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Icon / Emoji */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Icon / Emoji
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="deal-icon-input"
                  type="text"
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                  className="w-16 px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-base text-center text-white focus:outline-none focus:border-amber-500"
                />
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-base">
                  {['🔥', '⚡', '🥛', '🥦', '🌾', '🛢️', '🥤', '🧹', '🍫', '💥', '✨'].map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setIcon(em)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm cursor-pointer"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Deal Description / Subtitle
              </label>
              <textarea
                id="deal-desc-input"
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Detailed description of the offer, savings, and eligible items..."
                className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
              />
            </div>

            {/* Image URL & Cloud Upload */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Banner Image (Firebase Cloud Storage / Direct URL)</span>
                <span className="text-[11px] text-amber-400 font-medium">Cloud Synced</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="deal-image-input"
                  type="url"
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/... or upload from device"
                  className="flex-1 px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs cursor-pointer transition-colors shrink-0">
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const url = await uploadCmsAsset(file, 'deals');
                          setImage(url);
                        } catch (err) {
                          console.error('Storage upload error:', err);
                        }
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Gradient Theme Selector */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Gradient Color Palette
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GRADIENT_PRESETS.map((g, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setGradient(g.value)}
                    className={`p-2 rounded-xl flex items-center gap-2 border transition-all text-xs cursor-pointer ${
                      gradient === g.value
                        ? 'border-amber-400 bg-slate-800 text-white font-bold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full shrink-0 ${g.preview}`} />
                    <span className="truncate text-[11px]">{g.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration / Expiry */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Offer Duration</span>
              </label>
              <select
                id="deal-expiry-select"
                value={expiryHours}
                onChange={e => setExpiryHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value={12}>12 Hours (Today Midnight)</option>
                <option value={24}>24 Hours (Full 1 Day Deal)</option>
                <option value={48}>48 Hours (2 Days Weekend Special)</option>
                <option value={168}>7 Days (Weekly Super Saver)</option>
                <option value={720}>30 Days (Monthly Festival Mela)</option>
              </select>
            </div>

            {/* Active & Flash Sale Toggles */}
            <div className="flex flex-col justify-center space-y-2.5 bg-slate-800/40 p-3 rounded-2xl border border-slate-800">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-slate-200">Activate Deal Immediately</span>
                <input
                  id="deal-is-active-toggle"
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Highlight as Flash Sale</span>
                </span>
                <input
                  id="deal-is-flash-toggle"
                  type="checkbox"
                  checked={isFlashSale}
                  onChange={e => setIsFlashSale(e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                />
              </label>
            </div>

          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-deal-submit-btn"
              type="submit"
              disabled={isSubmitting || !title}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Publishing Deal...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{initialDeal ? 'Update Deal' : 'Publish Deal to Store'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
