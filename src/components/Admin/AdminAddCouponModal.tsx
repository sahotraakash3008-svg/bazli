import React, { useState } from 'react';
import { Coupon } from '../../types';
import {
  X,
  Ticket,
  Percent,
  IndianRupee,
  Calendar,
  Sparkles,
  CheckCircle2,
  Tag,
  Users
} from 'lucide-react';

interface AdminAddCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCoupon: (coupon: Coupon) => Promise<void> | void;
  initialCoupon?: Coupon | null;
}

const CATEGORIES = [
  'All Store',
  'Fruits & Vegetables',
  'Dairy & Eggs',
  'Atta, Rice & Dal',
  'Oil & Ghee',
  'Masala & Spices',
  'Snacks & Namkeen',
  'Biscuits & Bakery',
  'Beverages',
  'Household Cleaning',
  'Personal Care'
];

const PRESET_COUPON_TEMPLATES = [
  { code: 'BAZLI50', discountAmount: 50, minOrder: 499, maxDiscount: 50, description: 'Flat ₹50 OFF on orders above ₹499' },
  { code: 'WELCOME100', discountAmount: 100, minOrder: 699, maxDiscount: 100, newCustomersOnly: true, description: 'Flat ₹100 OFF for first time customers on orders above ₹699' },
  { code: 'SUPERBARGAIN', discountPercent: 10, minOrder: 999, maxDiscount: 150, description: 'Get extra 10% OFF up to ₹150 on orders above ₹999' },
  { code: 'HOLI2026', discountAmount: 150, minOrder: 1199, maxDiscount: 150, description: 'Special Festive Discount: Flat ₹150 OFF on orders above ₹1199' },
  { code: 'FREEDELIVERY', discountAmount: 29, minOrder: 199, maxDiscount: 29, description: 'Zero Delivery Fee on minimum order of ₹199' }
];

