import { useState, useEffect, useRef, useCallback } from 'react';
import { triggerHaptic } from '../utils/haptics';

export interface NavStateSnapshot {
  activeTab: string;
  selectedCategory: string;
  searchQuery: string;
  hasDetailProduct: boolean;
  hasBargainProduct: boolean;
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isOrderHistoryOpen: boolean;
  isTrackingModalOpen: boolean;
  isCheckoutOpen: boolean;
  isAddressModalOpen: boolean;
  isBazliPassModalOpen: boolean;
  isVoiceModalOpen: boolean;
  isDeliveryRegisterOpen: boolean;
  scrollY?: number;
  label?: string;
}

interface UseNavigationHistoryProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  hasDetailProduct: boolean;
  onCloseDetailProduct: () => void;
  hasBargainProduct: boolean;
  onCloseBargain: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isOrderHistoryOpen: boolean;
  setIsOrderHistoryOpen: (open: boolean) => void;
  isTrackingModalOpen: boolean;
  setIsTrackingModalOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isAddressModalOpen: boolean;
  setIsAddressModalOpen: (open: boolean) => void;
  isBazliPassModalOpen: boolean;
  setIsBazliPassModalOpen: (open: boolean) => void;
  isVoiceModalOpen: boolean;
  setIsVoiceModalOpen: (open: boolean) => void;
  isDeliveryRegisterOpen: boolean;
  setIsDeliveryRegisterOpen: (open: boolean) => void;
}

