import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Tag,
  Flame,
  CheckCircle2,
  TrendingDown,
  ShoppingBag,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Percent,
  Coins,
  Scale,
  Gift,
  Award
} from 'lucide-react';
import { Product } from '../types';

export interface CategoryAdBanner {
  id: string;
  categoryName: string;
  targetCategory: string; // The category name in product database
  title: string;
  tagline: string;
  description: string;
  offerBadge: string;
  badgeColor: string; // Tailwind color class
  accentGradient: string; // Gradient background
  textColor: string;
  priceStarting: string;
  image: string;
  uspTag: string;
  benefits: string[];
  cashbackTag?: string;
  glowColor?: string;
  isTrending?: boolean;
}

export const CATEGORY_AD_BANNERS: CategoryAdBanner[] = [
  {
    id: 'ad-fruits-veg',
    categoryName: 'Fruits & Vegetables',
    targetCategory: 'Fruits & Vegetables',
    title: 'Farm Fresh Vegetables & Juicy Fruits',
    tagline: 'MANDI FRESH HARVEST • DIRECT FROM FARMERS',
    description: 'Crisp greens, farm-picked tomatoes, crunchy apples & onions delivered fresh in 10 minutes.',
    offerBadge: 'FLAT 40% OFF',
    badgeColor: 'bg-emerald-400 text-slate-950',
    accentGradient: 'from-emerald-950 via-slate-950 to-teal-950',
    textColor: 'text-emerald-300',
    priceStarting: 'Starting ₹15/kg',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
    uspTag: '🥦 100% Organic & Mandi Graded',
    benefits: ['⚡ 10-Min Fast Delivery', '🏷️ Bazli Bargain Allowed', '🛡️ Zero Questions Return', '💰 5% BazliCoins'],
    cashbackTag: '+5% Cashback',
    glowColor: 'hover:border-emerald-400 hover:shadow-emerald-900/40',
    isTrending: true
  },
  {
    id: 'ad-dairy-eggs',
    categoryName: 'Dairy & Eggs',
    targetCategory: 'Dairy & Eggs',
    title: 'Pure Cow Milk, Paneer & Fresh Eggs',
    tagline: 'DAILY MORNING ESSENTIALS • 100% COLD-CHAIN PURE',
    description: 'Amul Taaza, fresh malai paneer, thick curd, creamy butter & protein-rich farm graded eggs.',
    offerBadge: 'FRESH 6 AM BATCH',
    badgeColor: 'bg-cyan-400 text-slate-950',
    accentGradient: 'from-sky-950 via-slate-950 to-blue-950',
    textColor: 'text-cyan-300',
    priceStarting: 'Starting ₹28',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    uspTag: '🥛 Chilled 4°C Cold-Chain Fresh',
    benefits: ['⚡ Chilled Doorstep Delivery', '🛡️ 100% Purity Certified', '🏷️ Daily Mandi Rates', '💰 Extra Coins'],
    cashbackTag: 'Free Express Delivery',
    glowColor: 'hover:border-cyan-400 hover:shadow-cyan-900/40',
    isTrending: true
  },
  {
    id: 'ad-atta-rice-dal',
    categoryName: 'Atta, Rice & Dal',
    targetCategory: 'Atta, Rice & Dal',
    title: 'Chakki Fresh Atta, Royal Rice & Dals',
    tagline: 'PREMIUM PANTRY STAPLES • 100% STONE GROUND',
    description: '100% MP Sharbati wheat flour, 2-yr aged Royal Basmati rice & unpolished protein lentils.',
    offerBadge: 'SAVE UP TO ₹155',
    badgeColor: 'bg-amber-400 text-slate-950',
    accentGradient: 'from-amber-950 via-slate-950 to-yellow-950',
    textColor: 'text-amber-300',
    priceStarting: 'From ₹28/kg',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    uspTag: '🌾 100% Stone Chakki Grinded',
    benefits: ['🏷️ Negotiate on Bulk Bags', '🌾 Unpolished Purity', '⚡ Instant 10-Min Dispatch', '💰 Instant ₹50 Code'],
    cashbackTag: 'Bulk Discount 15%',
    glowColor: 'hover:border-amber-400 hover:shadow-amber-900/40',
    isTrending: true
  },
  {
    id: 'ad-oil-ghee',
    categoryName: 'Oil & Desi Ghee',
    targetCategory: 'Oil & Ghee',
    title: 'Vedic Desi Bilona Ghee & Cooking Oils',
    tagline: 'TRADITIONAL BILONA METHOD • 100% NATURAL AROMA',
    description: 'Golden granular cow ghee, Fortune refined sunflower oil & cold-pressed mustard oil.',
    offerBadge: 'MEGA VALUE PACKS',
    badgeColor: 'bg-yellow-400 text-slate-950',
    accentGradient: 'from-yellow-950 via-slate-950 to-amber-950',
    textColor: 'text-yellow-300',
    priceStarting: 'Flat 15% OFF',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    uspTag: '💛 Pure Granular Aroma & Health',
    benefits: ['🛡️ Zero Adulteration Check', '🏷️ Bazli Live Bargaining', '⚡ Fast Delivery', '🎁 Free ₹50 Coupon'],
    cashbackTag: '+5% Cashback',
    glowColor: 'hover:border-yellow-400 hover:shadow-yellow-900/40',
    isTrending: true
  },
  {
    id: 'ad-masala-spices',
    categoryName: 'Masala & Spices',
    targetCategory: 'Masala & Spices',
    title: 'Aromatic Whole Spices & Fresh Masalas',
    tagline: '100% AUTHENTIC INDIAN TADKA • AROMA SEALED',
    description: 'Tata Salt, Everest Garam Masala, Kashmiri Mirch, Haldi & whole aromatic pantry spices.',
    offerBadge: 'FLAT 20% OFF',
    badgeColor: 'bg-rose-500 text-white',
    accentGradient: 'from-rose-950 via-slate-950 to-orange-950',
    textColor: 'text-rose-300',
    priceStarting: 'Starts ₹18',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    uspTag: '🌶️ Natural Essential Oils Intact',
    benefits: ['🌿 Freshly Milled Blends', '⚡ 10-Min Delivery', '🏷️ Mandi Price Guarantee', '💰 Coins on Orders'],
    cashbackTag: 'Up to 20% OFF',
    glowColor: 'hover:border-rose-400 hover:shadow-rose-900/40'
  },
  {
    id: 'ad-snacks-namkeen',
    categoryName: 'Snacks & Namkeen',
    targetCategory: 'Snacks & Namkeen',
    title: 'Crispy Namkeen, Haldiram Bhujia & Chips',
    tagline: 'CHAI TIME FAVORITES • PARTY CRUNCH AT HOME',
    description: 'Haldiram\'s Aloo Bhujia, Lay\'s chips, roasted makhanas, Kurkure & crunchy spicy snacks.',
    offerBadge: 'UNDER ₹99 STORE',
    badgeColor: 'bg-orange-500 text-white',
    accentGradient: 'from-orange-950 via-slate-950 to-red-950',
    textColor: 'text-orange-300',
    priceStarting: 'Starting ₹10',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
    uspTag: '🍿 Crunchy Fresh Nitrogen Sealed',
    benefits: ['⚡ Midnight Crunch 10m', '🏷️ Buy 2 Get 1 Offers', '🛡️ 100% Sealed Fresh', '💰 Instant Coins'],
    cashbackTag: 'Party Combos',
    glowColor: 'hover:border-orange-400 hover:shadow-orange-900/40'
  },
  {
    id: 'ad-biscuits-bakery',
    categoryName: 'Biscuits & Bakery',
    targetCategory: 'Biscuits & Bakery',
    title: 'Fresh Bakery Breads, Rusks & Cookies',
    tagline: 'DAILY BAKED MORNING DELIGHTS • CRUNCH & CRUST',
    description: 'Brown bread, pav buns, Parle-G, Britannia Good Day, Oreo & crisp tea rusks.',
    offerBadge: 'BUY 2 GET 10% OFF',
    badgeColor: 'bg-amber-500 text-slate-950',
    accentGradient: 'from-stone-950 via-slate-950 to-amber-950',
    textColor: 'text-amber-300',
    priceStarting: 'Starting ₹12',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    uspTag: '☕ Best Chai Companion Bakes',
    benefits: ['🍞 Daily Morning Baked', '⚡ Fast 10m Doorstep', '🏷️ Combo Savings', '💰 5% Cash Return'],
    cashbackTag: 'Buy 2 Get 10%',
    glowColor: 'hover:border-amber-400 hover:shadow-amber-900/40'
  },
  {
    id: 'ad-beverages',
    categoryName: 'Beverages & Drinks',
    targetCategory: 'Beverages',
    title: 'Chilled Cold Drinks, Real Juices & Teas',
    tagline: 'BEAT THE HEAT • REFRESHING INSTANT ENERGY',
    description: 'Coca-Cola, Thums Up, Real Fruit Mango juice, Tata Tea Gold, Nescafe & energy drinks.',
    offerBadge: 'SERVED CHILLED ❄️',
    badgeColor: 'bg-teal-400 text-slate-950',
    accentGradient: 'from-teal-950 via-slate-950 to-cyan-950',
    textColor: 'text-teal-300',
    priceStarting: 'Starts at ₹20',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    uspTag: '🥤 10-Min Chilled Doorstep',
    benefits: ['❄️ Ice-Cold Delivery', '⚡ Express 10 Minutes', '🏷️ Bazli Bargain on Crates', '💰 Extra Coins'],
    cashbackTag: 'Chilled Guaranteed',
    glowColor: 'hover:border-teal-400 hover:shadow-teal-900/40'
  },
  {
    id: 'ad-instant-food',
    categoryName: 'Instant Food & Noodles',
    targetCategory: 'Instant Food',
    title: '2-Minute Maggi, Noodles & Quick Meals',
    tagline: 'QUICK HUNGER BUSTERS • LATE NIGHT SNACKS',
    description: 'Classic Maggi 2-min masala, instant cup noodles, pasta, ready curry mixes & instant soups.',
    offerBadge: 'FLAT 15% OFF',
    badgeColor: 'bg-red-500 text-white',
    accentGradient: 'from-red-950 via-slate-950 to-amber-950',
    textColor: 'text-red-300',
    priceStarting: 'Pack of 4 @ ₹54',
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
    uspTag: '⚡ 2-Min Quick Late Night Delight',
    benefits: ['⚡ 10-Min Midnight Delivery', '🏷️ Multi-Packs at ₹54', '🛡️ 100% Genuine Brands', '💰 Instant Cashback'],
    cashbackTag: 'Midnight Special',
    glowColor: 'hover:border-red-400 hover:shadow-red-900/40'
  },
  {
    id: 'ad-household-cleaning',
    categoryName: 'Household & Cleaning',
    targetCategory: 'Household Cleaning',
    title: 'Sparkling Clean Home & Branded Detergents',
    tagline: '99.9% GERM PROTECTION • SHINY CLEAN HOME',
    description: 'Surf Excel, Ariel matic, Lizol floor cleaner, Vim dishwash gel & Harpic toilet cleaner.',
    offerBadge: 'CLEANING COMBO DEALS',
    badgeColor: 'bg-indigo-400 text-slate-950',
    accentGradient: 'from-indigo-950 via-slate-950 to-purple-950',
    textColor: 'text-indigo-300',
    priceStarting: 'Combos from ₹89',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80',
    uspTag: '🧼 Sparkling Hygiene & Stain Removal',
    benefits: ['🛡️ 100% Original Brand Stock', '🏷️ Super Saver Combos', '⚡ Heavy Bags Doorstep', '💰 5% Cash Reward'],
    cashbackTag: 'Save ₹80 on Combos',
    glowColor: 'hover:border-indigo-400 hover:shadow-indigo-900/40'
  },
  {
    id: 'ad-personal-care',
    categoryName: 'Personal Care & Skincare',
    targetCategory: 'Personal Care',
    title: 'Branded Soaps, Hair Care & Daily Hygiene',
    tagline: 'TOP BRANDED BEAUTY & HYGIENE ESSENTIALS',
    description: 'Dettol antiseptic soaps, Dove moisturizing bars, Head & Shoulders shampoo & Colgate.',
    offerBadge: 'UP TO 35% OFF',
    badgeColor: 'bg-fuchsia-400 text-slate-950',
    accentGradient: 'from-fuchsia-950 via-slate-950 to-pink-950',
    textColor: 'text-fuchsia-300',
    priceStarting: 'Starts ₹35',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    uspTag: '✨ 100% Genuine Branded Beauty',
    benefits: ['🛡️ 100% Authentic Stock', '⚡ 10-Min Fast Delivery', '🏷️ Up to 35% Discount', '💰 Extra Coins'],
    cashbackTag: 'Up to 35% OFF',
    glowColor: 'hover:border-fuchsia-400 hover:shadow-fuchsia-900/40'
  },
  {
    id: 'ad-ice-cream',
    categoryName: 'Ice Cream & Frozen Treats',
    targetCategory: 'Ice Cream',
    title: 'Amul Ice Creams, Kulfi & Frozen Delights',
    tagline: 'CHILLED INDULGENCE • DELIVERED FROZEN AT -18°C',
    description: 'Amul chocolate tubs, Kwality Wall\'s cornettos, chocobars, kulfis & frozen green peas.',
    offerBadge: 'MELT-FREE DELIVERY ❄️',
    badgeColor: 'bg-cyan-400 text-slate-950',
    accentGradient: 'from-cyan-950 via-slate-950 to-blue-950',
    textColor: 'text-cyan-300',
    priceStarting: 'Starting ₹20',
    image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&q=80',
    uspTag: '🍦 Insulated Cold Bag Shipped',
    benefits: ['❄️ Melt-Free Guarantee', '⚡ 10-Min Rapid Reach', '🏷️ Direct Milk Purity', '💰 Coin Rewards'],
    cashbackTag: '100% Melt-Proof',
    glowColor: 'hover:border-cyan-400 hover:shadow-cyan-900/40'
  }
];

