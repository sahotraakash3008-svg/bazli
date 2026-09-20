import React, { useState } from 'react';
import { Product, CartItem, BargainingSession, ProductReview } from '../types';
import { PRODUCT_CATEGORIES } from '../data/initialData';
import { ProductCard } from './ProductCard';
import { CircularCategories } from './CircularCategories';
import { calculateProductSearchScore, normalizeSearchText } from '../utils/searchUtils';
import {
  Search,
  PackageCheck,
  ArrowRight
} from 'lucide-react';

interface CategoriesViewProps {
  products: Product[];
  cartItems: CartItem[];
  bargainSessions: Record<string, BargainingSession>;
  wishlistIds?: string[];
  onToggleWishlist?: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBargainClick: (product: Product) => void;
  onUpdateCartQty: (product: Product, quantity: number) => void;
  onSelectCategory: (categoryName: string) => void;
  reviews?: ProductReview[];
  hasPurchasedProduct?: (productId: string) => boolean;
  onAddReview?: (productId: string, rating: number, comment: string) => void;
  onOpenProductDetail?: (product: Product) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  products,
  cartItems,
  bargainSessions,
  wishlistIds = [],
  onToggleWishlist,
  onAddToCart,
  onBargainClick,
  onUpdateCartQty,
  onSelectCategory,
  reviews = [],
  hasPurchasedProduct,
  onAddReview,
  onOpenProductDetail
}) => {
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Helper to match products to a category definition
  const getProductsForCategory = (categoryName: string) => {
    return products.filter(p => {
      const matchName = p.category.toLowerCase();
      const targetName = categoryName.toLowerCase();

      return (
        matchName === targetName ||
        matchName.includes(targetName) ||
        targetName.includes(matchName) ||
        (targetName.includes('dairy') && matchName.includes('dairy')) ||
        (targetName.includes('fruit') && matchName.includes('fruit')) ||
        (targetName.includes('atta') && matchName.includes('atta')) ||
        (targetName.includes('oil') && matchName.includes('oil')) ||
        (targetName.includes('cleaning') && (matchName.includes('cleaning') || matchName.includes('laundry')))
      );
    });
  };

  const cleanCatSearch = normalizeSearchText(searchQuery);

  const filteredCategories = PRODUCT_CATEGORIES.filter(cat => {
    const matchesFilter = selectedCatFilter === 'All' || cat.name === selectedCatFilter;
    if (!cleanCatSearch) return matchesFilter;

    const catNameNorm = normalizeSearchText(cat.name);
    const directCatMatch = catNameNorm.includes(cleanCatSearch) || cleanCatSearch.includes(catNameNorm);
    const productMatch = getProductsForCategory(cat.name).some(p => {
      const { matches, score } = calculateProductSearchScore(p, cleanCatSearch);
      return matches && score > 0;
    });

    return matchesFilter && (directCatMatch || productMatch);
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Circular Categories Filter Bar */}
      <div className="bg-[#fcfaf6] rounded-3xl p-4 sm:p-5 border border-[#ded2bc] shadow-2xs">
        <CircularCategories
          selectedCategory={selectedCatFilter}
          onSelectCategory={(cat) => {
            setSelectedCatFilter(cat);
            if (cat !== 'All') {
              onSelectCategory(cat);
            }
          }}
          showAllOption={true}
        />
      </div>

      {/* Quick Search & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {selectedCatFilter === 'All' ? 'All Groceries & Essentials' : selectedCatFilter}
          </h1>
          <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
            {selectedCatFilter === 'All' ? products.length : getProductsForCategory(selectedCatFilter).length} items
          </span>
        </div>

        {/* Quick Search */}
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search in categories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-amber-300/80 text-slate-900 placeholder-slate-400 text-xs font-semibold pl-10 pr-4 py-2.5 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 shadow-xs"
          />
        </div>
      </div>

      {/* Category Sections & Items List */}
      <div className="space-y-8">
        {filteredCategories.map(category => {
          const categoryProducts = getProductsForCategory(category.name);
          if (categoryProducts.length === 0 && selectedCatFilter !== 'All') return null;

          return (
            <section key={category.id} className="bg-white rounded-3xl border border-[#ded2bc] p-4 sm:p-5 shadow-2xs space-y-4">
              {/* Category Section Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-[#ded2bc]/60">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[#ded2bc] shadow-2xs shrink-0 bg-[#fbf9f5] p-0.5">
                    <img src={category.image} alt={category.name} className="w-full h-full object-cover rounded-full" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span>{category.name}</span>
                      <span className="text-[#0a192f] bg-[#ede5d8] text-[11px] font-bold px-2 py-0.5 rounded-full border border-[#ded2bc]">
                        {categoryProducts.length} items
                      </span>
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => onSelectCategory(category.name)}
                  className="text-xs font-bold text-[#0a192f] hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>View in shop</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Product Shelf (Swipe left-right with 3-4 visible on mobile, scaled for desktop) */}
              {categoryProducts.length > 0 ? (
                <div className="flex items-stretch gap-2 sm:gap-3.5 overflow-x-auto pb-2 pt-1 px-1 scrollbar-none scroll-smooth snap-x snap-mandatory">
                  {categoryProducts.map(product => (
                    <div
                      key={product.id}
                      className="w-[98px] sm:w-[136px] md:w-[160px] lg:w-[185px] xl:w-[200px] shrink-0 snap-start flex flex-col"
                    >
                      <ProductCard
                        key={product.id}
                        product={product}
                        bargainSession={bargainSessions[product.id]}
                        onAddToCart={onAddToCart}
                        onBargainClick={onBargainClick}
                        onOpenBargain={onBargainClick}
                        onUpdateCartQty={(p, q) => onUpdateCartQty(p, q)}
                        cartQuantity={cartItems.find(i => i.product.id === product.id)?.quantity || 0}
                        isWishlisted={wishlistIds.includes(product.id)}
                        onToggleWishlist={onToggleWishlist}
                        reviews={reviews}
                        hasPurchased={hasPurchasedProduct ? hasPurchasedProduct(product.id) : false}
                        onAddReview={onAddReview}
                        onOpenProductDetail={onOpenProductDetail}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-[#ded2bc] text-slate-400 text-xs font-semibold">
                  No items listed in {category.name} currently.
                </div>
              )}
            </section>
          );
        })}

        {filteredCategories.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#ded2bc] space-y-3">
            <PackageCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-extrabold text-slate-800 text-base">No categories matching your search</h3>
            <p className="text-xs text-slate-400">Try typing another category name or product keyword.</p>
            <button
              onClick={() => {
                setSelectedCatFilter('All');
                setSearchQuery('');
              }}
              className="bg-[#0a192f] hover:bg-[#132f54] text-amber-300 font-bold px-4 py-2 rounded-xl text-xs border border-[#1e3a5f] cursor-pointer shadow-xs"
            >
              Reset Category Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
