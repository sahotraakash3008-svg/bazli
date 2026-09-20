import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Star,
  Sparkles,
  ShoppingBag,
  Heart,
  Plus,
  Minus,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Clock,
  Flame,
  Store,
  ChevronLeft,
  ChevronRight,
  Share2,
  Check,
  Info,
  Scale,
  Award,
  Leaf,
  ChefHat,
  Tag,
  ZoomIn,
  Eye,
  RotateCcw
} from 'lucide-react';
import { Product, CartItem, BargainingSession, ProductReview } from '../types';
import { isProductInTodaysDeal, getProductDealPrice } from '../data/todaysDeals';
import {
  isWeightAdjustableProduct,
  getWeightPresetsForProduct,
  calculatePriceForVariant,
  parseProductQuantity
} from '../utils/weightUtils';
import { getProductImageGallery } from '../utils/productImageGallery';
import { hapticAddToCart, hapticSelection, hapticBargainSubmit } from '../utils/haptics';
import { ProductReviewsModal } from './ProductReviewsModal';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    bargainSession?: any,
    selectedWeight?: string,
    unitPrice?: number,
    unitMrp?: number
  ) => void;
  onUpdateCartQty?: (product: Product, qty: number, selectedWeight?: string) => void;
  cartQuantity?: number;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
  onOpenBargain?: (product: Product, selectedWeight?: string, variantPrice?: number) => void;
  bargainSession?: BargainingSession;
  bargainedPrice?: number;
  reviews?: ProductReview[];
  hasPurchased?: boolean;
  onAddReview?: (productId: string, rating: number, comment: string) => void;
  allProducts?: Product[];
  onSelectOtherProduct?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onUpdateCartQty,
  cartQuantity = 0,
  isWishlisted = false,
  onToggleWishlist,
  onOpenBargain,
  bargainSession,
  bargainedPrice,
  reviews = [],
  hasPurchased = false,
  onAddReview,
  allProducts = [],
  onSelectOtherProduct
}) => {
  // Multi-image list (guarantees 3-4 distinct photos)
  const imageGallery = useMemo(() => {
    return product ? getProductImageGallery(product) : [];
  }, [product]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  // Reset active image on product change
  useEffect(() => {
    if (product?.id) {
      setActiveImageIndex(0);
      setIsImageZoomed(false);
    }
  }, [product?.id]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Deal and Weight logic
  const isDealItem = product ? (isProductInTodaysDeal(product) || product.isTodayDeal) : false;
  const dealPrice = product ? getProductDealPrice(product) : 0;
  const effectiveBasePrice = product ? (isDealItem ? dealPrice : product.sellingPrice) : 0;

  const isWeightAdjustable = useMemo(() => product ? isWeightAdjustableProduct(product) : false, [product]);
  const presets = useMemo(() => product ? getWeightPresetsForProduct(product) : [], [product]);
  const parsedBase = useMemo(() => product ? parseProductQuantity(product.quantity) : { normalizedGramsOrUnits: 500, unitType: 'gm', isWeightBased: true }, [product?.quantity]);

  const [selectedGrams, setSelectedGrams] = useState<number>(500);

  // Sync selected grams whenever product changes
  useEffect(() => {
    if (product) {
      setSelectedGrams(parsedBase.normalizedGramsOrUnits || 500);
    }
  }, [product?.id, parsedBase.normalizedGramsOrUnits]);

  const currentVariant = useMemo(
    () => {
      if (!product) {
        return { label: 'Standard', sellingPrice: 0, mrp: 0, weightGrams: 500, ratio: 1 };
      }
      return calculatePriceForVariant(product, selectedGrams, effectiveBasePrice);
    },
    [product, selectedGrams, effectiveBasePrice]
  );

  const activeBargainedPrice = typeof bargainedPrice === 'number'
    ? bargainedPrice
    : (bargainSession?.status === 'accepted' ? bargainSession?.finalAgreedPrice : undefined);

  const displayPrice = activeBargainedPrice || currentVariant.sellingPrice;
  const displayMrp = currentVariant.mrp;
  const savingsAmount = Math.max(0, displayMrp - displayPrice);
  const savingsPercent = Math.round((savingsAmount / (displayMrp || 1)) * 100);

  // Reviews calculation
  const productReviews = useMemo(
    () => product ? reviews.filter(r => r.productId === product.id) : [],
    [reviews, product?.id]
  );
  const avgRating = productReviews.length > 0
    ? Number((productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length).toFixed(1))
    : (product?.rating || 4.5);
  const reviewCount = productReviews.length > 0 ? productReviews.length : (product?.reviewCount || 0);

  // Similar Products in the same category
  const similarProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(p => p.id !== product.id && (p.category === product.category || p.sellerType === product.sellerType))
      .slice(0, 6);
  }, [allProducts, product]);

  if (!isOpen || !product) return null;

  const handleBargain = () => {
    hapticBargainSubmit();
    if (onOpenBargain) {
      onOpenBargain(product, currentVariant.label, currentVariant.sellingPrice);
    }
  };

  const handleAddToCart = () => {
    hapticAddToCart();
    onAddToCart(
      product,
      bargainSession,
      currentVariant.label,
      currentVariant.sellingPrice,
      currentVariant.mrp
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Bazli for just ₹${displayPrice}!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const isRestaurantItem = product.sellerType === 'restaurant' || product.category?.toLowerCase().includes('restaurant') || product.category?.toLowerCase().includes('dining');

  return (
    <div
      id="product-detail-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-5xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 sm:px-6 sm:py-3.5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
              {product.category}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 shrink-0">
              <Truck className="w-3 h-3 text-emerald-600" />
              <span>Fast Doorstep Delivery</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Share Product"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onToggleWishlist?.(product)}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-600'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* Left Column: Multi-Photo Gallery (5 Cols) */}
            <div className="lg:col-span-5 space-y-3">
              {/* Main Image Container */}
              <div className="relative aspect-square w-full rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-200 overflow-hidden group">
                <img
                  src={imageGallery[activeImageIndex] || product.image}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    isImageZoomed ? 'scale-150 cursor-zoom-out' : 'group-hover:scale-105 cursor-zoom-in'
                  }`}
                  onClick={() => setIsImageZoomed(!isImageZoomed)}
                  referrerPolicy="no-referrer"
                />

                {/* Left/Right Carousel Controls if multiple images */}
                {imageGallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setActiveImageIndex((activeImageIndex - 1 + imageGallery.length) % imageGallery.length);
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setActiveImageIndex((activeImageIndex + 1) % imageGallery.length);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Photo Index Badge */}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  {activeImageIndex + 1} / {imageGallery.length} Photos
                </div>

                {/* Veg/Non-Veg & Deal Badges Overlay */}
                <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                  {isRestaurantItem && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 ${
                      product.isVeg !== false ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}>
                      <Leaf className="w-3 h-3" />
                      <span>{product.isVeg !== false ? '100% Pure Veg' : 'Non-Veg'}</span>
                    </span>
                  )}

                  {isDealItem ? (
                    <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wide shadow-xs flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-amber-200 text-amber-200" />
                      <span>Special Deal 30% OFF</span>
                    </span>
                  ) : savingsPercent > 0 ? (
                    <span className="bg-slate-900 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-xs">
                      {savingsPercent}% OFF
                    </span>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => setIsImageZoomed(!isImageZoomed)}
                  className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/50 hover:bg-black/70 text-white backdrop-blur-xs transition-all cursor-pointer"
                  title="Toggle Zoom"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Multi-Photo Thumbnail Bar (3-4 Images) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {imageGallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-emerald-600 ring-2 ring-emerald-500/30 scale-105 shadow-sm'
                        : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[8px] font-bold text-center">
                      #{idx + 1}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Product Info & Actions (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Title & Brand */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                    {product.category}
                  </span>
                  {product.subcategory && (
                    <>
                      <span>›</span>
                      <span>{product.subcategory}</span>
                    </>
                  )}
                </div>

                <h1 className="text-lg sm:text-2xl font-black text-slate-950 leading-tight">
                  {product.name}
                </h1>

                {/* Rating Bar */}
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => setIsReviewsOpen(true)}
                    className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="ml-1 font-black text-slate-900 text-xs">
                        {avgRating}
                      </span>
                    </div>
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="text-xs font-bold text-amber-900 underline">
                      {reviewCount} Customer Reviews
                    </span>
                  </button>

                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>In Stock & Ready to Dispatch</span>
                  </span>
                </div>
              </div>

              {/* Price & Savings Block */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
                    ₹{displayPrice}
                  </span>
                  {displayMrp > displayPrice && (
                    <span className="text-sm sm:text-base text-slate-400 line-through font-mono">
                      MRP ₹{displayMrp}
                    </span>
                  )}
                  {savingsAmount > 0 && (
                    <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                      Save ₹{savingsAmount} ({savingsPercent}% OFF)
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500">
                  (Inclusive of all applicable GST taxes • Handled with Bazli Quality Guarantee)
                </div>

                {activeBargainedPrice && (
                  <div className="p-2 bg-amber-100 text-amber-950 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-amber-300">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Bazli Bargain Accepted Price: ₹{activeBargainedPrice} applied to this item!</span>
                  </div>
                )}
              </div>

              {/* Weight / Pack Variant Selector */}
              {isWeightAdjustable && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-emerald-600" /> Select Pack / Mandi Weight:
                    </span>
                    <span className="text-slate-500 font-medium text-[11px]">
                      Selected: <strong>{currentVariant.label}</strong>
                    </span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {presets.map(p => {
                      const isSelected = selectedGrams === p.gramsOrUnits;
                      const variantCalc = calculatePriceForVariant(product, p.gramsOrUnits, effectiveBasePrice);
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setSelectedGrams(p.gramsOrUnits)}
                          className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/20 font-bold shadow-xs'
                              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                          }`}
                        >
                          <div className="text-xs font-bold">{p.label}</div>
                          <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                            ₹{variantCalc.sellingPrice}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Restaurant Specific Info (Prep time & Spice level) */}
              {isRestaurantItem && (
                <div className="p-3 bg-orange-50/80 rounded-2xl border border-orange-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-orange-700 font-bold block">Avg Prep Time</span>
                    <span className="font-extrabold text-slate-900 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-orange-600" />
                      <span>{product.prepTimeMinutes || 20} Mins</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-orange-700 font-bold block">Spice Level</span>
                    <span className="font-extrabold text-slate-900 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-600" />
                      <span>{product.spiceLevel || 'Medium'}</span>
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-orange-700 font-bold block">Kitchen Type</span>
                    <span className="font-extrabold text-slate-900 flex items-center gap-1">
                      <ChefHat className="w-3.5 h-3.5 text-orange-600" />
                      <span>Fresh Dine-In</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Bazli Bargaining Feature Banner (Grocery / Supermarket items only, not for Bazli Restaurant) */}
              {product.bargainingAllowed && !isRestaurantItem && (
                <div className="p-3.5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-300 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-black text-amber-950 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Want a better discount? Negotiate with Bazli Bargain!</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Offer your custom target price. Instant Bazli evaluation and real-time deal confirmation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleBargain}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-xs shrink-0 cursor-pointer transition-all border border-amber-400"
                  >
                    Bargain Now
                  </button>
                </div>
              )}

              {/* Seller / Merchant Details Card */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Store className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1">
                      <span className="truncate">{product.sellerName}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Verified Bazli Merchant Partner • 100% Quality Checked
                    </p>
                  </div>
                </div>

                <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded-lg shrink-0">
                  ID: {product.sellerId}
                </span>
              </div>

              {/* Return, Exchange & Refund Assurance Box */}
              <div className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs ${
                product.returnPolicy === 'Non-Returnable'
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-950'
              }`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  product.returnPolicy === 'Non-Returnable'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-xs">
                      {product.returnPolicy === 'Non-Returnable'
                        ? '❌ Non-Returnable / Non-Exchangeable'
                        : product.returnPolicy === 'Exchange-Only'
                        ? `🔄 ${product.returnWindowDays || 2}-Day Exchange Only`
                        : product.returnPolicy === 'Replacement-Only'
                        ? `🔁 ${product.returnWindowDays || 2}-Day Free Replacement`
                        : `✅ ${product.returnWindowDays || 2}-Day Easy Return`}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                      product.refundPolicy === 'Full-Refund'
                        ? 'bg-emerald-100 text-emerald-800'
                        : product.refundPolicy === 'Store-Credit-Only'
                        ? 'bg-indigo-100 text-indigo-800'
                        : product.refundPolicy === 'Replacement-Only'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {product.refundPolicy === 'Full-Refund'
                        ? '💰 100% Full Refund'
                        : product.refundPolicy === 'Store-Credit-Only'
                        ? '🪙 Bazli Coin Credit'
                        : product.refundPolicy === 'Replacement-Only'
                        ? '🔁 Item Replacement'
                        : '❌ Non-Refundable'}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80 leading-relaxed">
                    {product.refundDetails || (
                      product.returnPolicy === 'Non-Returnable'
                        ? 'For hygiene and safety reasons, this item cannot be returned or refunded once delivered.'
                        : `Eligible for doorstep pickup/exchange within ${product.returnWindowDays || 2} days if damaged, expired, or incorrect.`
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Full Description, Specifications & Highlights */}
          <div className="p-4 sm:p-6 space-y-5 bg-slate-50/50">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 mb-2 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-600" />
                <span>Product Description & Features</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {product.description || `High quality, freshly packed ${product.name} sourced directly from verified sellers on Bazli.`}
              </p>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Key Quality Highlights
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>100% Hygienically processed and vacuum packed</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Directly sourced from trusted regional APMC mandis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>No harmful chemicals or artificial preservatives</span>
                  </li>
                </ul>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Specifications & Storage
                </h4>
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between py-0.5 border-b border-slate-100">
                    <span className="text-slate-400">Net Quantity:</span>
                    <strong className="text-slate-800">{currentVariant.label}</strong>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-100">
                    <span className="text-slate-400">Shelf Life:</span>
                    <strong className="text-slate-800">{product.shelfLife || '3-6 Months from Packaging'}</strong>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-400">Country of Origin:</span>
                    <strong className="text-slate-800">{product.origin || 'India (Made in Bharat)'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Reviews Preview Row */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Customer Ratings & Reviews ({reviewCount})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Real verified feedback from Bazli customers
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReviewsOpen(true)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                >
                  Write / View All Reviews
                </button>
              </div>

              {productReviews.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  No written reviews yet. Be the first to share your experience!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {productReviews.slice(0, 2).map(r => (
                    <div key={r.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800">{r.customerName}</span>
                        <div className="flex text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 text-[11px] line-clamp-2">"{r.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Similar Products Recommendation */}
            {similarProducts.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  You Might Also Like in {product.category}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  {similarProducts.map(sp => (
                    <div
                      key={sp.id}
                      onClick={() => onSelectOtherProduct && onSelectOtherProduct(sp)}
                      className="p-2 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 transition-all cursor-pointer group text-xs flex flex-col justify-between"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-slate-50 mb-1.5">
                        <img
                          src={sp.image}
                          alt={sp.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-[11px] line-clamp-1 group-hover:text-emerald-700">
                          {sp.name}
                        </h5>
                        <div className="font-mono font-black text-slate-950 mt-0.5">
                          ₹{sp.sellingPrice}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Sticky Action Bar */}
        <div className="sticky bottom-0 z-30 bg-white border-t border-slate-200 p-3 sm:p-4 px-4 sm:px-6 flex items-center justify-between gap-3 shadow-lg">
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Total Price:</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black text-slate-950 font-mono">
                ₹{displayPrice * (cartQuantity > 0 ? cartQuantity : 1)}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                ({currentVariant.label} • {cartQuantity > 0 ? `${cartQuantity} in cart` : '1 unit'})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cartQuantity > 0 ? (
              <div className="flex items-center bg-emerald-600 text-white rounded-2xl px-2 py-1.5 text-xs font-black shadow-md border border-emerald-500">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateCartQty &&
                    onUpdateCartQty(product, cartQuantity - 1, currentVariant.label)
                  }
                  className="w-7 h-7 flex items-center justify-center hover:bg-emerald-700 rounded-xl cursor-pointer transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 font-mono text-sm min-w-[24px] text-center font-bold">
                  {cartQuantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateCartQty &&
                    onUpdateCartQty(product, cartQuantity + 1, currentVariant.label)
                  }
                  className="w-7 h-7 flex items-center justify-center hover:bg-emerald-700 rounded-xl cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md flex items-center gap-2 cursor-pointer transition-all border border-emerald-400"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart • ₹{displayPrice}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Reviews Dialog */}
      {isReviewsOpen && (
        <ProductReviewsModal
          product={product}
          isOpen={isReviewsOpen}
          onClose={() => setIsReviewsOpen(false)}
          reviews={reviews}
          hasPurchased={hasPurchased}
          onAddReview={onAddReview || (() => {})}
        />
      )}
    </div>
  );
};
