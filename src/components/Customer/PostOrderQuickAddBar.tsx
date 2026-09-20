import React, { useState, useEffect } from 'react';
import { Clock, Plus, Check, Zap, AlertCircle, ShoppingBag, ArrowRight, X } from 'lucide-react';
import { Product, Order, CartItem } from '../../types';

interface PostOrderQuickAddBarProps {
  recentOrder: Order | null;
  onAddItemToOrder: (orderId: string, product: Product) => void;
  products: Product[];
  onDismiss?: () => void;
}

// Quick impulse essentials that customers frequently forget
const FORGOTTEN_ESSENTIAL_KEYWORDS = [
  'coriander', 'dhaniya', 'lemon', 'nimbu', 'chilli', 'mirch', 
  'bread', 'butter', 'milk', 'doodh', 'garlic', 'ginger', 'adrak', 'curd', 'dahi'
];

export const PostOrderQuickAddBar: React.FC<PostOrderQuickAddBarProps> = ({
  recentOrder,
  onAddItemToOrder,
  products,
  onDismiss
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [addedProductIds, setAddedProductIds] = useState<string[]>([]);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // 60-second countdown timer
  useEffect(() => {
    if (!recentOrder) return;

    setTimeLeft(60);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [recentOrder?.id]);

  if (!recentOrder || timeLeft <= 0) return null;

  // Find matching low-cost frequently forgotten impulse add-ons
  const addOnProducts = products
    .filter(p => {
      const name = p.name.toLowerCase();
      const cat = (p.category || '').toLowerCase();
      return (
        FORGOTTEN_ESSENTIAL_KEYWORDS.some(k => name.includes(k) || cat.includes(k)) ||
        p.price <= 50
      );
    })
    .slice(0, 5);

  const handleQuickAdd = (product: Product) => {
    onAddItemToOrder(recentOrder.id, product);
    setAddedProductIds(prev => [...prev, product.id]);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in fade-in slide-in-from-bottom-5">
      <div className="bg-[#140b06] text-white rounded-2xl shadow-2xl border-2 border-amber-500/80 p-3.5 backdrop-blur-md relative overflow-hidden">
        
        {/* Animated Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-950">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-emerald-400 transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 60) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mt-1 mb-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
                  Forgot Something?
                </span>
                <span className="bg-amber-400/20 text-amber-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-amber-400/40">
                  ⚡ 0₹ Extra Delivery
                </span>
              </div>
              <p className="text-[11px] text-stone-300 font-medium">
                Add to your live order in next <strong className="text-white font-black">{timeLeft}s</strong>!
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-black text-xs text-amber-300">
              {timeLeft}
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Add Items Carousel */}
        <div className="flex space-x-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {addOnProducts.map(prod => {
            const isAdded = addedProductIds.includes(prod.id);
            return (
              <div
                key={prod.id}
                className="shrink-0 w-32 bg-[#22160e] border border-[#3d2a1c] rounded-xl p-2 flex flex-col justify-between"
              >
                <div className="flex items-center space-x-1.5 mb-1.5">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-8 h-8 object-cover rounded-lg shrink-0 border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-white truncate leading-tight">
                      {prod.name}
                    </p>
                    <span className="text-[11px] font-black text-amber-400 block">
                      ₹{prod.price}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickAdd(prod)}
                  disabled={isAdded}
                  className={`w-full py-1 rounded-lg text-[10px] font-black flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                    isAdded
                      ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/50'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black shadow-xs'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      <span>+ Add ₹{prod.price}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
