import React, { useState } from 'react';
import { Product, ProductReview } from '../types';
import { ProductCard } from './ProductCard';
import { Sparkles, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  onBargainClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onUpdateCartQty: (product: Product, qty: number) => void;
  getCartQty: (productId: string) => number;
  wishlistIds: string[];
  onToggleWishlist: (product: Product) => void;
  bargainedPrices: Record<string, number>;
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;
  categories?: Array<{ name: string }>;
  reviews?: ProductReview[];
  hasPurchasedProduct?: (productId: string) => boolean;
  onAddReview?: (productId: string, rating: number, comment: string) => void;
  onOpenProductDetail?: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  title = "Popular Near You",
  subtitle = "Fresh grocery items & daily essentials delivered fast",
  onBargainClick,
  onAddToCart,
  onUpdateCartQty,
  getCartQty,
  wishlistIds,
  onToggleWishlist,
  bargainedPrices,
  selectedCategory,
  onSelectCategory,
  categories,
  reviews = [],
  hasPurchasedProduct,
  onAddReview,
  onOpenProductDetail
}) => {
  const [bargainOnlyFilter, setBargainOnlyFilter] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'discount'>('default');

  let filtered = [...products];

  if (bargainOnlyFilter) {
    filtered = filtered.filter(p => p.bargainingAllowed);
  }

  if (sortBy === 'price-low') {
    filtered.sort((a, b) => a.sellingPrice - b.sellingPrice);
  } else if (sortBy === 'price-high') {
    filtered.sort((a, b) => b.sellingPrice - a.sellingPrice);
  } else if (sortBy === 'discount') {
    filtered.sort((a, b) => b.discountPercentage - a.discountPercentage);
  }

  return (
    <section className="space-y-4">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{title}</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
              {filtered.length} Items
            </span>
          </h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Bargain Only Toggle Button */}
          <button
            onClick={() => setBargainOnlyFilter(!bargainOnlyFilter)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              bargainOnlyFilter
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Bargain Eligible Only</span>
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent outline-none cursor-pointer font-semibold text-slate-800"
            >
              <option value="default">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
            </select>
          </div>

        </div>
      </div>

      {/* Grid Display */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No products match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search filters or browse other categories on Bazli.
          </p>
          {bargainOnlyFilter && (
            <button
              onClick={() => setBargainOnlyFilter(false)}
              className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
            >
              Clear Bargain Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onBargainClick={onBargainClick}
              onAddToCart={onAddToCart}
              onUpdateCartQty={onUpdateCartQty}
              cartQuantity={getCartQty(product.id)}
              isWishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
              bargainedPrice={bargainedPrices[product.id]}
              reviews={reviews}
              hasPurchased={hasPurchasedProduct ? hasPurchasedProduct(product.id) : false}
              onAddReview={onAddReview}
              onOpenProductDetail={onOpenProductDetail}
            />
          ))}
        </div>
      )}
    </section>
  );
};