interface CategoryAdvertisementBannersProps {
  onSelectCategory: (categoryName: string) => void;
  products?: Product[];
  selectedCategory?: string;
  onBargainClick?: (product: Product) => void;
  freeDeliveryThreshold?: number;
}

export const CategoryAdvertisementBanners: React.FC<CategoryAdvertisementBannersProps> = ({
  onSelectCategory,
  products = [],
  selectedCategory,
  onBargainClick,
  freeDeliveryThreshold = 129
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'mandi' | 'staples' | 'snacks' | 'home'>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const handleBannerClick = (banner: CategoryAdBanner) => {
    // Select the category
    onSelectCategory(banner.targetCategory);

    // Smooth scroll directly to the products grid/catalog section
    setTimeout(() => {
      const targetElement =
        document.getElementById('bargain-zone-section') ||
        document.getElementById('shop-catalog-section') ||
        document.getElementById('products-grid');

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 600, behavior: 'smooth' });
      }
    }, 80);
  };

  // Filter banners based on selected sub-filter
  const filteredBanners = CATEGORY_AD_BANNERS.filter(b => {
    if (filterTab === 'mandi') return b.id === 'ad-fruits-veg' || b.id === 'ad-dairy-eggs';
    if (filterTab === 'staples') return b.id === 'ad-atta-rice-dal' || b.id === 'ad-oil-ghee' || b.id === 'ad-masala-spices';
    if (filterTab === 'snacks') return b.id === 'ad-snacks-namkeen' || b.id === 'ad-biscuits-bakery' || b.id === 'ad-beverages' || b.id === 'ad-instant-food' || b.id === 'ad-ice-cream';
    if (filterTab === 'home') return b.id === 'ad-household-cleaning' || b.id === 'ad-personal-care';
    return true;
  });

  // Calculate items in each category
  const getItemCount = (targetCat: string) => {
    return products.filter(p =>
      p.category.toLowerCase().includes(targetCat.toLowerCase()) ||
      targetCat.toLowerCase().includes(p.category.toLowerCase())
    ).length;
  };

  // Update scroll states & active index
  const updateScrollState = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Estimate index based on approximate card width
    const cardWidth = 330;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveBannerIndex(Math.min(index, filteredBanners.length - 1));
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollState, { passive: true });
      updateScrollState();
      return () => el.removeEventListener('scroll', updateScrollState);
    }
  }, [filteredBanners]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 350;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleScrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    const cardWidth = 330;
    scrollContainerRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth'
    });
  };

  return (
    <section className="space-y-3.5 bg-white p-3 sm:p-4 rounded-3xl border border-[#ded2bc] shadow-xs">
      {/* Section Header with Swipe Controls and Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#ded2bc] pb-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-6 bg-gradient-to-b from-[#0a192f] to-[#1e3a5f] rounded-full shadow-xs"></span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Category Spotlight Banners</span>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-500/40 shadow-xs flex items-center gap-1">
                <Zap className="w-3 h-3 fill-slate-950" /> Swipe Left / Right
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 flex-wrap">
            <span>👉 Swipe or tap arrows to explore all {CATEGORY_AD_BANNERS.length} category deals.</span>
            <span className="text-[#0a192f] font-extrabold bg-[#ede5d8] px-2 py-0.5 rounded-md border border-[#ded2bc]">
              🚚 Free Delivery &gt; ₹{freeDeliveryThreshold}
            </span>
          </p>
        </div>

        {/* Filter Pills & Swipe Arrow Navigation */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Quick Filter Buttons */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              onClick={() => {
                setFilterTab('all');
                if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-[#0a192f] text-white shadow-md ring-1 ring-[#1e3a5f]'
                  : 'bg-[#ede5d8]/60 text-slate-700 hover:bg-[#ede5d8] border border-[#ded2bc]'
              }`}
            >
              All (12)
            </button>
            <button
              onClick={() => {
                setFilterTab('mandi');
                if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                filterTab === 'mandi'
                  ? 'bg-[#0a192f] text-white shadow-md ring-1 ring-[#1e3a5f]'
                  : 'bg-[#ede5d8]/60 text-slate-700 hover:bg-[#ede5d8] border border-[#ded2bc]'
              }`}
            >
              🥦 Mandi
            </button>
            <button
              onClick={() => {
                setFilterTab('staples');
                if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                filterTab === 'staples'
                  ? 'bg-[#0a192f] text-white shadow-md ring-1 ring-[#1e3a5f]'
                  : 'bg-[#ede5d8]/60 text-slate-700 hover:bg-[#ede5d8] border border-[#ded2bc]'
              }`}
            >
              🌾 Staples
            </button>
            <button
              onClick={() => {
                setFilterTab('snacks');
                if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                filterTab === 'snacks'
                  ? 'bg-[#0a192f] text-white shadow-md ring-1 ring-[#1e3a5f]'
                  : 'bg-[#ede5d8]/60 text-slate-700 hover:bg-[#ede5d8] border border-[#ded2bc]'
              }`}
            >
              🥤 Snacks
            </button>
            <button
              onClick={() => {
                setFilterTab('home');
                if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                filterTab === 'home'
                  ? 'bg-[#0a192f] text-white shadow-md ring-1 ring-[#1e3a5f]'
                  : 'bg-[#ede5d8]/60 text-slate-700 hover:bg-[#ede5d8] border border-[#ded2bc]'
              }`}
            >
              🧼 Home
            </button>
          </div>

          {/* Swipe Left / Right Navigation Buttons */}
          <div className="flex items-center space-x-1 shrink-0 ml-auto sm:ml-2">
            <button
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                canScrollLeft
                  ? 'bg-slate-100 hover:bg-[#0a192f] hover:text-white text-slate-800 border-slate-200 shadow-xs'
                  : 'bg-slate-100/50 text-slate-400 border-slate-200/50 cursor-not-allowed'
              }`}
              aria-label="Swipe banners left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                canScrollRight
                  ? 'bg-slate-100 hover:bg-[#0a192f] hover:text-white text-slate-800 border-slate-200 shadow-xs'
                  : 'bg-slate-100/50 text-slate-400 border-slate-200/50 cursor-not-allowed'
              }`}
              aria-label="Swipe banners right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Swipeable Container for ALL 12 Banners */}
      <div className="relative group">
        {/* Left Floating Swipe Button (Desktop hover) */}
        {canScrollLeft && (
          <button
            onClick={() => handleScroll('left')}
            className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-950/90 text-white border-2 border-amber-400/80 shadow-2xl items-center justify-center hover:bg-amber-400 hover:text-slate-950 transition-all cursor-pointer hover:scale-110"
            aria-label="Swipe Left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Right Floating Swipe Button (Desktop hover) */}
        {canScrollRight && (
          <button
            onClick={() => handleScroll('right')}
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-950/90 text-white border-2 border-amber-400/80 shadow-2xl items-center justify-center hover:bg-amber-400 hover:text-slate-950 transition-all cursor-pointer hover:scale-110"
            aria-label="Swipe Right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-3.5 sm:gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredBanners.map((banner, index) => {
            const count = getItemCount(banner.targetCategory);
            const isSelected = selectedCategory === banner.targetCategory;

            return (
              <div
                key={banner.id}
                onClick={() => handleBannerClick(banner)}
                className={`group/card relative overflow-hidden rounded-2xl bg-gradient-to-br ${banner.accentGradient} p-3.5 sm:p-4 text-white shadow-xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between w-[275px] sm:w-[310px] md:w-[330px] shrink-0 snap-start ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/70 shadow-amber-900/50'
                    : 'border-slate-800/90 hover:border-amber-400/70'
                } ${banner.glowColor || 'hover:border-amber-400'}`}
              >
                {/* Background Ambient Glow */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-amber-400/10 rounded-full blur-2xl pointer-events-none group-hover/card:bg-amber-400/20 transition-all duration-500" />

                {/* Top Banner Image with Glossy Outlined Frame */}
                <div className="relative w-full h-32 sm:h-36 rounded-xl overflow-hidden mb-2.5 bg-slate-950 shadow-inner border border-white/10 group-hover/card:border-amber-400/50 transition-colors">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover group-hover/card:scale-108 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Visual Gradient Shading */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                  {/* Offer Ribbon on Top Left with Shine */}
                  <div className="absolute top-2 left-2">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-md banner-badge-shine border border-white/20 ${banner.badgeColor}`}>
                      {banner.offerBadge}
                    </span>
                  </div>

                  {/* Price starting badge on Top Right */}
                  <div className="absolute top-2 right-2 bg-slate-950/95 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-400/50 shadow-md flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5 text-amber-400" />
                    <span>{banner.priceStarting}</span>
                  </div>

                  {/* Floating USP on Image Bottom */}
                  <div className="absolute bottom-1.5 left-2 right-2 bg-slate-950/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/10 text-[10px] font-extrabold text-amber-300 truncate shadow-sm flex items-center justify-between">
                    <span className="truncate">{banner.uspTag}</span>
                    <span className="text-[9px] text-slate-400 font-mono">10m</span>
                  </div>
                </div>

                {/* Middle Information Area */}
                <div className="space-y-1 mb-2.5 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                      {banner.categoryName}
                    </span>
                    {banner.cashbackTag && (
                      <span className="text-[9px] font-bold text-amber-300 bg-[#0a192f] px-1.5 py-0.2 rounded border border-[#1e3a5f]">
                        {banner.cashbackTag}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-black text-white leading-snug group-hover/card:text-amber-300 transition-colors line-clamp-2 min-h-[2.5rem] break-words">
                    {banner.title}
                  </h4>

                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed font-normal">
                    {banner.description}
                  </p>

                  {/* Beneficial Micro Chips */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {banner.benefits.slice(0, 2).map((b, bIdx) => (
                      <span
                        key={bIdx}
                        className="bg-slate-900/90 text-slate-200 text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10 truncate max-w-full"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Footer with High-Contrast Outlines */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between mt-auto">
                  <span className="text-[10px] font-bold text-slate-400">
                    {count > 0 ? `${count} items in stock` : '⚡ 10-Min Delivery'}
                  </span>

                  <div className="inline-flex items-center gap-1 bg-amber-400 group-hover/card:bg-amber-300 text-slate-950 font-black text-[11px] px-3 py-1 rounded-lg border border-amber-300 shadow-md group-hover/card:scale-105 transition-all">
                    <span>Shop Now</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/card:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Swipe Indicator Dots Bar */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs text-slate-400">
        <span className="text-[11px] font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Showing <strong>{filteredBanners.length}</strong> Category Specials</span>
        </span>

        {/* Scroll navigation dots */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] scrollbar-none py-1">
          {filteredBanners.map((_, i) => (
            <button
              key={i}
              onClick={() => handleScrollToIndex(i)}
              className={`rounded-full transition-all cursor-pointer ${
                activeBannerIndex === i
                  ? 'w-4 h-1.5 bg-amber-400 shadow-xs'
                  : 'w-1.5 h-1.5 bg-slate-700 hover:bg-slate-500'
              }`}
              aria-label={`Jump to banner ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