export const AdminAddCouponModal: React.FC<AdminAddCouponModalProps> = ({
  isOpen,
  onClose,
  onSaveCoupon,
  initialCoupon
}) => {
  const [code, setCode] = useState(initialCoupon?.code || '');
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>(
    initialCoupon?.discountPercent ? 'percent' : 'flat'
  );
  const [discountValue, setDiscountValue] = useState<number>(
    initialCoupon?.discountPercent || initialCoupon?.discountAmount || 50
  );
  const [minOrder, setMinOrder] = useState<number>(initialCoupon?.minOrder || 499);
  const [maxDiscount, setMaxDiscount] = useState<number>(initialCoupon?.maxDiscount || 100);
  const [category, setCategory] = useState<string>(initialCoupon?.applicableCategory || 'All Store');
  const [newCustomersOnly, setNewCustomersOnly] = useState<boolean>(initialCoupon?.newCustomersOnly || false);
  const [expiryDate, setExpiryDate] = useState<string>(
    initialCoupon?.expiryDate || '2026-12-31'
  );
  const [description, setDescription] = useState(initialCoupon?.description || '');
  const [isActive, setIsActive] = useState<boolean>(
    initialCoupon?.isActive !== undefined ? initialCoupon.isActive : true
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleApplyPreset = (tpl: typeof PRESET_COUPON_TEMPLATES[0]) => {
    setCode(tpl.code);
    if ('discountPercent' in tpl && tpl.discountPercent) {
      setDiscountType('percent');
      setDiscountValue(tpl.discountPercent);
    } else if ('discountAmount' in tpl && tpl.discountAmount) {
      setDiscountType('flat');
      setDiscountValue(tpl.discountAmount);
    }
    setMinOrder(tpl.minOrder);
    setMaxDiscount(tpl.maxDiscount);
    setNewCustomersOnly(Boolean(tpl.newCustomersOnly));
    setDescription(tpl.description);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode || discountValue <= 0) return;

    setIsSubmitting(true);
    try {
      const couponData: Coupon = {
        id: initialCoupon?.id || `coup-${Date.now()}`,
        code: cleanCode,
        discountAmount: discountType === 'flat' ? Number(discountValue) : undefined,
        discountPercent: discountType === 'percent' ? Number(discountValue) : undefined,
        minOrder: Number(minOrder),
        maxDiscount: Number(maxDiscount),
        applicableCategory: category === 'All Store' ? undefined : category,
        newCustomersOnly,
        expiryDate,
        description: description || (discountType === 'flat' ? `Flat ₹${discountValue} OFF on orders above ₹${minOrder}` : `${discountValue}% OFF up to ₹${maxDiscount} on orders above ₹${minOrder}`),
        isActive
      };

      await onSaveCoupon(couponData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="admin-add-coupon-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {initialCoupon ? 'Edit Promo Coupon' : 'Create New Promo Coupon'}
              </h3>
              <p className="text-xs text-slate-400">
                Generate store discount codes redeemable at cart checkout
              </p>
            </div>
          </div>
          <button
            id="close-add-coupon-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Quick Presets */}
          {!initialCoupon && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Coupon Presets</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COUPON_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyPreset(tpl)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/40 text-xs font-bold text-slate-200 hover:text-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>🏷️ {tpl.code}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      {'discountAmount' in tpl ? `₹${tpl.discountAmount}` : `${tpl.discountPercent}%`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Coupon Code */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Coupon Code * (Uppercase, e.g. SAVE100)
              </label>
              <input
                id="coupon-code-input"
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. MEGAOFF20 / HOLI2026 / FIRST100"
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm font-black tracking-wider text-emerald-400 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors uppercase"
              />
            </div>

            {/* Discount Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Discount Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDiscountType('flat')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    discountType === 'flat'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>Flat Rupee (₹)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('percent')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    discountType === 'percent'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" />
                  <span>Percentage (%)</span>
                </button>
              </div>
            </div>

            {/* Discount Value */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                {discountType === 'flat' ? 'Discount Amount (₹) *' : 'Discount Percentage (%) *'}
              </label>
              <input
                id="coupon-value-input"
                type="number"
                min="1"
                max={discountType === 'percent' ? 90 : 2000}
                required
                value={discountValue}
                onChange={e => setDiscountValue(Number(e.target.value))}
                placeholder={discountType === 'flat' ? 'e.g. 100' : 'e.g. 15'}
                className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Minimum Order */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Minimum Order Value (₹) *
              </label>
              <input
                id="coupon-min-order-input"
                type="number"
                min="0"
                required
                value={minOrder}
                onChange={e => setMinOrder(Number(e.target.value))}
                placeholder="e.g. 499"
                className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Max Discount Cap */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Max Discount Cap (₹)
              </label>
              <input
                id="coupon-max-discount-input"
                type="number"
                min="1"
                value={maxDiscount}
                onChange={e => setMaxDiscount(Number(e.target.value))}
                placeholder="e.g. 150"
                className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Target Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Eligible Category
              </label>
              <select
                id="coupon-category-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Expiry Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Expiry Date</span>
              </label>
              <input
                id="coupon-expiry-input"
                type="date"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Coupon Description / Display Subtitle
              </label>
              <input
                id="coupon-desc-input"
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Flat ₹100 OFF on your first purchase above ₹699"
                className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Toggles */}
            <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 bg-slate-800/40 p-3 rounded-2xl border border-slate-800">
              <label className="flex-1 flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Active & Usable</span>
                </span>
                <input
                  id="coupon-active-toggle"
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                />
              </label>
              <label className="flex-1 flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>New Customers Only</span>
                </span>
                <input
                  id="coupon-new-cust-toggle"
                  type="checkbox"
                  checked={newCustomersOnly}
                  onChange={e => setNewCustomersOnly(e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                />
              </label>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-coupon-submit-btn"
              type="submit"
              disabled={isSubmitting || !code}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Creating Coupon...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{initialCoupon ? 'Update Coupon' : 'Create & Activate Coupon'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
