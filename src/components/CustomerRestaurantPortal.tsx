import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UtensilsCrossed,
  Sparkles,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  Search,
  ChevronRight,
  Flame,
  ArrowLeft,
  ShoppingBag,
  Plus,
  Minus,
  Store,
  ShieldCheck,
  Award,
  Heart,
  ChefHat,
  Camera,
  Image as ImageIcon,
  ZoomIn,
  X,
  ChevronLeft,
  LayoutList,
  LayoutGrid,
  Check,
  BadgePercent,
  Gift,
  RefreshCw
} from 'lucide-react';
import { Seller, Product, CartItem, BargainingSession, ProductReview, Order } from '../types';
import { isRestaurantProduct } from '../utils/productSector';

interface CustomerRestaurantPortalProps {
  sellers: Seller[];
  products: Product[];
  cartItems: CartItem[];
  bargainSessions: Record<string, BargainingSession>;
  wishlistIds: string[];
  orders?: Order[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onBargainClick: (product: Product) => void;
  onUpdateCartQty: (product: Product, qty: number, weight?: string) => void;
  reviews?: ProductReview[];
  hasPurchasedProduct?: (productId: string) => boolean;
  onAddReview?: (productId: string, rating: number, comment: string, reviewerName: string) => void;
  onOpenSellerRegistration?: () => void;
  onOpenProductDetail?: (product: Product) => void;
  onSimulateRestaurantOrder?: (sellerId: string, restaurantName: string) => void;
  onApplyRestaurantFreeFeast?: (maxDiscount: number) => void;
}

export const CustomerRestaurantPortal: React.FC<CustomerRestaurantPortalProps> = ({
  sellers,
  products,
  cartItems,
  bargainSessions,
  wishlistIds,
  orders = [],
  onToggleWishlist,
  onAddToCart,
  onBargainClick,
  onUpdateCartQty,
  reviews = [],
  hasPurchasedProduct,
  onAddReview,
  onOpenSellerRegistration,
  onOpenProductDetail,
  onSimulateRestaurantOrder,
  onApplyRestaurantFreeFeast
}) => {
  // Filter verified restaurant sellers
  const registeredRestaurants = useMemo(() => {
    return sellers.filter(
      s =>
        (s.sellerType === 'restaurant' ||
          s.category?.toLowerCase().includes('restaurant') ||
          s.category?.toLowerCase().includes('kitchen')) &&
        s.verificationStatus === 'Verified' &&
        s.active
    );
  }, [sellers]);

  // Selected Restaurant ID (null = directory view, string = specific restaurant menu view)
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);

