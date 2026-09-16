import React, { useState, useEffect } from 'react';
import { Gift, Clock, Sparkles, Check, ArrowRight, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Product } from '../../types';

interface FlashDealOneRupeeProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number, selectedWeight?: string, unitPrice?: number, unitMrp?: number) => void;
  cartTotal?: number;
  onOpenCart?: () => void;
}

export const FlashDealOneRupee: React.FC<FlashDealOneRupeeProps> = ({
  products,
  onAddToCart,
  cartTotal = 0,
  onOpenCart
}) => {
  const [claimedProduct, setClaimedProduct] = useState<Product | null>(null);
  const [isPickerModalOpen, setIsPickerModalOpen] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 2, minutes: 45, seconds: 12 });

  // Filter all products available on the site whose selling price is <= ₹39
  const eligibleProductsUnder39 = products.filter(p => {
    const price = p.sellingPrice || 0;
    return price > 0 && price <= 39 && p.stock > 0;
  });

  // Default selected item (first available item <= ₹39)
  const [selectedDealProduct, setSelectedDealProduct] = useState<Product>(() => {
    return eligibleProductsUnder39[0] || {
      id: 'p2-fallback',
      name: 'Tata Salt Vacuum Evaporated',
      quantity: '1 kg',
      category: 'Spices & Seasoning',
      mrp: 28,
      sellingPrice: 28,
      discountPercentage: 0,
      bargainingAllowed: false,
      stock: 100,
      sellerId: 's1',
      sellerName: 'Gupta Kirana Store',
      image: 'https://images.unsplash.com/photo-1518110168401-f2877ee2c8ab?auto=format&fit=crop&w=600&q=80',
      description: 'Tata Salt Iodized',
      rating: 4.9,
      reviewCount: 520
    };
  });

  useEffect(() => {
    if (eligibleProductsUnder39.length > 0 && !eligibleProductsUnder39.find(p => p.id === selectedDealProduct.id)) {
      setSelectedDealProduct(eligibleProductsUnder39[0]);
    }
  }, [products]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 3, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minOrderValue = 199;
  const isEligible = cartTotal >= minOrderValue;
  const neededAmount = Math.max(0, minOrderValue - cartTotal);

  const handleClaim = (productToClaim: Product) => {
    const originalPrice = productToClaim.sellingPrice || productToClaim.mrp || 35;
    const promoProduct: Product = {
      ...productToClaim,
      id: `free-gift-${productToClaim.id}`,
      name: `🎁 FREE Gift: ${productToClaim.name}`,
      sellingPrice: 0,
      mrp: originalPrice,
      discountPercentage: 100
    };

    onAddToCart(promoProduct, 1, productToClaim.quantity, 0, originalPrice);
    setClaimedProduct(promoProduct);
    setIsPickerModalOpen(false);
  };

  return (
    <>
      <div className="my-1.5 rounded-2xl golden-animated-banner golden-shine-beam border-2 border-amber-300/90 p-2 sm:px-3 sm:py-2 text-slate-950 shadow-lg shadow-amber-500/20 relative overflow-hidden transition-all">
        {/* Soft background golden ambiance */}
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-yellow-200/40 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-amber-600/20 rounded-full blur-lg pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 relative z-10">
          
          {/* Left: Product Visual + Offer Details */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0 flex-1">
            <div className="relative shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-amber-700/30 shadow-sm bg-amber-100">
                <img
                  src={selectedDealProduct.image}
                  alt={selectedDealProduct.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 bg-slate-950 text-amber-300 font-black text-[7.5px] px-1 py-0 rounded-full border border-amber-400 shadow-xs">
                FREE
              </span>
            </div>

            <div className="min-w-0 flex-1">
              {/* Row 1: Badges & Timer in one tight line */}
              <div className="flex flex-wrap items-center gap-1">
                <span className="bg-slate-950 text-amber-300 font-black text-[8px] sm:text-[9px] uppercase px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs shrink-0">
                  <Sparkles className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                  100% FREE GIFT
                </span>
                
                <span className="bg-black/15 text-slate-950 font-black text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full border border-black/10 shrink-0">
                  🎁 Item ≤ ₹39 is ₹0 on ₹199+
                </span>

                <div className="flex items-center space-x-1 text-[8.5px] font-mono text-slate-950 font-black bg-white/70 px-1.5 py-0.5 rounded-md border border-amber-500/40 shrink-0">
                  <Clock className="w-2.5 h-2.5 text-amber-800" />
                  <span>
                    {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Row 2: Product Name + Deal Price */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <h4 className="font-black text-xs sm:text-[13px] text-slate-950 truncate max-w-[180px] sm:max-w-xs">
                  {selectedDealProduct.name} ({selectedDealProduct.quantity})
                </h4>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 shrink-0">
                  <del className="text-slate-600 text-[9px] sm:text-[10px]">₹{selectedDealProduct.sellingPrice || selectedDealProduct.mrp}</del>{' '}
                  <strong className="text-slate-950 font-black">→ ₹0 FREE</strong>
                </span>
                {eligibleProductsUnder39.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setIsPickerModalOpen(true)}
                    className="text-[9px] text-amber-950 hover:text-black underline font-black flex items-center gap-0.5 cursor-pointer shrink-0"
                  >
                    <span>Change ({eligibleProductsUnder39.length})</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>

              {/* Row 3: Slim Integrated Progress Bar */}
              <div className="flex items-center gap-1.5 mt-0.5 text-[9px]">
                <span className="font-extrabold text-slate-900 shrink-0">Cart: ₹{cartTotal}/₹{minOrderValue}</span>
                <div className="w-20 sm:w-32 bg-slate-950/20 h-1.5 rounded-full overflow-hidden border border-slate-950/10 shrink-0">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isEligible
                        ? 'bg-emerald-700'
                        : 'bg-slate-950'
                    }`}
                    style={{ width: `${Math.min(100, Math.round((cartTotal / minOrderValue) * 100))}%` }}
                  />
                </div>
                {isEligible ? (
                  <span className="font-black text-emerald-900 flex items-center gap-0.5 shrink-0">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Unlocked!
                  </span>
                ) : (
                  <span className="font-bold text-amber-950 shrink-0">
                    Add ₹{neededAmount} more
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions (Change Item / Claim Button) */}
          <div className="flex flex-row items-center gap-1.5 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => setIsPickerModalOpen(true)}
              className="px-2 py-1 rounded-xl bg-white/70 hover:bg-white border border-amber-700/30 text-slate-950 font-black text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs"
            >
              <Gift className="w-3 h-3 text-amber-900" />
              <span>Other (≤ ₹39)</span>
            </button>

            <button
              type="button"
              onClick={() => handleClaim(selectedDealProduct)}
              disabled={Boolean(claimedProduct)}
              className={`px-3 py-1.5 rounded-xl font-black text-[11px] sm:text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all cursor-pointer ${
                claimedProduct
                  ? 'bg-emerald-700 text-white border border-emerald-600 cursor-default'
                  : 'bg-slate-950 hover:bg-black text-amber-300 hover:scale-105 active:scale-95 border border-amber-400/50 group'
              }`}
            >
              {claimedProduct ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Claimed in Cart!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 fill-amber-300 text-amber-300 group-hover:rotate-12 transition-transform" />
                  <span>Claim 100% FREE</span>
                  <ArrowRight className="w-2.5 h-2.5 text-amber-300 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Modal to Pick ANY Item Under ₹39 from the catalog */}
      {isPickerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#fbf9f5] border border-[#ded2bc] text-slate-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-3.5 sm:p-4 golden-animated-banner golden-shine-beam text-slate-950 flex items-center justify-between border-b border-amber-400/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-950 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-xs flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 fill-amber-300" />
                    100% FREE Gift
                  </span>
                  <h3 className="font-black text-base sm:text-lg text-slate-950">
                    Choose ANY Item Under ₹39
                  </h3>
                </div>
                <p className="text-xs text-slate-900 font-bold mt-0.5">
                  Select any product below to get it <strong>100% FREE (₹0)</strong> on minimum order of ₹199.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPickerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-950/15 hover:bg-slate-950/30 text-slate-950 font-bold flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Items Grid */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {eligibleProductsUnder39.map(item => {
                  const isCurrent = selectedDealProduct.id === item.id;
                  const itemPrice = item.sellingPrice || item.mrp || 0;

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                        isCurrent
                          ? 'bg-amber-50/90 border-amber-400 shadow-sm ring-2 ring-amber-400/50'
                          : 'bg-white border-[#ded2bc] hover:border-amber-300'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {item.name}
                        </h5>
                        <p className="text-[11px] text-slate-500">{item.quantity} • {item.category}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-black text-[#0a192f] bg-[#ede5d8] px-1.5 py-0.2 rounded font-mono">
                            FREE (₹0)
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            ₹{itemPrice}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDealProduct(item);
                          handleClaim(item);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#0a192f] hover:bg-[#132f54] text-white text-xs font-bold shrink-0 cursor-pointer shadow-xs"
                      >
                        Select FREE
                      </button>
                    </div>
                  );
                })}
              </div>

              {eligibleProductsUnder39.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <p>Koi item ₹39 ke andar filhal stock me nahi hai.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#ede5d8]/50 border-t border-[#ded2bc] flex items-center justify-between text-xs">
              <span className="text-slate-700 font-medium">
                Criterion: <strong>≤ ₹39 price item is ₹0 FREE</strong> on <strong>Min Order ₹199</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsPickerModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-[#ede5d8] border border-[#ded2bc] font-bold rounded-xl text-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
