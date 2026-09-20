import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Heart,
  Search,
  MapPin,
  User,
  Percent,
  Sparkles,
  Store,
  Truck,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  UserPlus,
  Bike,
  Lock,
  Unlock,
  LogOut,
  KeyRound,
  UtensilsCrossed,
  Flame,
  ChefHat,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  Smartphone,
  Camera,
  Printer,
  Star,
  Package
} from 'lucide-react';
import { UserRole, LoyaltyTier, Product, CartItem, CustomerProfile, CustomerAddress, SiteContentConfig, Order } from '../types';
import { SearchBar } from './SearchBar';
import { ColorRingPicker } from './ColorRingPicker';
import { SiteTheme } from '../utils/themeUtils';

const BAZLI_LOGO_SRC = '/bazli-logo.jpg?v=2';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isAdminAuthenticated?: boolean;
  onOpenAdminAuth?: () => void;
  onLockAdmin?: () => void;
  isSellerAuthenticated?: boolean;
  onOpenSellerAuth?: () => void;
  onLockSeller?: () => void;
  loyaltyTier: LoyaltyTier;
  onTierChange: (tier: LoyaltyTier) => void;
  cartCount: number;
  wishlistCount?: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSelectTodaysDeals?: () => void;
  onLogoClick?: () => void;
  onHomeClick?: () => void;
  onShopAllClick?: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedZone: string;
  setSelectedZone: (zoneId: string) => void;
  zones: Array<{ id: string; name: string; estimatedTime: string }>;
  selectedAddress?: CustomerAddress;
  onOpenAddressModal?: () => void;
  savedAddresses?: CustomerAddress[];
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onUpdateCartQty?: (product: Product, qty: number) => void;
  cartItems?: CartItem[];
  onBargainClick?: (product: Product) => void;
  onSelectCategory?: (category: string) => void;
  onOpenDeliveryRegisterModal?: () => void;
  onOpenVoiceAssistant?: () => void;
  onOpenCustomerAuth?: (reason?: 'checkout' | 'profile' | 'bargain' | 'general') => void;
  customerProfile?: CustomerProfile;
  canGoBack?: boolean;
  onGoBack?: () => void;
  previousLabel?: string;
  onOpenParchhiScanner?: () => void;
  onOpenPrintoutModal?: () => void;
  isDeliveryAuthenticated?: boolean;
  onOpenDeliveryAuth?: () => void;
  onLockDelivery?: () => void;
  onSubmitSearch?: (query: string) => void;
  currentTheme?: SiteTheme;
  onThemeChange?: (theme: SiteTheme) => void;
  freeDeliveryThreshold?: number;
  standardDeliveryFee?: number;
  announcementTickerText?: string;
  showAnnouncementTicker?: boolean;
  siteContent?: SiteContentConfig;
  activeDeliveryOrder?: Order | null;
  onTrackDeliveryOrder?: () => void;
  unratedDeliveredOrder?: Order | null;
  onRateDeliveredOrder?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  isAdminAuthenticated = false,
  onOpenAdminAuth,
  onLockAdmin,
  isSellerAuthenticated = false,
  onOpenSellerAuth,
  onLockSeller,
  isDeliveryAuthenticated = false,
  onOpenDeliveryAuth,
  onLockDelivery,
  currentTheme,
  onThemeChange,
  activeDeliveryOrder,
  onTrackDeliveryOrder,
  unratedDeliveredOrder,
  onRateDeliveredOrder,
  loyaltyTier,
  onTierChange,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
  activeTab,
  setActiveTab,
  onSelectTodaysDeals,
  onLogoClick,
  onHomeClick,
  onShopAllClick,
  searchQuery,
  setSearchQuery,
  selectedZone,
  setSelectedZone,
  zones,
  selectedAddress,
  onOpenAddressModal,
  savedAddresses = [],
  products = [],
  onSelectProduct,
  onAddToCart,
  onUpdateCartQty,
  cartItems = [],
  onBargainClick,
  onSelectCategory,
  onOpenDeliveryRegisterModal,
  onOpenVoiceAssistant,
  onOpenCustomerAuth,
  customerProfile,
  canGoBack = false,
  onGoBack,
  previousLabel,
  onOpenParchhiScanner,
  onOpenPrintoutModal,
  onSubmitSearch,
  freeDeliveryThreshold = 129,
  standardDeliveryFee = 19,
  announcementTickerText,
  showAnnouncementTicker = true,
  siteContent
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [zoneDropdownOpen, setZoneDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDealIndex, setActiveDealIndex] = useState(0);

  const isRestaurant = activeTab === 'restaurants';
  const isStationery = activeTab === 'stationery';

  // Animated rotating crazy deals
  const groceryDeals = [
    { icon: '🔥', badge: 'CRAZY DEAL', text: 'Farm Fresh Veggies & Fruits at Mandi rates (Up to 60% OFF) • Live Bargain Active!' },
    { icon: '🎁', badge: 'WELCOME GIFT', text: `Flat ₹100 Welcome Cashback + 100% FREE Delivery on First 2 Orders & above ₹${freeDeliveryThreshold}!` },
    { icon: '⚡', badge: 'BAZLI BARGAIN', text: 'Negotiate instant live discounts on 500+ daily essentials with Bazli!' },
    { icon: '🥛', badge: 'DAIRY SAVER', text: 'Fresh Dairy Milk, Malai Paneer & Desi Ghee at lowest local rates!' },
    { icon: '🚀', badge: 'FLASH DISPATCH', text: 'Superfast Guaranteed Doorstep Delivery from Local Dark Stores!' }
  ];

  const restaurantDeals = [
    { icon: '🔥', badge: 'HOT KITCHEN', text: 'Fresh Tandoor, Curries & Biryani dispatched hot & fresh!' },
    { icon: '🍕', badge: 'CRAZY COMBO', text: 'Flat 40% OFF Gourmet Feast Meals + Free Dessert on orders above ₹199!' },
    { icon: '👨‍🍳', badge: 'CHEF SPECIAL', text: 'Sizzling Live Kitchens & Hygiene Certified Cloud Dining!' }
  ];

  const stationeryDeals = [
    { icon: '📚', badge: 'SCHOOL & EXAM', text: 'Classmate Notebooks, Long Registers & Pens at depot wholesale prices!' },
    { icon: '⚡', badge: '10-MIN DISPATCH', text: 'Late night project sheets, charts, Fevicol & geometry kits delivered instantly!' },
    { icon: '🎨', badge: 'ART & OFFICE', text: 'Casio Calculators, A4 Xerox Paper Reams & Acrylic Paint sets • Bazli Bargain Active!' }
  ];

  const activeDealsList = isRestaurant ? restaurantDeals : isStationery ? stationeryDeals : groceryDeals;
  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  // Timer to cycle announcement deals
  useEffect(() => {
    const dealTimer = setInterval(() => {
      setActiveDealIndex(prev => (prev + 1) % activeDealsList.length);
    }, 3500);
    return () => clearInterval(dealTimer);
  }, [activeDealsList.length]);

  const currentZoneObj = zones.find(z => z.id === selectedZone) || zones[0];

  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
    } else if (onLogoClick) {
      onLogoClick();
    } else {
      setActiveTab('home');
    }
    setMobileMenuOpen(false);
  };

  const handleShopClick = () => {
    if (onShopAllClick) {
      onShopAllClick();
    } else {
      setActiveTab('shop');
    }
    setMobileMenuOpen(false);
  };

  const currentDeal = activeDealsList[activeDealIndex % activeDealsList.length] || activeDealsList[0];

  const isCustomOrSelectedTheme = Boolean(currentTheme && currentTheme.id !== 'gold');
  const navbarHeaderBg = isCustomOrSelectedTheme
    ? currentTheme!.headerBg
    : isRestaurant
    ? '#7a1a0d'
    : isStationery
    ? '#230b45'
    : (currentTheme?.headerBg || '#0a192f');

  const navbarBorderColor = currentTheme ? `${currentTheme.primary}44` : undefined;

  const currentPortalContext: 'grocery' | 'restaurant' | 'stationery' = isRestaurant
    ? 'restaurant'
    : isStationery
    ? 'stationery'
    : 'grocery';

  const searchPlaceholder = isRestaurant
    ? "Search biryani, pizza, burger, momos & restaurant meals..."
    : isStationery
    ? "Search notebooks, pens, art supplies & stationery..."
    : "Search fresh veggies, milk, atta, oil, snacks & groceries...";

  return (
    <header
      style={{
        backgroundColor: navbarHeaderBg,
        borderBottomColor: navbarBorderColor
      }}
      className={`sticky top-0 z-50 border-b shadow-xl w-full transition-colors duration-300 ${
        !isCustomOrSelectedTheme && isRestaurant 
          ? 'bg-[#7a1a0d] border-[#962211] text-orange-50' 
          : !isCustomOrSelectedTheme && isStationery
          ? 'bg-gradient-to-r from-purple-950 via-indigo-950 to-pink-950 border-pink-500/30 text-pink-50'
          : 'bg-gradient-to-r from-[#0a192f] via-[#0f2744] to-[#0a192f] border-[#1e3a5f] text-white'
      }`}
    >
      {/* Dynamic Announcement Banner Ticker - Real-time updated from Admin Panel */}
      {showAnnouncementTicker && (announcementTickerText || siteContent?.headerTickerText) && (
        <div className="bg-amber-400 text-slate-950 text-[11px] sm:text-xs py-1 px-3 text-center font-extrabold tracking-tight flex items-center justify-center gap-1.5 overflow-hidden shadow-xs border-b border-amber-500/30">
          <span className="shrink-0">📢</span>
          <span className="truncate">{announcementTickerText || siteContent?.headerTickerText}</span>
        </div>
      )}

      {/* Top Bar: Logo & Brand Status */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-1.5 sm:py-2 w-full">
        <div className="flex items-center justify-between gap-2 w-full">
          
          {/* Logo & Direct Home Trigger - Still and Static */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            {canGoBack && onGoBack && (
              <button
                id="navbar-top-back-btn"
                type="button"
                onClick={onGoBack}
                style={{
                  backgroundColor: currentTheme ? `${currentTheme.primary}25` : undefined,
                  borderColor: currentTheme ? `${currentTheme.primary}66` : undefined,
                  color: currentTheme ? currentTheme.primary : undefined
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/20 hover:brightness-125 text-amber-300 border border-amber-400/40 flex items-center justify-center transition-all active:scale-90 cursor-pointer shrink-0 mr-1 shadow-xs group"
                title={`Go back to ${previousLabel || 'previous screen'}`}
                aria-label="Go Back"
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:-translate-x-0.5" />
              </button>
            )}

            <button
              onClick={() => {
                if (onLogoClick) {
                  onLogoClick();
                } else {
                  handleHomeClick();
                }
              }}
              className="flex items-center space-x-1.5 sm:space-x-2 text-left group cursor-pointer focus:outline-none shrink-0"
              title="Bazli - Return to Home / Replay Animated Splash"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md shrink-0 border-2 border-yellow-400 ring-2 ring-yellow-400/40 shadow-yellow-400/20 relative overflow-hidden bg-white">
                <img
                  src={BAZLI_LOGO_SRC}
                  alt="Bazli"
                  className="w-full h-full object-cover rounded-lg sm:rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-lg font-black tracking-tight text-white flex items-center leading-none">
                  Bazli
                  <span className="ml-1 text-[7.5px] sm:text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-black px-1 py-0.2 rounded-full">
                    LIVE
                  </span>
                </span>
                <span className="text-[7.5px] sm:text-[9px] font-extrabold block mt-0.5 tracking-tight text-amber-300 font-freshness whitespace-nowrap">
                  100% freshness your environment
                </span>
              </div>
            </button>

            {/* Color Ring Palette Picker next to Bazli LIVE */}
            <div className="ml-1 sm:ml-1.5 flex items-center shrink-0">
              <ColorRingPicker currentTheme={currentTheme} onThemeChange={onThemeChange} />
            </div>
          </div>

          {/* Top Bar Right: Small Delivery Icon that pops up ONLY when customer has an active order */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0 min-h-[28px]">
            {activeDeliveryOrder && onTrackDeliveryOrder ? (
              <button
                type="button"
                id="header-live-delivery-icon-btn"
                onClick={onTrackDeliveryOrder}
                className="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-950/90 to-slate-900 border border-emerald-400/70 hover:border-emerald-300 shadow-md hover:shadow-emerald-500/20 text-white transition-all cursor-pointer animate-in zoom-in-90 duration-300 active:scale-95"
                title={`Order #${activeDeliveryOrder.id} • Click to view live GPS location & Delivery OTP`}
              >
                {/* Pulsing Green Radar / Bike Icon */}
                <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 group-hover:bg-emerald-500/30 shrink-0">
                  <Bike className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-ping" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5" />
                </div>
                <div className="flex items-center gap-1 text-[11px] font-black text-emerald-300">
                  <span>#{activeDeliveryOrder.id}</span>
                  <span className="text-[9px] bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-0.5">
                    <span>Live</span>
                    <span>📍</span>
                  </span>
                </div>
              </button>
            ) : unratedDeliveredOrder && onRateDeliveredOrder ? (
              <button
                type="button"
                id="navbar-unrated-order-btn"
                onClick={onRateDeliveredOrder}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/25 hover:bg-amber-500/35 text-amber-300 border border-amber-400/60 text-[10px] sm:text-xs font-black transition-all cursor-pointer shadow-xs shrink-0 animate-bounce"
                title={`Order #${unratedDeliveredOrder.id} Delivered! Click to rate & earn 25 Coins`}
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Rate Order</span>
                <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                  +25 ⭐
                </span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Sub-Header Bar (Lower Bar): Location on left; Search Bar; Portal Switcher, Wishlist, Cart, Three Strips on right */}
      <div className="border-t border-white/10 bg-black/20 px-1.5 sm:px-6 lg:px-8 py-1.5 w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3 w-full">
          
          {/* Zepto / Blinkit Style Delivery Location Selector */}
          <button
            id="header-location-pill"
            onClick={() => {
              if (onOpenAddressModal) {
                onOpenAddressModal();
              } else {
                setZoneDropdownOpen(!zoneDropdownOpen);
              }
            }}
            className={`flex items-center space-x-1.5 text-left px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl transition-all border cursor-pointer group shadow-xs min-w-0 shrink-0 max-w-[44%] sm:max-w-[36%] md:max-w-[210px] lg:max-w-[240px] ${
              isRestaurant
                ? 'text-orange-100 bg-[#581208]/90 hover:bg-[#6b180a] border-[#7d1b0e]'
                : isStationery
                ? 'text-indigo-100 bg-[#1c1c38]/90 hover:bg-[#28284e] border-[#383866]'
                : 'text-amber-100 bg-[#0e2440]/90 hover:bg-[#143257] border-[#22446d]'
            }`}
            title="Click to change delivery address or use current GPS location"
          >
            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center shrink-0 ${
              isRestaurant
                ? 'bg-orange-500/20 text-orange-300'
                : isStationery
                ? 'bg-indigo-500/20 text-indigo-300'
                : 'bg-amber-400/25 text-amber-300'
            }`}>
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:scale-110 transition-transform" />
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1 leading-none">
                <span className="font-black text-[9px] sm:text-[10px] text-white tracking-tight flex items-center gap-0.5 sm:gap-1">
                  <span>{isRestaurant ? 'Hot Food in' : 'Delivery in'}</span>
                  <span className="text-amber-300 font-extrabold flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                    <span>8-10 Mins</span>
                  </span>
                </span>
              </div>
              
              <div className="text-[10px] sm:text-[11px] font-bold text-amber-100 group-hover:text-amber-300 truncate mt-0.5 flex items-center gap-0.5">
                <span className="truncate">
                  {selectedAddress
                    ? `${selectedAddress.title}: ${selectedAddress.flatNo ? `${selectedAddress.flatNo}, ` : ''}${selectedAddress.street}`
                    : currentZoneObj?.name.split('-')[0] || 'Select Location'}
                </span>
                <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300/80 shrink-0 group-hover:translate-y-0.5 transition-transform" />
              </div>
            </div>
          </button>

          {/* Interactive Search Bar (Desktop Lower Header) */}
          <div className="hidden md:flex flex-1 max-w-xl lg:max-w-2xl mx-2 lg:mx-4 min-w-0">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              products={products}
              portalContext={currentPortalContext}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
              onUpdateCartQty={onUpdateCartQty}
              cartItems={cartItems}
              onBargainClick={onBargainClick}
              onSelectCategory={onSelectCategory}
              isMobile={false}
              placeholder={searchPlaceholder}
              onOpenVoiceAssistant={onOpenVoiceAssistant}
              onSubmitSearch={onSubmitSearch}
            />
          </div>

          {/* Right Actions: Multi-Role Portal Switcher, Wishlist, Cart, Three Strips Toggle */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">

            {/* Role Portal Switcher Button */}
            <div className="relative">
              <button
                id="header-role-switcher-btn"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`flex items-center space-x-1 px-1.5 sm:px-2.5 py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold border transition-all cursor-pointer ${
                  currentRole === 'customer'
                    ? isRestaurant
                      ? 'bg-[#581208] text-orange-100 border-[#7d1b0e] hover:bg-[#6b180a]'
                      : 'bg-[#0e2440] text-amber-100 border-[#22446d] hover:bg-[#143257]'
                    : currentRole === 'seller'
                    ? 'bg-amber-500 text-stone-950 border-amber-400 hover:bg-amber-400 font-bold'
                    : currentRole === 'delivery'
                    ? 'bg-sky-500 text-stone-950 border-sky-400 hover:bg-sky-400 font-bold'
                    : 'bg-purple-600 text-white border-purple-400 hover:bg-purple-500 font-bold'
                }`}
                title="Switch Account Portal"
              >
                {currentRole === 'customer' && <User className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isRestaurant ? 'text-orange-300' : 'text-amber-300'} shrink-0`} />}
                {currentRole === 'seller' && <Store className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-stone-950 shrink-0" />}
                {currentRole === 'delivery' && <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-stone-950 shrink-0" />}
                {currentRole === 'admin' && <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-200 shrink-0" />}
                <span className="capitalize text-[10px] sm:text-xs font-bold">
                  {currentRole === 'customer' ? 'Guest' : currentRole}
                </span>
                <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-70 shrink-0" />
              </button>

              {roleDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[105]"
                    onClick={() => setRoleDropdownOpen(false)}
                  />
                  <div
                    className="absolute right-0 top-full mt-1.5 w-64 sm:w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2.5 z-[110] animate-in fade-in slide-in-from-top-2 text-slate-800 divide-y divide-slate-100"
                  >
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Switch User View
                  </div>
                  <button
                    onClick={() => {
                      onRoleChange('customer');
                      setActiveTab('home');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2 hover:bg-slate-50 cursor-pointer ${
                      currentRole === 'customer' ? 'font-bold text-emerald-950 bg-emerald-50' : 'text-slate-700'
                    }`}
                  >
                    <User className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">Customer View (Rahul)</div>
                      <div className="text-[10px] text-slate-500">Shop, Bargain & Track Orders</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      if (onOpenSellerAuth) {
                        onOpenSellerAuth();
                      } else {
                        onRoleChange('seller');
                        setActiveTab('seller');
                      }
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#eee5d5] cursor-pointer ${
                      currentRole === 'seller' ? 'font-bold text-amber-900 bg-amber-50' : 'text-stone-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Store className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <div className="flex items-center gap-1.5 font-semibold text-stone-900">
                          <span>Seller Portal</span>
                          <Lock className="w-3 h-3 text-amber-600" />
                        </div>
                        <div className="text-[10px] text-stone-500">
                          Requires Business Name & Admin OTP
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-0.5">
                      <span>Shop 2FA 💬</span>
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      if (isDeliveryAuthenticated) {
                        onRoleChange('delivery');
                        setActiveTab('delivery');
                      } else if (onOpenDeliveryAuth) {
                        onOpenDeliveryAuth();
                      } else {
                        onRoleChange('delivery');
                      }
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#eee5d5] cursor-pointer ${
                      currentRole === 'delivery' ? 'font-bold text-sky-900 bg-sky-50' : 'text-stone-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-sky-600 shrink-0" />
                      <div>
                        <div className="flex items-center gap-1.5 font-semibold text-stone-900">
                          <span>Delivery Fleet Portal</span>
                          <Lock className="w-3 h-3 text-sky-600" />
                        </div>
                        <div className="text-[10px] text-stone-500">
                          Requires Registered Partner or Admin
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] bg-sky-100 text-sky-900 font-extrabold px-1.5 py-0.5 rounded-full border border-sky-300 flex items-center gap-0.5">
                      <span>Rider Lock 🔒</span>
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      if (onOpenAdminAuth) {
                        onOpenAdminAuth();
                      }
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#eee5d5] cursor-pointer ${
                      currentRole === 'admin' ? 'font-bold text-purple-900 bg-purple-50' : 'text-stone-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                      <div>
                        <div className="flex items-center gap-1.5 font-semibold text-stone-900">
                          <span>Super-Admin Console</span>
                          <Lock className="w-3 h-3 text-purple-600" />
                        </div>
                        <div className="text-[10px] text-stone-500">
                          Requires WhatsApp OTP (+91 9871618126)
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] bg-purple-100 text-purple-900 font-extrabold px-1.5 py-0.5 rounded-full border border-purple-300 flex items-center gap-0.5">
                      <span>OTP 💬</span>
                    </span>
                  </button>

                  {/* Lock / Exit Delivery Button if currently in Delivery view */}
                  {currentRole === 'delivery' && onLockDelivery && (
                    <div className="border-t border-[#ded2bc] mt-1 pt-1 px-2">
                      <button
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          onLockDelivery();
                        }}
                        className="w-full text-left px-2.5 py-2 text-xs flex items-center space-x-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold cursor-pointer transition-colors border border-stone-300"
                      >
                        <LogOut className="w-4 h-4 text-stone-700 shrink-0" />
                        <div>
                          <div>Lock & Sign Out Delivery</div>
                          <div className="text-[10px] text-stone-500 font-normal">Registered login required to reopen</div>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Lock / Exit Admin Button if currently in Admin view */}
                  {currentRole === 'admin' && onLockAdmin && (
                    <div className="border-t border-[#ded2bc] mt-1 pt-1 px-2">
                      <button
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          onLockAdmin();
                        }}
                        className="w-full text-left px-2.5 py-2 text-xs flex items-center space-x-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold cursor-pointer transition-colors border border-stone-300"
                      >
                        <LogOut className="w-4 h-4 text-stone-700 shrink-0" />
                        <div>
                          <div>Lock & Sign Out Admin</div>
                          <div className="text-[10px] text-stone-500 font-normal">Return securely to Customer view</div>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Lock / Switch Store Button if currently in Seller view */}
                  {currentRole === 'seller' && onLockSeller && (
                    <div className="border-t border-[#ded2bc] mt-1 pt-1 px-2">
                      <button
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          onLockSeller();
                        }}
                        className="w-full text-left px-2.5 py-2 text-xs flex items-center space-x-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold cursor-pointer transition-colors border border-stone-300"
                      >
                        <LogOut className="w-4 h-4 text-stone-700 shrink-0" />
                        <div>
                          <div>Lock & Sign Out Seller</div>
                          <div className="text-[10px] text-stone-500 font-normal">Requires 2FA to re-access</div>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Onboard / Register New Partner Trigger */}
                  {onOpenDeliveryRegisterModal && (
                    <div className="border-t border-[#ded2bc] mt-1 pt-1 px-2">
                      <button
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          onOpenDeliveryRegisterModal();
                        }}
                        className="w-full text-left px-2.5 py-2 text-xs flex items-center space-x-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl font-bold cursor-pointer transition-colors border border-sky-200"
                      >
                        <UserPlus className="w-4 h-4 text-sky-600 shrink-0" />
                        <div>
                          <div>+ Register New Partner</div>
                          <div className="text-[10px] text-sky-500 font-normal">Connect bike/EV & detailed KYC</div>
                        </div>
                      </button>
                    </div>
                  )}

                  {currentRole === 'customer' && (
                    <div className="border-t border-[#ded2bc] mt-1 pt-1.5 px-3 pb-1 space-y-1.5">
                      <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                        Customer Loyalty Tier
                      </div>
                      <select
                        value={loyaltyTier}
                        onChange={e => onTierChange(e.target.value as LoyaltyTier)}
                        className="w-full text-xs font-semibold bg-white border border-[#ded2bc] rounded-lg p-1 text-stone-800"
                      >
                        <option value="New">New Tier (Max 3% Bargain)</option>
                        <option value="Bronze">Bronze Tier (Max 5% Bargain)</option>
                        <option value="Silver">Silver Tier (Max 7% Bargain)</option>
                        <option value="Gold">Gold Tier (Max 10% Bargain)</option>
                      </select>

                      {/* Step 2: Customer Phone OTP Verification Button */}
                      {onOpenCustomerAuth && (
                        <button
                          type="button"
                          onClick={() => {
                            setRoleDropdownOpen(false);
                            onOpenCustomerAuth('profile');
                          }}
                          className="w-full text-left p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold text-xs flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Phone OTP Login</span>
                          </span>
                          <span className="text-[9px] bg-emerald-700 text-white px-1.5 py-0.5 rounded font-mono font-bold">
                            {customerProfile?.phone ? `+91 ${customerProfile.phone.slice(-4)}` : 'Verify'}
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                </>
              )}
            </div>

            {/* Wishlist Icon */}
            <button
              id="header-wishlist-button"
              onClick={onOpenWishlist}
              className={`p-1 sm:p-1.5 rounded-lg sm:rounded-xl relative transition-colors cursor-pointer shrink-0 border ${
                isRestaurant
                  ? 'text-orange-100 hover:text-white hover:bg-[#6b180a] border-[#7d1b0e] bg-[#581208]'
                  : 'text-amber-100 hover:text-white hover:bg-[#143257] border-[#22446d] bg-[#0e2440]'
              }`}
              title="Wishlist"
            >
              <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRestaurant ? 'text-orange-200' : 'text-amber-300'}`} />
              {wishlistCount > 0 && (
                <span className={`absolute -top-1 -right-1 text-[8px] sm:text-[9px] font-extrabold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center shadow-xs ${
                  isRestaurant ? 'bg-orange-400 text-stone-950' : 'bg-amber-400 text-stone-950'
                }`}>
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="header-cart-button"
              onClick={onOpenCart}
              className="flex items-center space-x-1 sm:space-x-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-slate-950 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl shadow-md transition-all cursor-pointer shrink-0 border border-amber-300 font-black text-xs"
              title="Shopping Cart"
            >
              <div className="relative flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-slate-950 text-amber-300 text-[8px] sm:text-[9px] font-black w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center shadow-xs border border-amber-400">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-xs font-black inline">
                {cartCount > 0 ? (
                  <span className="flex items-center gap-0.5">
                    <span className="hidden sm:inline">Cart</span>
                    <span className="bg-slate-950/15 px-1 py-0.2 rounded text-[9px] font-mono font-black">
                      ₹{cartSubtotal}
                    </span>
                  </span>
                ) : (
                  <span>Cart</span>
                )}
              </span>
            </button>

            {/* Three Strips (Menu Hamburger) */}
            <button
              id="header-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-1 sm:p-1.5 text-white rounded-lg sm:rounded-xl cursor-pointer shrink-0 border transition-colors ${
                isRestaurant
                  ? 'hover:bg-[#6b180a] border-[#7d1b0e] bg-[#581208]'
                  : 'hover:bg-[#143257] border-[#22446d] bg-[#0e2440]'
              }`}
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Lower Header - Line 2 on mobile devices) */}
        <div className="md:hidden mt-1.5 w-full">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            products={products}
            portalContext={currentPortalContext}
            onSelectProduct={onSelectProduct}
            onAddToCart={onAddToCart}
            onUpdateCartQty={onUpdateCartQty}
            cartItems={cartItems}
            onBargainClick={onBargainClick}
            onSelectCategory={onSelectCategory}
            isMobile={true}
            placeholder={searchPlaceholder}
            onOpenVoiceAssistant={onOpenVoiceAssistant}
            onSubmitSearch={onSubmitSearch}
          />
        </div>
      </div>

      {/* Main Desktop Navigation Links */}
      <nav
        style={{
          backgroundColor: isCustomOrSelectedTheme
            ? navbarHeaderBg
            : isRestaurant
            ? '#4a1208'
            : isStationery
            ? '#121226'
            : '#091a2e',
          borderTopColor: navbarBorderColor
        }}
        className={`border-t hidden md:block transition-colors duration-300 ${
          !isCustomOrSelectedTheme && isRestaurant 
            ? 'border-[#6b180a] bg-[#4a1208]' 
            : !isCustomOrSelectedTheme && isStationery
            ? 'border-[#2b2b52] bg-[#121226]'
            : 'border-[#193557] bg-[#091a2e]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-1 text-xs font-semibold">
            <div className="flex items-center space-x-1 sm:space-x-1.5">
              {/* 1. Grocery */}
              <button
                onClick={handleHomeClick}
                className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer font-bold text-xs ${
                  !isRestaurant && !isStationery
                    ? 'bg-amber-400 text-slate-950 shadow-xs border border-amber-300'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Grocery</span>
              </button>

              {/* 2. Restaurant */}
              <button
                onClick={() => setActiveTab('restaurants')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer font-bold text-xs ${
                  isRestaurant
                    ? 'bg-orange-500 text-white shadow-xs border border-orange-400'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Restaurant</span>
              </button>

              {/* 3. Stationery */}
              <button
                onClick={() => setActiveTab('stationery')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer font-bold text-xs ${
                  isStationery
                    ? 'bg-indigo-600 text-white shadow-xs border border-indigo-400'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Stationery</span>
              </button>

              <div className="h-3.5 w-px bg-white/20 mx-1 hidden sm:block" />

              {/* 4. My Order */}
              <button
                onClick={onOpenOrders}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer font-semibold text-xs ${
                  activeTab === 'orders' 
                    ? 'bg-[#fbf9f5] text-[#0a192f] font-black shadow-xs' 
                    : isRestaurant 
                    ? 'text-orange-200 hover:text-white hover:bg-[#6b180a]' 
                    : isStationery
                    ? 'text-indigo-200 hover:text-white hover:bg-[#2a2a50]'
                    : 'text-amber-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>My Order</span>
              </button>
            </div>

            <div className={`flex items-center space-x-2.5 text-[11px] font-medium ${
              isRestaurant ? 'text-orange-200/80' : isStationery ? 'text-indigo-200/80' : 'text-slate-300'
            }`}>
              {onOpenDeliveryRegisterModal && (
                <button
                  onClick={onOpenDeliveryRegisterModal}
                  className="text-sky-300 hover:text-white font-bold flex items-center gap-1 bg-sky-950/80 hover:bg-sky-900 px-2 py-0.5 rounded-md transition-colors cursor-pointer border border-sky-500/40 text-[11px]"
                >
                  <Bike className="w-3 h-3 text-sky-400" />
                  <span className="hidden sm:inline">Join</span> Delivery Partner
                </button>
              )}
              <span className="hidden md:inline">Loyalty: <strong className={isRestaurant ? 'text-orange-300' : isStationery ? 'text-indigo-300' : 'text-amber-400'}>{loyaltyTier} Tier</strong></span>
              <span className="hidden md:inline">•</span>
              <span className="text-amber-300 font-bold hidden sm:inline">
                {siteContent?.freeDeliveryThresholdText || `Free Delivery above ₹${freeDeliveryThreshold}`}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Slideout Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t px-4 py-3 space-y-3 animate-in fade-in text-white transition-colors duration-300 ${
          isRestaurant 
            ? 'border-[#6b180a] bg-[#7a1a0d]' 
            : isStationery
            ? 'border-[#2e2e50] bg-[#18182e]'
            : 'border-[#085a3a] bg-[#022418]'
        }`}>
          {/* Mobile 3 Sub-Portals Switcher */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-black/40 rounded-2xl border border-white/10 shadow-xs">
            <button
              onClick={() => {
                setActiveTab('home');
                setMobileMenuOpen(false);
              }}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                !isRestaurant && !isStationery
                  ? 'bg-amber-400 text-stone-950 font-black shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-white/10 font-bold'
              }`}
            >
              <ShoppingBag className="w-4 h-4 mb-0.5" />
              <span className="text-[11px] leading-tight font-black">Grocery</span>
              <span className="text-[8px] opacity-75 font-semibold">10m Express</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('restaurants');
                setMobileMenuOpen(false);
              }}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                isRestaurant
                  ? 'bg-orange-500 text-white font-black shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-white/10 font-bold'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 mb-0.5" />
              <span className="text-[11px] leading-tight font-black">Restaurants</span>
              <span className="text-[8px] opacity-75 font-semibold">Hot Meals</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('stationery');
                setMobileMenuOpen(false);
              }}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                isStationery
                  ? 'bg-indigo-600 text-white font-black shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-white/10 font-bold'
              }`}
            >
              <BookOpen className="w-4 h-4 mb-0.5" />
              <span className="text-[11px] leading-tight font-black">Kids & Study</span>
              <span className="text-[8px] opacity-75 font-semibold">Books & Art</span>
            </button>
          </div>

          <div className="flex flex-col space-y-1 text-sm font-semibold">
            <button
              onClick={() => {
                onOpenOrders();
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer font-bold ${
                isRestaurant ? 'hover:bg-[#6b180a] text-orange-200' : 'hover:bg-[#2d2217] text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                <span>My Orders</span>
              </span>
            </button>
            <button
              onClick={() => {
                onOpenWishlist();
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer ${
                isRestaurant ? 'hover:bg-[#6b180a] text-orange-200' : 'hover:bg-[#033624] text-emerald-100'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>My Wishlist ❤️</span>
              </span>
              {wishlistCount > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded font-black bg-rose-500 text-white">
                  {wishlistCount} items
                </span>
              )}
            </button>

            {/* Seller & Delivery & Admin quick portal links */}
            <div className={`pt-2 border-t space-y-1.5 ${
              isRestaurant ? 'border-[#6b180a]' : 'border-[#3b2f23]'
            }`}>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenSellerAuth) {
                    onOpenSellerAuth();
                  } else {
                    onRoleChange('seller');
                    setActiveTab('seller');
                  }
                }}
                className="w-full text-left px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold flex items-center justify-between cursor-pointer border border-amber-400"
              >
                <span className="flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-stone-950" />
                  <span>Seller Portal</span>
                </span>
                <span className="text-[10px] bg-stone-950 text-amber-300 px-2 py-0.5 rounded font-black flex items-center gap-0.5">
                  <span>Shop 2FA 💬</span>
                </span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (isDeliveryAuthenticated) {
                    onRoleChange('delivery');
                    setActiveTab('delivery');
                  } else if (onOpenDeliveryAuth) {
                    onOpenDeliveryAuth();
                  } else {
                    onRoleChange('delivery');
                  }
                }}
                className="w-full text-left px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center justify-between cursor-pointer border border-sky-400"
              >
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-sky-200" />
                  <span>Delivery Fleet Portal</span>
                </span>
                <span className="text-[10px] bg-sky-950 text-sky-200 px-2 py-0.5 rounded font-black flex items-center gap-0.5">
                  <span>Rider Lock 🔒</span>
                </span>
              </button>

              {currentRole === 'delivery' && onLockDelivery && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLockDelivery();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl bg-rose-900/90 hover:bg-rose-800 text-rose-100 font-bold flex items-center justify-between cursor-pointer border border-rose-700"
                >
                  <span className="flex items-center gap-1.5">
                    <LogOut className="w-4 h-4 text-rose-300" />
                    <span>Lock & Sign Out Delivery</span>
                  </span>
                  <span className="text-[10px] bg-rose-950 text-rose-200 px-2 py-0.5 rounded font-bold">
                    Secure
                  </span>
                </button>
              )}

              {onOpenDeliveryRegisterModal && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDeliveryRegisterModal();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-stone-950 font-bold flex items-center justify-between cursor-pointer border border-sky-400"
                >
                  <span className="flex items-center gap-1.5">
                    <Bike className="w-4 h-4 text-stone-950" />
                    <span>Join as Delivery Partner</span>
                  </span>
                  <span className="text-[10px] bg-stone-950 text-sky-300 px-2 py-0.5 rounded font-black">
                    EARN ₹25K+
                  </span>
                </button>
              )}

              {onOpenAdminAuth && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdminAuth();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold flex items-center justify-between cursor-pointer border border-purple-500"
                >
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-purple-200" />
                    <span>Admin Console</span>
                  </span>
                  <span className="text-[10px] bg-purple-950 text-purple-200 px-2 py-0.5 rounded font-black flex items-center gap-0.5">
                    <span>WhatsApp OTP 💬</span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Mobile Sticky Cart Checkout Bar */}
      {cartCount > 0 && currentRole === 'customer' && (
        <div className="md:hidden fixed bottom-[3.85rem] left-3 right-3 z-40 bg-[#0a192f]/95 backdrop-blur-md text-white p-2.5 px-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-[#1e3a5f] animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-[#10243e] border border-[#1e3a5f] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs border border-amber-300">
                {cartCount}
              </span>
            </div>
            <div className="leading-tight">
              <div className="text-[11px] font-black text-white flex items-center gap-1.5">
                <span>{cartCount} {cartCount === 1 ? 'Item' : 'Items'}</span>
                <span className="text-slate-400 font-normal">•</span>
                <span className="text-amber-300 font-extrabold">₹{cartSubtotal}</span>
              </div>
              <p className="text-[9px] text-slate-300 font-medium">⚡ 10-Min Darkstore Delivery</p>
            </div>
          </div>
          <button
            onClick={onOpenCart}
            className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1 cursor-pointer transition-all border border-amber-300"
          >
            <span>View Cart</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </header>
  );
};
