import React from 'react';
import { Home, UtensilsCrossed, BookOpen, Camera, Sparkles, ShoppingBag } from 'lucide-react';
import { UserRole } from '../types';
import { hapticSelection } from '../utils/haptics';

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentRole: UserRole;
  wishlistCount?: number;
  onOpenWishlist?: () => void;
  cartCount?: number;
  cartSubtotal?: number;
  onOpenCart?: () => void;
  onOpenVoiceAssistant?: () => void;
  onOpenParchhiScanner?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  currentRole,
  cartCount = 0,
  cartSubtotal = 0,
  onOpenCart,
  onOpenParchhiScanner,
}) => {
  // Only display for customer role
  if (currentRole !== 'customer') return null;

  const isRestaurant = activeTab === 'restaurants';
  const isStationery = activeTab === 'stationery';

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 safe-area-bottom pointer-events-none">
      <div className="max-w-md mx-auto relative pointer-events-auto">
        
        {/* Mathematically Seamless Symmetrical Curved Arch that merges flawlessly with the straight footer */}
        <div className="absolute -top-[32px] left-1/2 -translate-x-1/2 w-[96px] h-[36px] pointer-events-none overflow-visible">
          <svg
            className="w-[96px] h-[36px]"
            viewBox="0 0 96 36"
            fill="none"
          >
            {/* Seamless background filler that matches footer background */}
            <path
              d="M 0 32 C 12 32, 20 28, 27 22 C 34 16, 40 6, 48 6 C 56 6, 62 16, 69 22 C 76 28, 84 32, 96 32 L 96 36 L 0 36 Z"
              fill="var(--bazli-header-bg, #0a192f)"
              fillOpacity="0.98"
            />
            {/* Smooth continuous top border that merges seamlessly with the straight lines on left & right */}
            <path
              d="M 0 32 C 12 32, 20 28, 27 22 C 34 16, 40 6, 48 6 C 56 6, 62 16, 69 22 C 76 28, 84 32, 96 32"
              stroke="var(--bazli-primary, #f59e0b)"
              strokeOpacity="0.6"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Main Footer Container with Dynamic Theme Background */}
        <div
          className="relative backdrop-blur-xl rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.5)] px-2 py-1.5 flex items-center justify-between"
          style={{
            backgroundColor: 'var(--bazli-header-bg, #0a192f)'
          }}
        >
          {/* Straight Top Border on the LEFT - stops exactly where the center cradle begins at 48px from center */}
          <div
            className="absolute top-0 left-0 right-[calc(50%+48px)] h-[1.5px] rounded-tl-2xl pointer-events-none"
            style={{
              backgroundColor: 'var(--bazli-primary, #f59e0b)',
              opacity: 0.6
            }}
          />

          {/* Straight Top Border on the RIGHT - starts exactly where the center cradle ends at 48px from center */}
          <div
            className="absolute top-0 left-[calc(50%+48px)] right-0 h-[1.5px] rounded-tr-2xl pointer-events-none"
            style={{
              backgroundColor: 'var(--bazli-primary, #f59e0b)',
              opacity: 0.6
            }}
          />

          {/* Left Navigation Items: Grocery & Food */}
          <div className="flex items-center justify-around flex-1">
            
            {/* 1. Grocery Tab */}
            <button
              onClick={() => {
                hapticSelection();
                onSelectTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'home' || activeTab === 'shop' || activeTab === 'categories'
                  ? 'text-amber-400 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              style={{
                color: (activeTab === 'home' || activeTab === 'shop' || activeTab === 'categories')
                  ? 'var(--bazli-primary, #f59e0b)'
                  : undefined
              }}
            >
              <div className="relative">
                <Home className="w-5 h-5" />
                {(activeTab === 'home' || activeTab === 'shop' || activeTab === 'categories') && (
                  <span
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--bazli-primary, #f59e0b)' }}
                  />
                )}
              </div>
              <span className="text-[10px] sm:text-[10.5px] tracking-tight mt-0.5">Grocery</span>
            </button>

            {/* 2. Food & Dining Tab */}
            <button
              onClick={() => {
                hapticSelection();
                onSelectTab('restaurants');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer relative ${
                isRestaurant
                  ? 'text-orange-400 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <UtensilsCrossed className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black text-[7px] px-1 rounded-full animate-pulse border border-orange-400/50">
                  HOT
                </span>
                {isRestaurant && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-orange-400 rounded-full" />
                )}
              </div>
              <span className="text-[10px] sm:text-[10.5px] tracking-tight mt-0.5">Food</span>
            </button>

          </div>

          {/* Center: Elevated Scan Pod Cradled with Precision into the Arch */}
          <div className="relative flex flex-col items-center justify-center -mt-7 w-20 sm:w-24 shrink-0">
            {/* Ambient soft emerald backlight halo inside the cradle */}
            <div className="absolute inset-0 -top-1 bg-emerald-500/25 rounded-full blur-md pointer-events-none scan-ambient-glow-10s" />

            <button
              id="mobile-nav-scan-btn"
              onClick={() => {
                hapticSelection();
                if (onOpenParchhiScanner) {
                  onOpenParchhiScanner();
                }
              }}
              className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-[2px] shadow-[0_6px_20px_rgba(16,185,129,0.45)] border border-emerald-300/70 active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer group scan-button-flip-10s z-10"
              title="Scan Handwritten Parchhi / Items with Bazli"
            >
              <div className="w-full h-full rounded-full flex flex-col items-center justify-center bg-gradient-to-b from-emerald-500 to-teal-700 text-white relative overflow-hidden">
                {/* 10-second sweep shine beam that glints when flipping */}
                <div className="scan-shine-sweep-10s" />

                <Camera className="w-5 h-5 text-white drop-shadow group-hover:scale-110 transition-transform relative z-10" />
                <span className="text-[9px] font-black tracking-wider uppercase text-emerald-100 mt-0.5 leading-none flex items-center relative z-10">
                  Scan
                  <Sparkles className="w-2 h-2 text-amber-300 ml-0.5" />
                </span>
              </div>

              {/* Glowing Pulse Dot */}
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 z-20">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400 border border-slate-950" />
              </span>
            </button>
          </div>

          {/* Right Navigation Items: Kids & Art & Cart */}
          <div className="flex items-center justify-around flex-1">

            {/* 4. Stationery & Books Tab */}
            <button
              onClick={() => {
                hapticSelection();
                onSelectTab('stationery');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer relative ${
                isStationery
                  ? 'text-pink-400 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <BookOpen className={`w-5 h-5 ${isStationery ? 'text-pink-400' : ''}`} />
                <span className="absolute -top-1.5 -right-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-400 text-slate-950 font-black text-[7px] px-1 rounded-full border border-pink-300">
                  FUN
                </span>
                {isStationery && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gradient-to-r from-pink-400 to-yellow-300 rounded-full" />
                )}
              </div>
              <span className="text-[10px] sm:text-[10.5px] tracking-tight mt-0.5">Kids & Art</span>
            </button>

            {/* 5. Cart Tab */}
            <button
              onClick={() => {
                hapticSelection();
                if (onOpenCart) {
                  onOpenCart();
                }
              }}
              className="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer relative text-slate-400 hover:text-slate-200"
            >
              <div className="relative">
                <ShoppingBag className={`w-5 h-5 ${cartCount > 0 ? 'text-emerald-400' : ''}`} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-[8px] min-w-[15px] h-[15px] px-1 rounded-full flex items-center justify-center border border-emerald-300 shadow-sm animate-pulse">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] sm:text-[10.5px] tracking-tight mt-0.5 ${cartCount > 0 ? 'text-emerald-400 font-bold' : ''}`}>
                {cartCount > 0 ? `₹${cartSubtotal}` : 'Cart'}
              </span>
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};
