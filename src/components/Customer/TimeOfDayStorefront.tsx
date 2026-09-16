import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sun,
  Moon,
  Coffee,
  Sparkles,
  Zap,
  ShoppingBag,
  Plus,
  Flame,
  Clock,
  ArrowRight,
  TrendingUp,
  Heart,
  Timer
} from 'lucide-react';
import { Product } from '../../types';
import { hapticAddToCart, hapticSelection } from '../../utils/haptics';

export type TimeOfDayPeriod = 'morning' | 'afternoon' | 'evening' | 'latenight';

interface TimeOfDayStorefrontProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onSelectCategory?: (category: string) => void;
  onBargainClick?: (product: Product) => void;
  wishlistIds?: string[];
  onToggleWishlist?: (productId: string) => void;
  onOpenProductDetail?: (product: Product) => void;
}

interface PeriodConfig {
  id: TimeOfDayPeriod;
  name: string;
  tagline: string;
  badge: string;
  icon: string;
  timeRange: string;
  bgColor: string;
  borderColor: string;
  accentColor: string;
  filterKeywords: string[];
  bannerHighlight: string;
}

export const TIME_PERIODS: PeriodConfig[] = [
  {
    id: 'morning',
    name: 'Morning Fresh & Breakfast',
    tagline: 'Farm fresh milk, warm bakery bread, brown eggs & morning chai',
    badge: '6 AM - 11 AM PRIORITY',
    icon: '☀️',
    timeRange: '6:00 AM - 11:00 AM',
    bgColor: 'from-amber-500/15 via-orange-500/10 to-yellow-500/5',
    borderColor: 'border-amber-400/40',
    accentColor: 'text-amber-700 bg-amber-100',
    filterKeywords: ['milk', 'bread', 'butter', 'egg', 'tea', 'chai', 'coffee', 'paneer', 'curd', 'dahi', 'juice', 'corn flakes', 'oats'],
    bannerHighlight: 'Get fresh milk & bread delivered within 8-10 minutes flat!'
  },
  {
    id: 'afternoon',
    name: 'Lunch & Fresh Mandi Picks',
    tagline: 'Fresh farm veggies, Aashirvaad atta, basmati rice & cooking oils',
    badge: '11 AM - 4 PM MIDDAY RUSH',
    icon: '🍛',
    timeRange: '11:00 AM - 4:00 PM',
    bgColor: 'from-emerald-500/15 via-teal-500/10 to-green-500/5',
    borderColor: 'border-emerald-400/40',
    accentColor: 'text-emerald-800 bg-emerald-100',
    filterKeywords: ['atta', 'rice', 'dal', 'oil', 'ghee', 'tomato', 'potato', 'onion', 'masala', 'paneer', 'salt', 'sugar', 'spices'],
    bannerHighlight: 'Live Mandi Bargain active on all fresh kitchen essentials!'
  },
  {
    id: 'evening',
    name: 'Evening Chai & Snacks Club',
    tagline: 'Hot samosas, crunchy chips, biscuits, cold sodas & quick bites',
    badge: '4 PM - 9 PM CHAI TIME',
    icon: '☕',
    timeRange: '4:00 PM - 9:00 PM',
    bgColor: 'from-orange-500/15 via-amber-500/10 to-rose-500/5',
    borderColor: 'border-orange-400/40',
    accentColor: 'text-orange-800 bg-orange-100',
    filterKeywords: ['chai', 'tea', 'biscuit', 'chips', 'namkeen', 'samosa', 'maggi', 'noodle', 'beverage', 'rusk', 'cookie', 'juice'],
    bannerHighlight: 'Chai-time combos at flat 30% OFF with zero delivery fees!'
  },
  {
    id: 'latenight',
    name: 'Midnight Cravings & Night Owl Lounge',
    tagline: 'Midnight ice creams, chocolates, 2-min noodles & cold drinks',
    badge: '9 PM - 4 AM MIDNIGHT DISPATCH',
    icon: '🌙',
    timeRange: '9:00 PM - 4:00 AM',
    bgColor: 'from-purple-900/20 via-indigo-900/15 to-slate-900/10',
    borderColor: 'border-purple-500/40',
    accentColor: 'text-purple-900 bg-purple-100',
    filterKeywords: ['ice cream', 'chocolate', 'maggi', 'chips', 'coke', 'soda', 'wafer', 'snack', 'midnight', 'instant', 'popcorn'],
    bannerHighlight: 'Open all night! Instant 10-minute dark store dispatch.'
  }
];

