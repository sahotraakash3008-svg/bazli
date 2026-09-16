import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Sparkles,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  Search,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ShoppingBag,
  Plus,
  Minus,
  Store,
  ShieldCheck,
  Heart,
  PenTool,
  FileText,
  Palette,
  Scissors,
  GraduationCap,
  Briefcase,
  Printer,
  ArrowRight,
  Tag
} from 'lucide-react';
import { Seller, Product, CartItem, BargainingSession, ProductReview } from '../types';
import { isStationeryProduct } from '../utils/productSector';

interface CustomerStationeryPortalProps {
  sellers: Seller[];
  products: Product[];
  cartItems: CartItem[];
  bargainSessions: Record<string, BargainingSession>;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onBargainClick: (product: Product) => void;
  onUpdateCartQty: (product: Product, qty: number) => void;
  reviews?: ProductReview[];
  hasPurchasedProduct?: (productId: string) => boolean;
  onAddReview?: (productId: string, rating: number, comment: string, reviewerName: string) => void;
  onOpenSellerRegistration?: () => void;
  onOpenProductDetail?: (product: Product) => void;
  onOpenPrintoutModal?: () => void;
}

export const CustomerStationeryPortal: React.FC<CustomerStationeryPortalProps> = ({
  sellers,
  products,
  cartItems,
  bargainSessions,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onBargainClick,
  onUpdateCartQty,
  onOpenSellerRegistration,
  onOpenProductDetail,
  onOpenPrintoutModal
}) => {
  // Filter verified stationery sellers
  const registeredStationeryShops = useMemo(() => {
    return sellers.filter(
      s =>
        (s.sellerType === 'stationery' ||
          s.category?.toLowerCase().includes('stationery') ||
          s.category?.toLowerCase().includes('book')) &&
        s.verificationStatus === 'Verified' &&
        s.active
    );
  }, [sellers]);

  // Selected Stationery Shop ID (null = directory/all items view, string = specific shop store view)
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  // Search & Filter state
  const [stationerySearchQuery, setStationerySearchQuery] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('All');
  const [bargainOnly, setBargainOnly] = useState(false);
  const [quickDispatchOnly, setQuickDispatchOnly] = useState(false);
  const [priceSort, setPriceSort] = useState<'default' | 'low-high' | 'high-low' | 'rating'>('default');

  // Animated Search Prompt State (Matching Restaurant Portal style)
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchPromptIndex, setSearchPromptIndex] = useState(0);

  const creativeSearchPrompts = useMemo(() => [
    'Doms Brush Pens & Sketch Kits 🎨',
    'Classmate Spiral Notebooks & Registers 📓',
    'Faber-Castell Triangular Crayons 🖍️',
    'Camlin Acrylic Paints & Canvas Boards 🖌️',
    'Maped Shatterproof Geometry Box 📐',
    'Urgent 10-Min Document Xerox & Prints 🖨️',
    'Fevicol Craft Glue, Tapes & Scissors ✂️',
    'Uniball & Reynolds Fine Gel Pens ✒️'
  ], []);

  // Cycle animated appetizing dish/creative search suggestions every 2.8s
  useEffect(() => {
    if (isSearchFocused || stationerySearchQuery) return;
    const timer = setInterval(() => {
      setSearchPromptIndex(prev => (prev + 1) % creativeSearchPrompts.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [isSearchFocused, stationerySearchQuery, creativeSearchPrompts.length]);

  // Animated Hero Spotlight Carousel State (Matching Restaurant Portal style)
  const [activeBannerSlide, setActiveBannerSlide] = useState(0);
  const [isBannerHovered, setIsBannerHovered] = useState(false);

  const spotlightSlides = useMemo(() => [
    {
      id: 'kids-art-studio',
      badge: '🎨 KIDS ART & CREATIVE STUDIO',
      discount: 'UP TO 45% OFF',
      title: 'Inspire Young Minds: Art Sets, Crayons & Drawing Kits',
      description: 'Faber-Castell oil pastels, Doms brush pens, Camlin acrylics, canvas boards & clay modeling sets with 10-min doorstep dispatch.',
      bgGradient: 'from-purple-950 via-fuchsia-950 to-slate-950',
      accentBorder: 'border-purple-500/50',
      accentColor: 'text-purple-300',
      badgeBg: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1000&q=80',
      ctaText: 'Explore Kids Art Kits',
      categoryTarget: 'Art & Craft Supplies',
      queryFilter: ''
    },
    {
      id: 'school-notebooks',
      badge: '📚 SCHOOL & EXAM ESSENTIALS',
      discount: 'FLAT 30% OFF ON COMBOS',
      title: 'Classmate Notebooks, Geometry & Exam Sets',
      description: 'Spiral registers, Maped shatterproof compass sets, Uniball pens, highlighters & school exam pads delivered before class!',
      bgGradient: 'from-indigo-950 via-blue-950 to-slate-950',
      accentBorder: 'border-indigo-500/50',
      accentColor: 'text-indigo-300',
      badgeBg: 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80',
      ctaText: 'Explore School Notebooks',
      categoryTarget: 'Notebooks & Registers',
      queryFilter: ''
    },
    {
      id: 'urgent-xerox-printout',
      badge: '🖨️ 10-MIN EXPRESS PRINTOUT',
      discount: 'STARTS AT ₹2/PAGE',
      title: 'Urgent Document Xerox, Resumes & Color Prints',
      description: 'Upload homework PDFs, college assignments, project reports or resumes — get crisp doorstep prints delivered in 10 minutes!',
      bgGradient: 'from-slate-950 via-purple-950 to-indigo-950',
      accentBorder: 'border-pink-500/50',
      accentColor: 'text-pink-300',
      badgeBg: 'bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950',
      image: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1000&q=80',
      ctaText: 'Upload & Print Now',
      isPrintoutAction: true
    },
    {
      id: 'kids-bargain-bundles',
      badge: '🏷️ BAZLI BARGAIN GUARANTEE',
      discount: 'SAVE UP TO ₹150 ON BUNDLES',
      title: 'School Stationery Combos & Live Mandi Bargain',
      description: 'Negotiate live prices on stationery kits, buy bulk school packs for kids, and enjoy 100% free delivery above ₹499!',
      bgGradient: 'from-amber-950 via-rose-950 to-slate-950',
      accentBorder: 'border-amber-400/60',
      accentColor: 'text-amber-300',
      badgeBg: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=80',
      ctaText: 'Explore Discounted Combos',
      categoryTarget: 'All',
      queryFilter: ''
    }
  ], []);

  // Auto-rotate the animated spotlight banner every 4.5 seconds
  useEffect(() => {
    if (isBannerHovered || selectedShopId) return;
    const timer = setInterval(() => {
      setActiveBannerSlide(prev => (prev + 1) % spotlightSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isBannerHovered, selectedShopId, spotlightSlides.length]);

  // All stationery items (strictly isolated to stationery vendors & stationery categories)
  const allStationeryProducts = useMemo(() => {
    return products.filter(isStationeryProduct);
  }, [products]);

  // Subcategories with icons
  const stationeryCategories = [
    { id: 'All', label: 'All Supplies', icon: BookOpen, symbol: '📚' },
    { id: 'Art & Craft Supplies', label: 'Kids Art & Craft', icon: Palette, symbol: '🎨' },
    { id: 'Notebooks & Registers', label: 'Notebooks & Registers', icon: BookOpen, symbol: '📓' },
    { id: 'Pens & Writing', label: 'Pens & Fine Writing', icon: PenTool, symbol: '✒️' },
    { id: 'School & Geometry Sets', label: 'School & Geometry', icon: GraduationCap, symbol: '📐' },
    { id: 'Adhesives, Tapes & Tools', label: 'Adhesives & Scissors', icon: Scissors, symbol: '✂️' },
    { id: 'Paper, Files & Folders', label: 'Paper & Files', icon: FileText, symbol: '📁' },
    { id: 'Office & Desk Essentials', label: 'Desk & Office', icon: Briefcase, symbol: '📎' }
  ];

  // Currently selected shop
  const currentShop = useMemo(() => {
    if (!selectedShopId) return null;
    return registeredStationeryShops.find(s => s.id === selectedShopId) || null;
  }, [selectedShopId, registeredStationeryShops]);

  // Items for the selected shop (or all stationery products)
  const shopProducts = useMemo(() => {
    if (!selectedShopId) {
      return allStationeryProducts;
    }
    return allStationeryProducts.filter(p => p.sellerId === selectedShopId);
  }, [selectedShopId, allStationeryProducts]);

  // Filtered stationery products based on search, category, bargain, sort
  const filteredProducts = useMemo(() => {
    return shopProducts
      .filter(product => {
        // Search query
        if (stationerySearchQuery.trim()) {
          const q = stationerySearchQuery.toLowerCase();
          const matchName = product.name.toLowerCase().includes(q);
          const matchDesc = product.description?.toLowerCase().includes(q);
          const matchSub = product.subcategory?.toLowerCase().includes(q);
          const matchTags = product.tags?.some(t => t.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchSub && !matchTags) return false;
        }

        // Category filter
        if (selectedCategoryTab !== 'All') {
          if (product.subcategory !== selectedCategoryTab) {
            return false;
          }
        }

        // Bargain only filter
        if (bargainOnly && !product.bargainingAllowed) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (priceSort === 'low-high') return a.sellingPrice - b.sellingPrice;
        if (priceSort === 'high-low') return b.sellingPrice - a.sellingPrice;
        if (priceSort === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [shopProducts, stationerySearchQuery, selectedCategoryTab, bargainOnly, priceSort]);

  // Helper to check quantity in cart
  const getProductCartQty = (productId: string) => {
    const item = cartItems.find(ci => ci.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="w-full bg-slate-50 text-slate-900 min-h-[85vh] pb-24 space-y-5 animate-in fade-in duration-300">
      
      {/* 1. TOP SPOTLIGHT HERO BANNER - Sleek, Responsive & Animated (Matching Restaurant Portal) */}
      {!selectedShopId && (
        <div
          className="relative rounded-3xl overflow-hidden shadow-lg border border-purple-950/20 group select-none"
          onMouseEnter={() => setIsBannerHovered(true)}
          onMouseLeave={() => setIsBannerHovered(false)}
        >
          <AnimatePresence mode="wait">
            {spotlightSlides.map((slide, index) => {
              if (index !== activeBannerSlide) return null;
              return (
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className={`relative min-h-[220px] sm:min-h-[250px] bg-gradient-to-r ${slide.bgGradient} text-white p-5 sm:p-7 flex flex-col justify-between overflow-hidden`}
                >
                  {/* Background Image with subtle gradient mask */}
                  <div className="absolute top-0 right-0 w-full sm:w-2/3 h-full pointer-events-none overflow-hidden">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover object-center opacity-30 sm:opacity-40 group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                  </div>

                  {/* Top Row: Badges & Partner CTA with proper wrapping and zero overflow */}
                  <div className="relative z-10 flex items-center justify-between gap-2.5 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className={`text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm shrink-0 ${slide.badgeBg}`}>
                        {slide.badge}
                      </span>
                      <span className="text-[10px] sm:text-xs font-extrabold bg-white/10 backdrop-blur-md text-amber-200 border border-white/15 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                        <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>{slide.discount}</span>
                      </span>
                    </div>

                    {onOpenSellerRegistration && (
                      <button
                        onClick={onOpenSellerRegistration}
                        className="text-[11px] font-bold text-amber-300 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Book Depot Partner?</span> Join Bazli
                      </button>
                    )}
                  </div>

                  {/* Center Content: Headline & Description (Responsive & Fitted) */}
                  <div className="relative z-10 my-3 sm:my-4 max-w-xl space-y-1.5">
                    <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-sm break-words">
                      {slide.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-purple-200/90 font-medium leading-relaxed max-w-lg line-clamp-2 break-words">
                      {slide.description}
                    </p>
                  </div>

                  {/* Bottom Row: CTA Button & Slide Controls */}
                  <div className="relative z-10 flex items-center justify-between gap-3 pt-1 flex-wrap sm:flex-nowrap">
                    <button
                      onClick={() => {
                        if (slide.isPrintoutAction && onOpenPrintoutModal) {
                          onOpenPrintoutModal();
                        } else if (slide.categoryTarget) {
                          setSelectedCategoryTab(slide.categoryTarget);
                          setStationerySearchQuery('');
                        }
                      }}
                      className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap"
                    >
                      <span>{slide.ctaText}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Pagination Indicators & Next/Prev Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Prev Button */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setActiveBannerSlide(prev => (prev === 0 ? spotlightSlides.length - 1 : prev - 1));
                        }}
                        className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all cursor-pointer border border-white/20"
                        title="Previous Banner"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {/* Dots */}
                      <div className="flex items-center gap-1.5 px-1">
                        {spotlightSlides.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            onClick={() => setActiveBannerSlide(dotIdx)}
                            className={`h-2 rounded-full transition-all cursor-pointer ${
                              dotIdx === activeBannerSlide
                                ? 'w-6 bg-amber-400'
                                : 'w-2 bg-white/30 hover:bg-white/50'
                            }`}
                            aria-label={`Go to slide ${dotIdx + 1}`}
                          />
                        ))}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setActiveBannerSlide(prev => (prev + 1) % spotlightSlides.length);
                        }}
                        className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all cursor-pointer border border-white/20"
                        title="Next Banner"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* 2. COMPACT & ANIMATED SEARCH & CATEGORY EXPERIENCE DECK (Matching Restaurant Portal Style) */}
      <div className="relative bg-gradient-to-b from-white to-purple-50/40 rounded-2xl p-3 sm:p-3.5 border border-purple-200/80 shadow-sm space-y-2.5">
        
        {/* Top Search & Filter Bar: Compact single/dual flex deck */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 items-stretch sm:items-center justify-between">
          
          {/* Animated Search Box with Live Creative Item Ticker */}
          <div className="relative flex-1 group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
              <Search className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
            </div>

            <input
              ref={searchInputRef}
              type="text"
              value={stationerySearchQuery}
              onChange={e => setStationerySearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/80 focus:border-purple-500 font-medium text-slate-900 shadow-2xs transition-all placeholder:text-transparent"
            />

            {/* Rotating Animated Creative Item Placeholder */}
            {!stationerySearchQuery && !isSearchFocused && (
              <div
                onClick={() => searchInputRef.current?.focus()}
                className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none text-xs sm:text-sm text-slate-400 font-medium flex items-center gap-1.5 overflow-hidden pr-8 select-none"
              >
                <span className="text-slate-400 shrink-0 hidden xs:inline">Need</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={searchPromptIndex}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="text-purple-700 font-black truncate"
                  >
                    {creativeSearchPrompts[searchPromptIndex]}
                  </motion.span>
                </AnimatePresence>
                <span className="text-slate-400 shrink-0">?</span>
              </div>
            )}

            {stationerySearchQuery && (
              <button
                onClick={() => setStationerySearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-5 h-5 rounded-full flex items-center justify-center font-bold transition-all cursor-pointer"
                title="Clear Search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Dietary / Bargain Filters & Express Delivery Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 justify-between sm:justify-end">
            <button
              onClick={() => setBargainOnly(!bargainOnly)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                bargainOnly
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs scale-102 font-black'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Show Bazli Bargaining allowed items only"
            >
              <Sparkles className={`w-3.5 h-3.5 ${bargainOnly ? 'text-slate-950 fill-current' : 'text-amber-500'}`} />
              <span>Bazli Bargain 🏷️</span>
            </button>

            <select
              value={priceSort}
              onChange={e => setPriceSort(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-2xs"
            >
              <option value="default">🌟 Featured</option>
              <option value="low-high">💰 Low to High</option>
              <option value="high-low">💎 High to Low</option>
              <option value="rating">⭐ Top Rated</option>
            </select>

            {/* Express Delivery & Free Delivery Mini-Perk */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-300/60 text-[11px] font-bold text-purple-950">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>₹21 Express</span>
              <span className="text-purple-300">•</span>
              <span className="text-emerald-700 font-black">Free &gt; ₹499</span>
            </div>
          </div>
        </div>

        {/* Bottom Category Filter Track with Spring Animated Pills */}
        <div className="pt-1 border-t border-purple-100 flex items-center gap-1 sm:gap-2">
          <span className="text-[10px] sm:text-[11px] font-black text-purple-900/60 uppercase tracking-wider shrink-0 hidden sm:inline">
            Supplies
          </span>

          {/* Animated Horizontal Category Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none w-full py-0.5">
            {stationeryCategories.map(cat => {
              const isSelected = selectedCategoryTab === cat.id;
              const Icon = cat.icon;

              return (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ y: -1 }}
                  onClick={() => setSelectedCategoryTab(cat.id)}
                  className={`relative px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                    isSelected
                      ? 'text-white shadow-xs font-black'
                      : 'bg-white/90 text-slate-700 hover:bg-purple-100/70 hover:text-slate-950 border border-slate-200/70'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeStationeryPill"
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 rounded-full -z-10 shadow-xs shadow-purple-500/30"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="text-sm leading-none">{cat.symbol}</span>
                  <span>{cat.label}</span>
                  {isSelected && (
                    <Sparkles className="w-3 h-3 text-amber-200 animate-pulse shrink-0" />
                  )}
                </motion.button>
              );
            })}

            {selectedCategoryTab !== 'All' && (
              <button
                onClick={() => setSelectedCategoryTab('All')}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer shrink-0 ml-1 border border-slate-200"
                title="Reset Category Filter"
              >
                ✕ Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. SLEEK 10-MIN DOCUMENT XEROX & PRINTOUT BANNER (Responsive & Perfectly Fitted Text) */}
      {onOpenPrintoutModal && (
        <div
          onClick={onOpenPrintoutModal}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#17092b] via-[#240e42] to-[#120724] border border-purple-500/40 p-[1px] shadow-sm hover:shadow-md hover:border-pink-400/60 transition-all cursor-pointer group"
        >
          {/* Soft ambient glow */}
          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-pink-500/10 via-purple-500/10 to-transparent pointer-events-none" />

          <div className="relative z-10 px-3.5 py-3 sm:px-4 sm:py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Modern Vibrant Icon Pod */}
              <div className="relative shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-yellow-300 via-pink-400 to-purple-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
                  <Printer className="w-4.5 h-4.5 stroke-[2.5]" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-400" />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-xs sm:text-sm text-white tracking-tight break-words">
                    🖨️ Urgent 10-Min Document Xerox & Printouts
                  </span>
                  <span className="bg-yellow-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 shadow-xs">
                    From ₹2/page
                  </span>
                  <span className="bg-purple-400/20 text-purple-200 border border-purple-400/30 text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0 hidden md:inline-flex">
                    Color & B/W
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-purple-200/90 max-w-xl font-medium mt-0.5 leading-relaxed break-words">
                  Upload PDFs, resumes, homework or reports — doorstep printout delivery in 10 minutes!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPrintoutModal();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-500 hover:from-yellow-200 hover:to-pink-400 text-slate-950 font-black text-xs shadow-md shadow-pink-900/30 transition-all flex items-center gap-1.5 group-hover:gap-2 cursor-pointer whitespace-nowrap"
              >
                <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Upload & Print</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. VERIFIED LOCAL BOOK DEPOTS & KIDS STORES (Matching Restaurant Portal Directory Styling) */}
      {!selectedShopId && registeredStationeryShops.length > 0 && (
        <div className="space-y-3.5 pt-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xs">
                  <Store className="w-4 h-4" />
                </span>
                <span>Verified Local Book Depots & Kids Stores 🏬✨</span>
              </h2>
              <p className="text-xs text-slate-500 font-bold mt-0.5">
                Authentic stationery stores, art galleries & school uniform book depots in your area
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {registeredStationeryShops.map((shop) => {
              const shopItemCount = allStationeryProducts.filter(p => p.sellerId === shop.id).length;

              return (
                <div
                  key={shop.id}
                  onClick={() => setSelectedShopId(shop.id)}
                  className="bg-white rounded-2xl border border-slate-200/80 hover:border-purple-300 hover:shadow-md transition-all duration-300 cursor-pointer p-3.5 flex flex-col justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-20 rounded-xl overflow-hidden relative shrink-0 bg-slate-100 shadow-inner">
                      <img
                        src={shop.bannerImage || 'https://images.unsplash.com/photo-1507842229451-79b1be886a20?auto=format&fit=crop&w=600&q=80'}
                        alt={shop.businessName}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      />
                      <div className="absolute top-1 left-1 px-1.5 py-0.2 rounded-md bg-slate-950/75 backdrop-blur-xs text-white text-[8.5px] font-black flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Verified</span>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-black text-slate-900 text-sm group-hover:text-purple-600 transition-colors truncate">
                          {shop.businessName}
                        </h3>
                      </div>

                      <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span className="truncate">{shop.address || 'Local Market'}</span>
                      </p>

                      <div className="flex items-center gap-2 text-[11px] pt-0.5">
                        <div className="flex items-center gap-0.5 text-amber-500 font-black">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{shop.rating || '4.9'}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <span className="text-purple-700 font-black text-[10px] bg-purple-50 px-1.5 py-0.2 rounded-md">
                          {shopItemCount} items
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ⚡ 10-Min Dispatch
                    </span>
                    <span className="text-purple-700 font-black text-xs flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      <span>Explore Catalog</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. STORE DETAIL HEADER (When a specific book depot is selected) */}
      {selectedShopId && currentShop && (
        <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 rounded-2xl p-4 sm:p-5 border border-purple-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <button
              onClick={() => setSelectedShopId(null)}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shadow-xs border border-slate-200"
              title="Back to All Stores"
            >
              <ArrowLeft className="w-4 h-4 text-purple-700" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[9.5px] font-black uppercase tracking-wider">
                  Store Catalog
                </span>
                <span className="text-emerald-700 font-black text-[11px] flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Book Depot</span>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                {currentShop.businessName}
              </h2>
              <p className="text-xs text-slate-600 font-bold flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                <span>{currentShop.address}</span>
                <span className="text-slate-300">•</span>
                <span>Proprietor: {currentShop.ownerName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedShopId(null)}
            className="text-xs font-black text-purple-700 hover:text-purple-900 bg-white hover:bg-purple-50 px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-xs border border-purple-200"
          >
            🎨 View All Stores & Supplies
          </button>
        </div>
      )}

      {/* 6. PRODUCT GRID SECTION (Restaurant Portal Style Typography & Badges) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2 tracking-tight">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-ping" />
            <span>{selectedCategoryTab === 'All' ? '🎨 All Magic Stationery & Kids Supplies' : selectedCategoryTab}</span>
            <span className="text-xs font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200">
              {filteredProducts.length} Items
            </span>
          </h3>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-purple-200 shadow-sm">
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2.5 text-purple-600 text-2xl shadow-inner">
              🎨
            </div>
            <h4 className="text-base font-black text-slate-800 tracking-tight">No stationery items found</h4>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              Try searching for sketch pens, crayons, spiral notebooks, geometry box or reset filters.
            </p>
            <button
              onClick={() => {
                setStationerySearchQuery('');
                setSelectedCategoryTab('All');
                setBargainOnly(false);
                setSelectedShopId(null);
              }}
              className="mt-3.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-black hover:opacity-90 transition-all shadow-md cursor-pointer"
            >
              Reset Filters 🔄
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => {
              const cartQty = getProductCartQty(product.id);
              const isWishlisted = wishlistIds.includes(product.id);
              const hasBargain = !!bargainSessions[product.id];
              const bargainedPrice = bargainSessions[product.id]?.agreedPrice;

              return (
                <div
                  key={product.id}
                  id={`product-${product.id}`}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-0.5"
                >
                  {/* Image Area */}
                  <div className="relative aspect-square w-full bg-gradient-to-b from-slate-50 to-purple-50/20 p-2.5 flex items-center justify-center overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300 cursor-pointer"
                      onClick={() => onOpenProductDetail && onOpenProductDetail(product)}
                      loading="lazy"
                    />

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(product.id);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 backdrop-blur-xs shadow-md flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white transition-colors cursor-pointer z-10"
                      title="Add to Wishlist"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>

                    {/* 10-Min Fast Dispatch Badge */}
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[8.5px] font-black px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>⚡ 10-Min</span>
                    </div>

                    {/* Bargain Active Pill if session exists */}
                    {hasBargain && bargainedPrice && (
                      <div className="absolute bottom-2 left-2 bg-gradient-to-r from-yellow-300 to-amber-400 text-slate-950 text-[9.5px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-yellow-200">
                        <Sparkles className="w-3 h-3 fill-current" />
                        <span>Deal: ₹{bargainedPrice}</span>
                      </div>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="p-3 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Subcategory & Rating */}
                      <div className="flex items-center justify-between text-[10px] font-black mb-1">
                        <span className="text-[9.5px] px-2 py-0.5 rounded-full font-black truncate max-w-[120px] bg-purple-100 text-purple-800">
                          {product.subcategory || 'Stationery'}
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-slate-700 font-black">{product.rating || '4.8'}</span>
                        </div>
                      </div>

                      {/* Product Title (2-line clamped) */}
                      <h4
                        onClick={() => onOpenProductDetail && onOpenProductDetail(product)}
                        className="font-black text-slate-900 text-xs sm:text-[13px] line-clamp-2 hover:text-purple-600 transition-colors cursor-pointer mt-1 leading-snug tracking-tight"
                      >
                        {product.name}
                      </h4>

                      {/* Quantity / Unit */}
                      <p className="text-[11px] text-slate-500 font-bold mt-0.5 truncate">
                        📦 {product.quantity}
                      </p>

                      {/* Seller Name */}
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate flex items-center gap-1">
                        <Store className="w-2.5 h-2.5 text-purple-400" />
                        <span>{product.sellerName}</span>
                      </p>
                    </div>

                    {/* Pricing and Action Buttons */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <div className="flex items-baseline justify-between mb-2">
                        <div>
                          <span className="text-sm sm:text-base font-black text-slate-950">
                            ₹{bargainedPrice || product.sellingPrice}
                          </span>
                          {product.mrp > (bargainedPrice || product.sellingPrice) && (
                            <span className="text-xs text-slate-400 line-through ml-1.5 font-medium">
                              ₹{product.mrp}
                            </span>
                          )}
                        </div>

                        {product.discountPercentage ? (
                          <span className="text-[9.5px] font-black text-white bg-gradient-to-r from-rose-500 to-pink-500 px-1.5 py-0.5 rounded-full shadow-2xs">
                            {product.discountPercentage}% OFF
                          </span>
                        ) : null}
                      </div>

                      {/* Action buttons: Cart & Bargain */}
                      <div className="flex items-center gap-1.5">
                        {cartQty > 0 ? (
                          <div className="flex-1 flex items-center justify-between bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-2 py-1.5 font-black text-xs shadow-md">
                            <button
                              onClick={() => onUpdateCartQty(product, cartQty - 1)}
                              className="w-5 h-5 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-1 text-xs">{cartQty}</span>
                            <button
                              onClick={() => onUpdateCartQty(product, cartQty + 1)}
                              className="w-5 h-5 rounded-lg bg-white text-purple-700 shadow-xs flex items-center justify-center hover:bg-pink-50 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onAddToCart(product)}
                            className="flex-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-1.5 px-3 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 transform hover:scale-[1.02]"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-yellow-200" />
                            <span>Add</span>
                          </button>
                        )}

                        {product.bargainingAllowed && (
                          <button
                            onClick={() => onBargainClick(product)}
                            className="p-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 shadow-md transition-all cursor-pointer shrink-0 border border-yellow-200 transform hover:scale-105"
                            title="Bargain Live Price with Bazli"
                          >
                            <Sparkles className="w-3.5 h-3.5 fill-current text-slate-950" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. STUDENT & KIDS ART BUNDLES BANNER (All Text Perfectly Fitted with zero overflow) */}
      <div className="mt-8 p-1 rounded-3xl bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-400 via-sky-500 to-purple-600 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 rounded-[22px] p-5 sm:p-8 text-white relative overflow-hidden">
          {/* Background glowing spheres */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="inline-flex max-w-full items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 text-slate-950 shadow-md border border-yellow-200 truncate">
              🎒 Rainbow Kids Art Kits, Drawing Sets & Notebook Bundles
            </span>

            <h3 className="text-lg sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug drop-shadow-md break-words">
              Exciting Drawing Kits, Exam Sets & Bulk Supplies! 🎨✏️
            </h3>

            <p className="text-xs sm:text-sm text-pink-100/90 font-medium leading-relaxed max-w-xl break-words">
              Doms sketch pens, Faber-Castell crayons, Camlin water colors, Classmate notebooks & origami paper available at super discounted rates with instant 10-min delivery!
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                onClick={() => {
                  setSelectedCategoryTab('Art & Craft Supplies');
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-xs transition-all shadow-md cursor-pointer transform hover:scale-105 flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>🎨 Kids Art & Craft Sets</span>
              </button>

              <button
                onClick={() => {
                  setSelectedCategoryTab('Notebooks & Registers');
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }}
                className="px-4 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-black text-xs transition-all shadow-md cursor-pointer transform hover:scale-105 flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>📓 School Notebook Combos</span>
              </button>

              <button
                onClick={() => {
                  setSelectedCategoryTab('Pens & Writing');
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer transform hover:scale-105 flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>✒️ Color & Gel Pens</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
