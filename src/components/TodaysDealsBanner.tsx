import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Clock,
  Calendar,
  ArrowRight,
  Flame,
  Percent,
  Tag,
  CheckCircle2,
  ShoppingBag,
  Scale,
  Heart,
  Zap,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Ticket,
  Eye,
  Check,
  Gift,
  Coins,
  ShieldCheck,
  Award
} from 'lucide-react';
import {
  getTodaysDealSchedule,
  ALTERNATE_DEAL_SCHEDULE,
  isProductInTodaysDeal,
  getProductDealPrice,
  DealScheduleItem
} from '../data/todaysDeals';
import { Product, CartItem, CustomDeal } from '../types';

interface TodaysDealsBannerProps {
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
  products?: Product[];
  cartItems?: CartItem[];
  deals?: CustomDeal[];
  activeDealCategory?: string;
  onAddToCart?: (product: Product) => void;
  onUpdateCartQty?: (product: Product, quantity: number) => void;
  onBargainClick?: (product: Product) => void;
  wishlistIds?: string[];
  onToggleWishlist?: (product: Product) => void;
  onOpenProductDetail?: (product: Product) => void;
}

export const TodaysDealsBanner: React.FC<TodaysDealsBannerProps> = ({
  onSelectCategory,
  selectedCategory,
  products = [],
  cartItems = [],
  deals = [],
  activeDealCategory,
  onAddToCart,
  onUpdateCartQty,
  onBargainClick,
  wishlistIds = [],
  onToggleWishlist,
  onOpenProductDetail,
}) => {
  const activeDealsList: (DealScheduleItem | CustomDeal)[] = deals.length > 0
    ? deals.filter(d => d.isActive !== false)
    : ALTERNATE_DEAL_SCHEDULE;

  const { today, tomorrow, todayIndex } = getTodaysDealSchedule();
  
  // If an activeDealCategory was explicitly set by Admin or selected, find its index
  const initialIndex = activeDealCategory
    ? Math.max(0, activeDealsList.findIndex(d => d.category === activeDealCategory))
    : todayIndex % Math.max(1, activeDealsList.length);

  const [activeDealIndex, setActiveDealIndex] = useState<number>(initialIndex);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [couponClaimed, setCouponClaimed] = useState(false);
  const [showScheduleGrid, setShowScheduleGrid] = useState(false);
  
  const carouselRef = useRef<HTMLDivElement>(null);

  const currentDeal = activeDealsList[activeDealIndex] || activeDealsList[0] || today;
  const isViewingToday = activeDealIndex === (todayIndex % Math.max(1, activeDealsList.length));
  const isViewingTomorrow = activeDealIndex === ((todayIndex + 1) % Math.max(1, activeDealsList.length));

  // Filter products for the currently viewed deal category
  const dealProducts = products.filter(p => {
    const categoryMatch = p.category.toLowerCase().includes(currentDeal.category.toLowerCase()) ||
      currentDeal.category.toLowerCase().includes(p.category.toLowerCase());
    const aliasMatch = (currentDeal as any).categoryAliases?.some((alias: string) =>
      p.category.toLowerCase().includes(alias.toLowerCase()) || alias.toLowerCase().includes(p.category.toLowerCase())
    );
    return categoryMatch || aliasMatch || p.isTodayDeal;
  });

  // Midnight countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);

      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClaimCoupon = () => {
    setCouponClaimed(true);
    onSelectCategory(currentDeal.category);
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-to-br from-[#0a192f] via-[#0f2744] to-[#071322] rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-2xl relative overflow-hidden border-2 border-[#1e3a5f] ring-1 ring-amber-400/20 my-4 sm:my-6 transition-all">
      
      {/* Background Ambient Glow Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-sky-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* TOP HEADER BAR: Quick-commerce Badges with High-Contrast Outlines */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 mb-4 border-b border-[#1e3a5f]">
        
        {/* Title & Delivery Time Pill */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-md banner-badge-shine border border-amber-300 font-freshness">
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>100% FRESHNESS YOUR ENVIRONMENT</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-black text-base sm:text-lg text-white tracking-tight flex items-center gap-1.5 drop-shadow-md">
              <span>Today's Deal Showcase</span>
            </span>
            <span className="bg-amber-500 text-slate-950 text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md animate-pulse border border-amber-300">
              FLAT 30% OFF
            </span>
          </div>
        </div>

        {/* Tab Switchers with Outlines */}
        <div className="flex items-center gap-1.5 bg-[#051120]/95 p-1 rounded-xl border border-[#1b385c] self-start sm:self-auto overflow-x-auto max-w-full scrollbar-none shadow-md">
          <button
            onClick={() => setActiveDealIndex(todayIndex)}
            className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              isViewingToday
                ? 'bg-amber-400 text-slate-950 shadow-md border border-amber-300'
                : 'text-amber-100 hover:text-white hover:bg-[#143257]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Today's Deal</span>
          </button>

          <button
            onClick={() => setActiveDealIndex((todayIndex + 1) % ALTERNATE_DEAL_SCHEDULE.length)}
            className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              isViewingTomorrow
                ? 'bg-[#fbf9f5] text-[#0a192f] shadow-md border border-[#ded2bc]'
                : 'text-amber-100 hover:text-white hover:bg-[#143257]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Tomorrow's Preview</span>
          </button>

          <button
            onClick={() => setShowScheduleGrid(!showScheduleGrid)}
            className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              showScheduleGrid
                ? 'bg-[#0a192f] text-amber-300 border border-amber-400/50 shadow-xs'
                : 'text-amber-100 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>6-Day Schedule</span>
          </button>
        </div>
      </div>

      {/* QUICK CATEGORY SWITCHER RIBBON */}
      <div className="relative z-10 mb-4 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {activeDealsList.map((item, idx) => {
            const isSelected = idx === activeDealIndex;
            const isToday = idx === (todayIndex % Math.max(1, activeDealsList.length));

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveDealIndex(idx);
                  onSelectCategory(item.category);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300/40 shadow-md'
                    : 'bg-[#0e2440]/90 text-amber-100 border-[#22446d] hover:bg-[#143257] hover:text-white'
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{item.category}</span>
                {isToday && (
                  <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                    LIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* HERO SPOTLIGHT BANNER with High-Contrast Outlines & Tangible Benefits */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Col (7 cols): Deal Headline, Value Props & Actions */}
        <div className="lg:col-span-7 space-y-3.5 flex flex-col justify-between">
          
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md banner-badge-shine border border-white/20">
                <Percent className="w-3.5 h-3.5" /> Flat 30% OFF Category Deal
              </span>
              <span className="text-amber-200 text-xs font-extrabold flex items-center gap-1 bg-[#061224]/80 px-2.5 py-0.5 rounded-lg border border-[#1f3f66]">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" /> Auto-Applied at Checkout
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight flex items-center gap-2.5 drop-shadow-lg">
              <span className="text-3xl sm:text-4xl">{currentDeal.icon}</span>
              <span>{currentDeal.title}</span>
            </h2>

            <p className="text-slate-200/90 text-xs sm:text-sm font-normal leading-relaxed">
              {currentDeal.description} <strong className="text-amber-300 underline decoration-amber-400 underline-offset-2">100% Stackable with Bazli Live Mandi Bargaining!</strong>
            </p>

            {/* Beneficial Value Props Callouts */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              <div className="bg-[#061224]/90 border border-[#1b385c] rounded-xl p-2 text-[10px] font-bold text-slate-200 flex items-center gap-1.5 font-freshness">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" /> 100% freshness your environment
              </div>
              <div className="bg-[#061224]/90 border border-[#1b385c] rounded-xl p-2 text-[10px] font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Zero Risk Return
              </div>
              <div className="bg-[#061224]/90 border border-[#1b385c] rounded-xl p-2 text-[10px] font-bold text-slate-200 flex items-center gap-1.5 col-span-2 sm:col-span-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" /> 5% Coins Auto-Back
              </div>
            </div>
          </div>

          {/* Value Props & Countdown Timer */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
            
            {/* Ticker Timer */}
            <div className="bg-[#061224]/95 border-2 border-[#1b385c] px-3.5 py-2 rounded-xl flex items-center justify-between sm:justify-start space-x-2.5 shadow-inner">
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                <span className="text-amber-200 text-[10px] font-black uppercase tracking-wider">
                  {isViewingToday ? 'Resets In:' : 'Starts In:'}
                </span>
              </div>

              <div className="flex items-center gap-1 font-mono font-black text-amber-300 text-xs sm:text-sm">
                <span className="bg-[#030914] px-2 py-0.5 rounded border border-[#152e4d] shadow-xs">
                  {String(timeLeft.hours).padStart(2, '0')}h
                </span>
                <span>:</span>
                <span className="bg-[#030914] px-2 py-0.5 rounded border border-[#152e4d] shadow-xs">
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </span>
                <span>:</span>
                <span className="bg-[#030914] px-2 py-0.5 rounded border border-[#152e4d] shadow-xs">
                  {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleClaimCoupon}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-lg border hover:scale-105 ${
                  couponClaimed
                    ? 'bg-[#fbf9f5] text-[#0a192f] border-[#ded2bc] ring-2 ring-amber-300/40'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-300'
                }`}
              >
                {couponClaimed ? <Check className="w-4 h-4" /> : <Ticket className="w-4 h-4" />}
                <span>{couponClaimed ? '30% Coupon Active' : 'Claim 30% Coupon'}</span>
              </button>

              <button
                onClick={() => onSelectCategory(currentDeal.category)}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-lg border hover:scale-105 ${
                  selectedCategory === currentDeal.category
                    ? 'bg-[#fbf9f5] text-[#0a192f] border-white ring-2 ring-white/50'
                    : 'bg-white/10 hover:bg-white/20 border-white/40 text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {selectedCategory === currentDeal.category
                    ? `Active (${dealProducts.length})`
                    : `Shop (${dealProducts.length})`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Right Col (5 cols): High-Impact Category Hero Card with Radiant Outlined Border */}
        <div className="lg:col-span-5 relative group min-h-[170px] sm:min-h-[200px] lg:min-h-[220px] rounded-3xl overflow-hidden border-2 border-[#1e3a5f] shadow-2xl flex flex-col justify-end p-4 sm:p-5 group-hover:border-amber-400 transition-colors">
          <img
            src={currentDeal.image}
            alt={currentDeal.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#051120] via-[#051120]/60 to-transparent"></div>

          <div className="absolute top-3 right-3 bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1 border border-amber-300 z-10 banner-badge-shine">
            <Percent className="w-3 h-3" /> 30% OFF TODAY
          </div>

          <div className="relative z-10 space-y-1.5 text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-[#051120]/90 px-2.5 py-0.5 rounded-md border border-amber-400/40 inline-block">
              {currentDeal.category}
            </span>
            <h4 className="text-lg font-black text-white leading-tight drop-shadow-md">
              {currentDeal.title}
            </h4>
            <div className="flex items-center justify-between text-xs font-black pt-1 text-amber-300">
              <span>{dealProducts.length} Items on 30% Sale</span>
              <button
                onClick={() => onSelectCategory(currentDeal.category)}
                className="text-amber-300 hover:text-white flex items-center gap-1 hover:underline cursor-pointer bg-[#051120]/80 px-2.5 py-1 rounded-lg border border-amber-400/30"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* EXPANDABLE 6-DAY DEAL SCHEDULE */}
      {showScheduleGrid && (
        <div className="mt-4 pt-4 border-t border-[#1e3a5f] animate-fadeIn relative z-10">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Rotational 6-Day 30% OFF Schedule
            </h3>
            <span className="text-xs text-amber-200 hidden sm:inline font-medium">
              Click any day to view category deals & benefits
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {activeDealsList.map((item, idx) => {
              const isToday = idx === (todayIndex % Math.max(1, activeDealsList.length));
              const isTomorrow = idx === ((todayIndex + 1) % Math.max(1, activeDealsList.length));
              const isSelected = idx === activeDealIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveDealIndex(idx);
                    onSelectCategory(item.category);
                  }}
                  className={`rounded-2xl border-2 text-left transition-all cursor-pointer relative group overflow-hidden ${
                    isSelected
                      ? 'ring-2 ring-amber-400 border-amber-300 shadow-xl scale-102 bg-[#0f2744]'
                      : 'border-[#1b385c] hover:border-amber-400 bg-[#061224]'
                  }`}
                >
                  <div className="h-16 sm:h-20 w-full relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.category}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#051120] via-[#051120]/40 to-transparent"></div>

                    {isToday && (
                      <span className="absolute top-1.5 right-1.5 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-md z-10 banner-badge-shine">
                        TODAY
                      </span>
                    )}
                    {isTomorrow && (
                      <span className="absolute top-1.5 right-1.5 bg-[#fbf9f5] text-[#0a192f] font-black text-[9px] px-2 py-0.5 rounded-full shadow-md z-10">
                        TOMORROW
                      </span>
                    )}
                  </div>

                  <div className="p-2.5 bg-[#061224]">
                    <div className="text-xs font-black text-white line-clamp-1 flex items-center gap-1">
                      <span>{item.icon}</span>
                      <span>{item.category}</span>
                    </div>
                    <div className="text-[10px] font-extrabold text-amber-300 mt-0.5">
                      {item.discountPercent}% OFF DEAL
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DEAL PRODUCTS SHELF / CAROUSEL */}
      {dealProducts.length > 0 && (
        <div className="mt-5 pt-4 border-t border-[#1e3a5f] relative z-10">
          
          {/* Header & Carousel Nav Controls */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-400 text-slate-950 p-1.5 rounded-lg text-xs font-black shadow-sm">
                <Flame className="w-4 h-4 fill-slate-950" />
              </span>
              <h3 className="text-xs sm:text-sm font-black text-white tracking-tight">
                Featured In Today's 30% OFF Sale ({dealProducts.length} Items)
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => scrollCarousel('left')}
                className="w-8 h-8 rounded-full bg-[#061224]/90 border border-[#1b385c] hover:border-amber-400 text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                className="w-8 h-8 rounded-full bg-[#061224]/90 border border-[#1b385c] hover:border-amber-400 text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectCategory(currentDeal.category)}
                className="text-xs text-amber-300 hover:text-amber-200 font-black ml-1.5 flex items-center gap-1 hover:underline cursor-pointer bg-[#061224] px-3 py-1.5 rounded-xl border border-[#1b385c]"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Horizontal Scrollable Products Shelf with High-Contrast Outlines */}
          <div
            ref={carouselRef}
            className="flex items-stretch gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
          >
            {dealProducts.map(product => {
              const dealPrice = getProductDealPrice(product, currentDeal.category);
              const originalPrice = product.mrp || product.sellingPrice;
              const savings = originalPrice - dealPrice;
              const cartItem = cartItems.find(i => i.product.id === product.id);
              const qty = cartItem?.quantity || 0;
              const isWishlisted = wishlistIds.includes(product.id);

              return (
                <div
                  key={product.id}
                  className="w-[160px] sm:w-[180px] md:w-[195px] shrink-0 snap-start bg-[#061224]/95 border-2 border-[#1b385c] hover:border-amber-400 rounded-2xl p-2.5 flex flex-col justify-between transition-all hover:shadow-2xl group relative overflow-hidden"
                >
                  {/* Top Badges & Wishlist */}
                  <div className="flex items-center justify-between mb-1.5 z-10">
                    <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                      <Flame className="w-3 h-3 fill-slate-950" /> 30% OFF
                    </span>

                    {onToggleWishlist && (
                      <button
                        onClick={() => onToggleWishlist(product)}
                        className="p-1 rounded-full bg-[#0d223c] hover:bg-[#143257] text-amber-200 transition-colors cursor-pointer"
                        title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    )}
                  </div>

                  {/* Product Thumbnail with 10 Mins Pill */}
                  <div
                    onClick={() => onOpenProductDetail?.(product)}
                    className="w-full h-24 sm:h-28 bg-[#030914] rounded-xl overflow-hidden mb-2 relative flex items-center justify-center p-1.5 border border-[#152e4d] cursor-pointer"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform"
                      loading="lazy"
                    />
                    <div className="absolute bottom-1 left-1 bg-[#061224]/95 text-amber-300 font-extrabold text-[7.5px] px-1.5 py-0.5 rounded border border-[#1b385c] font-freshness whitespace-nowrap">
                      🌿 100% freshness your environment
                    </div>
                  </div>

                  {/* Title & Quantity */}
                  <div
                    onClick={() => onOpenProductDetail?.(product)}
                    className="space-y-0.5 text-left cursor-pointer"
                  >
                    <h4 className="font-bold text-xs text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-[10px] text-slate-300/80 line-clamp-1 font-medium">
                      {product.quantity} • {product.sellerName}
                    </p>
                  </div>

                  {/* Pricing Block with Gold Highlights */}
                  <div className="mt-2 pt-1.5 border-t border-[#152e4d] text-left">
                    <div className="flex items-baseline space-x-1.5">
                      <span className="font-black text-sm text-amber-300">
                        ₹{dealPrice}
                      </span>
                      {originalPrice > dealPrice && (
                        <span className="text-[10px] text-slate-400 line-through">
                          ₹{originalPrice}
                        </span>
                      )}
                    </div>
                    {savings > 0 && (
                      <div className="text-[9px] text-amber-400 font-extrabold">
                        Save ₹{savings} (30% OFF)
                      </div>
                    )}
                  </div>

                  {/* Action Buttons: Add / Stepper & Bargain */}
                  <div className="mt-2 flex items-center gap-1.5">
                    {qty > 0 && onUpdateCartQty ? (
                      <div className="flex-1 bg-amber-500 text-slate-950 rounded-xl py-1 px-1 flex items-center justify-between text-xs font-black shadow-sm">
                        <button
                          onClick={() => onUpdateCartQty(product, qty - 1)}
                          className="hover:bg-amber-600 p-0.5 rounded cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span>{qty}</span>
                        <button
                          onClick={() => onUpdateCartQty(product, qty + 1)}
                          className="hover:bg-amber-600 p-0.5 rounded cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onAddToCart?.(product)}
                        className="flex-1 bg-[#fbf9f5] hover:bg-amber-100 text-[#0a192f] font-black text-[10px] py-1.5 px-2 rounded-xl flex items-center justify-center space-x-1 cursor-pointer transition-colors shadow-sm"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>+ ADD</span>
                      </button>
                    )}

                    {product.bargainingAllowed && onBargainClick && (
                      <button
                        onClick={() => onBargainClick(product)}
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 p-1.5 rounded-xl text-xs font-black cursor-pointer transition-colors shrink-0 shadow-sm"
                        title="Bargain further with Bazli"
                      >
                        <Scale className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

    </section>
  );
};
