import React from 'react';
import { PRODUCT_CATEGORIES } from '../data/initialData';

interface CategoryGridProps {
  onSelectCategory: (categoryName: string) => void;
  selectedCategory?: string;
}

const CATEGORY_BG_COLORS = [
  'from-emerald-100 to-teal-50 border-emerald-200',
  'from-blue-100 to-sky-50 border-sky-200',
  'from-amber-100 to-yellow-50 border-amber-200',
  'from-orange-100 to-amber-50 border-orange-200',
  'from-rose-100 to-red-50 border-rose-200',
  'from-purple-100 to-indigo-50 border-purple-200',
  'from-pink-100 to-rose-50 border-pink-200',
  'from-teal-100 to-cyan-50 border-teal-200',
  'from-lime-100 to-green-50 border-lime-200',
];

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory,
  selectedCategory
}) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          Explore by Category
        </h2>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory('')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
          >
            Show All
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
        {PRODUCT_CATEGORIES.map((cat, idx) => {
          const isSelected = selectedCategory === cat.name;
          const bgGradient = CATEGORY_BG_COLORS[idx % CATEGORY_BG_COLORS.length];

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-200 group cursor-pointer text-center"
            >
              {/* Circular Avatar Container */}
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 border-2 transition-all duration-200 bg-gradient-to-b ${bgGradient} overflow-hidden shadow-2xs ${
                  isSelected
                    ? 'ring-3 ring-emerald-600 ring-offset-2 scale-105 border-emerald-500 shadow-md'
                    : 'group-hover:scale-105 group-hover:shadow-sm'
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Title */}
              <span
                className={`text-xs font-bold leading-tight line-clamp-2 transition-colors ${
                  isSelected ? 'text-emerald-700 font-black' : 'text-slate-700 group-hover:text-slate-900'
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

