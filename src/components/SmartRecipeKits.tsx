import React, { useState } from 'react';
import { ChefHat, Sparkles, Plus, Check, ShoppingBag, Clock, Flame, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface RecipeKitItem {
  id: string;
  name: string;
  qty: string;
  approxPrice: number;
}

interface RecipeKit {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  cookingTime: string;
  serves: string;
  difficulty: 'Easy' | 'Medium' | 'Quick 5m';
  image: string;
  bundlePrice: number;
  originalPrice: number;
  ingredients: RecipeKitItem[];
  category: string;
}

interface SmartRecipeKitsProps {
  products: Product[];
  onAddRecipeKitToCart: (kit: RecipeKit) => void;
  onOpenProductDetail?: (product: Product) => void;
}

export const SMART_RECIPE_KITS: RecipeKit[] = [
  {
    id: 'kit-1',
    title: 'Desi Masala Chai & Crunchy Biscuits Break',
    subtitle: 'Fresh milk, ginger root, premium Assam tea & Parle-G bundle',
    badge: '10-MIN SNACK',
    cookingTime: '6 mins',
    serves: '2-3 Cups',
    difficulty: 'Quick 5m',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    bundlePrice: 85,
    originalPrice: 110,
    category: 'Beverages',
    ingredients: [
      { id: 'ing-1', name: 'Fresh Full Cream Milk', qty: '500 ml', approxPrice: 34 },
      { id: 'ing-2', name: 'Premium Assam CTC Tea', qty: '250 g', approxPrice: 42 },
      { id: 'ing-3', name: 'Fresh Ginger Root (Adrak)', qty: '100 g', approxPrice: 15 },
      { id: 'ing-4', name: 'Classic Gold Biscuits', qty: '1 Pack', approxPrice: 10 },
    ]
  },
  {
    id: 'kit-2',
    title: 'Authentic Dhaba Dal Tadka & Jeera Rice Kit',
    subtitle: 'Unpolished Toor Dal, pure Desi Ghee, cumin seeds, tomatoes & garlic',
    badge: 'CHEF SPECIAL',
    cookingTime: '15 mins',
    serves: '3-4 Persons',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    bundlePrice: 175,
    originalPrice: 220,
    category: 'Atta, Rice & Dal',
    ingredients: [
      { id: 'ing-5', name: 'Organic Toor Dal (Arhar)', qty: '500 g', approxPrice: 78 },
      { id: 'ing-6', name: 'Premium Basmati Rice', qty: '1 kg', approxPrice: 85 },
      { id: 'ing-7', name: 'Pure Cow Desi Ghee', qty: '100 ml', approxPrice: 65 },
      { id: 'ing-8', name: 'Fresh Garlic & Cumin Seeds', qty: '1 Combo', approxPrice: 25 },
    ]
  },
  {
    id: 'kit-3',
    title: 'Pan-Tossed Italian Margherita Pizza Kit',
    subtitle: 'Artisan thin crust bases, mozzarella cheese block & pizza pasta sauce',
    badge: 'KIDS FAVORITE',
    cookingTime: '10 mins',
    serves: '2 Pizzas',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    bundlePrice: 195,
    originalPrice: 260,
    category: 'Instant Food',
    ingredients: [
      { id: 'ing-9', name: 'Gourmet Pizza Bases (2 pcs)', qty: '1 Pack', approxPrice: 65 },
      { id: 'ing-10', name: 'Diced Mozzarella Blend', qty: '200 g', approxPrice: 110 },
      { id: 'ing-11', name: 'Classic Pizza Pasta Herb Sauce', qty: '200 g', approxPrice: 55 },
      { id: 'ing-12', name: 'Oregano & Chilli Flakes', qty: 'Pack', approxPrice: 20 },
    ]
  },
  {
    id: 'kit-4',
    title: 'Midnight Gamer Maggi & Chilled Cola Combo',
    subtitle: '2x Masala Noodles, spicy peri-peri seasoning & 750ml chilled cola',
    badge: 'MIDNIGHT CRAVING',
    cookingTime: '4 mins',
    serves: '1-2 Persons',
    difficulty: 'Quick 5m',
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
    bundlePrice: 78,
    originalPrice: 105,
    category: 'Instant Food',
    ingredients: [
      { id: 'ing-13', name: '2-Minute Masala Noodles (2pk)', qty: '2 Packs', approxPrice: 30 },
      { id: 'ing-14', name: 'Chilled Cola Pet Bottle', qty: '750 ml', approxPrice: 40 },
      { id: 'ing-15', name: 'Crispy Salted Potato Chips', qty: '1 Pack', approxPrice: 20 },
    ]
  }
];

export const SmartRecipeKits: React.FC<SmartRecipeKitsProps> = ({
  products,
  onAddRecipeKitToCart
}) => {
  const [selectedKitId, setSelectedKitId] = useState<string>(SMART_RECIPE_KITS[0].id);
  const [addedKitIds, setAddedKitIds] = useState<string[]>([]);

  const activeKit = SMART_RECIPE_KITS.find(k => k.id === selectedKitId) || SMART_RECIPE_KITS[0];

  const handleAdd = (kit: RecipeKit) => {
    onAddRecipeKitToCart(kit);
    setAddedKitIds(prev => [...prev, kit.id]);
    setTimeout(() => {
      setAddedKitIds(prev => prev.filter(id => id !== kit.id));
    }, 2000);
  };

  return (
    <div className="w-full space-y-4">
      {/* Header with AI Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ded2bc] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#0a192f] text-amber-300 flex items-center justify-center font-bold shadow-md border border-[#1e3a5f]">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Bazli 10-Min Meal Kits & Recipes 🍳
              </h2>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow-2xs">
                BAZLI BUNDLES
              </span>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm font-medium mt-0.5">
              Everything you need to cook fresh meals in 10 mins • 1-Click adds all ingredients with instant savings!
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Recipe Kits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SMART_RECIPE_KITS.map(kit => {
          const isAdded = addedKitIds.includes(kit.id);
          const savings = kit.originalPrice - kit.bundlePrice;
          const discountPercent = Math.round((savings / kit.originalPrice) * 100);

          return (
            <div
              key={kit.id}
              className="bg-white rounded-3xl border border-[#ded2bc] shadow-sm hover:shadow-xl hover:border-amber-400/80 transition-all overflow-hidden flex flex-col justify-between group"
            >
              {/* Image & Badges */}
              <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                <img
                  src={kit.image}
                  alt={kit.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                
                {/* Top Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                    {kit.badge}
                  </span>
                  <span className="bg-[#0a192f] text-amber-300 font-black text-[9px] px-1.5 py-0.5 rounded-md shadow-xs border border-[#1e3a5f]">
                    SAVE {discountPercent}%
                  </span>
                </div>

                {/* Timing Badge */}
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px] font-bold">
                  <span className="flex items-center gap-1 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-white/20">
                    <Clock className="w-3 h-3 text-amber-300" /> {kit.cookingTime}
                  </span>
                  <span className="bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-white/20 text-slate-200">
                    {kit.serves}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-[#0a192f] transition-colors">
                    {kit.title}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1 line-clamp-2">
                    {kit.subtitle}
                  </p>

                  {/* Included Ingredients Pill List */}
                  <div className="mt-2.5 pt-2 border-t border-[#ded2bc]/60 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                      Included ({kit.ingredients.length} items):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {kit.ingredients.map(ing => (
                        <span
                          key={ing.id}
                          className="bg-[#ede5d8]/60 text-slate-800 text-[10px] font-medium px-2 py-0.5 rounded-md border border-[#ded2bc]"
                        >
                          ✓ {ing.name} ({ing.qty})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing and 1-Click Add Button */}
                <div className="pt-3 border-t border-[#ded2bc]/60 flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base sm:text-lg font-black text-slate-900">
                        ₹{kit.bundlePrice}
                      </span>
                      <span className="text-xs font-bold text-slate-400 line-through">
                        ₹{kit.originalPrice}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-700 font-extrabold block">
                      Save ₹{savings} Bundle Deal
                    </span>
                  </div>

                  <button
                    onClick={() => handleAdd(kit)}
                    disabled={isAdded}
                    className={`px-3.5 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-md ${
                      isAdded
                        ? 'bg-[#0a192f] text-amber-300 border border-[#1e3a5f]'
                        : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 border border-amber-300'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added Kit!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add Kit 🛒</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
