import React, { useState, useMemo } from 'react';
import { Product, CartItem, ProductReview } from '../types';
import { ProductCard } from './ProductCard';
import {
  Search,
  ArrowLeft,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  TrendingUp,
  X,
  PackageCheck,
  Tag,
  ShoppingBag,
  UtensilsCrossed
} from 'lucide-react';
import { normalizeSearchText, calculateProductSearchScore } from '../utils/searchUtils';

interface SearchResultsViewProps {
  query: string;
  products: Product[];
  portalContext?: 'grocery' | 'restaurant' | 'stationery';
  onSwitchPortalContext?: (portal: 'grocery' | 'restaurant' | 'stationery') => void;
  cartItems: CartItem[];
  bargainSessions: Record<string, any>;
  wishlistIds: string[];
  reviews: Record<string, ProductReview[]>;
  hasPurchasedProduct: (id: string) => boolean;
  highlightedProductId: string | null;
  onAddToCart: (product: Product, quantity?: number, weight?: string, price?: number) => void;
  onBargainClick: (product: Product, weight?: string, initialPrice?: number) => void;
  onUpdateCartQty: (product: Product, newQty: number, weight?: string) => void;
  onToggleWishlist: (product: Product) => void;
  onAddReview: (review: any) => void;
  onOpenProductDetail: (product: Product) => void;
  onClearSearch: () => void;
  onSearchQueryChange: (newQuery: string) => void;
}

const GROCERY_SEARCH_SUGGESTIONS = [
  { term: 'Milk', icon: '🥛' },
  { term: 'Atta', icon: '🌾' },
  { term: 'Desi Ghee', icon: '🧈' },
  { term: 'Butter', icon: '🧈' },
  { term: 'Paneer', icon: '🧀' },
  { term: 'Basmati Rice', icon: '🍚' },
  { term: 'Maggi', icon: '🍜' },
  { term: 'Chips & Snacks', icon: '🍿' },
  { term: 'Tea', icon: '☕' },
  { term: 'Biscuits', icon: '🍪' },
  { term: 'Apples', icon: '🍎' },
  { term: 'Detergent', icon: '🧼' }
];

const RESTAURANT_SEARCH_SUGGESTIONS = [
  { term: 'Chicken Biryani', icon: '🍗' },
  { term: 'Paneer Butter Masala', icon: '🍛' },
  { term: 'Butter Naan', icon: '🫓' },
  { term: 'Veg Deluxe Thali', icon: '🍱' },
  { term: 'Margherita Pizza', icon: '🍕' },
  { term: 'Crispy Burger', icon: '🍔' },
  { term: 'Steamed Momos', icon: '🥟' },
  { term: 'Hakka Noodles', icon: '🍜' },
  { term: 'Dal Makhani', icon: '🍲' },
  { term: 'Gulab Jamun', icon: '🍮' },
  { term: 'Kathi Roll', icon: '🌯' },
  { term: 'Cold Coffee', icon: '🥤' }
];