export const TimeOfDayStorefront: React.FC<TimeOfDayStorefrontProps> = ({
  products,
  onAddToCart,
  onSelectCategory,
  onBargainClick,
  wishlistIds = [],
  onToggleWishlist,
  onOpenProductDetail
}) => {
  // Determine real local time
  const getAutoPeriod = (): TimeOfDayPeriod => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 16) return 'afternoon';
    if (hour >= 16 && hour < 21) return 'evening';
    return 'latenight';
  };

  const [activePeriodId, setActivePeriodId] = useState<TimeOfDayPeriod>(getAutoPeriod);
  const currentConfig = TIME_PERIODS.find(p => p.id === activePeriodId) || TIME_PERIODS[0];

  // Filter relevant products for current period
  const curatedProducts = React.useMemo(() => {
    const keywords = currentConfig.filterKeywords;
    return products.filter(p => {
      const name = p.name.toLowerCase();
      const cat = p.category.toLowerCase();
      return keywords.some(k => name.includes(k) || cat.includes(k));
    }).slice(0, 10);
  }, [products, currentConfig]);

  return (
    <motion.section
      animate={{
        boxShadow: [
          '0 4px 20px -2px rgba(16, 185, 129, 0.15)',
          '0 6px 28px 2px rgba(245, 158, 11, 0.22)',
          '0 4px 20px -2px rgba(16, 185, 129, 0.15)'
        ]
      }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className={`rounded-2xl border ${currentConfig.borderColor} bg-gradient-to-br ${currentConfig.bgColor} p-3 sm:p-4 transition-all duration-500 relative overflow-hidden shadow-xs golden-shine-beam group`}
    >
      {/* Animated Light Sweep Beam traversing across banner */}
      <motion.div
        animate={{ x: ['-150%', '300%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2.5 }}
        className="absolute inset-y-0 w-48 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 pointer-events-none z-0"
      />

      {/* Dynamic Animated Ambient Background Orbs */}
      <motion.div 
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1.1, 0.95, 1.1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-amber-400/20 blur-xl pointer-events-none" 
      />

      {/* Decorative ambient badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2.5 border-b border-black/10 relative z-10">
        <div className="flex items-center space-x-2.5">
          <motion.div 
            animate={{ 
              y: [0, -4, 0],
              scale: [1, 1.05, 1],
              rotate: [0, -3, 3, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/95 shadow-md flex items-center justify-center text-2xl shrink-0 border border-emerald-300/60 relative overflow-hidden"
          >
            <span className="relative z-10">{currentConfig.icon}</span>
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/40 to-transparent pointer-events-none" />
          </motion.div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-black text-sm sm:text-base text-stone-950 tracking-tight flex items-center gap-1.5">
                <span>{currentConfig.name}</span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-600 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>Live</span>
                </span>
              </h3>
              <motion.span 
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${currentConfig.accentColor} border border-black/10 shadow-2xs`}
              >
                {currentConfig.badge}
              </motion.span>
            </div>
            <p className="text-[11px] text-stone-700 font-medium mt-0.5 line-clamp-1 flex items-center gap-1">
              <span>{currentConfig.tagline}</span>
            </p>
          </div>
        </div>

        {/* Manual Time Switcher Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0 no-scrollbar">
          {TIME_PERIODS.map(period => {
            const isActive = activePeriodId === period.id;
            return (
              <button
                key={period.id}
                onClick={() => {
                  hapticSelection();
                  setActivePeriodId(period.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold shrink-0 transition-all duration-300 cursor-pointer flex items-center space-x-1 relative overflow-hidden ${
                  isActive
                    ? 'bg-[#0a192f] text-amber-300 shadow-sm border border-[#1e3a5f] scale-105'
                    : 'bg-white/80 hover:bg-[#ede5d8] text-slate-700 border border-[#ded2bc] hover:scale-102'
                }`}
              >
                <span className="text-xs">{period.icon}</span>
                <span className="capitalize">{period.id}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Highlight Banner with Animated Shimmer */}
      <div className="py-2 px-3 bg-white/90 backdrop-blur-md rounded-xl border border-emerald-300/60 my-2.5 flex items-center justify-between text-[11px] shadow-2xs relative overflow-hidden">
        <div className="flex items-center space-x-2 relative z-10 min-w-0">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span className="font-extrabold text-slate-900 truncate">
            {currentConfig.bannerHighlight}
          </span>
          <span className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.2 text-[9px] font-black bg-emerald-100 text-emerald-800 rounded-md border border-emerald-300 shrink-0">
            ⚡ 10-Min Fast
          </span>
        </div>
        <div className="flex items-center gap-2 relative z-10 shrink-0 pl-2">
          <span className="text-[10px] font-mono font-bold text-slate-700 hidden sm:inline bg-stone-100/80 px-2 py-0.5 rounded-md border border-stone-200">
            🕒 {currentConfig.timeRange}
          </span>
        </div>
      </div>

      {/* Horizontal Swipeable Product Rail */}
      <div className="flex space-x-2.5 overflow-x-auto pb-1.5 pt-1 no-scrollbar relative z-10">
        {curatedProducts.map((product, idx) => {
          const price = product.sellingPrice || product.price;
          const isWishlisted = wishlistIds.includes(product.id);

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
              whileHover={{ y: -4 }}
              className="w-34 sm:w-38 shrink-0 bg-white rounded-xl border border-[#ded2bc] p-2 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group/card relative"
            >
              {/* Discount / Deal Tag */}
              {product.discountPercentage ? (
                <span className="absolute top-1.5 left-1.5 bg-[#0a192f] text-amber-300 font-black text-[8px] px-1.5 py-0.5 rounded-md shadow-xs z-10 border border-[#1e3a5f] animate-pulse-glow">
                  {product.discountPercentage}% OFF
                </span>
              ) : null}

              {/* Wishlist Button */}
              {onToggleWishlist && (
                <button
                  onClick={() => {
                    hapticSelection();
                    onToggleWishlist(product.id);
                  }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-rose-500 transition-colors shadow-2xs z-10 cursor-pointer hover:scale-110 active:scale-95"
                >
                  <Heart className={`w-3 h-3 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              )}

              {/* Product Image */}
              <div
                onClick={() => onOpenProductDetail?.(product)}
                className="w-full h-22 sm:h-24 rounded-lg overflow-hidden bg-slate-100 mb-1.5 relative cursor-pointer"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover/card:scale-108 transition-transform duration-500 ease-out"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div
                  onClick={() => onOpenProductDetail?.(product)}
                  className="cursor-pointer"
                >
                  <span className="text-[9px] text-slate-500 font-bold block truncate">
                    {product.quantity}
                  </span>
                  <h4 className="font-bold text-[11px] text-slate-900 line-clamp-2 leading-tight h-7 mt-0.5 hover:text-[#0a192f] transition-colors">
                    {product.name}
                  </h4>
                </div>

                <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-black text-slate-950 font-mono">
                      ₹{price}
                    </span>
                    {product.mrp && product.mrp > price && (
                      <span className="text-[9px] text-slate-400 line-through block -mt-1 font-mono">
                        ₹{product.mrp}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      hapticAddToCart();
                      onAddToCart(product);
                    }}
                    className="p-1 px-1.5 rounded-lg bg-[#0a192f] hover:bg-[#132f54] active:scale-90 text-white font-bold transition-all shadow-2xs flex items-center gap-0.5 cursor-pointer text-[10px] hover:shadow-xs"
                    title="Add to cart"
                  >
                    <Plus className="w-3 h-3 text-amber-300" />
                    <span className="text-[9px] font-black uppercase">Add</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
};
