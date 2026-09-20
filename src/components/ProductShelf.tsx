import React, { useRef } from 'react';
import { Product, CartItem, BargainingSession, ProductReview } from '../types';
import { ProductCard } from './ProductCard';
import { ChevronLeft, ChevronRight, Zap, Sparkles } from 'lucide-react';

interface ProductShelfProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  products: Product[];
  cartItems: CartItem[];
  bargainSessions: Record<string, BargainingSession>;
  wishlistIds?: string[];
  onToggleWishlist?: (product: Product) => void;
  onAddToCart: (product: Product, bargainSession?: any, selectedWeight?: string, unitPrice?: number, unitMrp?: number) => void;
  onBargainClick: (product: Product, selectedWeight?: string, variantPrice?: number) => void;
  onUpdateCartQty: (product: Product, quantity: number, selectedWeight?: string) => void;
  reviews?: ProductReview[];
  hasPurchasedProduct?: (productId: string) => boolean;
  onAddReview?: (productId: string, rating: number, comment: string) => void;
  onSeeAll?: () => void;
  onOpenProductDetail?: (product: Product) => void;
}

export const ProductShelf: React.FC<ProductShelfProps> = React.memo(({
  title,
  subtitle,
  badgeText = '⚡ 100% freshness your environment',
  products,
  cartItems,
  bargainSessions,
  wishlistIds = [],
  onToggleWishlist,
  onAddToCart,
  onBargainClick,
  onUpdateCartQty,
  reviews = [],
  hasPurchasedProduct,
  onAddReview,
  onSeeAll,
  onOpenProductDetail,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      // Scroll by ~3 card widths
      const cardWidth = scrollRef.current.clientWidth > 640 ? 360 : 220;
      const scrollOffset = direction === 'left' ? -cardWidth : cardWidth;
      scrollRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl p-3 sm:p-5 border border-[#ded2bc] shadow-xs space-y-3">
      {/* Shelf Header with Title & Left/Right Arrows for Desktop */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base md:text-lg font-black text-slate-900 tracking-tight">
                {title}
              </h2>
              {badgeText && (
                <span className="text-[10px] sm:text-xs font-black text-[#0a192f] bg-[#ede5d8] px-2 py-0.5 rounded-full border border-[#ded2bc] flex items-center gap-0.5 font-freshness">
                  <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>{badgeText}</span>
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSeeAll && (
            <button
              onClick={onSeeAll}
              className="text-[11px] sm:text-xs font-bold text-[#0a192f] hover:text-[#132f54] transition-colors cursor-pointer"
            >
              See All
            </button>
          )}

          {/* Desktop Left/Right Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <button
              onClick={() => handleScroll('left')}
              className="w-7 h-7 rounded-full bg-slate-50 hover:bg-[#ede5d8] border border-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-7 h-7 rounded-full bg-slate-50 hover:bg-[#ede5d8] border border-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Swipeable Left-Right Product Tray */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-2.5 sm:gap-3.5 overflow-x-auto pb-2 pt-1 px-0.5 scrollbar-none overscroll-x-contain touch-pan-x"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {products.map((product) => {
          const cartItem = cartItems.find((i) => i.product.id === product.id);
          const cartQty = cartItem?.quantity || 0;
          const isWish = wishlistIds.includes(product.id);
          const session = bargainSessions[product.id];

          return (
            <div
              key={product.id}
              className="w-[130px] sm:w-[150px] md:w-[170px] lg:w-[185px] xl:w-[200px] shrink-0 flex flex-col"
            >
              <ProductCard
                product={product}
                bargainSession={session}
                onAddToCart={onAddToCart}
                onBargainClick={onBargainClick}
                onOpenBargain={onBargainClick}
                onUpdateCartQty={onUpdateCartQty}
                cartQuantity={cartQty}
                isWishlisted={isWish}
                onToggleWishlist={onToggleWishlist}
                reviews={reviews}
                hasPurchased={hasPurchasedProduct ? hasPurchasedProduct(product.id) : false}
                onAddReview={onAddReview}
                onOpenProductDetail={onOpenProductDetail}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
});
