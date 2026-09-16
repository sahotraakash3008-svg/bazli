import React from 'react';
import { Product, CartItem } from '../types';
import { Heart, X, Trash2, ShoppingBag, Scale, Sparkles, ShoppingCart, ArrowRight, Store, Flame, TrendingDown, Bell } from 'lucide-react';
import { isProductInTodaysDeal, getProductDealPrice } from '../data/todaysDeals';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: string[];
  products: Product[];
  cartItems: CartItem[];
  onToggleWishlist: (product: Product) => void;
  onClearWishlist: () => void;
  onAddToCart: (product: Product) => void;
  onUpdateCartQty: (product: Product, qty: number) => void;
  onBargainClick?: (product: Product) => void;
  onMoveAllToCart: () => void;
  onSimulatePriceDrop?: (productId?: string) => void;
  onOpenProductDetail?: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistIds,
  products,
  cartItems,
  onToggleWishlist,
  onClearWishlist,
  onAddToCart,
  onUpdateCartQty,
  onBargainClick,
  onMoveAllToCart,
  onSimulatePriceDrop,
  onOpenProductDetail
}) => {
  if (!isOpen) return null;

  const wishlistedProducts = products.filter(p => wishlistIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      {/* Drawer Overlay backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Main Container */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slideLeft border-l border-slate-200">
        
        {/* Drawer Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-emerald-800/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-500/20 border border-rose-400/40 rounded-2xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-rose-400 fill-rose-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <span>My Wishlist</span>
                <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-black">
                  {wishlistedProducts.length}
                </span>
              </h3>
              <p className="text-[11px] text-emerald-200/90 font-medium">
                Saved items for quick access & price drop alerts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Price Drop Alert Status Banner */}
        <div className="bg-amber-50 border-b border-amber-200/70 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center space-x-2">
            <Bell className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />
            <span className="font-bold text-[11px]">Price Drop Tracker Active</span>
          </div>
          {wishlistedProducts.length > 0 && onSimulatePriceDrop && (
            <button
              onClick={() => onSimulatePriceDrop()}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg border border-amber-500/50 shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
              title="Test the real-time price drop toast notification"
            >
              <TrendingDown className="w-3 h-3 text-slate-950" />
              <span>Simulate Drop</span>
            </button>
          )}
        </div>

        {/* Action Header Bar if items exist */}
        {wishlistedProducts.length > 0 && (
          <div className="bg-emerald-50/80 border-b border-emerald-100 p-3 px-5 flex items-center justify-between">
            <button
              onClick={onMoveAllToCart}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Move All to Cart</span>
            </button>

            <button
              onClick={onClearWishlist}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Wishlist</span>
            </button>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {wishlistedProducts.length > 0 ? (
            wishlistedProducts.map(product => {
              const isDeal = isProductInTodaysDeal(product) || product.isTodayDeal;
              const effectivePrice = isDeal ? getProductDealPrice(product) : product.sellingPrice;
              const cartItem = cartItems.find(i => i.product.id === product.id);
              const cartQty = cartItem?.quantity || 0;

              return (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-3.5 flex gap-3 shadow-2xs transition-all relative group"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => onToggleWishlist(product)}
                    className="absolute top-2.5 right-2.5 p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-full transition-colors cursor-pointer z-10"
                    title="Remove from Wishlist"
                  >
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  </button>

                  {/* Product Image */}
                  <div
                    onClick={() => {
                      onOpenProductDetail?.(product);
                      onClose();
                    }}
                    className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100 relative cursor-pointer"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {isDeal && (
                      <span className="absolute top-1 left-1 bg-rose-600 text-white font-black text-[8px] px-1 py-0.2 rounded">
                        DEAL
                      </span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between pr-6">
                    <div
                      onClick={() => {
                        onOpenProductDetail?.(product);
                        onClose();
                      }}
                      className="cursor-pointer"
                    >
                      <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block">
                        {product.category}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-1 hover:text-emerald-700 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {product.quantity} • {product.sellerName}
                      </p>
                    </div>

                    <div className="flex items-baseline space-x-2 pt-1">
                      <span className="font-extrabold text-sm text-emerald-700">
                        ₹{effectivePrice}
                      </span>
                      {product.mrp > effectivePrice && (
                        <span className="text-[11px] text-slate-400 line-through">
                          ₹{product.mrp}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-2">
                      <button
                        onClick={() => onAddToCart(product)}
                        className={`flex-1 font-extrabold text-[11px] py-1.5 px-2.5 rounded-xl flex items-center justify-center space-x-1 cursor-pointer transition-colors ${
                          cartQty > 0
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{cartQty > 0 ? `In Cart (${cartQty})` : 'Add to Cart'}</span>
                      </button>

                      {product.bargainingAllowed && onBargainClick && (
                        <button
                          onClick={() => {
                            onClose();
                            onBargainClick(product);
                          }}
                          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[11px] py-1.5 px-2.5 rounded-xl flex items-center justify-center space-x-1 cursor-pointer transition-colors border border-amber-300"
                          title="Bargain with Bazli"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span>Bargain</span>
                        </button>
                      )}

                      {onSimulatePriceDrop && (
                        <button
                          onClick={() => onSimulatePriceDrop(product.id)}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl transition-colors cursor-pointer border border-amber-200/80 flex items-center gap-0.5"
                          title="Simulate price drop for this item"
                        >
                          <TrendingDown className="w-3.5 h-3.5 text-amber-700" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center border border-rose-100 text-rose-500 shadow-inner">
                <Heart className="w-10 h-10 fill-rose-100 text-rose-400" />
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 text-base">
                  Your Wishlist is Empty
                </h4>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Tap the heart icon on any product to save your favorite groceries, daily essentials, or bargain deals for later!
                </p>
              </div>

              <button
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center space-x-2 cursor-pointer transition-transform hover:scale-102"
              >
                <span>Explore Groceries</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer info if items exist */}
        {wishlistedProducts.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
            <span>Items in your wishlist remain saved on this device.</span>
          </div>
        )}

      </div>
    </div>
  );
};
