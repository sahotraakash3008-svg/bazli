import React, { useState, useMemo } from 'react';
import { Product, ProductReview } from '../types';
import {
  Sparkles,
  Heart,
  Plus,
  Minus,
  Star,
  ShoppingBag,
  Store,
  Flame,
  MessageSquare,
  Scale,
  ChevronDown
} from 'lucide-react';
import { isProductInTodaysDeal, getProductDealPrice } from '../data/todaysDeals';
import { ProductReviewsModal } from './ProductReviewsModal';
import { WeightQuantityModal } from './WeightQuantityModal';
import {
  isWeightAdjustableProduct,
  getWeightPresetsForProduct,
  calculatePriceForVariant,
  parseProductQuantity,
  getMandiRateDescription
} from '../utils/weightUtils';
import {
  hapticAddToCart,
  hapticSelection,
  hapticBargainSubmit
} from '../utils/haptics';

interface ProductCardProps {
  product: Product;
  onBargainClick?: (product: Product, selectedWeight?: string, variantPrice?: number) => void;
  onOpenBargain?: (product: Product, selectedWeight?: string, variantPrice?: number) => void;
  onAddToCart: (
    product: Product,
    bargainSessionOrPrice?: any,
    selectedWeight?: string,
    unitPrice?: number,
    unitMrp?: number
  ) => void;
  onUpdateCartQty?: (product: Product, qty: number, selectedWeight?: string) => void;
  cartQuantity?: number;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
  bargainedPrice?: number;
  bargainSession?: any;
  isHighlighted?: boolean;
  reviews?: ProductReview[];
  hasPurchased?: boolean;
  onAddReview?: (productId: string, rating: number, comment: string) => void;
  onOpenReviews?: (product: Product) => void;
  onOpenProductDetail?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  onBargainClick,
  onOpenBargain,
  onAddToCart,
  onUpdateCartQty,
  cartQuantity = 0,
  isWishlisted = false,
  onToggleWishlist,
  bargainedPrice,
  bargainSession,
  isHighlighted = false,
  reviews = [],
  hasPurchased = false,
  onAddReview,
  onOpenReviews,
  onOpenProductDetail
}) => {
  const [imgError, setImgError] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  const isDealItem = isProductInTodaysDeal(product) || product.isTodayDeal;
  const dealPrice = getProductDealPrice(product);

  const isWeightAdjustable = useMemo(() => isWeightAdjustableProduct(product), [product]);
  const presets = useMemo(() => getWeightPresetsForProduct(product), [product]);
  const parsedBase = useMemo(() => parseProductQuantity(product.quantity), [product.quantity]);

  // Selected weight in grams/units (defaults to package base weight)
  const [selectedGrams, setSelectedGrams] = useState<number>(
    parsedBase.normalizedGramsOrUnits || 500
  );

  // Calculate pricing for currently selected weight variant
  const effectiveBasePrice = isDealItem ? dealPrice : product.sellingPrice;
  const currentVariant = useMemo(
    () => calculatePriceForVariant(product, selectedGrams, effectiveBasePrice),
    [product, selectedGrams, effectiveBasePrice]
  );

  const activeBargainedPrice = typeof bargainedPrice === 'number'
    ? bargainedPrice
    : (bargainSession?.status === 'accepted' ? bargainSession?.finalAgreedPrice : undefined);

  // Selling price for display
  const displayPrice = activeBargainedPrice || currentVariant.sellingPrice;
  const displayMrp = currentVariant.mrp;

  const productReviews = reviews.filter(r => r.productId === product.id);
  const totalReviewsCount = productReviews.length > 0 ? productReviews.length : product.reviewCount;
  const avgRating = productReviews.length > 0
    ? Number((productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length).toFixed(1))
    : product.rating;

  const handleBargain = () => {
    hapticBargainSubmit();
    if (typeof onBargainClick === 'function') {
      onBargainClick(product, currentVariant.label, currentVariant.sellingPrice);
    } else if (typeof onOpenBargain === 'function') {
      onOpenBargain(product, currentVariant.label, currentVariant.sellingPrice);
    }
  };

  const handleOpenReviews = () => {
    if (typeof onOpenReviews === 'function') {
      onOpenReviews(product);
    } else {
      setIsReviewsModalOpen(true);
    }
  };

  const handleQuickAdd = () => {
    hapticAddToCart();
    onAddToCart(
      product,
      bargainSession,
      currentVariant.label,
      currentVariant.sellingPrice,
      currentVariant.mrp
    );
  };

  const handleConfirmModalAdd = (
    _prod: Product,
    selectedWeight: string,
    unitPrice: number,
    unitMrp: number,
    packQty: number
  ) => {
    hapticAddToCart();
    for (let i = 0; i < packQty; i++) {
      onAddToCart(
        product,
        bargainSession,
        selectedWeight,
        unitPrice,
        unitMrp
      );
    }
  };

  return (
    <>
      <div
        id={`product-${product.id}`}
        className={`bg-white rounded-2xl sm:rounded-3xl border transition-all duration-200 flex flex-col justify-between overflow-hidden group scroll-mt-28 relative h-full ${
          isHighlighted
            ? 'ring-3 sm:ring-4 ring-amber-500 border-amber-500 shadow-xl scale-[1.02] bg-amber-50/30'
            : 'border-slate-200/90 hover:border-slate-400/80 shadow-xs hover:shadow-lg hover:shadow-slate-900/5'
        }`}
      >
        {/* Highlighting Spotlight Tag */}
        {isHighlighted && (
          <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[8px] sm:text-[10px] font-black text-center py-0.5 z-20 shadow-md animate-pulse">
            ⭐ SPOTLIGHT
          </div>
        )}

        {/* Top Image Container */}
        <div
          onClick={() => onOpenProductDetail?.(product)}
          className="relative aspect-square w-full bg-slate-50 overflow-hidden cursor-pointer"
        >
          <img
            src={imgError ? 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400' : product.image}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />

          {/* Badges Overlay */}
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-col gap-0.5 items-start z-10 pointer-events-none">
            {isDealItem ? (
              <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 rounded-md uppercase tracking-wide shadow-2xs flex items-center gap-0.5 border border-red-400/30">
                <Flame className="w-2.5 h-2.5 text-amber-200 fill-amber-200" /> 30%
              </span>
            ) : currentVariant.discountPercent > 0 ? (
              <span className="bg-slate-900 text-white font-black text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 rounded-md uppercase tracking-wide shadow-2xs border border-slate-700">
                {currentVariant.discountPercent}% OFF
              </span>
            ) : null}

            {activeBargainedPrice && (
              <span className="bg-amber-400 text-slate-950 font-black text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 rounded-md shadow-2xs animate-pulse border border-amber-500">
                ⚡ ₹{activeBargainedPrice}
              </span>
            )}
          </div>

          {/* 100% Freshness speed badge */}
          <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 bg-[#0a192f]/90 backdrop-blur-xs text-amber-300 text-[7px] sm:text-[8px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-[#1e3a5f] pointer-events-none font-freshness whitespace-nowrap">
            <span>🌿 100% freshness your environment</span>
          </div>

          {/* Wishlist Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              hapticSelection();
              onToggleWishlist?.(product);
            }}
            className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1 sm:p-1.5 rounded-full backdrop-blur-md transition-all z-10 cursor-pointer ${
              isWishlisted
                ? 'bg-rose-50 text-rose-600 border border-rose-300 shadow-xs'
                : 'bg-white/90 hover:bg-white text-slate-400 hover:text-rose-600 border border-slate-200 shadow-xs'
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2 flex-1 flex flex-col justify-between">
          <div
            onClick={() => onOpenProductDetail?.(product)}
            className="cursor-pointer"
          >
            {/* Weight / Pack Pill */}
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-bold text-slate-500">
              <button
                type="button"
                onClick={e => {
                  if (isWeightAdjustable) {
                    e.stopPropagation();
                    setIsWeightModalOpen(true);
                  }
                }}
                className={`truncate max-w-[95px] sm:max-w-[130px] text-left transition-colors ${
                  isWeightAdjustable
                    ? 'text-[#0a192f] hover:text-[#132f54] bg-[#f5efe6] hover:bg-[#ede5d8] px-1.5 py-0.5 rounded-md border border-[#ded2bc] flex items-center gap-1 cursor-pointer font-bold'
                    : 'text-slate-600 font-semibold cursor-default'
                }`}
                title={isWeightAdjustable ? 'Click to select custom weight (100g, 250g, 500g, 1kg...)' : 'Fixed Packaged Unit'}
              >
                {isWeightAdjustable && <Scale className="w-2.5 h-2.5 text-[#0a192f] shrink-0" />}
                <span className="truncate">{currentVariant.label}</span>
              </button>
              <div className="flex items-center text-amber-500 shrink-0">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span className="ml-0.5 font-bold text-slate-700 text-[9px] sm:text-[10px]">
                  {avgRating}
                </span>
              </div>
            </div>

            {/* Product Name */}
            <h3 className="font-bold text-slate-900 text-[11px] sm:text-xs md:text-sm leading-tight mt-0.5 group-hover:text-[#0a192f] transition-colors line-clamp-2 h-7 sm:h-8">
              {product.name}
            </h3>

            {/* Weight selection chip if available on larger sizes */}
            {isWeightAdjustable && (
              <div
                onClick={e => e.stopPropagation()}
                className="mt-1 hidden sm:flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none"
              >
                {presets.slice(0, 2).map(p => {
                  const isSelected = selectedGrams === p.gramsOrUnits;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        hapticSelection();
                        setSelectedGrams(p.gramsOrUnits);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold whitespace-nowrap transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 font-black'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pricing & Add Stepper Action Row */}
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1 w-full">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1 flex-wrap">
                <span className="text-xs sm:text-sm md:text-base font-black text-slate-950 font-mono tracking-tight whitespace-nowrap">
                  ₹{displayPrice}
                </span>
                {displayMrp > displayPrice && (
                  <span className="text-[9px] sm:text-[10px] text-slate-400 line-through font-mono hidden xs:inline whitespace-nowrap">
                    ₹{displayMrp}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons: ADD / Stepper + Bargain (Only when bargaining is enabled by Admin) */}
            <div className="flex items-center gap-1 shrink-0">
              {product.bargainingAllowed && product.sellerType !== 'restaurant' && product.category !== 'Restaurant Meals & Dining' && (
                <button
                  onClick={handleBargain}
                  className="p-1 sm:p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 transition-colors cursor-pointer border border-amber-200 flex items-center justify-center shrink-0"
                  title="Negotiate with Bazli Bargain"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                </button>
              )}

              {cartQuantity > 0 ? (
                <div className="flex items-center bg-[#0a192f] text-white rounded-lg sm:rounded-xl px-1 py-0.5 text-[10px] sm:text-xs font-black shadow-2xs border border-[#1e3a5f] shrink-0">
                  <button
                    onClick={() => {
                      hapticSelection();
                      onUpdateCartQty &&
                        onUpdateCartQty(product, cartQuantity - 1, currentVariant.label);
                    }}
                    className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center hover:bg-[#152e4d] rounded cursor-pointer transition-colors"
                  >
                    <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </button>
                  <span className="px-1 font-mono text-[10px] sm:text-xs min-w-[14px] text-center text-amber-300 font-bold">{cartQuantity}</span>
                  <button
                    onClick={() => {
                      hapticAddToCart();
                      onUpdateCartQty &&
                        onUpdateCartQty(product, cartQuantity + 1, currentVariant.label);
                    }}
                    className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center hover:bg-[#152e4d] rounded cursor-pointer transition-colors"
                  >
                    <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleQuickAdd}
                  className="bg-[#0a192f] hover:bg-[#143257] text-white font-black px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs transition-all shadow-xs flex items-center gap-0.5 cursor-pointer border border-[#1e3a5f] shrink-0 whitespace-nowrap"
                >
                  <span>ADD</span>
                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Local Mandi Weight Adjustment Dialog */}
      {isWeightModalOpen && (
        <WeightQuantityModal
          product={product}
          isOpen={isWeightModalOpen}
          onClose={() => setIsWeightModalOpen(false)}
          initialWeightGrams={selectedGrams}
          initialWeightLabel={currentVariant.label}
          onConfirmAddToCart={handleConfirmModalAdd}
          onOpenBargainWithWeight={(prod, weight, price) => {
            if (typeof onBargainClick === 'function') {
              onBargainClick(prod, weight, price);
            } else if (typeof onOpenBargain === 'function') {
              onOpenBargain(prod, weight, price);
            }
          }}
        />
      )}

      {/* Product Reviews Modal */}
      {isReviewsModalOpen && (
        <ProductReviewsModal
          product={product}
          isOpen={isReviewsModalOpen}
          onClose={() => setIsReviewsModalOpen(false)}
          reviews={reviews}
          hasPurchased={hasPurchased}
          onAddReview={onAddReview || (() => {})}
        />
      )}
    </>
  );
});
