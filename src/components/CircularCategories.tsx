import React, { useRef } from 'react';
import { PRODUCT_CATEGORIES } from '../data/initialData';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface CircularCategoriesProps {
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
  showAllOption?: boolean;
  title?: string;
  badgeText?: string;
}

// Clean background accents for category circles in fresh modern tones
const CATEGORY_BG_COLORS = [
  'from-[#f5efe6] to-[#ede5d8] text-slate-900 border-[#ded2bc]',
  'from-amber-50 to-amber-100 text-slate-900 border-amber-200',
  'from-sky-50 to-blue-50 text-slate-900 border-sky-200',
  'from-orange-50 to-amber-50 text-slate-900 border-orange-200',
  'from-[#fbf9f5] to-[#f5efe6] text-slate-900 border-[#e8dfd1]',
];

export const CircularCategories: React.FC<CircularCategoriesProps> = ({
  selectedCategory,
  onSelectCategory,
  showAllOption = true,
  title = 'Explore Categories',
  badgeText = '⚡ 100% freshness your environment'
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full relative py-1">
      {/* Header bar: Minimal & clean */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            {title}
          </h2>
          {badgeText && (
            <span className="text-[11px] font-black text-[#0a192f] bg-[#ede5d8] px-2.5 py-0.5 rounded-full border border-[#ded2bc] font-freshness">
              {badgeText}
            </span>
          )}
        </div>

        {/* Scroll Arrows on Desktop */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="w-7 h-7 rounded-full bg-white hover:bg-[#ede5d8] border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs transition-colors cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-7 h-7 rounded-full bg-white hover:bg-[#ede5d8] border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs transition-colors cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Circular Tray */}
      <div
        ref={scrollContainerRef}
        className="flex items-start gap-3 sm:gap-4.5 overflow-x-auto pb-2 pt-1 px-1 scrollbar-none scroll-smooth"
      >
        {/* "All Items" Circle */}
        {showAllOption && (
          <button
            onClick={() => onSelectCategory('All')}
            className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer text-center w-17 sm:w-20"
          >
            <div
              className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center border-2 transition-all duration-200 bg-gradient-to-br from-[#0a192f] via-[#0f2744] to-[#071322] shadow-md ${
                selectedCategory === 'All'
                  ? 'ring-3 ring-[#0a192f] ring-offset-2 ring-offset-[#fbf9f5] scale-105 border-amber-400'
                  : 'border-[#1e3a5f] group-hover:scale-105'
              }`}
            >
              <div className="text-center text-white">
                <span className="text-xl sm:text-2xl block">🛒</span>
              </div>
            </div>
            <span
              className={`text-[11px] sm:text-xs font-bold leading-tight line-clamp-2 transition-colors ${
                selectedCategory === 'All'
                  ? 'text-[#0a192f] font-black'
                  : 'text-slate-700 group-hover:text-[#0a192f]'
              }`}
            >
              All Items
            </span>
          </button>
        )}

        {/* Circular Categories List */}
        {PRODUCT_CATEGORIES.map((cat, idx) => {
          const isSelected = selectedCategory === cat.name;
          const bgGradient = CATEGORY_BG_COLORS[idx % CATEGORY_BG_COLORS.length];

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer text-center w-17 sm:w-20"
            >
              {/* Circular Avatar Container */}
              <div
                className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full p-1 border-2 transition-all duration-200 bg-gradient-to-b ${bgGradient} overflow-hidden shadow-2xs ${
                  isSelected
                    ? 'ring-3 ring-[#0a192f] ring-offset-2 ring-offset-[#fbf9f5] scale-105 border-[#0a192f] shadow-md'
                    : 'border-slate-200 group-hover:scale-105 group-hover:shadow-sm'
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Category Name Label (Short & Clean) */}
              <span
                className={`text-[11px] sm:text-xs leading-tight line-clamp-2 transition-colors max-w-full ${
                  isSelected
                    ? 'text-[#0a192f] font-black'
                    : 'text-slate-700 font-bold group-hover:text-[#0a192f]'
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
