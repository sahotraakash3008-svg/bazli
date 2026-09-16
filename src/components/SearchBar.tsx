import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Plus,
  Minus,
  Store,
  TrendingUp,
  Tag,
  ChevronRight,
  CheckCircle2,
  Mic,
  MicOff,
  Radio,
  Volume2
} from 'lucide-react';
import { Product, CartItem } from '../types';
import { isProductInTodaysDeal, getProductDealPrice } from '../data/todaysDeals';
import { calculateProductSearchScore, normalizeSearchText } from '../utils/searchUtils';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onUpdateCartQty?: (product: Product, qty: number) => void;
  cartItems?: CartItem[];
  onBargainClick?: (product: Product) => void;
  onSelectCategory?: (category: string) => void;
  isMobile?: boolean;
  placeholder?: string;
  onOpenVoiceAssistant?: () => void;
  onSubmitSearch?: (query: string) => void;
  portalContext?: 'grocery' | 'restaurant' | 'stationery';
}

const POPULAR_GROCERY_KEYWORDS = [
  { term: 'Milk', icon: '🥛', category: 'Dairy & Eggs' },
  { term: 'Atta', icon: '🌾', category: 'Atta, Rice & Dal' },
  { term: 'Desi Ghee', icon: '🧈', category: 'Oil & Ghee' },
  { term: 'Amul Butter', icon: '🧈', category: 'Dairy & Eggs' },
  { term: 'Fortune Oil', icon: '🛢️', category: 'Oil & Ghee' },
  { term: 'Paneer', icon: '🧀', category: 'Dairy & Eggs' },
  { term: 'Basmati Rice', icon: '🍚', category: 'Atta, Rice & Dal' },
  { term: 'Maggi & Noodles', icon: '🍜', category: 'Instant Food' },
  { term: 'Tea & Chai', icon: '☕', category: 'Beverages' },
  { term: 'Detergent & Surf', icon: '🧼', category: 'Laundry' },
  { term: 'Biscuits', icon: '🍪', category: 'Biscuits & Bakery' },
  { term: 'Fresh Apples', icon: '🍎', category: 'Fruits & Vegetables' }
];

