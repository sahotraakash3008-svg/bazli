import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  Ticket,
  Check,
  Coins,
  Scale,
  Bell,
  CheckCircle2,
  Crown
} from 'lucide-react';
import {
  getTodaysDealSchedule,
  ALTERNATE_DEAL_SCHEDULE,
  DealScheduleItem
} from '../data/todaysDeals';
import { Product, CartItem, CustomDeal } from '../types';

interface BazliBannerCarouselProps {
  onShopNow: () => void;
  onExploreDeals: () => void;
  onStartBargaining: () => void;
  onOpenDeliveryRegisterModal?: () => void;
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
}

export const BazliBannerCarousel: React.FC<BazliBannerCarouselProps> = ({
  onExploreDeals,
  onStartBargaining,
  onSelectCategory,
  deals = [],
  activeDealCategory
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [copiedCoupon, setCopiedCoupon] = useState<boolean>(false);
  const [alertSet, setAlertSet] = useState<boolean>(false);

  // Real-time Countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const activeDealsList: (DealScheduleItem | CustomDeal)[] = deals.length > 0
    ? deals.filter(d => d.isActive !== false)
    : ALTERNATE_DEAL_SCHEDULE;

  const { today } = getTodaysDealSchedule();
  const currentDeal = activeDealsList.find(d => d.category === activeDealCategory) || activeDealsList[0] || today;

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

  // Highly beneficial, curated, ultra-compact single banner slides
  const SLIDES = [
    {
      id: 'crazy-deal',
      badge: '🔥 CRAZY FLASH DEALS',
      badgeClass: 'bg-rose-600 text-white font-black animate-pulse',
      title: `${currentDeal.title} • Flat ${currentDeal.discountPercent || 40}% OFF`,
      benefit: '⚡ 10-Min Doorstep Dispatch',
      subtext: `Valid on fresh essentials • Ends in ${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`,
      cta: 'Shop Deals',
      gradient: 'from-[#1c0809] via-[#2d1013] to-[#140608]',
      borderColor: 'border-rose-500/60',
      icon: '🔥',
      action: () => {
        onSelectCategory(currentDeal.category);
        onExploreDeals();
      }
    },
    {
      id: 'ai-bargain',
      badge: '🤝 BAZLI LIVE MANDI BARGAIN',
      badgeClass: 'bg-amber-400 text-stone-950 font-black',
      title: 'Pay Your Own Price: Live Bazli Price Negotiation',
      benefit: '⚡ Save ₹5 to ₹50 Instantly',
      subtext: 'Why pay MRP? Instant counter offers on 100+ fresh veggies, atta & staples',
      cta: 'Bargain Now',
      gradient: 'from-[#1a1106] via-[#2a1a09] to-[#120c05]',
      borderColor: 'border-amber-500/70',
      icon: '⚖️',
      action: onStartBargaining
    },
    {
      id: 'coupon-benefit',
      badge: '🎟️ MEGA DISCOUNT VOUCHER',
      badgeClass: 'bg-teal-400 text-stone-950 font-black',
      title: 'Use Code BAZLI50: Flat ₹50 OFF + ₹0 Free Delivery',
      benefit: '⚡ 5% Cashback Coins',
      subtext: 'Applicable automatically at checkout on all orders above ₹499',
      cta: 'Copy & Save',
      gradient: 'from-[#081717] via-[#0d2726] to-[#061212]',
      borderColor: 'border-teal-400/70',
      icon: '🎁',
      action: () => {
        navigator.clipboard.writeText('BAZLI50');
        setCopiedCoupon(true);
        setTimeout(() => setCopiedCoupon(false), 2500);
      }
    },
    {
      id: 'upcoming-drop',
      badge: '⏰ NEXT FLASH DROP @ 8:00 PM',
      badgeClass: 'bg-indigo-600 text-white font-black',
      title: 'Dinner Mandi Rush: Up to 50% OFF Fresh Greens & Paneer',
      benefit: '⚡ Auto-Notification Alert',
      subtext: 'Stock refreshes at 8 PM • Farm fresh direct harvest dispatch',
      cta: alertSet ? 'Alert Active' : 'Remind Me',
      gradient: 'from-[#0e101f] via-[#161a33] to-[#0a0c17]',
      borderColor: 'border-indigo-500/60',
      icon: '🥦',
      action: () => {
        setAlertSet(!alertSet);
      }
    }
  ];

  // Auto slide rotation every 4.5s
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, SLIDES.length]);

  const slide = SLIDES[currentSlide];

  const handleCopyCoupon = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('BAZLI50');
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  return (
    <div
      className="w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* SINGLE HIGH-IMPACT BENEFICIAL BANNER (Height: ~68px to 76px, Zero Layout Bloat) */}
      <div
        onClick={slide.action}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${slide.gradient} text-white px-3 sm:px-4 py-2 sm:py-2.5 border-2 ${slide.borderColor} shadow-md flex items-center justify-between gap-2.5 cursor-pointer transition-all hover:scale-[1.005] group`}
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-32 h-16 bg-white/5 rounded-full blur-xl pointer-events-none" />

        {/* Left Icon & Text */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 text-left">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black/50 border border-white/20 flex items-center justify-center text-base sm:text-lg shrink-0 shadow-inner group-hover:rotate-6 transition-transform">
            <span>{slide.icon}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${slide.badgeClass} shrink-0`}>
                {slide.badge}
              </span>
              <span className="text-[10px] text-amber-300 font-extrabold hidden sm:inline-flex items-center gap-1 shrink-0">
                <span>{slide.benefit}</span>
              </span>
            </div>

            <p className="text-[11px] sm:text-[13px] font-black text-white leading-tight break-words line-clamp-1 sm:line-clamp-none mt-0.5 group-hover:text-amber-300 transition-colors">
              {slide.title}
            </p>
            <p className="text-[10px] text-stone-300 font-medium truncate hidden sm:block">
              {slide.subtext}
            </p>
          </div>
        </div>

        {/* Right CTA & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Code Badge if on coupon slide */}
          {slide.id === 'coupon-benefit' && (
            <button
              onClick={handleCopyCoupon}
              className="bg-black/60 hover:bg-black/80 text-amber-300 border border-dashed border-teal-400 px-2 py-1 rounded-lg text-[10px] font-mono font-black hidden sm:flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              {copiedCoupon ? <Check className="w-3 h-3 text-emerald-400" /> : <Ticket className="w-3 h-3 text-teal-300" />}
              <span>{copiedCoupon ? 'COPIED!' : 'BAZLI50'}</span>
            </button>
          )}

          {/* Action Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              slide.action();
            }}
            className="bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-stone-950 font-black text-[11px] sm:text-xs px-3 sm:px-3.5 py-1.5 rounded-xl flex items-center gap-1 shadow-md group-hover:scale-105 transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <span>{copiedCoupon && slide.id === 'coupon-benefit' ? 'Copied' : alertSet && slide.id === 'upcoming-drop' ? 'Alert Set ✓' : slide.cta}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Carousel Arrows */}
          <div className="hidden md:flex items-center gap-0.5 ml-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(prev => (prev - 1 + SLIDES.length) % SLIDES.length);
              }}
              className="w-6 h-6 rounded-full bg-black/40 text-stone-300 hover:bg-amber-400 hover:text-black flex items-center justify-center transition-colors cursor-pointer border border-white/10"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(prev => (prev + 1) % SLIDES.length);
              }}
              className="w-6 h-6 rounded-full bg-black/40 text-stone-300 hover:bg-amber-400 hover:text-black flex items-center justify-center transition-colors cursor-pointer border border-white/10"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Small Dot Indicators at Bottom */}
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex items-center gap-1">
          {SLIDES.map((s, idx) => (
            <span
              key={s.id}
              className={`h-1 rounded-full transition-all ${
                currentSlide === idx ? 'w-3 bg-amber-400' : 'w-1 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