// Helper to reliably check if a product is a prepared restaurant dish
export function isRestaurantProduct(p: Product): boolean {
  if (p.sellerType === 'restaurant') return true;
  if (p.category === 'Restaurant Meals & Dining') return true;
  if (p.category && p.category.toLowerCase().includes('restaurant')) return true;
  if (p.id && (p.id.startsWith('rest-') || p.id.startsWith('dish-'))) return true;
  if (p.cuisine && p.cuisine.trim().length > 0) return true;
  return false;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  query,
  products,
  portalContext = 'grocery',
  onSwitchPortalContext,
  cartItems,
  bargainSessions,
  wishlistIds,
  reviews,
  hasPurchasedProduct,
  highlightedProductId,
  onAddToCart,
  onBargainClick,
  onUpdateCartQty,
  onToggleWishlist,
  onAddReview,
  onOpenProductDetail,
  onClearSearch,
  onSearchQueryChange
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc' | 'discount' | 'rating'>('relevance');
  const [bargainOnly, setBargainOnly] = useState<boolean>(false);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [priceUnder99, setPriceUnder99] = useState<boolean>(false);

  // Strict portal enforcement:
  // Grocery Portal => Absolutely ZERO restaurant or stationery items
  // Restaurant Portal => Absolutely ZERO grocery or stationery items
  const isRestaurantMode = portalContext === 'restaurant';

  const portalScopedProducts = useMemo(() => {
    if (isRestaurantMode) {
      return products.filter(p => isRestaurantProduct(p));
    } else if (portalContext === 'stationery') {
      return products.filter(p => p.sellerType === 'stationery');
    } else {
      // Default: Grocery
      return products.filter(p => !isRestaurantProduct(p) && p.sellerType !== 'stationery');
    }
  }, [products, isRestaurantMode, portalContext]);

  const cleanQuery = useMemo(() => normalizeSearchText(query), [query]);

  // Match and rank products within the strict portal scope
  const matchedProducts = useMemo(() => {
    if (!cleanQuery) return portalScopedProducts;

    return portalScopedProducts
      .map(product => {
        const { matches, score } = calculateProductSearchScore(product, cleanQuery);
        return { product, matches, score };
      })
      .filter(item => item.matches && item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);
  }, [portalScopedProducts, cleanQuery]);

  // Get categories present in the results
  const availableCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    matchedProducts.forEach(p => {
      if (p.category) categoriesSet.add(p.category);
    });
    return ['All', ...Array.from(categoriesSet)];
  }, [matchedProducts]);

  // Apply secondary filters and sorting
  const displayedProducts = useMemo(() => {
    let list = [...matchedProducts];

    // Category filter
    if (selectedCategory !== 'All') {
      list = list.filter(p => p.category === selectedCategory);
    }

    // Bargain only
    if (bargainOnly) {
      list = list.filter(p => p.bargainingAllowed);
    }

    // In stock only
    if (inStockOnly) {
      list = list.filter(p => p.stock > 0 && !p.isSoldOut);
    }

    // Under 99
    if (priceUnder99) {
      list = list.filter(p => p.sellingPrice <= 99);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.sellingPrice - b.sellingPrice);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.sellingPrice - a.sellingPrice);
    } else if (sortBy === 'discount') {
      list.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  }, [matchedProducts, selectedCategory, bargainOnly, inStockOnly, priceUnder99, sortBy]);

  const activeSuggestions = isRestaurantMode
    ? RESTAURANT_SEARCH_SUGGESTIONS
    : GROCERY_SEARCH_SUGGESTIONS;

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {/* Strict Portal Silo Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isRestaurantMode ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-800'
          }`}>
            {isRestaurantMode ? <UtensilsCrossed className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>{isRestaurantMode ? 'Restaurant & Cloud Kitchen Search' : 'Grocery & Darkstore Mandi Search'}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Strict Isolation
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {isRestaurantMode
                ? 'Showing chef-prepared hot dishes, pizza, biryani & meals only (Zero grocery items)'
                : 'Showing fresh produce, dairy, staples & packaged groceries only (Zero restaurant meals)'}
            </div>
          </div>
        </div>

        {onSwitchPortalContext && (
          <button
            onClick={() => onSwitchPortalContext(isRestaurantMode ? 'grocery' : 'restaurant')}
            className={`w-full sm:w-auto px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border shadow-2xs ${
              isRestaurantMode
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-orange-50 hover:bg-orange-100 text-orange-900 border-orange-300'
            }`}
          >
            <span>{isRestaurantMode ? 'Switch to Grocery Search 🛒' : 'Switch to Food Search 🍽️'}</span>
          </button>
        )}
      </div>

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-[#ded2bc] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Small icon-only back button */}
            <button
              id="search-results-back-button"
              type="button"
              onClick={onClearSearch}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-950 border border-slate-200 hover:border-amber-300 flex items-center justify-center transition-all active:scale-90 cursor-pointer shrink-0 shadow-2xs group"
              title="Return to store"
              aria-label="Return to store"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            </button>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                  Search results for <span className="underline decoration-amber-400 decoration-2" style={{ color: 'var(--bazli-primary, #f59e0b)' }}>"{query}"</span>
                </h1>
                <span className="text-[11px] sm:text-xs font-black bg-amber-100 text-amber-950 border border-amber-300 px-2 py-0.5 rounded-full">
                  {matchedProducts.length} {matchedProducts.length === 1 ? 'item' : 'items'} found
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium">
                ⚡ 10-Minute doorstep dispatch on all items
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* Clear Search Button */}
            <button
              type="button"
              onClick={onClearSearch}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Search</span>
            </button>
          </div>
        </div>

        {/* Category Pills & Quick Filter Controls */}
        {matchedProducts.length > 0 && (
          <div className="pt-3 space-y-3">
            {/* Category Pills Bar */}
            {availableCategories.length > 2 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {availableCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all cursor-pointer border shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Quick Filter Badges + Sorting Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {/* Bargain Only Filter */}
                <button
                  type="button"
                  onClick={() => setBargainOnly(!bargainOnly)}
                  className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                    bargainOnly
                      ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-xs'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Bargain Eligible</span>
                </button>

                {/* Under ₹99 Filter */}
                <button
                  type="button"
                  onClick={() => setPriceUnder99(!priceUnder99)}
                  className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                    priceUnder99
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Under ₹99</span>
                </button>

                {/* In Stock Filter */}
                <button
                  type="button"
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                    inStockOnly
                      ? 'bg-slate-900 text-white border-slate-950 shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>In Stock</span>
                </button>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1 text-slate-600 font-semibold shrink-0 ml-auto">
                <ArrowUpDown className="w-3 h-3 text-slate-400" />
                <span className="text-[11px] text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800 outline-none cursor-pointer hover:bg-slate-100"
                >
                  <option value="relevance">Best Match</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="discount">Highest Discount</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid of Results */}
      {displayedProducts.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500">
              Showing {displayedProducts.length} of {matchedProducts.length} matching products
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 sm:gap-3.5">
            {displayedProducts.map(product => (
              <div key={product.id} className="flex flex-col">
                <ProductCard
                  product={product}
                  bargainSession={bargainSessions[product.id]}
                  onAddToCart={onAddToCart}
                  onBargainClick={onBargainClick}
                  onOpenBargain={onBargainClick}
                  onUpdateCartQty={onUpdateCartQty}
                  cartQuantity={cartItems.find(i => i.product.id === product.id)?.quantity || 0}
                  isWishlisted={wishlistIds.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                  isHighlighted={highlightedProductId === product.id}
                  reviews={reviews}
                  hasPurchased={hasPurchasedProduct(product.id)}
                  onAddReview={onAddReview}
                  onOpenProductDetail={onOpenProductDetail}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#ded2bc] text-center shadow-xs space-y-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto text-amber-500 shadow-inner">
            <Search className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              No products found for "{query}"
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              We couldn't find matches in the {isRestaurantMode ? 'Restaurant & Dining' : 'Grocery'} catalogue. Check for typos, or search popular suggestions below.
            </p>
          </div>

          {/* Popular Search Suggestions */}
          <div className="pt-2 max-w-lg mx-auto">
            <div className="flex items-center justify-center gap-1.5 text-xs font-black text-slate-800 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              <span>{isRestaurantMode ? 'Popular Dishes & Cuisines' : 'Popular Everyday Essentials'}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {activeSuggestions.map(item => (
                <button
                  key={item.term}
                  type="button"
                  onClick={() => onSearchQueryChange(item.term)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-800 hover:text-amber-950 border border-slate-200 hover:border-amber-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <span>{item.icon}</span>
                  <span>{item.term}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onClearSearch}
              className="px-5 py-2.5 rounded-xl text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-2"
              style={{ backgroundColor: 'var(--bazli-primary, #f59e0b)' }}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Return to {isRestaurantMode ? 'Restaurant Food' : 'Storefront'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