export function useNavigationHistory({
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  hasDetailProduct,
  onCloseDetailProduct,
  hasBargainProduct,
  onCloseBargain,
  isCartOpen,
  setIsCartOpen,
  isWishlistOpen,
  setIsWishlistOpen,
  isOrderHistoryOpen,
  setIsOrderHistoryOpen,
  isTrackingModalOpen,
  setIsTrackingModalOpen,
  isCheckoutOpen,
  setIsCheckoutOpen,
  isAddressModalOpen,
  setIsAddressModalOpen,
  isBazliPassModalOpen,
  setIsBazliPassModalOpen,
  isVoiceModalOpen,
  setIsVoiceModalOpen,
  isDeliveryRegisterOpen,
  setIsDeliveryRegisterOpen
}: UseNavigationHistoryProps) {
  const historyStackRef = useRef<NavStateSnapshot[]>([]);
  const [historyLength, setHistoryLength] = useState(0);
  const isNavigatingBackRef = useRef(false);

  // Helper to generate a human-readable title of current view
  const getCurrentLabel = useCallback(
    (tab: string, cat: string, query: string): string => {
      if (query) return `Search "${query}"`;
      if (hasDetailProduct) return 'Product Details';
      if (hasBargainProduct) return 'Bazli Bargain Counter';
      if (isCartOpen) return 'Shopping Cart';
      if (isWishlistOpen) return 'My Wishlist';
      if (isOrderHistoryOpen) return 'My Orders';
      if (isCheckoutOpen) return 'Checkout';
      if (isTrackingModalOpen) return 'Live Order Tracking';
      if (isBazliPassModalOpen) return 'Bazli VIP Pass';
      if (isVoiceModalOpen) return 'Voice Assistant';
      if (isAddressModalOpen) return 'Delivery Address';
      if (isDeliveryRegisterOpen) return 'Rider Onboarding';

      if (tab === 'restaurants') return 'Food & Dining';
      if (tab === 'stationery') return 'Stationery & Books';
      if (tab === 'categories') return 'Category Directory';
      if (tab === 'deals') return 'Today\'s Deals';
      if (tab === 'seller') return 'Mandi Seller Hub';
      if (tab === 'delivery') return 'Delivery Partner Fleet';
      if (tab === 'admin') return 'Admin Master Control';
      if (tab === 'search') return query ? `Search "${query}"` : 'Search Results';
      if (cat && cat !== 'All') return cat;
      return 'Home Storefront';
    },
    [
      hasDetailProduct,
      hasBargainProduct,
      isCartOpen,
      isWishlistOpen,
      isOrderHistoryOpen,
      isCheckoutOpen,
      isTrackingModalOpen,
      isBazliPassModalOpen,
      isVoiceModalOpen,
      isAddressModalOpen,
      isDeliveryRegisterOpen
    ]
  );

  const prevSnapshotRef = useRef<NavStateSnapshot>({
    activeTab,
    selectedCategory,
    searchQuery,
    hasDetailProduct,
    hasBargainProduct,
    isCartOpen,
    isWishlistOpen,
    isOrderHistoryOpen,
    isTrackingModalOpen,
    isCheckoutOpen,
    isAddressModalOpen,
    isBazliPassModalOpen,
    isVoiceModalOpen,
    isDeliveryRegisterOpen,
    scrollY: 0,
    label: 'Home Storefront'
  });

  // Check if state changed significantly to warrant pushing to stack
  useEffect(() => {
    const currentSnapshot: NavStateSnapshot = {
      activeTab,
      selectedCategory,
      searchQuery,
      hasDetailProduct,
      hasBargainProduct,
      isCartOpen,
      isWishlistOpen,
      isOrderHistoryOpen,
      isTrackingModalOpen,
      isCheckoutOpen,
      isAddressModalOpen,
      isBazliPassModalOpen,
      isVoiceModalOpen,
      isDeliveryRegisterOpen,
      scrollY: typeof window !== 'undefined' ? window.scrollY : 0,
      label: getCurrentLabel(activeTab, selectedCategory, searchQuery)
    };

    if (isNavigatingBackRef.current) {
      isNavigatingBackRef.current = false;
      prevSnapshotRef.current = currentSnapshot;
      return;
    }

    const prev = prevSnapshotRef.current;
    const hasChanged =
      prev.activeTab !== activeTab ||
      prev.selectedCategory !== selectedCategory ||
      prev.searchQuery !== searchQuery ||
      prev.hasDetailProduct !== hasDetailProduct ||
      prev.hasBargainProduct !== hasBargainProduct ||
      prev.isCartOpen !== isCartOpen ||
      prev.isWishlistOpen !== isWishlistOpen ||
      prev.isOrderHistoryOpen !== isOrderHistoryOpen ||
      prev.isTrackingModalOpen !== isTrackingModalOpen ||
      prev.isCheckoutOpen !== isCheckoutOpen ||
      prev.isAddressModalOpen !== isAddressModalOpen ||
      prev.isBazliPassModalOpen !== isBazliPassModalOpen ||
      prev.isVoiceModalOpen !== isVoiceModalOpen ||
      prev.isDeliveryRegisterOpen !== isDeliveryRegisterOpen;

    if (hasChanged) {
      // Push previous snapshot to history
      historyStackRef.current.push({
        ...prev,
        scrollY: typeof window !== 'undefined' ? window.scrollY : 0
      });

      // Keep max 25 stack items
      if (historyStackRef.current.length > 25) {
        historyStackRef.current.shift();
      }

      setHistoryLength(historyStackRef.current.length);

      // Also push browser history state for native Android/iOS/Browser back button support
      try {
        if (typeof window !== 'undefined' && window.history) {
          window.history.pushState({ bazliNav: true, depth: historyStackRef.current.length }, '');
        }
      } catch {
        // Safe fallback
      }

      prevSnapshotRef.current = currentSnapshot;
    }
  }, [
    activeTab,
    selectedCategory,
    searchQuery,
    hasDetailProduct,
    hasBargainProduct,
    isCartOpen,
    isWishlistOpen,
    isOrderHistoryOpen,
    isTrackingModalOpen,
    isCheckoutOpen,
    isAddressModalOpen,
    isBazliPassModalOpen,
    isVoiceModalOpen,
    isDeliveryRegisterOpen,
    getCurrentLabel
  ]);

  // Handle goBack execution
  const goBack = useCallback(() => {
    triggerHaptic('selection');

    // 1. If any modal / drawer is currently active, prioritize closing it first
    if (hasDetailProduct) {
      onCloseDetailProduct();
      return true;
    }
    if (hasBargainProduct) {
      onCloseBargain();
      return true;
    }
    if (isCheckoutOpen) {
      setIsCheckoutOpen(false);
      return true;
    }
    if (isCartOpen) {
      setIsCartOpen(false);
      return true;
    }
    if (isWishlistOpen) {
      setIsWishlistOpen(false);
      return true;
    }
    if (isOrderHistoryOpen) {
      setIsOrderHistoryOpen(false);
      return true;
    }
    if (isTrackingModalOpen) {
      setIsTrackingModalOpen(false);
      return true;
    }
    if (isBazliPassModalOpen) {
      setIsBazliPassModalOpen(false);
      return true;
    }
    if (isVoiceModalOpen) {
      setIsVoiceModalOpen(false);
      return true;
    }
    if (isAddressModalOpen) {
      setIsAddressModalOpen(false);
      return true;
    }
    if (isDeliveryRegisterOpen) {
      setIsDeliveryRegisterOpen(false);
      return true;
    }

    // 2. If we have previous stack items, pop and restore
    if (historyStackRef.current.length > 0) {
      isNavigatingBackRef.current = true;
      const targetState = historyStackRef.current.pop()!;
      setHistoryLength(historyStackRef.current.length);

      setActiveTab(targetState.activeTab);
      setSelectedCategory(targetState.selectedCategory);
      setSearchQuery(targetState.searchQuery);

      if (!targetState.hasDetailProduct) onCloseDetailProduct();
      if (!targetState.hasBargainProduct) onCloseBargain();
      setIsCartOpen(targetState.isCartOpen);
      setIsWishlistOpen(targetState.isWishlistOpen);
      setIsOrderHistoryOpen(targetState.isOrderHistoryOpen);
      setIsTrackingModalOpen(targetState.isTrackingModalOpen);
      setIsCheckoutOpen(targetState.isCheckoutOpen);
      setIsAddressModalOpen(targetState.isAddressModalOpen);
      setIsBazliPassModalOpen(targetState.isBazliPassModalOpen);
      setIsVoiceModalOpen(targetState.isVoiceModalOpen);
      setIsDeliveryRegisterOpen(targetState.isDeliveryRegisterOpen);

      if (typeof targetState.scrollY === 'number' && typeof window !== 'undefined') {
        setTimeout(() => {
          window.scrollTo({ top: targetState.scrollY, behavior: 'smooth' });
        }, 50);
      }

      return true;
    }

    // 3. Fallback: If not on root home, return to root
    if (activeTab !== 'home' || selectedCategory !== 'All' || searchQuery !== '') {
      isNavigatingBackRef.current = true;
      setActiveTab('home');
      setSelectedCategory('All');
      setSearchQuery('');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return true;
    }

    return false;
  }, [
    hasDetailProduct,
    onCloseDetailProduct,
    hasBargainProduct,
    onCloseBargain,
    isCheckoutOpen,
    setIsCheckoutOpen,
    isCartOpen,
    setIsCartOpen,
    isWishlistOpen,
    setIsWishlistOpen,
    isOrderHistoryOpen,
    setIsOrderHistoryOpen,
    isTrackingModalOpen,
    setIsTrackingModalOpen,
    isBazliPassModalOpen,
    setIsBazliPassModalOpen,
    isVoiceModalOpen,
    setIsVoiceModalOpen,
    isAddressModalOpen,
    setIsAddressModalOpen,
    isDeliveryRegisterOpen,
    setIsDeliveryRegisterOpen,
    activeTab,
    selectedCategory,
    searchQuery,
    setActiveTab,
    setSelectedCategory,
    setSearchQuery
  ]);

  // Listen to browser popstate (e.g. phone back gesture or browser back button)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      goBack();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [goBack]);

  const canGoBack =
    historyLength > 0 ||
    hasDetailProduct ||
    hasBargainProduct ||
    isCartOpen ||
    isWishlistOpen ||
    isOrderHistoryOpen ||
    isCheckoutOpen ||
    isTrackingModalOpen ||
    isBazliPassModalOpen ||
    isVoiceModalOpen ||
    isAddressModalOpen ||
    isDeliveryRegisterOpen ||
    activeTab !== 'home' ||
    selectedCategory !== 'All' ||
    searchQuery !== '';

  const previousLabel =
    historyStackRef.current.length > 0
      ? historyStackRef.current[historyStackRef.current.length - 1].label || 'Previous Page'
      : activeTab !== 'home'
      ? 'Home Storefront'
      : 'Back';

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleTouchStart = (e: TouchEvent) => {
      if (!canGoBack) return;
      const touch = e.touches[0];
      if (!touch) return;
      // Only initiate swipe if touch started near very left edge (< 40px)
      if (touch.clientX < 40) {
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        };
      } else {
        touchStartRef.current = null;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || !canGoBack) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Clean horizontal swipe from left edge
      if (deltaX > 70 && Math.abs(deltaY) < 40 && deltaTime < 400) {
        goBack();
      }

      touchStartRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [canGoBack, goBack]);

  return {
    canGoBack,
    goBack,
    historyLength,
    previousLabel
  };
}
