import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { X, Package, Tag, IndianRupee, Image, Scale, Trash2, ShieldCheck, Sparkles, Box, CheckCircle2, RotateCcw, RefreshCw, Percent } from 'lucide-react';
import { isWeightAdjustableProduct } from '../../utils/weightUtils';
import { FirebaseImageUploader } from '../Common/FirebaseImageUploader';

interface AdminEditProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onUpdateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  onDeleteProduct?: (productId: string) => Promise<void>;
}

const CATEGORIES = [
  'Atta, Rice & Dal',
  'Oil & Ghee',
  'Masala & Spices',
  'Vegetables & Fruits',
  'Dairy & Bakery',
  'Snacks & Munchies',
  'Beverages & Drinks',
  'Cleaning & Household',
  'Personal Care'
];

export const AdminEditProductModal: React.FC<AdminEditProductModalProps> = ({
  isOpen,
  product,
  onClose,
  onUpdateProduct,
  onDeleteProduct
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [mrp, setMrp] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [image, setImage] = useState('');
  const [bargainDiscountPercent, setBargainDiscountPercent] = useState(20);
  const [bargainingAllowed, setBargainingAllowed] = useState(false);
  const [weightType, setWeightType] = useState<'fixed' | 'flexible'>('fixed');
  const [unitType, setUnitType] = useState<'weight' | 'volume' | 'count'>('weight');
  const [returnPolicy, setReturnPolicy] = useState<'Returnable' | 'Non-Returnable' | 'Exchange-Only' | 'Replacement-Only'>('Returnable');
  const [returnWindowDays, setReturnWindowDays] = useState<number>(2);
  const [refundPolicy, setRefundPolicy] = useState<'Full-Refund' | 'No-Refund' | 'Replacement-Only' | 'Store-Credit-Only'>('Full-Refund');
  const [refundDetails, setRefundDetails] = useState<string>('100% instant refund or replacement upon verification at delivery doorstep.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setQuantity(product.quantity);
      setMrp(product.mrp);
      setSellingPrice(product.sellingPrice);
      setStock(product.stock);
      setImage(product.image);
      setBargainDiscountPercent(product.maxBargainDiscountPercent || 20);
      setBargainingAllowed(Boolean(product.bargainingAllowed));
      
      const isFlex = product.weightType ? product.weightType === 'flexible' : (product.isWeightFlexible ?? isWeightAdjustableProduct(product));
      setWeightType(isFlex ? 'flexible' : 'fixed');
      setUnitType(product.unitType || (product.quantity.toLowerCase().includes('l') || product.quantity.toLowerCase().includes('ml') ? 'volume' : product.quantity.toLowerCase().includes('pc') || product.quantity.toLowerCase().includes('pack') ? 'count' : 'weight'));

      setReturnPolicy(product.returnPolicy || 'Returnable');
      setReturnWindowDays(product.returnWindowDays ?? (product.returnPolicy === 'Non-Returnable' ? 0 : 2));
      setRefundPolicy(product.refundPolicy || 'Full-Refund');
      setRefundDetails(product.refundDetails || '100% instant refund or replacement upon verification at delivery doorstep.');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const discountPct = mrp > 0 ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
  const minBargain = Math.round(sellingPrice * (1 - bargainDiscountPercent / 100));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || sellingPrice <= 0) return;

    setIsSubmitting(true);
    try {
      await onUpdateProduct(product.id, {
        name,
        category,
        quantity,
        mrp: Number(mrp),
        sellingPrice: Number(sellingPrice),
        discountPercentage: discountPct > 0 ? discountPct : 0,
        stock: Number(stock),
        image,
        bargainingAllowed,
        maxBargainDiscountPercent: bargainDiscountPercent,
        minBargainPrice: minBargain,
        weightType,
        isWeightFlexible: weightType === 'flexible',
        allowCustomWeight: weightType === 'flexible',
        unitType,
        returnPolicy,
        returnWindowDays: returnPolicy === 'Non-Returnable' ? 0 : returnWindowDays,
        refundPolicy,
        refundDetails
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Edit SKU #{product.id}</h3>
              <p className="text-slate-400 text-xs">Merchant: {product.sellerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Base Pack / Display Unit</label>
              <input
                type="text"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="e.g. 500 g, 1 kg, 1 L, 100g Pack"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">MRP (₹)</label>
              <input
                type="number"
                min="1"
                value={mrp}
                onChange={e => {
                  const newMrp = Number(e.target.value);
                  setMrp(newMrp);
                }}
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹)</label>
              <input
                type="number"
                min="1"
                value={sellingPrice}
                onChange={e => {
                  const newSelling = Number(e.target.value);
                  setSellingPrice(newSelling);
                }}
                className="w-full px-3 py-2 text-xs font-mono font-bold text-emerald-700 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Stock Count</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={e => setStock(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              />
            </div>
          </div>

          {/* ==================================================== */}
          {/* ADMIN DISCOUNT CONTROLLER */}
          {/* ==================================================== */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-amber-700" />
                <span>Admin Discount Control</span>
              </label>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                discountPct > 0
                  ? 'bg-amber-200 text-amber-950 border border-amber-300'
                  : 'bg-slate-200 text-slate-700 border border-slate-300'
              }`}>
                {discountPct > 0 ? `🔥 ${discountPct}% OFF (Save ₹${Math.max(0, mrp - sellingPrice)})` : '🏷️ 0% Discount (No Discount)'}
              </span>
            </div>

            <p className="text-[11px] text-amber-900 leading-tight">
              Only Admin and the product's Seller can set discounts. Choose 0% to remove discount completely or select a discount percentage:
            </p>

            <div className="flex flex-wrap items-center gap-1.5">
              {[0, 5, 10, 15, 20, 25, 30, 40, 50].map(pct => {
                const isSelected = discountPct === pct;
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      if (pct === 0) {
                        setSellingPrice(mrp);
                      } else {
                        const calculated = Math.max(1, Math.round(mrp * (1 - pct / 100)));
                        setSellingPrice(calculated);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                      isSelected
                        ? pct === 0
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-100 hover:border-amber-300'
                    }`}
                  >
                    {pct === 0 ? '0% (No Discount)' : `${pct}% OFF`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ==================================================== */}
          {/* ADMIN CONTROL 1: WEIGHT / QUANTITY SELECTION MODE */}
          {/* ==================================================== */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-blue-700" />
                <span>Admin Weight & Pack Dispatch Rule</span>
              </label>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                weightType === 'flexible'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-blue-100 text-blue-900 border border-blue-300'
              }`}>
                {weightType === 'flexible' ? '⚖️ Custom Weights Allowed' : '📦 Fixed Pre-Pack Only'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWeightType('fixed')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  weightType === 'fixed'
                    ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-blue-50/50 border-blue-200 hover:bg-white text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-xs text-slate-900">
                  <Box className="w-3.5 h-3.5 text-blue-600" />
                  <span>Fixed Pre-Packaged</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                  Sold strictly in original sealed pack/bottle (1x, 2x packs only). Customer cannot customize grams.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setWeightType('flexible')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  weightType === 'flexible'
                    ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-blue-50/50 border-blue-200 hover:bg-white text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-xs text-slate-900">
                  <Scale className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Flexible / Custom Weight</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                  Customer can freely choose 100g, 250g, 500g, 1kg, or ml/litre based on mandi rates.
                </p>
              </button>
            </div>

            {weightType === 'flexible' && (
              <div className="flex items-center gap-3 pt-1 border-t border-blue-200/60">
                <span className="text-[11px] font-bold text-blue-900 shrink-0">Measurement Unit:</span>
                <div className="flex items-center gap-2 text-xs">
                  <label className="flex items-center gap-1 text-slate-700 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="unitType"
                      checked={unitType === 'weight'}
                      onChange={() => setUnitType('weight')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Weight (g / kg)</span>
                  </label>
                  <label className="flex items-center gap-1 text-slate-700 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="unitType"
                      checked={unitType === 'volume'}
                      onChange={() => setUnitType('volume')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Volume (ml / L)</span>
                  </label>
                  <label className="flex items-center gap-1 text-slate-700 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="unitType"
                      checked={unitType === 'count'}
                      onChange={() => setUnitType('count')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Count (pcs)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* ==================================================== */}
          {/* ADMIN CONTROL 2: BARGAINING FEATURE & MARGIN SETTINGS */}
          {/* ==================================================== */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>Admin Bazli Bargaining Control</span>
              </label>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                bargainingAllowed
                  ? 'bg-amber-200 text-amber-950 border border-amber-300'
                  : 'bg-slate-200 text-slate-700 border border-slate-300'
              }`}>
                {bargainingAllowed ? '⚡ Live Bargaining Active' : '🔒 Fixed Price Only'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-amber-900 mb-1">Bargaining Permission</label>
                <select
                  value={bargainingAllowed ? 'enabled' : 'disabled'}
                  onChange={e => setBargainingAllowed(e.target.value === 'enabled')}
                  className="w-full px-3 py-2 text-xs font-bold border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-slate-800"
                >
                  <option value="disabled">❌ Disabled (Fixed MRP / No Bargain)</option>
                  <option value="enabled">✅ Enabled (Customer Can Negotiate)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-900 mb-1">Max Bargain Discount Ceiling</label>
                <select
                  disabled={!bargainingAllowed}
                  value={bargainDiscountPercent}
                  onChange={e => setBargainDiscountPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-bold border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-amber-950 disabled:opacity-40"
                >
                  <option value={5}>5% Maximum Discount</option>
                  <option value={10}>10% Maximum Discount</option>
                  <option value={15}>15% Maximum Discount</option>
                  <option value={20}>20% Maximum Discount</option>
                  <option value={25}>25% Maximum Discount</option>
                  <option value={30}>30% Maximum Discount</option>
                </select>
              </div>
            </div>

            {bargainingAllowed ? (
              <div className="p-2 bg-white rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                <span className="font-bold text-amber-950 flex items-center gap-1">
                  <span>Lowest Permitted Bazli Bargain Floor Price:</span>
                </span>
                <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                  ₹{minBargain} (Max {bargainDiscountPercent}% off)
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-amber-900 italic">
                Bargaining is OFF. Customers can only purchase this product at the listed price of ₹{sellingPrice}.
              </p>
            )}
          </div>

          {/* ==================================================== */}
          {/* ADMIN CONTROL 3: RETURN, EXCHANGE & REFUND POLICY   */}
          {/* ==================================================== */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-blue-700" />
                <span>Return, Exchange & Refund Master Policy</span>
              </label>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                returnPolicy === 'Returnable'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : returnPolicy === 'Exchange-Only' || returnPolicy === 'Replacement-Only'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}>
                {returnPolicy === 'Returnable' ? '✅ Easy Return & Refund' : returnPolicy === 'Exchange-Only' ? '🔄 Exchange Only' : returnPolicy === 'Replacement-Only' ? '🔁 Replacement Only' : '🔒 Non-Returnable'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-blue-900 mb-1">Return / Exchange Eligibility</label>
                <select
                  value={returnPolicy}
                  onChange={e => setReturnPolicy(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-bold border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-800"
                >
                  <option value="Returnable">✅ Returnable (Customer can return/refund)</option>
                  <option value="Exchange-Only">🔄 Exchange Only (Item swap allowed)</option>
                  <option value="Replacement-Only">🔁 Replacement Only (Defective piece replace)</option>
                  <option value="Non-Returnable">❌ Non-Returnable (Perishable / Final sale)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-blue-900 mb-1">Return Window (Days)</label>
                <select
                  disabled={returnPolicy === 'Non-Returnable'}
                  value={returnWindowDays}
                  onChange={e => setReturnWindowDays(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-bold border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-blue-950 disabled:opacity-40"
                >
                  <option value={1}>1 Day (24 Hours doorstep window)</option>
                  <option value={2}>2 Days (Standard grocery window)</option>
                  <option value={3}>3 Days</option>
                  <option value={7}>7 Days (Stationery / packaged goods)</option>
                  <option value={10}>10 Days</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-blue-100">
              <div>
                <label className="block text-[11px] font-bold text-blue-900 mb-1">Refund Type Allowed</label>
                <select
                  value={refundPolicy}
                  onChange={e => setRefundPolicy(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-bold border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-800"
                >
                  <option value="Full-Refund">💰 100% Full Refund to Original Payment / UPI</option>
                  <option value="Store-Credit-Only">🪙 Store Credit / Bazli Coins Wallet Only</option>
                  <option value="Replacement-Only">🔁 Free Replacement Item Only (No Cash Refund)</option>
                  <option value="No-Refund">❌ No Refund (Only if damaged at delivery doorstep)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-blue-900 mb-1">Refund Terms / Note for Customer</label>
                <input
                  type="text"
                  value={refundDetails}
                  onChange={e => setRefundDetails(e.target.value)}
                  placeholder="e.g. 100% refund upon doorstep verification"
                  className="w-full px-3 py-2 text-xs font-bold border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="pt-1">
            <FirebaseImageUploader
              label="Product Image (Firebase Cloud Storage)"
              value={image}
              onChange={url => setImage(url)}
              uploadType="product"
              targetId={product.sellerId || 'seller'}
              placeholder="https://images.unsplash.com/... or upload from device"
              helperText="Uploaded securely to Firebase Storage bucket."
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            {onDeleteProduct && (
              <button
                type="button"
                onClick={async () => {
                  await onDeleteProduct(product.id);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete SKU</span>
              </button>
            )}

            <div className="flex items-center space-x-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-black text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Updates'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
