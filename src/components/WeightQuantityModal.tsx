import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import {
  parseProductQuantity,
  getWeightPresetsForProduct,
  calculatePriceForVariant,
  formatWeightLabel,
  getMandiRateDescription,
  UnitType
} from '../utils/weightUtils';
import {
  Scale,
  X,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  Check,
  Store,
  ShieldCheck,
  Flame,
  Info,
  TrendingDown
} from 'lucide-react';
import { isProductInTodaysDeal, getProductDealPrice } from '../data/todaysDeals';

interface WeightQuantityModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  initialWeightGrams?: number;
  initialWeightLabel?: string;
  onConfirmAddToCart: (
    product: Product,
    selectedWeight: string,
    unitPrice: number,
    unitMrp: number,
    packQty: number
  ) => void;
  onOpenBargainWithWeight?: (
    product: Product,
    selectedWeight: string,
    variantPrice: number
  ) => void;
}

export const WeightQuantityModal: React.FC<WeightQuantityModalProps> = ({
  product,
  isOpen,
  onClose,
  initialWeightGrams,
  initialWeightLabel,
  onConfirmAddToCart,
  onOpenBargainWithWeight
}) => {
  const parsed = useMemo(
    () => parseProductQuantity(product?.quantity || '500g'),
    [product?.quantity]
  );
  const presets = useMemo(
    () => (product ? getWeightPresetsForProduct(product) : []),
    [product]
  );

  // Deal Pricing check
  const isDeal = product ? isProductInTodaysDeal(product) || product.isTodayDeal : false;
  const effectiveBasePrice = product ? (isDeal ? getProductDealPrice(product) : product.sellingPrice) : 0;

  // Selected weight in grams or milliliters or pieces
  const defaultGrams = initialWeightGrams || parsed.normalizedGramsOrUnits || 500;
  const [selectedGrams, setSelectedGrams] = useState<number>(defaultGrams);
  const [packQuantity, setPackQuantity] = useState<number>(1);
  const [activeUnitTab, setActiveUnitTab] = useState<'g' | 'kg'>(
    defaultGrams >= 1000 ? 'kg' : 'g'
  );

  // Calculate pricing for the current selected weight
  const variant = useMemo(
    () => (product ? calculatePriceForVariant(product, selectedGrams, effectiveBasePrice) : {
      label: '500g',
      sellingPrice: 0,
      mrp: 0,
      weightGrams: 500,
      ratio: 1
    }),
    [product, selectedGrams, effectiveBasePrice]
  );

  const isWeightUnit = parsed.unitType === 'weight';
  const isVolumeUnit = parsed.unitType === 'volume';

  if (!isOpen || !product) return null;

  // Step increments
  const handleStep = (deltaGrams: number) => {
    setSelectedGrams(prev => {
      const next = prev + deltaGrams;
      if (parsed.unitType === 'count') {
        return Math.max(1, Math.min(100, next));
      }
      // Weight or volume: min 25g/ml, max 50000g (50kg)
      return Math.max(25, Math.min(50000, next));
    });
  };

  const handleDirectInput = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) return;

    if (activeUnitTab === 'kg' && isWeightUnit) {
      setSelectedGrams(Math.round(num * 1000));
    } else {
      setSelectedGrams(Math.round(num));
    }
  };

  const handleAddClick = () => {
    onConfirmAddToCart(
      product,
      variant.label,
      variant.sellingPrice,
      variant.mrp,
      packQuantity
    );
    onClose();
  };

  const handleBargainClick = () => {
    if (onOpenBargainWithWeight) {
      onOpenBargainWithWeight(product, variant.label, variant.sellingPrice);
      onClose();
    }
  };

  const totalPrice = variant.sellingPrice * packQuantity;
  const totalMrp = variant.mrp * packQuantity;
  const totalSavings = Math.max(0, totalMrp - totalPrice);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div
        id="weight-quantity-modal"
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 relative animate-in zoom-in-95 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="flex items-center space-x-2.5 z-10">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-amber-400/30">
                  Local Mandi Weigher ⚖️
                </span>
                {isDeal && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-white bg-rose-600 px-1.5 py-0.5 rounded">
                    30% OFF DEAL
                  </span>
                )}
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight mt-0.5">
                Choose Weight & Quantity
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer z-10"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-800">
          {/* Product Snippet Header */}
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div className="w-14 h-14 bg-white rounded-xl p-1 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                {product.category}
              </span>
              <h4 className="font-bold text-sm text-slate-900 truncate">{product.name}</h4>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                <Store className="w-3 h-3 text-slate-400" />
                <span className="truncate">{product.sellerName}</span>
                <span>•</span>
                <span className="font-semibold text-emerald-700">{getMandiRateDescription(product)}</span>
              </div>
            </div>
          </div>

          {/* Quick Preset Weight Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <span>⚡ Popular Weight Presets</span>
                <span className="text-[10px] text-slate-400 font-normal">(Click to select)</span>
              </label>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {presets.map(p => {
                const isSelected = selectedGrams === p.gramsOrUnits;
                const pPrice = calculatePriceForVariant(product, p.gramsOrUnits, effectiveBasePrice);

                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setSelectedGrams(p.gramsOrUnits);
                      if (isWeightUnit) {
                        setActiveUnitTab(p.gramsOrUnits >= 1000 ? 'kg' : 'g');
                      }
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between relative ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-300'
                        : 'bg-white hover:bg-emerald-50/60 border-slate-200 text-slate-800'
                    }`}
                  >
                    {p.isPopular && (
                      <span
                        className={`absolute -top-2 bg-amber-400 text-slate-950 font-black text-[8px] px-1.5 py-0.2 rounded-full uppercase shadow-2xs ${
                          isSelected ? 'ring-1 ring-white' : ''
                        }`}
                      >
                        Popular
                      </span>
                    )}
                    <span className="font-black text-xs sm:text-sm">{p.label}</span>
                    <span
                      className={`text-[10px] font-bold mt-1 ${
                        isSelected ? 'text-emerald-100' : 'text-emerald-700'
                      }`}
                    >
                      ₹{pPrice.sellingPrice}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Weighing Scale & Custom Stepper */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-4 rounded-3xl border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Scale className="w-4 h-4" />
                <span>Custom Mandi Weigher Adjustment</span>
              </span>

              {/* Unit Toggle if weight item */}
              {isWeightUnit && (
                <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setActiveUnitTab('g')}
                    className={`px-2.5 py-1 rounded-lg font-black transition-colors cursor-pointer ${
                      activeUnitTab === 'g'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Grams (g)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveUnitTab('kg')}
                    className={`px-2.5 py-1 rounded-lg font-black transition-colors cursor-pointer ${
                      activeUnitTab === 'kg'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Kilograms (kg)
                  </button>
                </div>
              )}
            </div>

            {/* Digital Weight Dial & Live Price Display */}
            <div className="bg-slate-800/90 rounded-2xl p-3.5 border border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Measured Weight
                </span>
                <div className="flex items-baseline space-x-1.5 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono tracking-tight">
                    {variant.label}
                  </span>
                  {isWeightUnit && (
                    <span className="text-xs text-slate-400 font-mono">
                      ({(selectedGrams / 1000).toFixed(3)} kg)
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Calculated Price
                </span>
                <div className="flex items-baseline space-x-1.5 justify-end mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                    ₹{variant.sellingPrice}
                  </span>
                  {variant.mrp > variant.sellingPrice && (
                    <span className="text-xs text-slate-400 line-through">
                      ₹{variant.mrp}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Step Adjustment Buttons */}
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                Adjust Weight by increments:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {isWeightUnit && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStep(-500)}
                      disabled={selectedGrams <= 500}
                      className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                    >
                      -500g
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep(-100)}
                      disabled={selectedGrams <= 100}
                      className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                    >
                      -100g
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep(-50)}
                      disabled={selectedGrams <= 50}
                      className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                    >
                      -50g
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep(+50)}
                      className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-emerald-600 transition-colors cursor-pointer"
                    >
                      +50g
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep(+100)}
                      className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-emerald-600 transition-colors cursor-pointer"
                    >
                      +100g
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep(+250)}
                      className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-emerald-600 transition-colors cursor-pointer"
                    >
                      +250g
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep(+500)}
                      className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-emerald-600 transition-colors cursor-pointer"
                    >
                      +500g
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep(+1000)}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      +1 kg
                    </button>
                  </>
                )}

                {isVolumeUnit && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStep(-100)}
                      disabled={selectedGrams <= 100}
                      className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-700 cursor-pointer"
                    >
                      -100ml
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep(+100)}
                      className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl border border-emerald-600 cursor-pointer"
                    >
                      +100ml
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep(+250)}
                      className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl border border-emerald-600 cursor-pointer"
                    >
                      +250ml
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep(+500)}
                      className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl border border-emerald-600 cursor-pointer"
                    >
                      +500ml
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep(+1000)}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      +1 L
                    </button>
                  </>
                )}

                {parsed.unitType === 'count' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStep(-1)}
                      disabled={selectedGrams <= 1}
                      className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-700 cursor-pointer"
                    >
                      -1 pc
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep(+1)}
                      className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl border border-emerald-600 cursor-pointer"
                    >
                      +1 pc
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep(+6)}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      +6 pcs (Half Dozen)
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Number of Packs of this selected weight */}
          <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <span className="font-bold text-xs text-slate-900 block">Number of {variant.label} Packs:</span>
              <span className="text-[11px] text-slate-500">
                Total weight: <strong>{formatWeightLabel(selectedGrams * packQuantity, parsed.unitType)}</strong>
              </span>
            </div>

            <div className="flex items-center space-x-2 bg-white border border-slate-300 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setPackQuantity(prev => Math.max(1, prev - 1))}
                disabled={packQuantity <= 1}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 text-slate-700 font-bold cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-black text-sm text-slate-900">
                {packQuantity}
              </span>
              <button
                type="button"
                onClick={() => setPackQuantity(prev => prev + 1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Local Mandi Quality Note */}
          <div className="flex items-start gap-2 bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-extrabold text-emerald-950 block">
                Local Mandi Certified Weight & Freshness
              </span>
              <p className="text-[11px] text-emerald-800 leading-snug">
                Every packet is weighed accurately on digital scales by local partner stores and sealed hygienically before fast doorstep delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                ₹{totalPrice}
              </span>
              {totalSavings > 0 && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{totalMrp}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 font-semibold">
              For {packQuantity > 1 ? `${packQuantity} × ${variant.label}` : variant.label}
              {totalSavings > 0 && (
                <span className="text-emerald-700 font-bold ml-1.5">
                  (Save ₹{totalSavings})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {product.bargainingAllowed && onOpenBargainWithWeight && (
              <button
                type="button"
                onClick={handleBargainClick}
                className="flex-1 sm:flex-none bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="Bargain on this custom weight"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bargain Price</span>
              </button>
            )}

            <button
              type="button"
              id="confirm-weight-add-to-cart"
              onClick={handleAddClick}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-6 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add {variant.label} to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