  // Search & Filter state
  const [restaurantSearchQuery, setRestaurantSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [quickPrepOnly, setQuickPrepOnly] = useState(false);
  const [viewLayout, setViewLayout] = useState<'menu-list' | 'grid'>('menu-list');

  // Animated Search Prompt State
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [searchPromptIndex, setSearchPromptIndex] = useState(0);

  const dishSearchPrompts = useMemo(() => [
    "Hyderabadi Dum Biryani 🍗",
    "Cheesy Wood-Fired Pizza 🍕",
    "Butter Chicken & Garlic Naan 🥘",
    "Crispy Masala Dosa & Chutney 🥞",
    "Steamed Darjeeling Momos 🥟",
    "Loaded Gourmet Smashed Burger 🍔",
    "Smoky Paneer & Tikka Rolls 🌯",
    "Cold Thick Shakes & Kulfi 🍨"
  ], []);

  // Cycle animated appetizing dish search suggestions every 2.8s
  useEffect(() => {
    if (isSearchFocused || restaurantSearchQuery) return;
    const timer = setInterval(() => {
      setSearchPromptIndex(prev => (prev + 1) % dishSearchPrompts.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [isSearchFocused, restaurantSearchQuery, dishSearchPrompts.length]);

  // Animated Hero Spotlight Carousel State
  const [activeBannerSlide, setActiveBannerSlide] = useState(0);
  const [isBannerHovered, setIsBannerHovered] = useState(false);

  const spotlightSlides = useMemo(() => [
    {
      id: 'biryani',
      badge: "CHEF'S HANDI SELECTION",
      discount: "UP TO 40% OFF",
      title: "Royal Dum Biryani & Charred Kebabs",
      description: "Fragrant aged basmati rice slow-simmered with whole spices, tender cuts & cooling burani raita in thermal packaging.",
      bgGradient: "from-amber-950 via-orange-950 to-stone-950",
      accentBorder: "border-amber-500/50",
      accentColor: "text-amber-300",
      badgeBg: "bg-amber-500 text-stone-950",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=80",
      ctaText: "Explore Biryani Menu",
      queryFilter: "Biryani"
    },
    {
      id: 'pizza-burgers',
      badge: "GOURMET FAST FOOD",
      discount: "FLAT ₹100 OFF • FEAST100",
      title: "Wood-Fired Pizzas & Smashed Burgers",
      description: "Bubbling mozzarella, slow-simmered marinara sauces, hand-stretched crusts & loaded golden seasoned fries.",
      bgGradient: "from-rose-950 via-orange-950 to-stone-950",
      accentBorder: "border-rose-500/50",
      accentColor: "text-rose-300",
      badgeBg: "bg-rose-500 text-white",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80",
      ctaText: "Explore Fast Food",
      queryFilter: "Pizza"
    },
    {
      id: 'loyalty',
      badge: "BAZLI PRIVILEGE CLUB",
      discount: "8TH MEAL 100% FREE",
      title: "Dine 7 Times, Enjoy 8th Order On Us!",
      description: "Place 7 orders of ₹200 or more from verified kitchens to unlock your 8th feast up to ₹499 completely FREE!",
      bgGradient: "from-[#1a1205] via-[#2d1b09] to-[#120a03]",
      accentBorder: "border-amber-400/60",
      accentColor: "text-amber-300",
      badgeBg: "bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950",
      image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=1000&q=80",
      ctaText: "Explore Partner Kitchens",
      queryFilter: ""
    }
  ], []);

  // Auto-rotate the animated spotlight banner every 4.5 seconds
  useEffect(() => {
    if (isBannerHovered || selectedRestaurantId) return;
    const timer = setInterval(() => {
      setActiveBannerSlide(prev => (prev + 1) % spotlightSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isBannerHovered, selectedRestaurantId, spotlightSlides.length]);

  const getCuisineIcon = (cuisine: string) => {
    const c = cuisine.toLowerCase();
    if (c === 'all') return '🍽️';
    if (c.includes('biryani')) return '🍗';
    if (c.includes('north') || c.includes('indian') || c.includes('thali') || c.includes('curry')) return '🥘';
    if (c.includes('pizza') || c.includes('burger') || c.includes('fast')) return '🍕';
    if (c.includes('chinese') || c.includes('momo') || c.includes('noodle')) return '🥟';
    if (c.includes('roll') || c.includes('wrap') || c.includes('tandoor') || c.includes('snack')) return '🌯';
    if (c.includes('dessert') || c.includes('sweet') || c.includes('shake') || c.includes('ice cream')) return '🍨';
    if (c.includes('south') || c.includes('dosa')) return '🥞';
    return '🍴';
  };

  // Menu Photos Modal state
  const [menuPhotosModalOpen, setMenuPhotosModalOpen] = useState(false);
  const [activeMenuPhotoIndex, setActiveMenuPhotoIndex] = useState(0);

  // All restaurant dishes (strictly isolated to restaurant sellers & menus)
  const allRestaurantProducts = useMemo(() => {
    return products.filter(isRestaurantProduct);
  }, [products]);

  // Available Cuisines
  const availableCuisines = useMemo(() => {
    const cuisinesSet = new Set<string>();
    registeredRestaurants.forEach(r => {
      if (r.cuisineSpecialties) {
        r.cuisineSpecialties.forEach(c => cuisinesSet.add(c));
      }
    });
    return ['All', ...Array.from(cuisinesSet)];
  }, [registeredRestaurants]);

  // Currently selected restaurant
  const currentRestaurant = useMemo(() => {
    if (!selectedRestaurantId) return null;
    return registeredRestaurants.find(r => r.id === selectedRestaurantId) || null;
  }, [selectedRestaurantId, registeredRestaurants]);

  // Dishes for the selected restaurant (or all restaurant dishes)
  const restaurantDishes = useMemo(() => {
    if (!selectedRestaurantId) {
      return allRestaurantProducts;
    }
    return allRestaurantProducts.filter(p => p.sellerId === selectedRestaurantId);
  }, [selectedRestaurantId, allRestaurantProducts]);

  // Filtered restaurants for the directory
  const filteredRestaurants = useMemo(() => {
    const q = restaurantSearchQuery.trim().toLowerCase();
    return registeredRestaurants.filter(r => {
      const matchSearch =
        q === '' ||
        r.businessName.toLowerCase().includes(q) ||
        r.ownerName.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        (r.cuisineSpecialties && r.cuisineSpecialties.some(c => c.toLowerCase().includes(q)));

      const matchCuisine =
        selectedCuisine === 'All' ||
        (r.cuisineSpecialties && r.cuisineSpecialties.includes(selectedCuisine));

      const matchQuickPrep = !quickPrepOnly || (r.avgPrepTimeMinutes && r.avgPrepTimeMinutes <= 15);

      return matchSearch && matchCuisine && matchQuickPrep;
    });
  }, [registeredRestaurants, restaurantSearchQuery, selectedCuisine, quickPrepOnly]);

  // Filtered dishes for currently viewed restaurant
  const filteredDishes = useMemo(() => {
    const q = restaurantSearchQuery.trim().toLowerCase();
    return restaurantDishes.filter(d => {
      const matchSearch =
        q === '' ||
        d.name.toLowerCase().includes(q) ||
        (d.cuisine && d.cuisine.toLowerCase().includes(q)) ||
        (d.subCategory && d.subCategory.toLowerCase().includes(q)) ||
        d.description.toLowerCase().includes(q);

      const matchVeg = !vegOnly || d.foodType === 'veg';
      const matchQuickPrep = !quickPrepOnly || (d.preparationTimeMinutes && d.preparationTimeMinutes <= 15);
      const matchSubCategory =
        selectedCategoryTab === 'All' ||
        (d.subCategory && d.subCategory.toLowerCase() === selectedCategoryTab.toLowerCase()) ||
        (selectedCategoryTab === 'Veg Special' && d.foodType === 'veg') ||
        (selectedCategoryTab === 'Bestseller' && d.rating >= 4.7);

      return matchSearch && matchVeg && matchQuickPrep && matchSubCategory;
    });
  }, [restaurantDishes, restaurantSearchQuery, vegOnly, quickPrepOnly, selectedCategoryTab]);

  // Group dishes by category for clean sectioning
  const groupedDishes = useMemo(() => {
    const groups: Record<string, Product[]> = {};

    filteredDishes.forEach(dish => {
      let groupName = 'Recommended & Chef Specials';
      if (dish.subCategory) {
        groupName = dish.subCategory;
      } else if (dish.name.toLowerCase().includes('biryani') || dish.name.toLowerCase().includes('platter')) {
        groupName = 'Biryani & Signature Platters';
      } else if (
        dish.name.toLowerCase().includes('tikka') ||
        dish.name.toLowerCase().includes('kebab') ||
        dish.name.toLowerCase().includes('roll') ||
        dish.name.toLowerCase().includes('starter')
      ) {
        groupName = 'Starters & Tandoor Bites';
      } else if (
        dish.name.toLowerCase().includes('curry') ||
        dish.name.toLowerCase().includes('paneer') ||
        dish.name.toLowerCase().includes('dal') ||
        dish.name.toLowerCase().includes('chicken')
      ) {
        groupName = 'Main Course Curries';
      } else if (
        dish.name.toLowerCase().includes('naan') ||
        dish.name.toLowerCase().includes('roti') ||
        dish.name.toLowerCase().includes('combo') ||
        dish.name.toLowerCase().includes('thali')
      ) {
        groupName = 'Breads, Rice & Combos';
      } else if (
        dish.name.toLowerCase().includes('sweet') ||
        dish.name.toLowerCase().includes('shake') ||
        dish.name.toLowerCase().includes('lassi') ||
        dish.name.toLowerCase().includes('dessert')
      ) {
        groupName = 'Desserts & Beverages';
      }

      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(dish);
    });

    return groups;
  }, [filteredDishes]);

  // Subcategories for menu tabs
  const availableSubCategories = useMemo(() => {
    const cats = new Set<string>();
    cats.add('All');
    cats.add('Bestseller');
    cats.add('Veg Special');
    restaurantDishes.forEach(d => {
      if (d.subCategory) cats.add(d.subCategory);
    });
    return Array.from(cats);
  }, [restaurantDishes]);

  // Current restaurant menu photos
  const currentMenuPhotos = useMemo(() => {
    if (!currentRestaurant) return [];
    if (currentRestaurant.menuPhotoDetails && currentRestaurant.menuPhotoDetails.length > 0) {
      return currentRestaurant.menuPhotoDetails;
    }
    if (currentRestaurant.menuPhotos && currentRestaurant.menuPhotos.length > 0) {
      return currentRestaurant.menuPhotos.map((url, idx) => ({
        id: `mp-${idx}`,
        url,
        title: `Menu Card Page ${idx + 1}`,
        category: 'Menu Card',
        uploadDate: 'Recent'
      }));
    }
    return [];
  }, [currentRestaurant]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. TOP SPOTLIGHT HERO BANNER - Animated, Sleek & Reduced Visual Clutter */}
      {!selectedRestaurantId && (
        <div
          className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-800/20 group select-none"
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
                    <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/70 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-transparent" />
                  </div>

                  {/* Top Row: Badges & Partner CTA */}
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
                        <ChefHat className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Restaurant Partner?</span> Join Bazli
                      </button>
                    )}
                  </div>

                  {/* Center Content: Headline & Description */}
                  <div className="relative z-10 my-3 sm:my-4 max-w-xl space-y-1.5">
                    <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-sm break-words">
                      {slide.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-300 font-medium leading-relaxed max-w-lg line-clamp-2 break-words">
                      {slide.description}
                    </p>
                  </div>

                  {/* Bottom Row: CTA Button & Slide Controls */}
                  <div className="relative z-10 flex items-center justify-between gap-4 pt-1">
                    <button
                      onClick={() => {
                        if (slide.queryFilter) {
                          setRestaurantSearchQuery(slide.queryFilter);
                        } else {
                          setRestaurantSearchQuery('');
                          setSelectedCuisine('All');
                        }
                      }}
                      className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <span>{slide.ctaText}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Pagination Indicators & Next/Prev Controls */}
                    <div className="flex items-center gap-2">
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

      {/* 2. CREATIVE & COMPACT ANIMATED SEARCH & CUISINE EXPERIENCE DECK */}
      <div className="relative overflow-hidden bg-gradient-to-r from-stone-950 via-[#1c0804] to-stone-950 rounded-2xl p-2.5 sm:p-3 border border-orange-500/35 shadow-xl shadow-orange-950/25 space-y-2 text-white">
        {/* Ambient Warm Ember Glow */}
        <div className="absolute top-0 right-1/4 w-44 h-12 bg-gradient-to-b from-orange-500/20 to-transparent rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-4 left-10 w-32 h-10 bg-amber-500/15 rounded-full blur-lg pointer-events-none" />

        {/* Top Search & Filter Bar: Compact Single Line / Responsive Deck */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
          
          {/* Animated Search Box with Glowing Dish Craving Ticker */}
          <div className="relative flex-1 group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
              <Search className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>

            <input
              ref={searchInputRef}
              type="text"
              value={restaurantSearchQuery}
              onChange={e => setRestaurantSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-white/10 hover:bg-white/15 focus:bg-black/60 border border-white/20 focus:border-amber-400 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium text-white shadow-inner transition-all placeholder:text-transparent"
            />

            {/* Rotating Animated Dish Craving Placeholder */}
            {!restaurantSearchQuery && !isSearchFocused && (
              <div
                onClick={() => searchInputRef.current?.focus()}
                className="absolute left-9 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-stone-300 font-medium flex items-center gap-1.5 overflow-hidden pr-6 select-none"
              >
                <span className="text-amber-300 font-black shrink-0 hidden xs:inline flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400 animate-pulse" />
                  Craving
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={searchPromptIndex}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="text-amber-200 font-bold truncate"
                  >
                    {dishSearchPrompts[searchPromptIndex]}
                  </motion.span>
                </AnimatePresence>
                <span className="text-stone-400 shrink-0">?</span>
              </div>
            )}

            {restaurantSearchQuery && (
              <button
                onClick={() => setRestaurantSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-white bg-white/15 hover:bg-white/25 w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold transition-all cursor-pointer"
                title="Clear Search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Dietary Filters & Express Delivery Badge */}
          <div className="relative z-10 flex items-center gap-1.5 shrink-0 justify-between sm:justify-end">
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                vegOnly
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm shadow-emerald-500/25 scale-102 font-black'
                  : 'bg-white/10 border-white/20 text-stone-300 hover:text-white hover:bg-white/20'
              }`}
              title="Show Pure Vegetarian Only"
            >
              <div className={`w-3 h-3 rounded-xs border flex items-center justify-center ${vegOnly ? 'border-white bg-emerald-600' : 'border-emerald-400'}`}>
                <div className={`w-1 h-1 rounded-full ${vegOnly ? 'bg-white' : 'bg-emerald-400'}`} />
              </div>
              <span className="hidden xs:inline">Pure</span> Veg
            </button>

            <button
              onClick={() => setQuickPrepOnly(!quickPrepOnly)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                quickPrepOnly
                  ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 border-amber-300 shadow-sm shadow-amber-500/25 scale-102 font-black'
                  : 'bg-white/10 border-white/20 text-stone-300 hover:text-white hover:bg-white/20'
              }`}
              title="Filter kitchens with fast prep under 15 mins"
            >
              <Clock className={`w-3 h-3 ${quickPrepOnly ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>⚡ Fast Prep</span>
            </button>

            {/* Express Delivery Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-500/20 border border-orange-400/40 text-[11px] font-bold text-orange-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span>10-15m Hot Dispatch</span>
            </div>
          </div>
        </div>

        {/* Bottom Cuisine Filter Track (When viewing all restaurants) */}
        {!selectedRestaurantId && (
          <div className="relative z-10 pt-1.5 border-t border-white/10 flex items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] font-black text-amber-300/80 uppercase tracking-widest shrink-0 hidden sm:inline flex items-center gap-1">
              <span>✦</span> Cuisines
            </span>

            {/* Animated Horizontal Cuisine Carousel */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none w-full py-0.5">
              {availableCuisines.map(cuisine => {
                const isSelected = selectedCuisine === cuisine;
                const icon = getCuisineIcon(cuisine);
                return (
                  <motion.button
                    key={cuisine}
                    whileTap={{ scale: 0.94 }}
                    whileHover={{ y: -1.5, scale: 1.02 }}
                    onClick={() => setSelectedCuisine(cuisine)}
                    className={`relative px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                      isSelected
                        ? 'text-slate-950 font-black shadow-md shadow-amber-500/30'
                        : 'bg-white/10 text-stone-200 hover:bg-white/20 hover:text-white border border-white/15'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeCuisinePill"
                        className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 rounded-full -z-10 border border-amber-200"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span className="text-sm leading-none">{icon}</span>
                    <span>{cuisine}</span>
                    {isSelected && (
                      <Sparkles className="w-3 h-3 text-slate-950 animate-pulse shrink-0" />
                    )}
                  </motion.button>
                );
              })}

              {selectedCuisine !== 'All' && (
                <button
                  onClick={() => setSelectedCuisine('All')}
                  className="px-2 py-0.5 rounded-full text-[11px] font-bold text-amber-300 hover:text-white bg-white/10 hover:bg-white/20 transition-all cursor-pointer shrink-0 ml-1 border border-white/20"
                  title="Reset Cuisine Filter"
                >
                  ✕ Reset
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. VIEW A: SPECIFIC RESTAURANT MENU VIEW */}
      {selectedRestaurantId && currentRestaurant ? (
        <div className="space-y-6">
          
          {/* Restaurant Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
            {/* Restaurant Cover Image */}
            <div className="relative h-48 sm:h-56 bg-slate-900 overflow-hidden">
              <img
                src={
                  currentRestaurant.bannerImage ||
                  currentRestaurant.menuPhotos?.[0] ||
                  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
                }
                alt={currentRestaurant.businessName}
                className="w-full h-full object-cover opacity-75"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Back Button */}
              <button
                onClick={() => setSelectedRestaurantId(null)}
                className="absolute top-4 left-4 bg-white/95 hover:bg-white text-slate-900 text-xs font-black px-3.5 py-2 rounded-xl backdrop-blur-md transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Restaurants</span>
              </button>

              {/* Menu Photos Button */}
              {currentMenuPhotos.length > 0 && (
                <button
                  onClick={() => {
                    setActiveMenuPhotoIndex(0);
                    setMenuPhotosModalOpen(true);
                  }}
                  className="absolute top-4 right-4 bg-black/75 hover:bg-black text-white text-xs font-extrabold px-3.5 py-2 rounded-xl backdrop-blur-md transition-all border border-white/20 shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-pink-400" />
                  <span>View Photos ({currentMenuPhotos.length})</span>
                </button>
              )}

              {/* Info Overlay at Bottom */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-sm">
                        {currentRestaurant.businessName}
                      </h2>
                      <span className="bg-emerald-500 text-white font-black text-xs px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-xs">
                        <Star className="w-3.5 h-3.5 fill-white text-white" />
                        {currentRestaurant.rating}
                      </span>
                    </div>

                    <p className="text-xs text-orange-200 font-semibold mt-1 flex items-center gap-2">
                      <span>{currentRestaurant.cuisineSpecialties?.join(', ') || 'Multi-Cuisine'}</span>
                      <span>•</span>
                      <span>{currentRestaurant.address}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                    <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      {currentRestaurant.avgPrepTimeMinutes || 15} mins delivery
                    </span>
                    <span className="bg-emerald-500/90 text-white px-3 py-1.5 rounded-xl flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      FSSAI Verified
                    </span>
                    <span className="bg-amber-400 text-slate-950 font-black px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs">
                      <span>Delivery ₹21</span>
                      <span className="opacity-60">•</span>
                      <span>FREE above ₹499</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Section Tabs Bar */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Menu:
                </span>
                {availableSubCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryTab(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedCategoryTab === cat
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <span className="text-xs font-black text-slate-700 bg-white px-3 py-1 rounded-xl border border-slate-200 shrink-0">
                {filteredDishes.length} Dishes
              </span>
            </div>
          </div>

          {/* Dishes List (Clean Restaurant Menu Style) */}
          {filteredDishes.length > 0 ? (
            <div className="space-y-6">
              {(Object.entries(groupedDishes) as [string, Product[]][]).map(([categoryName, dishes]) => {
                if (dishes.length === 0) return null;

                return (
                  <div
                    key={categoryName}
                    className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-5 bg-orange-600 rounded-full"></span>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                          {categoryName}
                        </h3>
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {dishes.length}
                        </span>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {dishes.map(dish => {
                        const cartItem = cartItems.find(i => i.product.id === dish.id);
                        const quantityInCart = cartItem?.quantity || 0;
                        const isVeg = dish.foodType === 'veg';

                        return (
                          <div
                            key={dish.id}
                            className="py-4 sm:py-5 flex items-start justify-between gap-4 first:pt-1 last:pb-1"
                          >
                            {/* Left Side: Dish Details */}
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {/* Veg / Non-Veg Icon */}
                                <div
                                  className={`w-4 h-4 rounded-xs flex items-center justify-center border ${
                                    isVeg ? 'border-emerald-600 bg-emerald-50/50' : 'border-rose-600 bg-rose-50/50'
                                  }`}
                                  title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                                >
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                                    }`}
                                  />
                                </div>

                                {dish.rating >= 4.7 && (
                                  <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-1.5 py-0.2 rounded">
                                    ⭐ Bestseller
                                  </span>
                                )}
                              </div>

                              <h4
                                onClick={() => onOpenProductDetail?.(dish)}
                                className="font-bold text-slate-900 text-sm sm:text-base leading-tight hover:text-orange-600 transition-colors cursor-pointer"
                              >
                                {dish.name}
                              </h4>

                              <div className="flex items-baseline gap-2 font-mono">
                                <span className="text-sm sm:text-base font-black text-slate-900">
                                  ₹{dish.sellingPrice}
                                </span>
                                {dish.mrp > dish.sellingPrice && (
                                  <span className="text-xs text-slate-400 line-through">
                                    ₹{dish.mrp}
                                  </span>
                                )}
                              </div>

                              <p
                                onClick={() => onOpenProductDetail?.(dish)}
                                className="text-xs text-slate-500 leading-relaxed line-clamp-2 max-w-xl cursor-pointer"
                              >
                                {dish.description}
                              </p>
                            </div>

                            {/* Right Side: Dish Image & ADD Button */}
                            <div className="flex flex-col items-center shrink-0 w-28 sm:w-32">
                              <div
                                onClick={() => onOpenProductDetail?.(dish)}
                                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 shadow-2xs border border-slate-200 cursor-pointer group"
                              >
                                <img
                                  src={dish.image}
                                  alt={dish.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  loading="lazy"
                                />
                              </div>

                              {/* Clean Stepper / ADD Button */}
                              <div className="-mt-3 z-10 w-22 sm:w-24">
                                {quantityInCart === 0 ? (
                                  <button
                                    onClick={() => onAddToCart(dish)}
                                    className="w-full bg-white hover:bg-orange-50 text-orange-600 font-black text-xs py-1.5 rounded-xl border border-orange-300 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>ADD</span>
                                  </button>
                                ) : (
                                  <div className="w-full flex items-center justify-between bg-orange-600 text-white rounded-xl px-1.5 py-1 text-xs font-black shadow-sm">
                                    <button
                                      onClick={() => onUpdateCartQty(dish, quantityInCart - 1)}
                                      className="w-5 h-5 flex items-center justify-center hover:bg-orange-700 rounded cursor-pointer"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="font-mono text-xs">{quantityInCart}</span>
                                    <button
                                      onClick={() => onUpdateCartQty(dish, quantityInCart + 1)}
                                      className="w-5 h-5 flex items-center justify-center hover:bg-orange-700 rounded cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 space-y-3">
              <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-base font-bold text-slate-800">No dishes match this search or filter</div>
              <button
                onClick={() => {
                  setRestaurantSearchQuery('');
                  setVegOnly(false);
                  setQuickPrepOnly(false);
                  setSelectedCategoryTab('All');
                }}
                className="text-xs font-bold text-orange-600 hover:underline cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* 4. VIEW B: ALL RESTAURANTS DIRECTORY (Clean, Spacious Grid) */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Top Rated Restaurant Kitchens</span>
              <span className="text-xs bg-orange-100 text-orange-800 font-extrabold px-2.5 py-0.5 rounded-full">
                {filteredRestaurants.length} Open
              </span>
            </h2>
          </div>

          {filteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRestaurants.map(restaurant => {
                const dishesCount = allRestaurantProducts.filter(p => p.sellerId === restaurant.id).length;
                const sampleDishes = allRestaurantProducts.filter(p => p.sellerId === restaurant.id).slice(0, 2);

                return (
                  <div
                    key={restaurant.id}
                    onClick={() => setSelectedRestaurantId(restaurant.id)}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-lg hover:border-orange-300 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Restaurant Cover */}
                      <div className="relative h-44 bg-slate-900 overflow-hidden">
                        <img
                          src={
                            restaurant.bannerImage ||
                            restaurant.menuPhotos?.[0] ||
                            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
                          }
                          alt={restaurant.businessName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-85"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                        {/* Rating Badge */}
                        <div className="absolute top-3 right-3 bg-white/95 text-slate-900 text-xs font-black px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{restaurant.rating}</span>
                        </div>

                        {/* Delivery Time / Freshness */}
                        <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-white/20">
                          <Clock className="w-3 h-3 text-amber-300" />
                          <span>Delivery ₹21 • FREE &gt; ₹499</span>
                        </div>
                      </div>

                      {/* Info Body */}
                      <div className="p-4 space-y-2.5">
                        <div>
                          <h3 className="font-black text-slate-900 text-base group-hover:text-orange-600 transition-colors">
                            {restaurant.businessName}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                            {restaurant.cuisineSpecialties?.join(', ') || 'Multi-Cuisine'}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{restaurant.address}</span>
                        </div>

                        {/* Popular Highlights */}
                        {sampleDishes.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-hidden">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                              Must Try:
                            </span>
                            <div className="flex items-center gap-1 truncate">
                              {sampleDishes.map(d => (
                                <span
                                  key={d.id}
                                  className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium truncate"
                                >
                                  {d.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="p-4 pt-0">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedRestaurantId(restaurant.id);
                        }}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black text-xs py-2.5 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <UtensilsCrossed className="w-3.5 h-3.5" />
                        <span>Explore Menu ({dishesCount} dishes)</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 space-y-2">
              <Store className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-base font-bold text-slate-800">No restaurants match your search</div>
              <p className="text-xs text-slate-500">Try changing your search keywords or cuisine filter</p>
            </div>
          )}
        </div>
      )}

      {/* 5. MENU PHOTOS LIGHTBOX MODAL */}
      {menuPhotosModalOpen && currentMenuPhotos.length > 0 && (
        <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-white/20 p-4 space-y-4">
            <div className="flex items-center justify-between text-white border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-base">
                  {currentRestaurant?.businessName} — Photos
                </h3>
                <span className="text-xs text-slate-400">
                  {activeMenuPhotoIndex + 1} of {currentMenuPhotos.length}
                </span>
              </div>
              <button
                onClick={() => setMenuPhotosModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="relative aspect-video max-h-[60vh] bg-black rounded-2xl overflow-hidden flex items-center justify-center">
              <img
                src={currentMenuPhotos[activeMenuPhotoIndex]?.url}
                alt="Menu Photo"
                className="w-full h-full object-contain"
              />

              {/* Prev / Next controls */}
              {currentMenuPhotos.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveMenuPhotoIndex(prev => (prev === 0 ? currentMenuPhotos.length - 1 : prev - 1))
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveMenuPhotoIndex(prev => (prev === currentMenuPhotos.length - 1 ? 0 : prev + 1))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {currentMenuPhotos.map((photo, idx) => (
                <button
                  key={photo.id}
                  onClick={() => setActiveMenuPhotoIndex(idx)}
                  className={`w-16 h-12 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer ${
                    activeMenuPhotoIndex === idx ? 'border-orange-500' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={photo.url} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
