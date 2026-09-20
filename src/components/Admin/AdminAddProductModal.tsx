import React, { useState } from 'react';
import { Product, Seller } from '../../types';
import { X, Plus, Package, Tag, IndianRupee, Sparkles, Image, Scale, Store, ShieldCheck, Percent, HelpCircle, Box, RotateCcw, RefreshCw, UtensilsCrossed, BookOpen, ShoppingBag, Clock, Flame } from 'lucide-react';
import { FirebaseImageUploader } from '../Common/FirebaseImageUploader';
import { ProductSector, getCategoriesForSector, GROCERY_CATEGORIES } from '../../utils/productSector';

interface AdminAddProductModalProps {
  isOpen: boolean;
  sellers: Seller[];
  onClose: () => void;
  onAddProduct: (productData: Partial<Product>) => Promise<void>;
}

const CATEGORIES = [
  'Atta, Rice & Dal',
  'Oil & Ghee',
  'Masala & Spices',
  'Vegetables & Fruits',
  'Dairy & Bakery',
  'Snacks & Beverages',
  'Cleaning & Household',
  'Personal Care'
];

export const AdminAddProductModal: React.FC<AdminAddProductModalProps> = ({
  isOpen,
  sellers,
  onClose,
  onAddProduct
}) => {
  const adminStore = sellers.find(s => s.isAdminStore || s.id === 's-admin') || sellers[0];
  const [productSector, setProductSector] = useState<ProductSector>('grocery');
  const [sellingAsAdmin, setSellingAsAdmin] = useState(true);
  const [name, setName] = useState('');
  const [category, setCategory] = useState(GROCERY_CATEGORIES[0]);
  const [quantity, setQuantity] = useState('1 kg');
  const [mrp, setMrp] = useState(100);
  const [sellingPrice, setSellingPrice] = useState(85);
  const [stock, setStock] = useState(50);
  const [sellerId, setSellerId] = useState(adminStore?.id || 's-admin');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80');
  const [description, setDescription] = useState('Direct fresh product from Bazli');
  const [bargainDiscountPercent, setBargainDiscountPercent] = useState(20);
  const [bargainingAllowed, setBargainingAllowed] = useState(true);
  const [isVeg, setIsVeg] = useState(true);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(20);
  const [weightType, setWeightType] = useState<'fixed' | 'flexible'>('fixed');
  const [unitType, setUnitType] = useState<'weight' | 'volume' | 'count'>('weight');
  const [returnPolicy, setReturnPolicy] = useState<'Returnable' | 'Non-Returnable' | 'Exchange-Only' | 'Replacement-Only'>('Returnable');
  const [returnWindowDays, setReturnWindowDays] = useState<number>(2);
  const [refundPolicy, setRefundPolicy] = useState<'Full-Refund' | 'No-Refund' | 'Replacement-Only' | 'Store-Credit-Only'>('Full-Refund');
  const [refundDetails, setRefundDetails] = useState<string>('100% instant refund or replacement upon verification at delivery doorstep.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const targetSeller = sellingAsAdmin ? adminStore : (sellers.find(s => s.id === sellerId) || sellers[0]);
  const discountPct = Math.round(((mrp - sellingPrice) / mrp) * 100);
  const minBargain = Math.round(sellingPrice * (1 - bargainDiscountPercent / 100));
  const estimatedAdminFee = sellingAsAdmin ? 0 : Math.round(sellingPrice * 0.10);
  const estimatedNetPayout = sellingAsAdmin ? sellingPrice : Math.round(sellingPrice * 0.90);

  const availableCategories = getCategoriesForSector(productSector);
  const sectorSellers = sellers.filter(s => !s.isAdminStore && (s.sellerType === productSector || s.id === sellerId));
  const displaySellers = sectorSellers.length > 0 ? sectorSellers : sellers.filter(s => !s.isAdminStore);

  const handleSectorChange = (newSector: ProductSector) => {
    setProductSector(newSector);
    const newCats = getCategoriesForSector(newSector);
    setCategory(newCats[0]);

    if (newSector === 'restaurant') {
      setQuantity('1 Full Portion');
      setBargainingAllowed(false);
      setWeightType('fixed');
      setUnitType('count');
      setReturnPolicy('Non-Returnable');
      const restSeller = sellers.find(s => s.sellerType === 'restaurant' && !s.isAdminStore);
      if (restSeller && !sellingAsAdmin) setSellerId(restSeller.id);
    } else if (newSector === 'stationery') {
      setQuantity('1 Unit / Pack');
      setBargainingAllowed(false);
      setWeightType('fixed');
      setUnitType('count');
      setReturnPolicy('Returnable');
      const statSeller = sellers.find(s => s.sellerType === 'stationery' && !s.isAdminStore);
      if (statSeller && !sellingAsAdmin) setSellerId(statSeller.id);
    } else {
      setQuantity('1 kg');
      setBargainingAllowed(true);
      setWeightType('fixed');
      setUnitType('weight');
      setReturnPolicy('Returnable');
      const grocSeller = sellers.find(s => s.sellerType === 'grocery' && !s.isAdminStore);
      if (grocSeller && !sellingAsAdmin) setSellerId(grocSeller.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || sellingPrice <= 0) return;

    setIsSubmitting(true);
    try {
      await onAddProduct({
        name,
        category,
        quantity: productSector === 'restaurant' ? `${quantity || '1 Portion'} • ${prepTimeMinutes}m prep` : quantity,
        mrp: Number(mrp),
        sellingPrice: Number(sellingPrice),
        discountPercentage: discountPct > 0 ? discountPct : 0,
        stock: Number(stock),
        sellerId: targetSeller?.id || 's-admin',
        sellerName: targetSeller?.businessName || 'Bazli Official Store',
        sellerType: productSector,
        image: image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
        description,
        bargainingAllowed: productSector === 'restaurant' ? false : bargainingAllowed,
        maxBargainDiscountPercent: (productSector === 'restaurant' || !bargainingAllowed) ? 0 : bargainDiscountPercent,
        minBargainPrice: (productSector === 'restaurant' || !bargainingAllowed) ? Number(sellingPrice) : minBargain,
        weightType: productSector === 'restaurant' ? 'fixed' : weightType,
        isWeightFlexible: productSector === 'restaurant' ? false : weightType === 'flexible',
        allowCustomWeight: productSector === 'restaurant' ? false : weightType === 'flexible',
        unitType,
        isVeg: productSector === 'restaurant' ? isVeg : undefined,
        prepTimeMinutes: productSector === 'restaurant' ? prepTimeMinutes : undefined,
        returnPolicy: productSector === 'restaurant' ? 'Non-Returnable' : returnPolicy,
        returnWindowDays: (productSector === 'restaurant' || returnPolicy === 'Non-Returnable') ? 0 : returnWindowDays,
        refundPolicy,
        refundDetails,
        rating: 5.0,
        reviewCount: 1,
        tags: sellingAsAdmin
          ? ['Admin Direct', 'Official Store', productSector === 'restaurant' ? 'Chef Special' : productSector === 'stationery' ? 'Stationery Supplies' : 'Bazli Direct']
          : ['Marketplace Seller']
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Add Product to Catalog</h3>
              <p className="text-slate-400 text-xs">Sell directly as Admin or list for connected sellers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Merchant Choice Mode Selector */}
        <div className="bg-slate-100 p-3 border-b border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSellingAsAdmin(true);
              if (adminStore) setSellerId(adminStore.id);
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              sellingAsAdmin
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sell as Admin Store (100% Revenue)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSellingAsAdmin(false);
              const nonAdmin = sectorSellers[0] || sellers.find(s => !s.isAdminStore && s.id !== 's-admin') || sellers[0];
              if (nonAdmin) setSellerId(nonAdmin.id);
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              !sellingAsAdmin
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Connected Seller (10% Fee)</span>
          </button>
        </div>

        {/* Target Portal / Category Section Selection */}
        <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200">
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
            Target Catalog Portal (Products are strictly isolated to this section)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleSectorChange('grocery')}
              className={`p-2.5 rounded-2xl border font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                productSector === 'grocery'
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-md ring-2 ring-emerald-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>🛒 Grocery</span>
            </button>
            <button
              type="button"
              onClick={() => handleSectorChange('restaurant')}
              className={`p-2.5 rounded-2xl border font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                productSector === 'restaurant'
                  ? 'bg-orange-600 text-white border-orange-700 shadow-md ring-2 ring-orange-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>🍽️ Restaurant</span>
            </button>
            <button
              type="button"
              onClick={() => handleSectorChange('stationery')}
              className={`p-2.5 rounded-2xl border font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                productSector === 'stationery'
                  ? 'bg-purple-700 text-white border-purple-800 shadow-md ring-2 ring-purple-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>📚 Stationery</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {sellingAsAdmin ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="font-black text-emerald-950 block">Bazli Official Store Product</span>
                  <span className="text-emerald-700 text-[11px]">100% of sales revenue is credited to Bazli Admin Account (+91 9871618126) with 0% platform deduction.</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-950 flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-amber-700" />
                  <span>Mandatory 10% Platform Commission Policy</span>
                </span>
                <span className="font-mono font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                  10% Admin Cut
                </span>
              </div>
              <p className="text-amber-800 text-[11px]">
                When this merchant sells this SKU, 10% is automatically routed to Bazli Admin Account, and 90% is credited to the seller's wallet.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
            <input
              type="text"
              required
              placeholder={sellingAsAdmin ? "e.g. Bazli Premium Royal Basmati Rice" : "e.g. Aashirvaad Superior MP Sharbati Atta"}
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Category ({productSector.toUpperCase()})</span>
                <span className="text-[10px] text-slate-400 font-semibold">{availableCategories.length} available</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              >
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Merchant Store</label>
              {sellingAsAdmin ? (
                <div className="w-full px-3 py-2 text-xs font-black text-emerald-900 bg-emerald-100/70 border border-emerald-300 rounded-xl flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Bazli Official Store (Admin Direct)</span>
                </div>
              ) : (
                <select
                  value={sellerId}
                  onChange={e => setSellerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                >
                  {displaySellers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.businessName} ({s.sellerType ? s.sellerType.toUpperCase() : 'STORE'} • 10% Fee)
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Restaurant Specific Controls */}
          {productSector === 'restaurant' && (
            <div className="p-3 bg-orange-50/80 border border-orange-200 rounded-2xl grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-orange-950 mb-1 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-600" /> Dietary Type
                </label>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsVeg(true)}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      isVeg ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                    <span>Pure Veg</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsVeg(false)}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      !isVeg ? 'bg-rose-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-300"></span>
                    <span>Non-Veg</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-orange-950 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-orange-600" /> Kitchen Prep Time (Mins)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={prepTimeMinutes}
                  onChange={e => setPrepTimeMinutes(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-bold border border-orange-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pack / Unit</label>
              <input
                type="text"
                placeholder="1 kg / 500 g"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              />
            </div>

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
          </div>

          {/* Admin Discount Control */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-amber-700" />
                <span>Discount Setting (Admin / Merchant Controlled)</span>
              </label>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                discountPct > 0
                  ? 'bg-amber-200 text-amber-950 border border-amber-300'
                  : 'bg-slate-200 text-slate-700 border border-slate-300'
              }`}>
                {discountPct > 0 ? `🔥 ${discountPct}% OFF (Save ₹${Math.max(0, mrp - sellingPrice)})` : '🏷️ 0% (No Discount)'}
              </span>
            </div>

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

          {/* Real-time Revenue & Commission Breakdown */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>Financial Split per Unit Sold:</span>
              <span>Selling Price: ₹{sellingPrice}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center pt-1">
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">
                  {sellingAsAdmin ? 'Admin Direct Earnings (100%)' : '10% Platform Fee to Admin'}
                </span>
                <span className="font-mono font-black text-emerald-700 text-sm">
                  ₹{sellingAsAdmin ? sellingPrice : estimatedAdminFee}
                </span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">
                  {sellingAsAdmin ? 'Platform Fee Deducted' : 'Net Merchant Earning (90%)'}
                </span>
                <span className="font-mono font-black text-sky-800 text-sm">
                  {sellingAsAdmin ? '₹0 (0% Fee)' : `₹${estimatedNetPayout}`}
                </span>
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* ADMIN CONTROL 1: WEIGHT / PACKING DISPATCH MODE */}
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
                      name="addUnitType"
                      checked={unitType === 'weight'}
                      onChange={() => setUnitType('weight')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Weight (g / kg)</span>
                  </label>
                  <label className="flex items-center gap-1 text-slate-700 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="addUnitType"
                      checked={unitType === 'volume'}
                      onChange={() => setUnitType('volume')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Volume (ml / L)</span>
                  </label>
                  <label className="flex items-center gap-1 text-slate-700 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="addUnitType"
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
          {/* ADMIN CONTROL 2: AI BARGAINING & MAX DISCOUNT LIMIT */}
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
                  <option value={20}>20% Maximum Discount (Default)</option>
                  <option value={25}>25% Maximum Discount</option>
                  <option value={30}>30% Maximum Discount</option>
                </select>
              </div>
            </div>

            {bargainingAllowed && (
              <div className="p-2 bg-white rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                <span className="font-bold text-amber-950">Lowest Permitted Floor:</span>
                <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                  ₹{minBargain} (Max {bargainDiscountPercent}% off)
                </span>
              </div>
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Inventory Stock Units</label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={e => setStock(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
            />
          </div>

          <div className="pt-1">
            <FirebaseImageUploader
              label="Product Image (Firebase Cloud Storage)"
              value={image}
              onChange={url => setImage(url)}
              uploadType="product"
              targetId={sellingAsAdmin ? 'admin-store' : sellerId}
              placeholder="https://images.unsplash.com/... or upload from device"
              helperText="Uploaded to Firebase Storage bucket with fast CDN caching."
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Adding SKU...' : sellingAsAdmin ? 'Publish as Admin Product' : 'Add to Seller Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