const POPULAR_RESTAURANT_KEYWORDS = [
  { term: 'Chicken Biryani', icon: '🍗', category: 'Restaurant Meals & Dining' },
  { term: 'Paneer Butter Masala', icon: '🍛', category: 'Restaurant Meals & Dining' },
  { term: 'Butter Naan', icon: '🫓', category: 'Restaurant Meals & Dining' },
  { term: 'Margherita Pizza', icon: '🍕', category: 'Restaurant Meals & Dining' },
  { term: 'Veg Deluxe Thali', icon: '🍱', category: 'Restaurant Meals & Dining' },
  { term: 'Crispy Burger', icon: '🍔', category: 'Restaurant Meals & Dining' },
  { term: 'Steamed Momos', icon: '🥟', category: 'Restaurant Meals & Dining' },
  { term: 'Gulab Jamun', icon: '🍮', category: 'Restaurant Meals & Dining' },
  { term: 'Hakka Noodles', icon: '🍜', category: 'Restaurant Meals & Dining' },
  { term: 'Cold Coffee', icon: '🥤', category: 'Restaurant Meals & Dining' }
];

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  products = [],
  onSelectProduct,
  onAddToCart,
  onUpdateCartQty,
  cartItems = [],
  onBargainClick,
  onSelectCategory,
  isMobile = false,
  placeholder = "Search 'milk', 'atta', 'oil', 'ghee', 'butter', 'chips'...",
  onOpenVoiceAssistant,
  onSubmitSearch,
  portalContext = 'grocery'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isInlineListening, setIsInlineListening] = useState(false);
  const [inlineListeningNotice, setInlineListeningNotice] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inlineRecognitionRef = useRef<any>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Whenever searchQuery is updated (from voice search, assistant, or external source), pop open suggestions
  useEffect(() => {
    if (searchQuery && searchQuery.trim().length >= 1) {
      setIsOpen(true);
    }
  }, [searchQuery]);

  // Clean up inline speech recognition on unmount
  useEffect(() => {
    return () => {
      if (inlineRecognitionRef.current) {
        try {
          inlineRecognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Direct Inline Voice Search Handler
  const toggleInlineVoice = async () => {
    if (isInlineListening) {
      if (inlineRecognitionRef.current) {
        try {
          inlineRecognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsInlineListening(false);
      setInlineListeningNotice(null);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // If browser doesn't support Web Speech directly, fallback to voice assistant modal
      if (onOpenVoiceAssistant) {
        onOpenVoiceAssistant();
      }
      return;
    }

    // Request mic access first
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
      } catch (err: any) {
        console.warn('Microphone check:', err);
        setInlineListeningNotice('Microphone permission needed');
        setTimeout(() => setInlineListeningNotice(null), 3000);
        if (onOpenVoiceAssistant) onOpenVoiceAssistant();
        return;
      }
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN'; // Hindi + English supported

      recognition.onstart = () => {
        setIsInlineListening(true);
        setIsOpen(true);
        setInlineListeningNotice('Listening... Speak now (Hindi/English)');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          // Clean common prefix filler words like "mujhe", "search karo", "daalo"
          const clean = transcript
            .replace(/\b(mujhe|chahiye|daal do|search|karo|bhai|please)\b/gi, '')
            .trim();
          const targetText = clean.length > 0 ? clean : transcript.trim();
          setSearchQuery(targetText);
          setIsOpen(true);
          setInlineListeningNotice(`Recognized: "${targetText}"`);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Inline Speech Error:', event.error);
        setIsInlineListening(false);
        if (event.error !== 'no-speech') {
          setInlineListeningNotice(`Voice notice: ${event.error}`);
        } else {
          setInlineListeningNotice(null);
        }
      };

      recognition.onend = () => {
        setIsInlineListening(false);
        setTimeout(() => setInlineListeningNotice(null), 2500);
      };

      inlineRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech start error:', err);
      setIsInlineListening(false);
      if (onOpenVoiceAssistant) onOpenVoiceAssistant();
    }
  };

  // Normalized query
  const cleanQuery = useMemo(() => {
    return normalizeSearchText(searchQuery);
  }, [searchQuery]);

  // Is query active (1+ characters)
  const isQueryActive = cleanQuery.length >= 1;

  // Strict portal scoping
  const isRestaurantScope = portalContext === 'restaurant';
  const scopedProducts = useMemo(() => {
    if (isRestaurantScope) {
      return products.filter(p =>
        p.sellerType === 'restaurant' ||
        p.category === 'Restaurant Meals & Dining' ||
        (p.category && p.category.toLowerCase().includes('restaurant')) ||
        (p.id && (p.id.startsWith('rest-') || p.id.startsWith('dish-')))
      );
    } else if (portalContext === 'stationery') {
      return products.filter(p => p.sellerType === 'stationery');
    } else {
      // Grocery
      return products.filter(p =>
        p.sellerType !== 'restaurant' &&
        p.category !== 'Restaurant Meals & Dining' &&
        !(p.category && p.category.toLowerCase().includes('restaurant')) &&
        !(p.id && (p.id.startsWith('rest-') || p.id.startsWith('dish-'))) &&
        p.sellerType !== 'stationery'
      );
    }
  }, [products, isRestaurantScope, portalContext]);

  // Compute matched products with smart ranked scoring (bilingual, substring, and tokenized)
  const matchedProducts = useMemo(() => {
    if (!isQueryActive) return [];

    return scopedProducts
      .map(product => {
        const { matches, score } = calculateProductSearchScore(product, cleanQuery);
        return { product, matches, score };
      })
      .filter(item => item.matches && item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product)
      .slice(0, 12); // Return top 12 relevant matches
  }, [cleanQuery, isQueryActive, scopedProducts]);

  // Compute matched categories
  const matchedCategories = useMemo(() => {
    if (!isQueryActive) return [];

    const allCategories = Array.from(new Set(scopedProducts.map(p => p.category))).filter((c): c is string => typeof c === 'string' && c.length > 0);
    return allCategories
      .filter(cat => {
        const catClean = normalizeSearchText(cat);
        return (
          catClean.includes(cleanQuery) ||
          cleanQuery.includes(catClean.split(' ')[0]) ||
          (cleanQuery.includes('milk') && catClean.includes('dairy')) ||
          (cleanQuery.includes('oil') && catClean.includes('oil')) ||
          (cleanQuery.includes('atta') && catClean.includes('atta')) ||
          (cleanQuery.includes('fruit') && catClean.includes('fruit')) ||
          (cleanQuery.includes('snack') && catClean.includes('snack')) ||
          (cleanQuery.includes('soap') && catClean.includes('bath'))
        );
      })
      .slice(0, 4);
  }, [cleanQuery, isQueryActive, products]);

  // Compute matched seller / stores
  const matchedSellers = useMemo(() => {
    if (!isQueryActive) return [];

    const sellersMap = new Map<string, number>();
    products.forEach(p => {
      if (normalizeSearchText(p.sellerName).includes(cleanQuery)) {
        sellersMap.set(p.sellerName, (sellersMap.get(p.sellerName) || 0) + 1);
      }
    });

    return Array.from(sellersMap.entries())
      .map(([name, count]) => ({ name, count }))
      .slice(0, 2);
  }, [cleanQuery, isQueryActive, products]);

  // Direct Product Jump (1-Click Instant Navigation)
  const handleProductSelect = (product: Product) => {
    setIsOpen(false);
    inputRef.current?.blur();
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  // Direct Category Jump
  const handleCategorySelect = (category: string) => {
    setIsOpen(false);
    inputRef.current?.blur();
    if (onSelectCategory) {
      onSelectCategory(category);
    }
    setSearchQuery('');
  };

  // Direct Keyword / Search Submit to Dedicated Results Page
  const handleSearchSubmit = (keyword?: string) => {
    const term = (keyword !== undefined ? keyword : searchQuery).trim();
    setIsOpen(false);
    inputRef.current?.blur();
    if (term) {
      setSearchQuery(term);
      if (onSubmitSearch) {
        onSubmitSearch(term);
      }
    }
  };

  const handleKeywordSearch = (keyword: string) => {
    handleSearchSubmit(keyword);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      setSelectedIndex(prev => (prev < matchedProducts.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : matchedProducts.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < matchedProducts.length) {
        handleProductSelect(matchedProducts[selectedIndex]);
      } else {
        // Direct Submit on Enter to Dedicated Search Results Page!
        handleSearchSubmit(searchQuery);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  // Safe Highlight text match for search keywords
  const highlightMatch = (text: string, query: string) => {
    if (!query || query.length < 1) return text;
    try {
      const tokens = query.split(' ').filter(Boolean);
      if (tokens.length === 0) return text;
      const pattern = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
      const regex = new RegExp(`(${pattern})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-amber-200 text-slate-950 font-black rounded-xs px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      );
    } catch {
      return text;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id="global-search-input"
          type="text"
          placeholder={
            isInlineListening
              ? "🎙️ Listening... Bolie: Doodh, Atta, Butter, Chips..."
              : placeholder
          }
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          className={`w-full rounded-2xl transition-all border outline-none font-semibold shadow-md ${
            isInlineListening
              ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400 text-amber-950 placeholder:text-amber-700 animate-pulse'
              : 'bg-white hover:bg-amber-50/40 focus:bg-white text-slate-900 border-amber-300/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/40 placeholder:text-slate-400'
          } ${
            isMobile ? 'text-xs pl-9 pr-20 py-2.5' : 'text-sm pl-10 pr-24 py-2.5'
          }`}
        />
        
        <button
          type="button"
          onClick={() => handleSearchSubmit(searchQuery)}
          className={`text-amber-600 hover:text-amber-700 absolute transition-colors cursor-pointer ${
            isMobile ? 'left-3' : 'left-3.5'
          }`}
          title="Search"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        <div className="absolute right-2 flex items-center space-x-1">
          {searchQuery && (
            <button
              id="clear-search-btn"
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedIndex(-1);
                inputRef.current?.focus();
                if (onSubmitSearch) onSubmitSearch('');
              }}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Voice Search Button (Direct Speak + Assistant Menu) */}
          <div className="flex items-center space-x-0.5">
            <button
              id="voice-search-mic-btn"
              type="button"
              onClick={toggleInlineVoice}
              className={`p-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-xs ${
                isInlineListening
                  ? 'bg-red-600 text-white animate-bounce ring-2 ring-red-300'
                  : 'text-slate-950 bg-amber-400 hover:bg-amber-300 border border-amber-300 font-black'
              }`}
              title="Click to speak and auto-search (Hindi / English)"
            >
              {isInlineListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5 text-white animate-spin" />
                  <span className="text-[10px] font-black text-white">Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-slate-950" />
                  <span className="hidden sm:inline text-[10px] font-black text-slate-950">Voice</span>
                </>
              )}
            </button>

            {onOpenVoiceAssistant && !isInlineListening && (
              <button
                id="open-full-voice-modal-btn"
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenVoiceAssistant();
                }}
                className="hidden lg:flex px-1.5 py-1 text-[9px] font-black text-[#0a192f] hover:text-black bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors cursor-pointer items-center"
                title="Open Multi-item Voice Assistant (Cart Builder)"
              >
                <span>List+</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline listening notice banner */}
      {inlineListeningNotice && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 text-xs px-3 py-1.5 rounded-xl border border-amber-300 shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block" />
            <span className="font-black text-[11px]">{inlineListeningNotice}</span>
          </div>
          {onOpenVoiceAssistant && (
            <button
              onClick={() => {
                setIsInlineListening(false);
                onOpenVoiceAssistant();
              }}
              className="text-[10px] underline font-black text-slate-950 hover:text-slate-800 cursor-pointer ml-2"
            >
              Open Full Assistant ➔
            </button>
          )}
        </div>
      )}

      {/* Live Preferences & Suggestions Dropdown */}
      {isOpen && (
        <div
          id="search-preferences-dropdown"
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[#ded2bc] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 max-h-[80vh] overflow-y-auto divide-y divide-slate-100"
        >
          {/* STATE A: User typed 1+ letters -> Show matched products & category preferences */}
          {isQueryActive && (
            <>
              {/* 1. DIRECT PRODUCT MATCHES */}
              {matchedProducts.length > 0 && (
                <div className="p-2 sm:p-3">
                  <div className="flex items-center justify-between pb-2 px-1 text-[11px] font-bold text-slate-600">
                    <span className="flex items-center gap-1.5 text-[#0a192f] font-black">
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                      <span>Matching Products ({matchedProducts.length})</span>
                    </span>
                    <span className="text-[10px] text-amber-900 font-bold bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                      1-Click Instant Go ➔
                    </span>
                  </div>

                  <div className="space-y-1 mt-1">
                    {matchedProducts.map((product, idx) => {
                      const isDealItem = isProductInTodaysDeal(product) || product.isTodayDeal;
                      const dealPrice = isDealItem ? getProductDealPrice(product) : product.sellingPrice;
                      const cartItem = cartItems.find(i => i.product.id === product.id);
                      const qty = cartItem?.quantity || 0;
                      const isSelected = selectedIndex === idx;

                      return (
                        <div
                          key={product.id}
                          id={`search-suggestion-${product.id}`}
                          onMouseDown={(e) => {
                            // Instant navigation on single click/touch
                            e.preventDefault();
                            handleProductSelect(product);
                          }}
                          onClick={() => handleProductSelect(product)}
                          className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group border select-none ${
                            isSelected
                              ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-400/40 shadow-xs'
                              : 'bg-white hover:bg-[#fcfaf6] border-slate-200/80 hover:border-amber-300'
                          }`}
                        >
                          {/* Left: Thumbnail, Name, Pack, Store */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 p-1 shrink-0 flex items-center justify-center relative overflow-hidden shadow-2xs">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                                loading="lazy"
                              />
                              {isDealItem && (
                                <span className="absolute top-0 right-0 bg-red-600 text-white text-[7px] font-black px-1 rounded-bl">
                                  DEAL
                                </span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-amber-800 transition-colors">
                                {highlightMatch(product.name, cleanQuery)}
                              </h4>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5 truncate flex-wrap">
                                <span className="font-bold text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded">
                                  {product.quantity}
                                </span>
                                <span>•</span>
                                <span className="truncate text-slate-700 font-medium">{product.category}</span>
                                <span>•</span>
                                <span className="truncate flex items-center gap-0.5 text-slate-500">
                                  <Store className="w-2.5 h-2.5 text-slate-400" /> {product.sellerName}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Price & Quick Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <div className="text-xs sm:text-sm font-black text-[#0a192f]">
                                ₹{dealPrice}
                              </div>
                              {product.mrp > dealPrice && (
                                <div className="text-[10px] text-slate-400 line-through">
                                  ₹{product.mrp}
                                </div>
                              )}
                            </div>

                            {/* Direct Add to Cart / Qty Stepper */}
                            {qty > 0 && onUpdateCartQty ? (
                              <div
                                className="bg-[#0a192f] text-amber-300 rounded-lg p-1 text-[11px] font-bold flex items-center gap-1 shadow-xs border border-[#1e3a5f]"
                                onMouseDown={e => e.stopPropagation()}
                                onClick={e => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateCartQty(product, qty - 1);
                                  }}
                                  className="w-5 h-5 flex items-center justify-center hover:bg-[#132f54] rounded cursor-pointer"
                                  title="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3 text-amber-400" />
                                </button>
                                <span className="px-1 text-white font-bold">{qty}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateCartQty(product, qty + 1);
                                  }}
                                  className="w-5 h-5 flex items-center justify-center hover:bg-[#132f54] rounded cursor-pointer"
                                  title="Increase quantity"
                                >
                                  <Plus className="w-3 h-3 text-amber-400" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onMouseDown={e => e.stopPropagation()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddToCart?.(product);
                                }}
                                className="bg-[#0a192f] hover:bg-[#132f54] text-amber-300 text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-xs border border-[#1e3a5f]"
                                title="Add to cart"
                              >
                                <ShoppingBag className="w-3 h-3 text-amber-400" />
                                <span>Add</span>
                              </button>
                            )}

                            {/* Direct AI Bargaining Button */}
                            {product.bargainingAllowed && onBargainClick && (
                              <button
                                type="button"
                                onMouseDown={e => e.stopPropagation()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsOpen(false);
                                  onBargainClick(product);
                                }}
                                className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black p-1.5 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-0.5 border border-amber-300"
                                title="Bargain price with Bazli"
                              >
                                <Sparkles className="w-3 h-3" />
                              </button>
                            )}

                            {/* Arrow indicator for navigation */}
                            <div className="p-1 text-slate-300 group-hover:text-amber-500 transition-colors">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. MATCHING CATEGORIES PREFERENCE PILLS */}
              {matchedCategories.length > 0 && (
                <div className="p-3 bg-[#fbf9f5] border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-amber-500" />
                    <span>Matching Categories</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchedCategories.map(cat => {
                      const count = products.filter(p => p.category === cat).length;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleCategorySelect(cat);
                          }}
                          onClick={() => handleCategorySelect(cat)}
                          className="bg-white hover:bg-amber-50 hover:text-slate-950 border border-[#ded2bc] text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs group"
                        >
                          <span className="truncate">{cat}</span>
                          <span className="text-[10px] text-amber-900 font-bold bg-amber-100 px-1.5 py-0.2 rounded-full border border-amber-300">
                            {count} items
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-amber-600 transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. MATCHING LOCAL SELLER / STORE PREFERENCES */}
              {matchedSellers.length > 0 && (
                <div className="p-3 bg-white border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1 flex items-center gap-1">
                    <Store className="w-3 h-3 text-amber-500" />
                    <span>Matching Partner Stores</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {matchedSellers.map(s => (
                      <button
                        key={s.name}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearchQuery(s.name);
                          setIsOpen(false);
                        }}
                        onClick={() => {
                          setSearchQuery(s.name);
                          setIsOpen(false);
                        }}
                        className="bg-[#fbf9f5] hover:bg-amber-50 border border-[#ded2bc] text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <Store className="w-3 h-3 text-amber-500" />
                        <span>{s.name}</span>
                        <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black">
                          {s.count} items
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. NO PRODUCTS OR CATEGORIES FOUND */}
              {matchedProducts.length === 0 && matchedCategories.length === 0 && (
                <div className="p-8 text-center space-y-3 bg-white">
                  <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto text-amber-600 shadow-2xs">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-sm">
                      No grocery items found for "{searchQuery}"
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Check spelling or try popular essentials like 'milk', 'atta', 'oil', 'ghee', 'butter', 'rice'.
                    </p>
                  </div>
                </div>
              )}

              {/* 5. VIEW ALL RESULTS FOOTER BAR */}
              <div className="p-2.5 bg-[#0a192f] flex items-center justify-between border-t border-[#1e3a5f]">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSearchSubmit(searchQuery);
                  }}
                  onClick={() => handleSearchSubmit(searchQuery)}
                  className="w-full text-center text-xs font-black text-amber-300 hover:text-amber-200 py-1 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-amber-400" />
                  <span>View All ({matchedProducts.length}) Results for "{searchQuery}"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>
            </>
          )}

          {/* STATE B: Query is empty -> Show popular essentials & top categories */}
          {!cleanQuery && (
            <div className="p-3 sm:p-4 space-y-4 bg-white">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 mb-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <span>{isRestaurantScope ? 'Popular Dishes & Cuisines' : 'Popular & Trending Groceries'}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(isRestaurantScope ? POPULAR_RESTAURANT_KEYWORDS : POPULAR_GROCERY_KEYWORDS).map(kw => (
                    <button
                      key={kw.term}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleKeywordSearch(kw.term);
                      }}
                      onClick={() => handleKeywordSearch(kw.term)}
                      className="bg-[#fbf9f5] hover:bg-amber-50 hover:text-amber-900 hover:border-amber-400 border border-[#ded2bc] text-slate-800 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <span>{kw.icon}</span>
                      <span>{kw.term}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Categories Navigation */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Browse by Department
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {Array.from(new Set(products.map(p => p.category)))
                    .slice(0, 6)
                    .map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleCategorySelect(cat);
                        }}
                        onClick={() => handleCategorySelect(cat)}
                        className="text-left p-2 rounded-xl bg-[#fbf9f5] hover:bg-amber-50 hover:text-slate-900 text-slate-800 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-between border border-[#ded2bc]"
                      >
                        <span className="truncate">{cat}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
