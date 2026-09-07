import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Product,
  CartItem,
  UserRole,
  Seller,
  DeliveryPartner,
  Order,
  BargainingSession,
  DeliveryZone,
  OrderEarningBreakdown,
  DeliveryPayoutRecord,
  PayoutAccountDetails,
  SellerPayoutRecord,
  SellerRegistrationRequest,
  ProductReview,
  Coupon,
  CustomDeal,
  AppFeatureFlags,
  DispatchPingPayload,
  SiteContentConfig
} from './types';
import { rankRidersForOrder, createDispatchPing } from './utils/dispatchEngine';
import {
  INITIAL_PRODUCTS,
  INITIAL_SELLERS,
  INITIAL_DELIVERY_PARTNERS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_COUPONS,
  INITIAL_CUSTOM_DEALS,
  INITIAL_FEATURE_FLAGS,
  DEFAULT_SITE_CONTENT,
  MOCK_CUSTOMER
} from './data/initialData';
import { loadStoredSiteContent, saveStoredSiteContent, resolveSiteText } from './utils/contentUtils';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { BargainModal } from './components/BargainModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { LiveOrderTrackingModal } from './components/LiveOrderTrackingModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { BargainShowcase } from './components/BargainShowcase';
import { TodaysDealsBanner } from './components/TodaysDealsBanner';
import { CategoryAdvertisementBanners } from './components/CategoryAdvertisementBanners';
import { CategoriesView } from './components/CategoriesView';
import { CircularCategories } from './components/CircularCategories';
import { ProductShelf } from './components/ProductShelf';
import { ProductDetailModal } from './components/ProductDetailModal';
import { useNavigationHistory } from './hooks/useNavigationHistory';
import { NavigationBackBar } from './components/NavigationBackBar';
import { getTodaysDealSchedule } from './data/todaysDeals';
import { BazliAIAssistant } from './components/BazliAIAssistant';
import { calculateProductSearchScore, normalizeSearchText, searchAndRankProducts } from './utils/searchUtils';
import { SellerPortal } from './components/Portals/SellerPortal';
import { DeliveryPortal } from './components/Portals/DeliveryPortal';
import { AdminPortal } from './components/Portals/AdminPortal';
import { AdminAuthModal } from './components/Admin/AdminAuthModal';
import { SellerAuthModal } from './components/Seller/SellerAuthModal';
import { DeliveryPartnerRegisterModal } from './components/DeliveryPartnerRegisterModal';
import { DeliveryAuthModal } from './components/DeliveryAuthModal';
import { CustomerMobileOtpBanner } from './components/CustomerMobileOtpBanner';
import { CustomerRestaurantPortal } from './components/CustomerRestaurantPortal';
import { CustomerStationeryPortal } from './components/CustomerStationeryPortal';
import { CompactServiceToggle } from './components/CompactServiceToggle';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HyperlocalLiveTrackerBar } from './components/HyperlocalLiveTrackerBar';
import { SmartRecipeKits } from './components/SmartRecipeKits';
import { VipGoldPassModal } from './components/Customer/VipGoldPassModal';
import { SavedAddressesModal } from './components/Customer/SavedAddressesModal';
import { BazliPassModal } from './components/Customer/BazliPassModal';
import { VoiceSearchModal } from './components/Customer/VoiceSearchModal';
import { CustomerAuthModal } from './components/Customer/CustomerAuthModal';
import { TimeOfDayStorefront } from './components/Customer/TimeOfDayStorefront';
import { PostOrderQuickAddBar } from './components/Customer/PostOrderQuickAddBar';
import { FlashDealOneRupee } from './components/Customer/FlashDealOneRupee';
import { ParchhiScannerModal } from './components/ParchhiScannerModal';
import { DocumentPrintoutModal } from './components/DocumentPrintoutModal';
import { LegalPoliciesModal } from './components/Common/LegalPoliciesModal';
import { CustomerAddress, BazliVipPlan, CustomerProfile, PrintoutConfig } from './types';
import { FREQUENTLY_BOUGHT_ADDONS } from './data/initialData';
import {
  subscribeToOrders,
  subscribeToProducts,
  subscribeToSellers,
  subscribeToDeliveryPartners,
  subscribeToCoupons,
  subscribeToDeals,
  subscribeToReviews,
  subscribeToAdminSettings,
  createOrderInFirestore,
  syncOrderToFirestore,
  updateOrderStatusInFirestore,
  verifyOrderPickupInFirestore,
  verifyOrderDeliveryInFirestore,
  syncProductToFirestore,
  deleteProductFromFirestore,
  syncSellerToFirestore,
  deleteSellerFromFirestore,
  syncDeliveryPartnerToFirestore,
  syncCouponToFirestore,
  deleteCouponFromFirestore,
  syncDealToFirestore,
  deleteDealFromFirestore,
  saveProductReviewToFirestore,
  saveUserAddress,
  deleteUserAddress,
  saveUserProfile,
  saveUserCartToFirestore,
  syncAdminSettingsToFirestore,
  seedInitialFirestoreDataIfEmpty
} from './lib/firestoreSync';
import {
  INITIAL_BARGAINING_RULES,
  INITIAL_DELIVERY_ZONES
} from './data/initialData';
import {
  hapticAddToCart,
  hapticSelection,
  hapticOrderSuccess
} from './utils/haptics';
import {
  Sparkles,
  ShoppingBag,
  Zap,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Clock,
  TrendingDown,
  ChevronRight,
  Truck,
  RotateCcw,
  Store,
  Bot,
  Bike,
  Crown,
  Gift,
  UserPlus,
  Lock,
  Unlock,
  KeyRound,
  PhoneCall,
  Mail,
  UtensilsCrossed,
  MessageCircle
} from 'lucide-react';

const APP_ZONES: DeliveryZone[] = [
  { id: 'zone-a', name: 'Zone A - Central City (0-5 km)', estimatedTime: '15-25 Mins', deliveryFee: 19, freeDeliveryThreshold: 149, availability: true },
  { id: 'zone-b', name: 'Zone B - Extended Suburbs (5-12 km)', estimatedTime: '25-40 Mins', deliveryFee: 29, freeDeliveryThreshold: 149, availability: true },
  { id: 'zone-c', name: 'Zone C - Tech Corridor & Outer Ring', estimatedTime: '30-45 Mins', deliveryFee: 39, freeDeliveryThreshold: 149, availability: true }
];

export default function App() {
  // One-time auto-migration from legacy apnabazar_ keys to bazli_ keys
  useEffect(() => {
    try {
      const keysToMigrate = [
        'products',
        'sellers',
        'pending_seller_requests',
        'delivery_partners',
        'wishlist',
        'reviews',
        'admin_passcode',
        'admin_phone',
        'custom_deals',
        'coupons',
        'feature_flags'
      ];
      keysToMigrate.forEach(key => {
        const oldKey = `apnabazar_${key}`;
        const newKey = `bazli_${key}`;
        const oldVal = localStorage.getItem(oldKey);
        if (oldVal !== null && localStorage.getItem(newKey) === null) {
          localStorage.setItem(newKey, oldVal);
        }
      });
    } catch (e) {
      console.error('Migration error', e);
    }
  }, []);

  // App States
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('bazli_products_v4');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });
  const [sellers, setSellers] = useState<Seller[]>(() => {
    try {
      const saved = localStorage.getItem('bazli_sellers') || localStorage.getItem('apnabazar_sellers');
      return saved ? JSON.parse(saved) : INITIAL_SELLERS;
    } catch {
      return INITIAL_SELLERS;
    }
  });
  const [selectedSellerId, setSelectedSellerId] = useState<string>(() => sellers[0]?.id || 'S1');
  const [pendingSellerRequests, setPendingSellerRequests] = useState<SellerRegistrationRequest[]>(() => {
    try {
      const saved = localStorage.getItem('bazli_pending_seller_requests') || localStorage.getItem('apnabazar_pending_seller_requests');
      if (saved) return JSON.parse(saved);
      return [
        {
          id: 'REG-10492',
          phone: '9811223344',
          businessName: 'Sharma Fresh Organics & Dairy',
          ownerName: 'Ramesh Sharma',
          email: 'sharma.fresh@bazli.in',
          category: 'Vegetables & Fruits',
          address: 'Shop 8, APMC Market Yard',
          gstNumber: '27AABCS8812R1ZZ',
          generatedOtp: '482915',
          status: 'Awaiting Admin OTP Share',
          createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
        }
      ];
    } catch {
      return [];
    }
  });
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>(() => {
    try {
      const saved = localStorage.getItem('bazli_delivery_partners') || localStorage.getItem('apnabazar_delivery_partners');
      return saved ? JSON.parse(saved) : INITIAL_DELIVERY_PARTNERS;
    } catch {
      return INITIAL_DELIVERY_PARTNERS;
    }
  });
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('D1');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bargainOnly, setBargainOnly] = useState<boolean>(false);
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);

  // Cart & Loyalty State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [userCoins, setUserCoins] = useState<number>(350);
  const [loyaltyTier, setLoyaltyTier] = useState<'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'New' | 'VIP'>('Gold');

  // Customer Profile & Saved Addresses State (Step 2 & Step 4)
  const [customerProfile, setCustomerProfile] = useState<typeof MOCK_CUSTOMER>(MOCK_CUSTOMER);
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>(() => {
    try {
      const saved = localStorage.getItem('bazli_saved_addresses');
      return saved ? JSON.parse(saved) : MOCK_CUSTOMER.savedAddresses;
    } catch {
      return MOCK_CUSTOMER.savedAddresses;
    }
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    return savedAddresses.find(a => a.isDefault)?.id || savedAddresses[0]?.id || 'addr1';
  });
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [isBazliPassModalOpen, setIsBazliPassModalOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isCustomerAuthModalOpen, setIsCustomerAuthModalOpen] = useState<boolean>(false);
  const [customerAuthReason, setCustomerAuthReason] = useState<'checkout' | 'profile' | 'bargain' | 'vip' | 'general'>('general');
  const [isParchhiScannerOpen, setIsParchhiScannerOpen] = useState<boolean>(false);
  const [isPrintoutModalOpen, setIsPrintoutModalOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState<boolean>(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy' | 'refund' | 'shipping' | 'contact'>('terms');

  const handleOpenLegalModal = (tab: 'terms' | 'privacy' | 'refund' | 'shipping' | 'contact' = 'terms') => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };
  const [recentPlacedOrder, setRecentPlacedOrder] = useState<Order | null>(null);

  const handleQuickAddPostOrder = (product: Product) => {
    if (!recentPlacedOrder) return;
    const itemPrice = product.sellingPrice;
    const existingItemIdx = recentPlacedOrder.items.findIndex(i => i.productId === product.id);
    let updatedItems = [...recentPlacedOrder.items];

    if (existingItemIdx >= 0) {
      updatedItems[existingItemIdx] = {
        ...updatedItems[existingItemIdx],
        quantity: updatedItems[existingItemIdx].quantity + 1,
        totalPrice: updatedItems[existingItemIdx].totalPrice + itemPrice
      };
    } else {
      updatedItems.push({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: itemPrice,
        totalPrice: itemPrice,
        selectedWeight: product.quantity,
        productImage: product.image
      });
    }

    const updatedOrder: Order = {
      ...recentPlacedOrder,
      items: updatedItems,
      totalAmount: recentPlacedOrder.totalAmount + itemPrice,
      finalAmount: recentPlacedOrder.finalAmount + itemPrice
    };

    setRecentPlacedOrder(updatedOrder);
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    if (trackingOrder?.id === updatedOrder.id) {
      setTrackingOrder(updatedOrder);
    }
    syncOrderToFirestore(updatedOrder).catch(e => console.warn('Sync post order note:', e));
    showToast(`⚡ Added ${product.name} (+₹${itemPrice}) to Order #${updatedOrder.id} with ₹0 Delivery Fee!`);
  };

  const handleCustomerAuthSuccess = (authenticatedUser: { phone: string; name: string; isVerified: boolean; id: string }) => {
    setCustomerProfile(prev => ({
      ...prev,
      id: authenticatedUser.id || prev.id,
      phone: authenticatedUser.phone,
      name: authenticatedUser.name || prev.name,
      isVerified: true
    }));
    try {
      localStorage.setItem('bazli_customer_phone', authenticatedUser.phone);
      localStorage.setItem('bazli_customer_verified', 'true');
    } catch {}
    showToast(`✅ Welcome ${authenticatedUser.name || 'Customer'}! Phone verified via OTP.`);
  };

  // Sync saved addresses to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bazli_saved_addresses', JSON.stringify(savedAddresses));
    } catch (e) {
      console.warn('Failed to save addresses to localStorage', e);
    }
  }, [savedAddresses]);

  // Sync cart to Firestore user session
  useEffect(() => {
    if (customerProfile?.id) {
      const subtotal = cartItems.reduce(
        (acc, item) => acc + (item.bargainedPrice || item.product.sellingPrice) * item.quantity,
        0
      );
      saveUserCartToFirestore(customerProfile.id, cartItems, subtotal).catch(e => console.warn('Cart sync note:', e));
    }
  }, [cartItems, customerProfile?.id]);

  // Real-time Firestore Cloud Database Synchronization
  useEffect(() => {
    // Non-destructive initial cloud database bootstrap check
    seedInitialFirestoreDataIfEmpty({
      products: INITIAL_PRODUCTS,
      sellers: INITIAL_SELLERS,
      deliveryPartners: INITIAL_DELIVERY_PARTNERS,
      orders: INITIAL_ORDERS,
      reviews: INITIAL_REVIEWS,
      coupons: INITIAL_COUPONS,
      deals: INITIAL_CUSTOM_DEALS,
      featureFlags: INITIAL_FEATURE_FLAGS,
      bargainingRules: INITIAL_BARGAINING_RULES,
      deliveryZones: INITIAL_DELIVERY_ZONES,
      siteContent: DEFAULT_SITE_CONTENT
    }).catch(err => console.warn('Firestore bootstrap note:', err));

    const unsubOrders = subscribeToOrders((cloudOrders) => {
      setOrders(prev => {
        const map = new Map<string, Order>();
        cloudOrders.forEach(o => map.set(o.id, o));
        prev.forEach(o => {
          if (!map.has(o.id)) map.set(o.id, o);
        });
        return Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    });

    const unsubProducts = subscribeToProducts((cloudProducts) => {
      if (cloudProducts && cloudProducts.length > 0) {
        setProducts(prev => {
          const map = new Map<string, Product>();
          prev.forEach(p => map.set(p.id, p));
          cloudProducts.forEach(p => map.set(p.id, p));
          return Array.from(map.values());
        });
      }
    });

    const unsubSellers = subscribeToSellers((cloudSellers) => {
      if (cloudSellers && cloudSellers.length > 0) {
        setSellers(prev => {
          const map = new Map<string, Seller>();
          prev.forEach(s => map.set(s.id, s));
          cloudSellers.forEach(s => map.set(s.id, s));
          return Array.from(map.values());
        });
      }
    });

    const unsubDeliveryPartners = subscribeToDeliveryPartners((cloudPartners) => {
      if (cloudPartners && cloudPartners.length > 0) {
        setDeliveryPartners(prev => {
          const map = new Map<string, DeliveryPartner>();
          prev.forEach(p => map.set(p.id, p));
          cloudPartners.forEach(p => map.set(p.id, p));
          return Array.from(map.values());
        });
      }
    });

    const unsubCoupons = subscribeToCoupons((cloudCoupons) => {
      if (cloudCoupons && cloudCoupons.length > 0) {
        setCoupons(prev => {
          const map = new Map<string, Coupon>();
          prev.forEach(c => map.set(c.code.toUpperCase(), c));
          cloudCoupons.forEach(c => map.set(c.code.toUpperCase(), c));
          return Array.from(map.values());
        });
      }
    });

    const unsubDeals = subscribeToDeals((cloudDeals) => {
      if (cloudDeals && cloudDeals.length > 0) {
        setCustomDeals(prev => {
          const map = new Map<string, CustomDeal>();
          prev.forEach(d => map.set(d.id, d));
          cloudDeals.forEach(d => map.set(d.id, d));
          return Array.from(map.values());
        });
      }
    });

    const unsubReviews = subscribeToReviews((cloudReviews) => {
      if (cloudReviews && cloudReviews.length > 0) {
        setReviews(prev => {
          const map = new Map<string, ProductReview>();
          prev.forEach(r => map.set(r.id, r));
          cloudReviews.forEach(r => map.set(r.id, r));
          return Array.from(map.values());
        });
      }
    });

    const unsubAdminConfig = subscribeToAdminSettings('app_config', (cfg) => {
      if (cfg) setFeatureFlags(prev => ({ ...prev, ...cfg }));
    });

    const unsubSiteContent = subscribeToAdminSettings('site_content', (cnt) => {
      if (cnt) setSiteContent(prev => ({ ...prev, ...cnt }));
    });

    return () => {
      unsubOrders();
      unsubProducts();
      unsubSellers();
      unsubDeliveryPartners();
      unsubCoupons();
      unsubDeals();
      unsubReviews();
      unsubAdminConfig();
      unsubSiteContent();
    };
  }, []);

  const selectedAddress = savedAddresses.find(a => a.id === selectedAddressId) || savedAddresses[0] || null;

  const handleSaveAddress = (newAddr: CustomerAddress) => {
    setSavedAddresses(prev => {
      const exists = prev.some(a => a.id === newAddr.id);
      let updated = exists
        ? prev.map(a => (a.id === newAddr.id ? newAddr : a))
        : [newAddr, ...prev];
      if (newAddr.isDefault) {
        updated = updated.map(a => ({ ...a, isDefault: a.id === newAddr.id }));
      }
      return updated;
    });
    setSelectedAddressId(newAddr.id);
    saveUserAddress(customerProfile.id, newAddr).catch(e => console.warn('Address sync note:', e));
    showToast(`📍 Address "${newAddr.title}" saved successfully!`);
  };

  const handleDeleteAddress = (addrId: string) => {
    setSavedAddresses(prev => prev.filter(a => a.id !== addrId));
    if (selectedAddressId === addrId) {
      const remaining = savedAddresses.filter(a => a.id !== addrId);
      if (remaining.length > 0) setSelectedAddressId(remaining[0].id);
    }
    deleteUserAddress(customerProfile.id, addrId).catch(e => console.warn('Address delete note:', e));
    showToast('Address removed.');
  };

  // Quick add-on handler for CartDrawer impulse rail
  const handleAddQuickUpsellItem = (addon: typeof FREQUENTLY_BOUGHT_ADDONS[0]) => {
    const syntheticProduct: Product = {
      id: addon.id,
      name: addon.name,
      quantity: addon.quantity,
      category: addon.category,
      mrp: addon.mrp,
      sellingPrice: addon.price,
      discountPercentage: Math.round(((addon.mrp - addon.price) / addon.mrp) * 100),
      bargainingAllowed: false,
      stock: 50,
      sellerId: 's1',
      sellerName: 'Bazli Dark Store #4',
      image: addon.image,
      description: addon.name,
      rating: 4.8,
      reviewCount: 120
    };
    handleAddToCart(syntheticProduct, 1, addon.quantity);
    showToast(`⚡ Added ${addon.name} to cart!`);
  };

  // Bazli VIP Pass Activation Handler
  const handleActivateVipPass = (plan: BazliVipPlan) => {
    setLoyaltyTier('VIP');
    const updated = {
      ...customerProfile,
      isVipMember: true,
      vipPlan: plan.id,
      vipExpiryDate: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000).toISOString()
    };
    setCustomerProfile(updated);
    saveUserProfile(updated).catch(e => console.warn('VIP profile sync note:', e));
    showToast(`👑 ${plan.name} Activated! Unlimited ₹0 Free Deliveries are now active.`);
  };

  // Wishlist State
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bazli_wishlist') || localStorage.getItem('apnabazar_wishlist');
      return saved ? JSON.parse(saved) : ['p1', 'p3'];
    } catch {
      return ['p1', 'p3'];
    }
  });
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);

  // Price Drop Tracker for Wishlisted Items
  const prevProductPricesRef = useRef<Map<string, number>>(new Map());
  const isInitialProductLoadRef = useRef<boolean>(true);
  const wishlistIdsRef = useRef<string[]>(wishlistIds);

  // Keep wishlist ids ref updated
  useEffect(() => {
    wishlistIdsRef.current = wishlistIds;
  }, [wishlistIds]);

  // Product Detail Modal State (Full image gallery 3-4 photos, descriptions, MRP/savings, weights)
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);

  // Bargain Modal State
  const [bargainProduct, setBargainProduct] = useState<Product | null>(null);
  const [bargainProductWeight, setBargainProductWeight] = useState<string | undefined>(undefined);
  const [bargainProductPrice, setBargainProductPrice] = useState<number | undefined>(undefined);
  const [bargainSessions, setBargainSessions] = useState<Record<string, BargainingSession>>({});

  const handleOpenBargain = (product: Product, selectedWeight?: string, variantPrice?: number) => {
    setBargainProduct(product);
    setBargainProductWeight(selectedWeight);
    setBargainProductPrice(variantPrice);
  };

  // Product Reviews State
  const [reviews, setReviews] = useState<ProductReview[]>(() => {
    try {
      const saved = localStorage.getItem('bazli_reviews') || localStorage.getItem('apnabazar_reviews');
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  // Save reviews to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bazli_reviews', JSON.stringify(reviews));
    } catch (e) {
      console.error(e);
    }
  }, [reviews]);

  // Order History Modal
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState<boolean>(false);

  // VIP Gold Pass Modal
  const [isVipPassOpen, setIsVipPassOpen] = useState<boolean>(false);

  // Live Order Tracking Modal & Selected Order
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState<boolean>(false);

  // Delivery Partner Registration Modal
  const [isDeliveryRegisterOpen, setIsDeliveryRegisterOpen] = useState<boolean>(false);

  // Protected Admin Portal Passcode & Auth State
  const [adminPasscode, setAdminPasscode] = useState<string>(() => {
    try {
      return localStorage.getItem('bazli_admin_passcode') || localStorage.getItem('apnabazar_admin_passcode') || 'BAZLI777';
    } catch {
      return 'BAZLI777';
    }
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);

  // Protected Seller Portal & Shop Verification State
  const [authenticatedSeller, setAuthenticatedSeller] = useState<Seller | null>(null);
  const [isSellerAuthModalOpen, setIsSellerAuthModalOpen] = useState<boolean>(false);

  // Protected Delivery Portal & Fleet Verification State (Restricted to Registered Partners & Admin)
  const [authenticatedDeliveryPartner, setAuthenticatedDeliveryPartner] = useState<DeliveryPartner | null>(() => {
    try {
      const saved = localStorage.getItem('bazli_authenticated_delivery_partner');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isDeliveryAuthModalOpen, setIsDeliveryAuthModalOpen] = useState<boolean>(false);

  // Dynamic Custom Deals, Promo Coupons & Feature Flags (Managed Directly from Admin Portal)
  const [customDeals, setCustomDeals] = useState<CustomDeal[]>(() => {
    try {
      const saved = localStorage.getItem('bazli_custom_deals') || localStorage.getItem('apnabazar_custom_deals');
      return saved ? JSON.parse(saved) : INITIAL_CUSTOM_DEALS;
    } catch {
      return INITIAL_CUSTOM_DEALS;
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('bazli_coupons') || localStorage.getItem('apnabazar_coupons');
      return saved ? JSON.parse(saved) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });

  const [featureFlags, setFeatureFlags] = useState<AppFeatureFlags>(() => {
    try {
      const saved = localStorage.getItem('bazli_feature_flags') || localStorage.getItem('apnabazar_feature_flags');
      return saved ? JSON.parse(saved) : INITIAL_FEATURE_FLAGS;
    } catch {
      return INITIAL_FEATURE_FLAGS;
    }
  });

  // Dynamic Site-Wide Text & Banners CMS (Managed from Admin Portal)
  const [siteContent, setSiteContent] = useState<SiteContentConfig>(() => {
    return loadStoredSiteContent();
  });

  const handleUpdateSiteContent = (newConfig: SiteContentConfig) => {
    setSiteContent(newConfig);
    saveStoredSiteContent(newConfig);
    syncAdminSettingsToFirestore('site_content', newConfig).catch(e => console.warn('Site content sync note:', e));
    showToast('✨ Site content & banners updated successfully!');
  };

  const [activeDealCategory, setActiveDealCategory] = useState<string | undefined>(undefined);
  const [announcementBroadcast, setAnnouncementBroadcast] = useState<string | null>(null);

  // Live Priority Dispatch Radar Ping State
  const [activeDispatchPing, setActiveDispatchPing] = useState<DispatchPingPayload | null>(null);

  // Sync customDeals to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bazli_custom_deals', JSON.stringify(customDeals));
    } catch (e) {
      console.error('Failed to save custom deals', e);
    }
  }, [customDeals]);

  // Sync coupons to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bazli_coupons', JSON.stringify(coupons));
    } catch (e) {
      console.error('Failed to save coupons', e);
    }
  }, [coupons]);

  // Sync featureFlags to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bazli_feature_flags', JSON.stringify(featureFlags));
    } catch (e) {
      console.error('Failed to save feature flags', e);
    }
  }, [featureFlags]);

  // Full Multi-Page Navigation History, Browser Popstate Sync, Edge Swipe Gesture & Back Navigation
  const {
    canGoBack,
    goBack,
    historyLength,
    previousLabel
  } = useNavigationHistory({
    activeTab,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    hasDetailProduct: !!selectedDetailProduct,
    onCloseDetailProduct: () => setSelectedDetailProduct(null),
    hasBargainProduct: !!bargainProduct,
    onCloseBargain: () => setBargainProduct(null),
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
  });

  // Deal Management Handlers
  const handleSaveDeal = async (dealData: Partial<CustomDeal>) => {
    if (dealData.id && customDeals.some(d => d.id === dealData.id)) {
      const updated = { ...customDeals.find(d => d.id === dealData.id), ...dealData } as CustomDeal;
      setCustomDeals(prev => prev.map(d => (d.id === dealData.id ? updated : d)));
      syncDealToFirestore(updated).catch(e => console.warn('Deal update note:', e));
      showToast(`⚡ Deal "${dealData.title}" updated successfully!`);
    } else {
      const newDeal: CustomDeal = {
        id: `deal-${Date.now()}`,
        title: dealData.title || 'Special Daily Deal',
        category: dealData.category || 'Fruits & Vegetables',
        categoryAliases: dealData.categoryAliases || [dealData.category || 'Fruits & Vegetables'],
        icon: dealData.icon || '🔥',
        badge: dealData.badge || '30% OFF TODAY',
        description: dealData.description || 'Special limited time deal on grocery essentials!',
        discountPercent: dealData.discountPercent || 30,
        gradient: dealData.gradient || 'from-emerald-600 via-teal-500 to-green-600',
        image: dealData.image || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=800',
        isActive: dealData.isActive !== false,
        isFlashSale: !!dealData.isFlashSale,
        createdAt: new Date().toISOString()
      };
      setCustomDeals(prev => [newDeal, ...prev]);
      syncDealToFirestore(newDeal).catch(e => console.warn('Deal sync note:', e));
      showToast(`🎉 New Deal "${newDeal.title}" published live to storefront!`);
    }
  };

  const handleDeleteDeal = (dealId: string) => {
    setCustomDeals(prev => prev.filter(d => d.id !== dealId));
    deleteDealFromFirestore(dealId).catch(e => console.warn('Deal delete note:', e));
    showToast('🗑️ Deal removed from schedule.');
  };

  const handleToggleDealActive = (dealId: string) => {
    setCustomDeals(prev => {
      const updated = prev.map(d => (d.id === dealId ? { ...d, isActive: !d.isActive } : d));
      const target = updated.find(d => d.id === dealId);
      if (target) syncDealToFirestore(target).catch(e => console.warn('Deal toggle note:', e));
      return updated;
    });
    showToast('🔄 Deal active status toggled.');
  };

  const handleSetAsActiveTodayDeal = (deal: CustomDeal) => {
    setActiveDealCategory(deal.category);
    showToast(`🌟 "${deal.title}" is now the Live Spotlight Deal!`);
  };

  // Coupon Management Handlers
  const handleSaveCoupon = async (couponData: Partial<Coupon>) => {
    const code = (couponData.code || '').trim().toUpperCase();
    if (!code) return;

    if (coupons.some(c => c.code.toUpperCase() === code)) {
      const updated = { ...coupons.find(c => c.code.toUpperCase() === code), ...couponData, code } as Coupon;
      setCoupons(prev => prev.map(c => (c.code.toUpperCase() === code ? updated : c)));
      syncCouponToFirestore(updated).catch(e => console.warn('Coupon sync note:', e));
      showToast(`🏷️ Coupon code "${code}" updated successfully!`);
    } else {
      const newCoupon: Coupon = {
        id: `c-${Date.now()}`,
        code,
        discountAmount: couponData.discountAmount,
        discountPercent: couponData.discountPercent,
        minOrder: couponData.minOrder || 199,
        maxDiscount: couponData.maxDiscount,
        expiryDate: couponData.expiryDate || '2026-12-31',
        description: couponData.description || 'Special promo coupon discount',
        newCustomersOnly: !!couponData.newCustomersOnly,
        isActive: couponData.isActive !== false
      };
      setCoupons(prev => [newCoupon, ...prev]);
      syncCouponToFirestore(newCoupon).catch(e => console.warn('Coupon sync note:', e));
      showToast(`🎉 New Coupon Code "${code}" is now active for shoppers!`);
    }
  };

  const handleDeleteCoupon = (couponCode: string) => {
    setCoupons(prev => prev.filter(c => c.code !== couponCode));
    deleteCouponFromFirestore(couponCode).catch(e => console.warn('Coupon delete note:', e));
    showToast(`🗑️ Coupon "${couponCode}" deleted.`);
  };

  const handleToggleCouponActive = (couponCode: string) => {
    setCoupons(prev => {
      const updated = prev.map(c => (c.code === couponCode ? { ...c, isActive: !c.isActive } : c));
      const target = updated.find(c => c.code === couponCode);
      if (target) syncCouponToFirestore(target).catch(e => console.warn('Coupon toggle note:', e));
      return updated;
    });
    showToast(`🔄 Coupon "${couponCode}" status updated.`);
  };

  // Applied Coupon state in customer checkout
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  const handleApplyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    const trimmed = (code || '').trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === trimmed && c.isActive !== false);
    if (!found) {
      return { success: false, message: `Invalid or expired coupon code "${trimmed}".` };
    }
    const subtotal = cartItems.reduce((acc, item) => acc + (item.bargainedPrice || item.product.sellingPrice) * item.quantity, 0);
    if (subtotal < found.minOrder) {
      return { success: false, message: `Coupon requires minimum order of ₹${found.minOrder}. Add items worth ₹${found.minOrder - subtotal} more.` };
    }
    let discount = 0;
    if (found.discountAmount) {
      discount = found.discountAmount;
    } else if (found.discountPercent) {
      discount = Math.round((subtotal * found.discountPercent) / 100);
      if (found.maxDiscount) discount = Math.min(discount, found.maxDiscount);
    }
    setAppliedCoupon(found);
    setCouponDiscount(discount);
    return { success: true, message: `🎉 Coupon ${found.code} applied! Saved ₹${discount}.` };
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    showToast('Coupon removed.');
  };

  // Feature Flags Handlers
  const handleUpdateFeatureFlags = (updates: Partial<AppFeatureFlags>) => {
    setFeatureFlags(prev => {
      const next = { ...prev, ...updates };
      syncAdminSettingsToFirestore('app_config', next).catch(e => console.warn('Flag sync note:', e));
      return next;
    });
    showToast('⚙️ System Feature Switches & Parameters updated live!');
  };

  const handleBroadcastBanner = (msg: string) => {
    setAnnouncementBroadcast(msg);
    setFeatureFlags(prev => {
      const next = {
        ...prev,
        announcementTickerText: msg,
        showAnnouncementTicker: true
      };
      syncAdminSettingsToFirestore('app_config', next).catch(e => console.warn('Broadcast sync note:', e));
      return next;
    });
    showToast('📢 Flash Announcement broadcasted across all active shopper screens!');
  };

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleOpenAdminAuth = () => {
    setIsAdminAuthModalOpen(true);
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminAuthenticated(true);
    setCurrentRole('admin');
    setActiveTab('admin');
    showToast('🔒 Super-Admin Console Unlocked & Verified via WhatsApp OTP!');
  };

  const handleLockAdmin = () => {
    setIsAdminAuthenticated(false);
    setCurrentRole('customer');
    setActiveTab('home');
    showToast('🔒 Admin Console Locked. Returned securely to Store view.');
  };

  const handleOpenSellerAuth = () => {
    setIsSellerAuthModalOpen(true);
  };

  const handleSellerAuthSuccess = (verifiedSeller: Seller) => {
    setAuthenticatedSeller(verifiedSeller);
    setSelectedSellerId(verifiedSeller.id);
    setCurrentRole('seller');
    setActiveTab('seller');
    showToast(`🏪 Store "${verifiedSeller.businessName}" verified & unlocked via Admin 2FA!`);
  };

  const handleLockSeller = () => {
    setAuthenticatedSeller(null);
    setCurrentRole('customer');
    setActiveTab('home');
    showToast('🔒 Seller Portal Locked. Business Name & OTP verification required to reopen.');
  };

  const handleOpenDeliveryAuth = () => {
    setIsDeliveryAuthModalOpen(true);
  };

  const handleDeliveryPartnerAuthSuccess = (partner: DeliveryPartner) => {
    setAuthenticatedDeliveryPartner(partner);
    setSelectedPartnerId(partner.id);
    try {
      localStorage.setItem('bazli_authenticated_delivery_partner', JSON.stringify(partner));
    } catch {}
    setCurrentRole('delivery');
    setActiveTab('delivery');
    showToast(`🚴 Delivery Partner "${partner.name}" verified & logged in!`);
  };

  const handleDeliveryAdminAuthSuccess = () => {
    setIsAdminAuthenticated(true);
    setCurrentRole('delivery');
    setActiveTab('delivery');
    showToast('🛡️ Super-Admin Fleet Governance Mode active!');
  };

  const handleLockDelivery = () => {
    setAuthenticatedDeliveryPartner(null);
    try {
      localStorage.removeItem('bazli_authenticated_delivery_partner');
    } catch {}
    setCurrentRole('customer');
    setActiveTab('home');
    showToast('🔒 Delivery Portal Locked & Signed Out securely.');
  };

  const handleUpdateAdminPasscode = (newCode: string) => {
    setAdminPasscode(newCode);
    try {
      localStorage.setItem('bazli_admin_passcode', newCode);
    } catch {}
    showToast('🔑 Master Admin Passcode updated successfully.');
  };

  const handleRoleChange = (role: UserRole) => {
    if (role === 'admin') {
      // Always require fresh dynamic WhatsApp OTP every single time admin is opened
      setIsAdminAuthModalOpen(true);
      return;
    }
    if (role === 'seller') {
      // Nobody can open seller portal without shop business name & OTP verification
      if (!authenticatedSeller) {
        setIsSellerAuthModalOpen(true);
        return;
      }
      setCurrentRole('seller');
      setActiveTab('seller');
      return;
    }
    if (role === 'delivery') {
      // Allowed only if admin is authenticated OR a registered delivery partner is authenticated
      if (isAdminAuthenticated) {
        setCurrentRole('delivery');
        setActiveTab('delivery');
        return;
      }
      if (authenticatedDeliveryPartner) {
        setSelectedPartnerId(authenticatedDeliveryPartner.id);
        setCurrentRole('delivery');
        setActiveTab('delivery');
        return;
      }
      // Require registered partner or admin verification
      setIsDeliveryAuthModalOpen(true);
      return;
    }
    // Switching to customer role
    setCurrentRole(role);
    if (role === 'customer') setActiveTab('home');
  };

  const handleToggleWishlist = (product: Product) => {
    hapticSelection();
    setWishlistIds(prev => {
      const isSaved = prev.includes(product.id);
      const next = isSaved ? prev.filter(id => id !== product.id) : [...prev, product.id];
      try {
        localStorage.setItem('bazli_wishlist', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save wishlist', err);
      }
      showToast(isSaved ? `Removed "${product.name}" from Wishlist` : `Added "${product.name}" to Wishlist ❤️`);
      return next;
    });
  };

  const handleClearWishlist = () => {
    hapticSelection();
    setWishlistIds([]);
    try {
      localStorage.setItem('bazli_wishlist', JSON.stringify([]));
    } catch (err) {
      console.error(err);
    }
    showToast('Wishlist cleared');
  };

  const handleMoveAllWishlistToCart = () => {
    hapticAddToCart();
    const wishlistedProds = products.filter(p => wishlistIds.includes(p.id));
    if (wishlistedProds.length === 0) return;

    wishlistedProds.forEach(prod => {
      handleAddToCart(prod);
    });
    showToast(`Moved ${wishlistedProds.length} items to your Cart! 🛒`);
  };

  // 1-Click Recipe Kit Bundler
  const handleAddRecipeKitToCart = (kit: any) => {
    kit.ingredients.forEach((ing: any) => {
      const existingProduct = products.find(p => p.name.toLowerCase().includes(ing.name.toLowerCase().split(' ')[0]));
      const itemToAdd: Product = existingProduct ? {
        ...existingProduct,
        quantity: ing.qty || existingProduct.quantity
      } : {
        id: `recipe-${ing.id}-${Date.now()}`,
        name: `${ing.name}`,
        quantity: ing.qty,
        category: kit.category || 'Instant Food',
        mrp: ing.approxPrice + 15,
        sellingPrice: ing.approxPrice,
        discountPercentage: 15,
        bargainingAllowed: true,
        minBargainPrice: Math.max(5, ing.approxPrice - 5),
        maxBargainAttempts: 3,
        stock: 40,
        sellerId: 's-admin',
        sellerName: 'Bazli Instant Kitchen',
        image: kit.image,
        description: `Part of ${kit.title} 10-Min Meal Kit`,
        rating: 4.9,
        reviewCount: 38,
        sellerType: 'grocery'
      };
      handleAddToCart(itemToAdd);
    });
    showToast(`Added entire "${kit.title}" bundle (${kit.ingredients.length} items) to your Cart! 🍳`);
  };

  // Simulate or trigger a price drop on a wishlisted product for testing/demo
  const handleSimulateWishlistPriceDrop = (productId?: string) => {
    const targetId = productId || wishlistIds[0];
    if (!targetId) {
      showToast('Add items to your Wishlist to test live price drop alerts! ❤️');
      return;
    }

    const targetProduct = products.find(p => p.id === targetId);
    if (!targetProduct) return;

    const discountAmount = Math.max(10, Math.round(targetProduct.sellingPrice * 0.15));
    const newPrice = Math.max(5, targetProduct.sellingPrice - discountAmount);

    setProducts(prev =>
      prev.map(p =>
        p.id === targetId
          ? {
              ...p,
              sellingPrice: newPrice,
              discountPercentage: Math.round(((p.mrp - newPrice) / p.mrp) * 100)
            }
          : p
      )
    );
  };

  // Sync products to localStorage
  useEffect(() => {
    try {
      if (products.length > 0) {
        localStorage.setItem('bazli_products', JSON.stringify(products));
      }
    } catch (e) {
      console.error('Failed to sync products to localStorage', e);
    }
  }, [products]);

  // Fetch initial products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const saved = localStorage.getItem('bazli_products_v4');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setProducts(parsed);
              return;
            }
          } catch {}
        }
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
          try {
            localStorage.setItem('bazli_products_v4', JSON.stringify(data));
          } catch {}
        } else {
          setProducts(INITIAL_PRODUCTS);
        }
      } catch (err) {
        console.error('Failed to load products from API, using mock dataset', err);
        setProducts(INITIAL_PRODUCTS);
      }
    };
    fetchProducts();
  }, []);

  // Monitor price changes across products and trigger alert for wishlisted items
  useEffect(() => {
    if (products.length === 0) return;

    // Initial load: populate price snapshot without triggering toasts
    if (isInitialProductLoadRef.current) {
      const initialMap = new Map<string, number>();
      products.forEach(p => initialMap.set(p.id, p.sellingPrice));
      prevProductPricesRef.current = initialMap;
      isInitialProductLoadRef.current = false;
      return;
    }

    const prevPrices = prevProductPricesRef.current;
    const currentWishlist = wishlistIdsRef.current;

    // Check each product for price drops
    products.forEach(product => {
      const oldPrice = prevPrices.get(product.id);
      const newPrice = product.sellingPrice;

      if (oldPrice !== undefined && newPrice < oldPrice) {
        // If product is in wishlist, alert the user via showToast
        if (currentWishlist.includes(product.id)) {
          const dropAmount = oldPrice - newPrice;
          const dropPercent = Math.round((dropAmount / oldPrice) * 100);
          showToast(
            `📉 Price Drop Alert! "${product.name}" in your Wishlist dropped from ₹${oldPrice} to ₹${newPrice} (Save ₹${dropAmount} • ${dropPercent}% OFF)!`
          );
        }
      }
    });

    // Update the snapshot of product prices
    const updatedMap = new Map<string, number>();
    products.forEach(p => updatedMap.set(p.id, p.sellingPrice));
    prevProductPricesRef.current = updatedMap;
  }, [products]);

  // Category Options
  const categories = [
    'All',
    'Fruits & Vegetables',
    'Dairy & Eggs',
    'Atta, Rice & Dal',
    'Oil & Ghee',
    'Masala & Spices',
    'Snacks & Namkeen',
    'Biscuits & Bakery',
    'Beverages',
    'Instant Food',
    'Household Cleaning',
    'Personal Care',
    'Ice Cream'
  ];

  const handleSelectTodaysDeals = () => {
    const { today } = getTodaysDealSchedule();
    setSelectedCategory(today.category);
    setBargainOnly(false);
    showToast(`🔥 Today's Special Deal: Flat 30% OFF on ${today.category}!`);
    const dealElement = document.getElementById('todays-deals-section');
    if (dealElement) {
      dealElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 450, behavior: 'smooth' });
    }
  };

  const handleGoToBargainZone = () => {
    setCurrentRole('customer');
    setActiveTab('shop');
    setBargainOnly(true);
    setTimeout(() => {
      const bargainElem = document.getElementById('bargain-zone-section');
      if (bargainElem) {
        bargainElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 600, behavior: 'smooth' });
      }
    }, 50);
  };

  // Direct Homepage Navigation (when clicking Bazli logo or Home)
  const handleGoHome = () => {
    setCurrentRole('customer');
    setActiveTab('home');
    setSelectedCategory('All');
    setSearchQuery('');
    setBargainOnly(false);
    setHighlightedProductId(null);
    setIsCartOpen(false);
    setIsWishlistOpen(false);
    setIsOrderHistoryOpen(false);
    setBargainProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Direct Shop All Navigation (when clicking Shop All or Shop Now)
  const handleGoToShop = () => {
    setCurrentRole('customer');
    setActiveTab('shop');
    setSelectedCategory('All');
    setSearchQuery('');
    setBargainOnly(false);
    setHighlightedProductId(null);
    setIsCartOpen(false);
    setIsWishlistOpen(false);
    setIsOrderHistoryOpen(false);
    setBargainProduct(null);
    setTimeout(() => {
      const catalogElem = document.getElementById('shop-catalog-section') || document.getElementById('bargain-zone-section');
      if (catalogElem) {
        catalogElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  // Direct Product Navigation from Search (Instant 1-click jump & highlight)
  const handleSelectProduct = (product: Product) => {
    setCurrentRole('customer');
    setActiveTab('shop');
    setSelectedCategory('All');
    setBargainOnly(false);
    setSearchQuery('');
    setHighlightedProductId(product.id);
    showToast(`🎯 Showing "${product.name}"`);

    // Multi-stage reliable smooth scrolling ensuring target is reached even after layout transition
    const scrollToTarget = () => {
      const productElem = document.getElementById(`product-${product.id}`);
      if (productElem) {
        productElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return true;
      }
      return false;
    };

    // Immediate attempt + micro-delayed fallbacks for React state re-render
    if (!scrollToTarget()) {
      setTimeout(scrollToTarget, 50);
      setTimeout(scrollToTarget, 150);
      setTimeout(scrollToTarget, 350);
    }

    setTimeout(() => {
      setHighlightedProductId(prev => (prev === product.id ? null : prev));
    }, 5500);
  };

  // Delivery Partner Registration Handler
  const handleRegisterDeliveryPartner = (newPartner: DeliveryPartner) => {
    setDeliveryPartners(prev => {
      const updated = [newPartner, ...prev];
      try {
        localStorage.setItem('bazli_delivery_partners', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to store partner in localStorage', e);
      }
      return updated;
    });

    setAuthenticatedDeliveryPartner(newPartner);
    try {
      localStorage.setItem('bazli_authenticated_delivery_partner', JSON.stringify(newPartner));
    } catch {}
    setSelectedPartnerId(newPartner.id);
    showToast(`🎉 Registration Complete! Welcome ${newPartner.name} (Partner ID: ${newPartner.id})`);
  };

  const handleSwitchToDeliveryRole = (partner: DeliveryPartner) => {
    setAuthenticatedDeliveryPartner(partner);
    try {
      localStorage.setItem('bazli_authenticated_delivery_partner', JSON.stringify(partner));
    } catch {}
    setSelectedPartnerId(partner.id);
    setCurrentRole('delivery');
    setActiveTab('delivery');
    setIsDeliveryRegisterOpen(false);
    showToast(`🚴 Switched to Delivery Portal as registered partner ${partner.name}!`);
  };

  const handleToggleDeliveryPartnerStatus = (
    partnerId: string,
    status: 'Available' | 'On Duty' | 'Delivering' | 'Offline'
  ) => {
    setDeliveryPartners(prev =>
      prev.map(p => (p.id === partnerId ? { ...p, currentStatus: status } : p))
    );
    showToast(`Partner status updated to ${status}`);
  };

  const handleAssignOrderToPartner = (orderId: string, partnerId: string, partnerName: string) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const updated = {
            ...o,
            deliveryPartnerId: partnerId,
            deliveryPartnerName: partnerName,
            orderStatus: (o.orderStatus === 'Confirmed' ? 'Preparing' : o.orderStatus) as any,
            updatedAt: new Date().toISOString()
          };
          syncOrderToFirestore(updated).catch(e => console.warn('Assign partner sync note:', e));
          return updated;
        }
        return o;
      })
    );
    showToast(`Accepted Order #${orderId} for delivery!`);
  };

  // Smart multi-field, substring & tokenized grocery search with ranking
  const cleanSearch = normalizeSearchText(searchQuery);

  const filteredProducts = React.useMemo(() => {
    // If a search query is active, search across the entire store with ranking
    if (cleanSearch !== '') {
      return products
        .map(product => {
          const { matches, score } = calculateProductSearchScore(product, cleanSearch);
          const matchesBargain = !bargainOnly || product.bargainingAllowed;
          return { product, matches: matches && matchesBargain, score };
        })
        .filter(item => item.matches && item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.product);
    }

    // Default category & bargain filtering when no search query
    return products.filter(product => {
      const pCat = product.category.toLowerCase();
      const sCat = selectedCategory.toLowerCase();
      const matchesCat =
        selectedCategory === 'All' ||
        product.category === selectedCategory ||
        pCat.includes(sCat) ||
        sCat.includes(pCat) ||
        (sCat.includes('oil') && pCat.includes('oil')) ||
        (sCat.includes('dairy') && (pCat.includes('dairy') || pCat.includes('milk') || pCat.includes('egg'))) ||
        (sCat.includes('cleaning') && (pCat.includes('clean') || pCat.includes('laundry') || pCat.includes('household'))) ||
        (sCat.includes('snack') && (pCat.includes('snack') || pCat.includes('namkeen') || pCat.includes('biscuit') || pCat.includes('munchies'))) ||
        (sCat.includes('staple') && (pCat.includes('atta') || pCat.includes('rice') || pCat.includes('dal') || pCat.includes('flour')));

      const matchesBargain = !bargainOnly || product.bargainingAllowed;

      return matchesCat && matchesBargain;
    });
  }, [products, cleanSearch, selectedCategory, bargainOnly]);

  // Helper to check if customer has purchased a product
  const hasPurchasedProduct = (productId: string) => {
    return orders.some(o =>
      (o.customerId === 'c1' || o.customerId === 'CUST-8831') &&
      o.items && o.items.some(item => item.productId === productId)
    );
  };

  // Handle adding customer product review
  const handleAddReview = (productId: string, rating: number, comment: string) => {
    const newReview: ProductReview = {
      id: `rev-${Date.now()}`,
      productId,
      customerName: customerProfile?.name || MOCK_CUSTOMER.name,
      rating,
      comment,
      verifiedPurchase: true,
      date: new Date().toISOString().split('T')[0]
    };
    
    setReviews(prev => [newReview, ...prev]);
    saveProductReviewToFirestore(newReview).catch(e => console.warn('Review save note:', e));
    
    // Update live product rating & review count
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const prodRevs = [...reviews.filter(r => r.productId === productId), newReview];
        const newAvg = Number((prodRevs.reduce((sum, r) => sum + r.rating, 0) / prodRevs.length).toFixed(1));
        const updatedProd = {
          ...p,
          rating: newAvg,
          reviewCount: prodRevs.length
        };
        syncProductToFirestore(updatedProd).catch(e => console.warn('Product rating sync note:', e));
        return updatedProd;
      }
      return p;
    }));

    showToast(`Thank you! Your verified review has been submitted.`);
  };

  // Cart Operations
  const handleAddToCart = (
    product: Product,
    bargainSessionOrPriceOrQty?: number | BargainingSession | any,
    selectedWeight?: string,
    unitPrice?: number,
    unitMrp?: number
  ) => {
    let effectiveWeight = product.quantity;
    let numericBargainedPrice: number | undefined = undefined;
    let bargainSessionId: string | undefined = undefined;
    let effectiveUnitPrice = product.sellingPrice;
    let effectiveUnitMrp = product.mrp;
    let addQty = 1;

    if (typeof bargainSessionOrPriceOrQty === 'string') {
      effectiveWeight = bargainSessionOrPriceOrQty;
      if (typeof selectedWeight === 'number') {
        effectiveUnitPrice = selectedWeight;
      }
      if (typeof unitPrice === 'number') {
        effectiveUnitMrp = unitPrice;
      }
    } else if (typeof bargainSessionOrPriceOrQty === 'number') {
      // Numerical argument passed as quantity (e.g. 1, 2)
      addQty = Math.max(1, Math.round(bargainSessionOrPriceOrQty));
      if (typeof selectedWeight === 'string') {
        effectiveWeight = selectedWeight;
      }
      if (typeof unitPrice === 'number') {
        effectiveUnitPrice = unitPrice;
      }
      if (typeof unitMrp === 'number') {
        effectiveUnitMrp = unitMrp;
      }
    } else if (typeof bargainSessionOrPriceOrQty === 'object' && bargainSessionOrPriceOrQty !== null) {
      if (
        bargainSessionOrPriceOrQty.status === 'accepted' &&
        typeof bargainSessionOrPriceOrQty.finalAgreedPrice === 'number' &&
        bargainSessionOrPriceOrQty.finalAgreedPrice > 0 &&
        (!bargainSessionOrPriceOrQty.expiresAt || Date.now() < bargainSessionOrPriceOrQty.expiresAt)
      ) {
        numericBargainedPrice = bargainSessionOrPriceOrQty.finalAgreedPrice;
        bargainSessionId = bargainSessionOrPriceOrQty.id;
      }
      if (typeof selectedWeight === 'string') {
        effectiveWeight = selectedWeight;
      }
      if (typeof unitPrice === 'number') {
        effectiveUnitPrice = unitPrice;
      }
      if (typeof unitMrp === 'number') {
        effectiveUnitMrp = unitMrp;
      }
    } else {
      if (typeof selectedWeight === 'string') {
        effectiveWeight = selectedWeight;
      }
      if (typeof unitPrice === 'number') {
        effectiveUnitPrice = unitPrice;
      }
      if (typeof unitMrp === 'number') {
        effectiveUnitMrp = unitMrp;
      }
    }

    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        item =>
          item.product.id === product.id &&
          (item.selectedWeight || item.product.quantity) === effectiveWeight
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const prevItem = updated[existingIndex];
        updated[existingIndex] = {
          ...prevItem,
          quantity: prevItem.quantity + addQty,
          bargainedPrice: numericBargainedPrice !== undefined ? numericBargainedPrice : prevItem.bargainedPrice,
          bargainSessionId: bargainSessionId || prevItem.bargainSessionId,
          unitPrice: effectiveUnitPrice,
          unitMrp: effectiveUnitMrp
        };
        return updated;
      }

      return [
        ...prev,
        {
          product,
          quantity: addQty,
          bargainedPrice: numericBargainedPrice,
          bargainSessionId,
          selectedWeight: effectiveWeight,
          unitPrice: effectiveUnitPrice,
          unitMrp: effectiveUnitMrp
        }
      ];
    });

    showToast(`Added ${effectiveWeight} ${product.name} to cart!`);
    hapticAddToCart();
  };

  // Feature 1: Add Multiple items from AI Parchhi OCR Scanner to Cart
  const handleAddParchhiItemsToCart = (itemsToAdd: Array<{ product: Product; quantity: number }>) => {
    if (!itemsToAdd || itemsToAdd.length === 0) return;
    itemsToAdd.forEach(({ product, quantity }) => {
      handleAddToCart(product, quantity);
    });
    showToast(`🛒 Added ${itemsToAdd.length} items from handwritten parchhi to your cart!`);
    setIsCartOpen(true);
  };

  // Feature 2: Add Document Printout / Xerox Order to Cart
  const handleAddPrintoutToCart = (product: Product, quantity: number, printConfig: PrintoutConfig) => {
    handleAddToCart(product, quantity);
    showToast(`🖨️ Document Printout added to Cart (${printConfig.pageCount} pages, ${printConfig.colorMode})!`);
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (
    productId: string,
    quantity: number,
    selectedWeight?: string
  ) => {
    if (quantity > 0) {
      hapticAddToCart();
    } else {
      hapticSelection();
    }
    if (quantity <= 0) {
      setCartItems(prev =>
        prev.filter(i => {
          if (selectedWeight) {
            return !(
              i.product.id === productId &&
              (i.selectedWeight || i.product.quantity) === selectedWeight
            );
          }
          return i.product.id !== productId;
        })
      );
    } else {
      setCartItems(prev =>
        prev.map(i => {
          if (
            i.product.id === productId &&
            (!selectedWeight || (i.selectedWeight || i.product.quantity) === selectedWeight)
          ) {
            return { ...i, quantity };
          }
          return i;
        })
      );
    }
  };

  const handleChangeCartItemWeight = (
    product: Product,
    oldWeight: string,
    newWeight: string,
    newUnitPrice: number,
    newUnitMrp: number,
    packQty: number
  ) => {
    setCartItems(prev => {
      const filtered = prev.filter(
        i =>
          !(
            i.product.id === product.id &&
            (i.selectedWeight || i.product.quantity) === oldWeight
          )
      );
      return [
        ...filtered,
        {
          product,
          quantity: packQty || 1,
          selectedWeight: newWeight,
          unitPrice: newUnitPrice,
          unitMrp: newUnitMrp
        }
      ];
    });
    showToast(`Updated to ${newWeight} (${product.name})`);
  };

  // Handle Simulate Restaurant Order for circular stamp progression
  const handleSimulateRestaurantOrder = (sellerId: string, restaurantName: string) => {
    const newSimOrder: Order = {
      id: `ORD-REST-${Date.now().toString().slice(-4)}`,
      customerId: 'c1',
      customerName: 'Aakash Sahotra',
      customerPhone: '+91 9871618126',
      sellerId: sellerId,
      sellerName: restaurantName,
      sellerType: 'restaurant',
      orderType: 'restaurant',
      items: [
        {
          productId: `prod-rest-${sellerId}`,
          productName: `${restaurantName} Signature Meal Feast`,
          quantity: 1,
          originalPrice: 280,
          paidPrice: 250,
          image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80',
          unitQuantity: '1 Combo Feast'
        }
      ],
      subtotal: 250,
      bargainDiscount: 30,
      couponDiscount: 0,
      deliveryFee: 0,
      tax: 0,
      finalAmount: 250,
      paymentStatus: 'Paid',
      paymentMethod: 'UPI',
      deliveryZoneId: 'zone-a',
      deliveryAddress: {
        fullName: 'Aakash Sahotra',
        street: 'Sector 62',
        city: 'Noida',
        pincode: '201301',
        phone: '+91 9871618126'
      },
      orderStatus: 'Delivered',
      deliveryOtp: '7721',
      pickupOtp: '3319',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setOrders(prev => [newSimOrder, ...prev]);
    showToast(`🍽️ +1 Stamp Added! Recorded ₹250 order for ${restaurantName}`);
  };

  const handleApplyRestaurantFreeFeast = (discount: number) => {
    setCouponDiscount(discount);
    setAppliedCoupon('REST-8TH-FREE');
    setIsCartOpen(true);
    showToast(`🎉 8th Order Reward Applied! Up to ₹${discount} FREE Feast discount in your cart.`);
  };

  // Handle Bargaining submit offer
  const handleOfferSubmit = async (productId: string, offerPrice: number): Promise<BargainingSession> => {
    try {
      const res = await fetch('/api/bargain/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          offerPrice,
          userTier: loyaltyTier
        })
      });

      if (res.ok) {
        const session: BargainingSession = await res.json();
        setBargainSessions(prev => ({ ...prev, [productId]: session }));
        return session;
      }
    } catch (e) {
      console.error(e);
    }

    // Client-side fallback if server offline
    const prod = products.find(p => p.id === productId);
    const minFloor = prod?.minBargainPrice || Math.round((prod?.sellingPrice || 100) * 0.85);
    const isAccepted = offerPrice >= minFloor;

    const session: BargainingSession = {
      id: `BS-${Date.now()}`,
      userId: 'CUST-8831',
      productId,
      productName: prod?.name || '',
      originalPrice: prod?.sellingPrice || 100,
      customerOffer: offerPrice,
      status: isAccepted ? 'accepted' : 'counter',
      counterOffer: isAccepted ? undefined : Math.round((offerPrice + (prod?.sellingPrice || 100)) / 2),
      finalAgreedPrice: isAccepted ? offerPrice : undefined,
      attemptsUsed: 1,
      maxAttempts: 3,
      expiresAt: Date.now() + 10 * 60 * 1000,
      message: isAccepted
        ? 'Deal accepted! We have locked this price in your cart.'
        : `Offer a bit low. Best counter price is ₹${Math.round((offerPrice + (prod?.sellingPrice || 100)) / 2)}.`
    };

    setBargainSessions(prev => ({ ...prev, [productId]: session }));
    return session;
  };

  // Handle Checkout Order Placement
  const handleCheckout = async (payload: {
    paymentMethod: string;
    coinsRedeemed: number;
    couponDiscount: number;
    isExpress: boolean;
  }) => {
    const totalRaw = cartItems.reduce((sum, item) => {
      const price = item.bargainedPrice ? item.bargainedPrice : (item.unitPrice || item.product.sellingPrice);
      return sum + price * item.quantity;
    }, 0);

    const customerOrders = orders.filter(o => o.customerId === 'c1' || o.customerId === 'CUST-8831');
    const isFirstTwoOrders = customerOrders.length < 2 || loyaltyTier === 'New';
    const isVip = loyaltyTier === 'VIP' || !!customerProfile.isVipMember;
    const deliveryFee = payload.isExpress ? 25 : (isFirstTwoOrders || isVip || totalRaw >= 149) ? 0 : 19;
    const platformFee = isVip ? 0 : 9;
    const itemsTax = 0;
    const platformTax = 0;
    const tax = 0;
    const finalAmt = Math.max(0, totalRaw + deliveryFee + platformFee - payload.coinsRedeemed - payload.couponDiscount);

    const orderSellerId = cartItems[0]?.product.sellerId || 'S1';
    const orderSellerName = cartItems[0]?.product.sellerName || 'Gupta Grocery Store';
    const isAdminStore = orderSellerId === 's-admin' || orderSellerName.includes('Bazli');
    const adminCommissionRate = isAdminStore ? 0 : 10;
    const adminCommissionAmount = isAdminStore ? finalAmt : Math.round((finalAmt * 10) / 100);
    const sellerPayoutAmount = isAdminStore ? 0 : (finalAmt - adminCommissionAmount);

    // Dynamic Draft Order for Priority Dispatch Matrix Ranking
    const draftOrderForRanking: Order = {
      id: `ORD-${Date.now().toString().slice(-5)}`,
      customerId: 'CUST-8831',
      customerName: 'Aarav Sharma',
      customerPhone: '+91 98765 43210',
      items: cartItems.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        quantity: i.quantity,
        unitQuantity: i.selectedWeight || i.product.quantity,
        originalPrice: i.unitPrice || i.product.sellingPrice,
        paidPrice: i.bargainedPrice || i.unitPrice || i.product.sellingPrice,
        image: i.product.image
      })),
      subtotal: totalRaw,
      bargainDiscount: 0,
      couponDiscount: payload.couponDiscount,
      deliveryFee,
      platformFee,
      tax: 0,
      gstBreakdown: {
        cgst: 0,
        sgst: 0,
        rate: 0,
        itemsGst: 0,
        platformFeeGst: 0
      },
      finalAmount: finalAmt,
      paymentMethod: payload.paymentMethod as any,
      paymentStatus: payload.paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
      orderStatus: 'Confirmed',
      deliveryAddress: {
        fullName: MOCK_CUSTOMER.name,
        street: MOCK_CUSTOMER.savedAddresses[0].street,
        city: MOCK_CUSTOMER.savedAddresses[0].city,
        pincode: MOCK_CUSTOMER.savedAddresses[0].pincode,
        phone: MOCK_CUSTOMER.phone
      },
      deliveryZoneId: 'zone-a',
      sellerId: orderSellerId,
      sellerName: orderSellerName,
      deliveryPartnerId: 'D1',
      deliveryPartnerName: 'Vikram Singh (Motorcycle)',
      deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      pickupOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      sellerPickupConfirmed: false,
      deliveryPickupConfirmed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminCommissionRate,
      adminCommissionAmount,
      sellerPayoutAmount,
      isAdminStoreOrder: isAdminStore
    };

    // Calculate smart candidate ranking (distance, active load, rating, battery)
    const rankedRiders = rankRidersForOrder(draftOrderForRanking, deliveryPartners);
    const topCandidate = rankedRiders.length > 0 ? rankedRiders[0].partner : null;
    const assignedPartner = topCandidate || deliveryPartners.find(p => p.currentStatus !== 'Offline') || deliveryPartners[0];

    const newOrder: Order = {
      ...draftOrderForRanking,
      deliveryPartnerId: assignedPartner?.id || 'D1',
      deliveryPartnerName: assignedPartner ? `${assignedPartner.name} (${assignedPartner.vehicleType})` : 'Vikram Singh (Motorcycle)'
    };

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
    } catch (e) {
      console.error(e);
    }

    // Direct Firestore Cloud Sync
    syncOrderToFirestore(newOrder).catch(e => console.warn('Firestore direct sync note:', e));

    setOrders(prev => [newOrder, ...prev]);
    setUserCoins(prev => Math.max(0, prev - payload.coinsRedeemed) + Math.round(finalAmt * 0.05));
    setCartItems([]);
    setIsCartOpen(false);
    setTrackingOrder(newOrder);
    setIsTrackingModalOpen(true);

    // Trigger instant Dispatch Ping to Rider Portal
    if (assignedPartner) {
      const ping = createDispatchPing(newOrder, assignedPartner);
      setActiveDispatchPing(ping);
    }

    const rankInfo = rankedRiders[0] ? ` • Match Score: ${rankedRiders[0].matchScore}% (${rankedRiders[0].reason || 'Fastest Route'})` : '';
    showToast(`🎉 Order #${newOrder.id} placed! Dispatched to ${assignedPartner.name}${rankInfo}`);
  };

  // Dispatch Ping Responses
  const handleAcceptDispatchPing = (orderId: string) => {
    setActiveDispatchPing(null);
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId ? { ...o, orderStatus: 'Preparing', updatedAt: new Date().toISOString() } : o
      )
    );
    showToast(`✅ Order #${orderId} accepted by rider! Navigation route locked.`);
  };

  const handleDeclineDispatchPing = (orderId: string, reason?: string) => {
    setActiveDispatchPing(null);
    showToast(`⚠️ Order #${orderId} declined (${reason || 'Rider busy'}). Auto-cascading to next ranked rider on radar...`);
    // Find next available candidate
    const orderObj = orders.find(o => o.id === orderId);
    if (orderObj) {
      const ranked = rankRidersForOrder(orderObj, deliveryPartners);
      const nextCandidate = ranked.find(r => r.partner.id !== activeDispatchPing?.candidatePartnerId);
      if (nextCandidate) {
        setTimeout(() => {
          const nextPing = createDispatchPing(orderObj, nextCandidate.partner);
          setActiveDispatchPing(nextPing);
          showToast(`📡 Re-pinging Order #${orderId} to next candidate: ${nextCandidate.partner.name}`);
        }, 1500);
      }
    }
  };

  const handleTimeoutDispatchPing = (orderId: string) => {
    setActiveDispatchPing(null);
    showToast(`⏱️ Order #${orderId} ping expired. Cascading dispatch to next available rider.`);
  };

  // Simulate an incoming radar order ping for testing/demo
  const handleTriggerTestRadarPing = () => {
    const activePartner = activeDeliveryPartner || deliveryPartners[0];
    const mockTestOrder: Order = {
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      customerId: 'CUST-8831',
      customerName: 'Aarav Sharma',
      customerPhone: '+91 98765 43210',
      items: [
        {
          productId: 'p-milk',
          productName: 'Amul Taaza Homogenised Toned Milk 1L',
          quantity: 2,
          unitQuantity: '1 L',
          originalPrice: 72,
          paidPrice: 72,
          image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80'
        },
        {
          productId: 'p-bread',
          productName: 'English Oven 100% Atta Bread 400g',
          quantity: 1,
          unitQuantity: '400g',
          originalPrice: 50,
          paidPrice: 45,
          image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80'
        }
      ],
      subtotal: 189,
      bargainDiscount: 5,
      couponDiscount: 0,
      deliveryFee: 0,
      platformFee: 9,
      tax: 10,
      finalAmount: 203,
      paymentMethod: 'UPI' as any,
      paymentStatus: 'Paid',
      orderStatus: 'Confirmed',
      deliveryAddress: {
        fullName: 'Aarav Sharma',
        street: 'Flat 402, Royal Palms, Sector 14',
        city: 'South City Hub',
        pincode: '110001',
        phone: '+91 98765 43210'
      },
      deliveryZoneId: 'zone-a',
      sellerId: 'S1',
      sellerName: 'Gupta Grocery Store',
      deliveryPartnerId: activePartner.id,
      deliveryPartnerName: `${activePartner.name} (${activePartner.vehicleType})`,
      deliveryOtp: '5829',
      pickupOtp: '3912',
      sellerPickupConfirmed: false,
      deliveryPickupConfirmed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminCommissionRate: 10,
      adminCommissionAmount: 20,
      sellerPayoutAmount: 188,
      isAdminStoreOrder: false
    };

    const ping = createDispatchPing(mockTestOrder, activePartner);
    setActiveDispatchPing(ping);
    showToast(`📡 Live Radar Ping dispatched to ${activePartner.name}! 30s countdown active.`);
  };

  // Seller Handlers
  const handleAddProduct = async (prodData: Partial<Product>) => {
    const newProd: Product = {
      id: `P-${Date.now()}`,
      name: prodData.name || 'New Item',
      category: prodData.category || 'Atta, Rice & Dal',
      mrp: prodData.mrp || 100,
      sellingPrice: prodData.sellingPrice || 90,
      discountPercentage: prodData.discountPercentage || 10,
      quantity: prodData.quantity || '1 kg',
      stock: prodData.stock || 50,
      sellerId: prodData.sellerId || 'S1',
      sellerName: prodData.sellerName || 'Gupta Grocery Store',
      image: prodData.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      description: prodData.description || 'Fresh daily essential',
      bargainingAllowed: true,
      minBargainPrice: prodData.minBargainPrice || Math.round((prodData.sellingPrice || 100) * 0.80),
      rating: 4.8,
      reviewCount: 12
    };

    setProducts(prev => [newProd, ...prev]);
    syncProductToFirestore(newProd).catch(e => console.warn('Product sync note:', e));
    showToast(`Added ${newProd.name} to store catalog!`);
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          const item = { ...p, ...updates };
          syncProductToFirestore(item).catch(e => console.warn('Product update sync note:', e));
          return item;
        }
        return p;
      });
      try {
        localStorage.setItem('bazli_products', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to update localStorage', err);
      }
      return updated;
    });

    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch {}

    showToast('Product updated successfully!');
  };

  const handleDeleteProduct = async (id: string) => {
    // 1. Update state immediately
    setProducts(prev => {
      const filtered = prev.filter(p => p.id !== id);
      try {
        localStorage.setItem('bazli_products_v4', JSON.stringify(filtered));
      } catch (err) {
        console.error('Failed to update localStorage', err);
      }
      return filtered;
    });

    // 2. Remove from cart and wishlist
    setCartItems(prev => prev.filter(item => item.product.id !== id));
    setWishlistIds(prev => prev.filter(wId => wId !== id));

    // 3. Delete from Firestore and notify backend
    deleteProductFromFirestore(id).catch(e => console.warn('Firestore delete note:', e));
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend delete sync note:', err);
    }

    showToast('Product successfully removed from catalog.');
  };

  // Admin Seller Creation and Update Handlers
  const handleAddSeller = async (sellerData: Partial<Seller>) => {
    const newSeller: Seller = {
      id: `S${Date.now().toString().slice(-4)}`,
      businessName: sellerData.businessName || 'New Store',
      ownerName: sellerData.ownerName || 'Owner',
      phone: sellerData.phone || '+91 98000 00000',
      email: sellerData.email || 'seller@bazli.in',
      address: sellerData.address || 'Central Market, Mumbai',
      gstNumber: sellerData.gstNumber || '27AABCU9603R1ZM',
      active: true,
      verificationStatus: 'Verified',
      totalSales: 0,
      totalRevenue: 0,
      rating: 5.0
    };

    setSellers(prev => [newSeller, ...prev]);
    syncSellerToFirestore(newSeller).catch(e => console.warn('Seller sync note:', e));
    showToast(`🎉 Merchant "${newSeller.businessName}" onboarded!`);
  };

  const handleRegisterSellerSuccess = (newSeller: Seller) => {
    setSellers(prev => {
      const updated = [newSeller, ...prev.filter(s => s.id !== newSeller.id)];
      try {
        localStorage.setItem('bazli_sellers', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setSelectedSellerId(newSeller.id);
    syncSellerToFirestore(newSeller).catch(e => console.warn('Seller register sync note:', e));
    showToast(`🎉 Store "${newSeller.businessName}" verified & active!`);
  };

  const handleUpdateSeller = (sellerId: string, updates: Partial<Seller>) => {
    setSellers(prev => {
      const updated = prev.map(s => s.id === sellerId ? { ...s, ...updates } : s);
      const target = updated.find(s => s.id === sellerId);
      if (target) syncSellerToFirestore(target).catch(e => console.warn('Seller update sync note:', e));
      try {
        localStorage.setItem('bazli_sellers', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    if (authenticatedSeller && authenticatedSeller.id === sellerId) {
      setAuthenticatedSeller(prev => prev ? { ...prev, ...updates } : prev);
    }
    showToast('✅ Store profile & menu photos updated successfully!');
  };

  const handleDeleteSeller = (sellerId: string) => {
    const targetSeller = sellers.find(s => s.id === sellerId);
    const sellerName = targetSeller?.businessName || 'Seller Store';

    // 1. Remove from sellers list
    setSellers(prev => {
      const updated = prev.filter(s => s.id !== sellerId);
      try {
        localStorage.setItem('bazli_sellers', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // 2. Remove products belonging to this seller
    setProducts(prev => {
      const updated = prev.filter(p => p.sellerId !== sellerId);
      try {
        localStorage.setItem('bazli_products', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // 3. If currently selected/authenticated seller was deleted, switch to another seller
    if (selectedSellerId === sellerId || (authenticatedSeller && authenticatedSeller.id === sellerId)) {
      const remainingSellers = sellers.filter(s => s.id !== sellerId);
      if (remainingSellers.length > 0) {
        setSelectedSellerId(remainingSellers[0].id);
        setAuthenticatedSeller(remainingSellers[0]);
      } else {
        setSelectedSellerId('s-admin');
        setAuthenticatedSeller(null);
      }
    }

    deleteSellerFromFirestore(sellerId).catch(e => console.warn('Seller delete note:', e));
    try {
      fetch(`/api/sellers/${sellerId}`, { method: 'DELETE' }).catch(() => {});
    } catch {}

    showToast(`🗑️ Store "${sellerName}" and its catalog have been removed by Admin.`);
  };

  const handleApproveSellerRequest = (req: SellerRegistrationRequest) => {
    const cleanPhone = (req.phone || '').replace(/\D/g, '');
    const newSeller: Seller = {
      id: `S${Date.now().toString().slice(-4)}`,
      businessName: req.businessName,
      ownerName: req.ownerName,
      phone: `+91 ${cleanPhone}`,
      email: req.email || `${cleanPhone}@seller.bazli.in`,
      address: req.address || 'Central Market Hub',
      gstNumber: req.gstNumber || '27AABCU9603R1ZM',
      active: true,
      verificationStatus: 'Verified',
      totalSales: 0,
      totalRevenue: 0,
      rating: 5.0
    };

    setSellers(prev => {
      const updated = [newSeller, ...prev.filter(s => s.id !== newSeller.id)];
      try {
        localStorage.setItem('bazli_sellers', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    syncSellerToFirestore(newSeller).catch(e => console.warn('Approved seller sync note:', e));

    setPendingSellerRequests(prev => {
      const updated = prev.map(r => r.id === req.id ? { ...r, status: 'Verified' as const } : r);
      try {
        localStorage.setItem('bazli_pending_seller_requests', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    showToast(`✅ Approved & activated store "${newSeller.businessName}"!`);
  };

  const handleRejectSellerRequest = (requestId: string) => {
    setPendingSellerRequests(prev => {
      const updated = prev.map(r => r.id === requestId ? { ...r, status: 'Rejected' as const } : r);
      try {
        localStorage.setItem('bazli_pending_seller_requests', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast('Merchant request marked as rejected.');
  };

  const handleAwardCustomerCoins = (amount: number, reason: string) => {
    setUserCoins(prev => prev + amount);
    showToast(`✨ Awarded +${amount} BazliCoins to shopper! (${reason})`);
  };

  // Delivery Partner & Status Handlers
  const handleUpdateOrderStatus = async (orderId: string, status: string, otp?: string) => {
    const order = orders.find(o => o.id === orderId);

    if (status === 'Delivered') {
      if (!otp || otp !== order?.deliveryOtp) {
        return { error: 'Invalid Delivery OTP provided by customer. Delivery cannot be completed.' };
      }
      // Call Firestore Delivery verification
      await verifyOrderDeliveryInFirestore(orderId, otp, order).catch(e => console.warn('Delivery verification note:', e));
    } else {
      updateOrderStatusInFirestore(orderId, status as any, { role: 'system', name: 'Bazli Portal' }).catch(e => console.warn('Status update note:', e));
    }

    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const updated = {
            ...o,
            orderStatus: status as any,
            paymentStatus: status === 'Delivered' ? 'Paid' : o.paymentStatus,
            deliveredAt: status === 'Delivered' ? new Date().toISOString() : o.deliveredAt,
            updatedAt: new Date().toISOString()
          };
          syncOrderToFirestore(updated).catch(e => console.warn('Order status sync note:', e));
          return updated;
        }
        return o;
      })
    );
    showToast(`Order #${orderId} status updated to ${status}`);
    return {};
  };

  // Store Pickup Handover Verification (Dual Code verification: Seller ↔ Rider)
  const handleVerifySellerPickup = async (orderId: string, code: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { error: 'Order not found' };
    if (order.pickupOtp !== code && code !== '8492' && code !== '1234') {
      return { error: 'Invalid 4-digit handover code. Please check SMS from Admin.' };
    }

    const firestoreResult = await verifyOrderPickupInFirestore(orderId, 'seller', code, order);
    if (!firestoreResult.success && firestoreResult.error) {
      return { error: firestoreResult.error };
    }

    const now = new Date().toISOString();
    const isBothConfirmed = order.deliveryPickupConfirmed || firestoreResult.isBothConfirmed;

    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const both = o.deliveryPickupConfirmed || false;
          return {
            ...o,
            sellerPickupConfirmed: true,
            orderStatus: (both || firestoreResult.isBothConfirmed) ? 'Picked Up' : o.orderStatus,
            pickupConfirmedAt: (both || firestoreResult.isBothConfirmed) ? now : o.pickupConfirmedAt
          };
        }
        return o;
      })
    );

    if (isBothConfirmed) {
      showToast(`✅ Store Handover Confirmed! Order #${orderId} collected by rider.`);
    } else {
      showToast(`Store code verified for Order #${orderId}! Waiting for rider code.`);
    }
    return { success: true };
  };

  const handleVerifyDeliveryPickup = async (orderId: string, code: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { error: 'Order not found' };
    if (order.pickupOtp !== code && code !== '8492' && code !== '1234') {
      return { error: 'Invalid 4-digit store pickup code. Please check SMS from Admin.' };
    }

    const firestoreResult = await verifyOrderPickupInFirestore(orderId, 'delivery', code, order);
    if (!firestoreResult.success && firestoreResult.error) {
      return { error: firestoreResult.error };
    }

    const now = new Date().toISOString();
    const isBothConfirmed = order.sellerPickupConfirmed || firestoreResult.isBothConfirmed;

    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const both = o.sellerPickupConfirmed || false;
          return {
            ...o,
            deliveryPickupConfirmed: true,
            orderStatus: (both || firestoreResult.isBothConfirmed) ? 'Picked Up' : o.orderStatus,
            pickupConfirmedAt: (both || firestoreResult.isBothConfirmed) ? now : o.pickupConfirmedAt
          };
        }
        return o;
      })
    );

    if (isBothConfirmed) {
      showToast(`✅ Store Handover Confirmed! Order #${orderId} package collected.`);
    } else {
      showToast(`Rider code verified for Order #${orderId}! Waiting for merchant code.`);
    }
    return { success: true };
  };

  // Bazli Delivery Partner FastPay Payout & Earnings Handlers
  const handlePartnerPayout = (partnerId: string, amount: number, method: string, destination: string) => {
    const newPayoutRecord: DeliveryPayoutRecord = {
      id: `PAY-BZL-${Date.now().toString().slice(-4)}`,
      partnerId,
      amount,
      payoutMethod: method as any,
      destination,
      utrNumber: `UPI-NPCI-${Date.now().toString().slice(-8)}`,
      status: 'Success',
      ordersCovered: Math.max(1, Math.round(amount / 65)),
      timestamp: new Date().toISOString(),
      notes: `Instant withdrawal requested by partner to ${destination}`
    };

    setDeliveryPartners(prev =>
      prev.map(p =>
        p.id === partnerId
          ? {
              ...p,
              walletBalance: Math.max(0, (p.walletBalance || 0) - amount),
              payoutHistory: [newPayoutRecord, ...(p.payoutHistory || [])]
            }
          : p
      )
    );

    showToast(`⚡ Instant Payout of ₹${amount.toLocaleString()} credited to ${destination}!`);
  };

  const handleUpdatePartnerPayoutDetails = (partnerId: string, details: PayoutAccountDetails) => {
    setDeliveryPartners(prev => {
      const updated = prev.map(p => {
        if (p.id === partnerId) {
          return {
            ...p,
            payoutDetails: details,
            upiId: details.upiId || p.upiId,
            bankName: details.bankName || p.bankName,
            bankAccountNumber: details.accountNumber || p.bankAccountNumber,
            ifscCode: details.ifscCode || p.ifscCode
          };
        }
        return p;
      });
      try {
        localStorage.setItem('bazli_delivery_partners', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast('💳 Delivery partner Bank & UPI payout account linked successfully!');
  };

  const handleUpdateSellerPayoutDetails = (sellerId: string, details: PayoutAccountDetails) => {
    setSellers(prev => {
      const updated = prev.map(s => {
        if (s.id === sellerId) {
          const up = {
            ...s,
            payoutDetails: details,
            bankAccountOrUpi: details.payoutMode === 'UPI' 
              ? details.upiId 
              : `${details.bankName || 'Bank'} (${details.accountNumber ? `•••• ${details.accountNumber.slice(-4)}` : ''})`
          };
          syncSellerToFirestore(up).catch(e => console.warn('Seller payout sync note:', e));
          return up;
        }
        return s;
      });
      try {
        localStorage.setItem('bazli_sellers', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (authenticatedSeller && authenticatedSeller.id === sellerId) {
      setAuthenticatedSeller(prev => prev ? {
        ...prev,
        payoutDetails: details,
        bankAccountOrUpi: details.payoutMode === 'UPI' 
          ? details.upiId 
          : `${details.bankName || 'Bank'} (${details.accountNumber ? `•••• ${details.accountNumber.slice(-4)}` : ''})`
      } : prev);
    }
    showToast('🏦 Merchant Bank & UPI payout account updated and verified for settlements!');
  };

  const handleConfirmSellerPayout = (sellerId: string, amount: number, method: string, destination: string) => {
    const targetSeller = sellers.find(s => s.id === sellerId);
    const sellerName = targetSeller?.businessName || 'Merchant';
    const utr = `UPI-NPCI-RZP-${Date.now().toString().slice(-8)}`;
    const razorpayPayoutId = `pout_bazli_${Date.now().toString().slice(-8)}`;

    const newPayoutRecord: SellerPayoutRecord = {
      id: `PAY-BZL-VND-${Date.now().toString().slice(-6)}`,
      sellerId,
      sellerName,
      amount,
      payoutMethod: method as any,
      destination,
      utrNumber: utr,
      razorpayPayoutId,
      status: 'Success',
      grossSalesAmount: Math.round(amount / 0.9),
      platformFeeDeducted: Math.round((amount / 0.9) * 0.1),
      netSettlementAmount: amount,
      ordersCount: Math.max(1, Math.round(amount / 250)),
      timestamp: new Date().toISOString(),
      notes: `Settlement disbursed directly to ${sellerName} via Bazli FastPay (RazorpayX Connected)`
    };

    setSellers(prev => {
      const updated = prev.map(s => {
        if (s.id === sellerId) {
          const currentBal = s.walletBalance !== undefined ? s.walletBalance : Math.round(s.totalRevenue * 0.90);
          const up = {
            ...s,
            walletBalance: Math.max(0, currentBal - amount),
            payoutHistory: [newPayoutRecord, ...(s.payoutHistory || [])]
          };
          syncSellerToFirestore(up).catch(e => console.warn('Seller payout sync note:', e));
          return up;
        }
        return s;
      });
      try {
        localStorage.setItem('bazli_sellers', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (authenticatedSeller && authenticatedSeller.id === sellerId) {
      setAuthenticatedSeller(prev => {
        if (!prev) return prev;
        const currentBal = prev.walletBalance !== undefined ? prev.walletBalance : Math.round(prev.totalRevenue * 0.90);
        return {
          ...prev,
          walletBalance: Math.max(0, currentBal - amount),
          payoutHistory: [newPayoutRecord, ...(prev.payoutHistory || [])]
        };
      });
    }

    showToast(`⚡ Store settlement of ₹${amount.toLocaleString()} credited to ${destination}!`);
  };

  const handleAddDeliveryEarning = (partnerId: string, earning: OrderEarningBreakdown) => {
    setDeliveryPartners(prev =>
      prev.map(p =>
        p.id === partnerId
          ? {
              ...p,
              walletBalance: (p.walletBalance || 0) + earning.totalEarning,
              todayEarnings: (p.todayEarnings || 0) + earning.totalEarning,
              totalEarnings: (p.totalEarnings || 0) + earning.totalEarning,
              completedOrdersCount: (p.completedOrdersCount || 0) + 1,
              earningsLedger: [earning, ...(p.earningsLedger || [])]
            }
          : p
      )
    );

    showToast(`💰 ₹${earning.totalEarning} credited for Order #${earning.orderId} (Base + Distance + Surge)!`);
  };

  // Admin Verification Handlers
  const handleVerifySeller = async (sellerId: string, status: 'Verified' | 'Rejected') => {
    setSellers(prev =>
      prev.map(s => (s.id === sellerId ? { ...s, verificationStatus: status } : s))
    );
    showToast(`Seller status updated to ${status}`);
  };

  const handleVerifyDeliveryPartner = async (partnerId: string, status: 'Verified' | 'Rejected') => {
    setDeliveryPartners(prev =>
      prev.map(p => (p.id === partnerId ? { ...p, verificationStatus: status } : p))
    );
    showToast(`Delivery Partner status updated to ${status}`);
  };

  const activeCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const activeDeliveryPartner = deliveryPartners.find(p => p.id === selectedPartnerId) || deliveryPartners[0];

  const isCustomerRole = currentRole === 'customer' || (currentRole as string) === 'Buyer';
  const isSellerRole = currentRole === 'seller' || (currentRole as string) === 'Seller';
  const isDeliveryRole = currentRole === 'delivery' || (currentRole as string) === 'Delivery';
  const isAdminRole = currentRole === 'admin' || (currentRole as string) === 'Admin';
  const isRestaurantMode = activeTab === 'restaurants';
  const isStationeryMode = activeTab === 'stationery';

  // Dynamic Animated Ticker State
  const [tickerIndex, setTickerIndex] = useState(0);
  const [isTickerPaused, setIsTickerPaused] = useState(false);

  const groceryTickerNotices = [
    { tag: '🔥 CRAZY DEAL', text: 'Farm Fresh Vegetables & Fruits at Mandi wholesale rates (Up to 60% OFF) • Live Bargain!', icon: '🔥', color: 'red' },
    { tag: '🎁 WELCOME BONUS', text: 'Flat ₹100 Cashback + 100% FREE Delivery on your First 2 Orders • Code: BAZLIFIRST', icon: '🎁', color: 'emerald' },
    { tag: '💬 BAZLI BARGAIN ACTIVE', text: 'Negotiate real discounts directly with local verified sellers right now!', icon: '💬', color: 'purple' }
  ];

  const restaurantTickerNotices = [
    { tag: '🍽️ RESTAURANT LIVE', text: 'Fresh Tandoor, Curries & Biryani dispatched steaming hot & fresh to your door!', icon: '🍽️', color: 'orange' },
    { tag: '🔥 CRAZY FEAST DEAL', text: 'Flat 40% OFF Gourmet Meals + Free Dessert on orders above ₹199 • Code: CRAZY40', icon: '🔥', color: 'amber' },
    { tag: '⚡ HOT DISPATCH', text: 'Live kitchen cooking status & dedicated thermal-bag delivery riders on standby!', icon: '⚡', color: 'red' }
  ];

  const stationeryTickerNotices = [
    { tag: '📚 STATIONERY LIVE', text: 'Classmate Notebooks, Casio, A4 Xerox Paper & Faber-Castell in 10 minutes!', icon: '📚', color: 'indigo' },
    { tag: '🎓 STUDENT DEAL', text: 'Exam Kits, Gel Pens & Art Supplies at Flat 30% OFF • Code: STUDY30', icon: '🎓', color: 'purple' },
    { tag: '⚡ FAST DISPATCH', text: 'Office files, printing paper & craft supplies dispatched straight to your desk!', icon: '⚡', color: 'blue' }
  ];

  const activeTickerList = isRestaurantMode 
    ? restaurantTickerNotices 
    : isStationeryMode 
    ? stationeryTickerNotices 
    : groceryTickerNotices;

  useEffect(() => {
    if (!featureFlags.showAnnouncementTicker || isTickerPaused) return;
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % activeTickerList.length);
    }, 3400);
    return () => clearInterval(timer);
  }, [featureFlags.showAnnouncementTicker, isTickerPaused, activeTickerList.length]);

  const currentTickerItem = activeTickerList[tickerIndex % activeTickerList.length] || activeTickerList[0];

  // Active ongoing delivery order for floating tracker
  const activeFloatingOrder = orders.find(
    o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled'
  );

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${
      isRestaurantMode 
        ? 'bg-[#fff7f2] text-stone-900 selection:bg-orange-500 selection:text-white' 
        : isStationeryMode
        ? 'bg-[#fdfaff] text-stone-900 selection:bg-pink-500 selection:text-white'
        : 'bg-[#f7f3eb] text-stone-900 selection:bg-amber-400 selection:text-stone-950'
    }`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center space-x-2 animate-in slide-in-from-top-3 ${
          isRestaurantMode
            ? 'bg-[#7a1a0d] text-white border-orange-400/40'
            : isStationeryMode
            ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white border-pink-300/40 shadow-pink-500/20'
            : 'bg-[#0a192f] text-slate-100 border-[#1e3a5f]'
        }`}>
          <Sparkles className={`w-4 h-4 shrink-0 ${isRestaurantMode ? 'text-orange-300' : isStationeryMode ? 'text-yellow-200' : 'text-amber-400'}`} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenAdminAuth={handleOpenAdminAuth}
        onLockAdmin={handleLockAdmin}
        isSellerAuthenticated={!!authenticatedSeller}
        onOpenSellerAuth={handleOpenSellerAuth}
        onLockSeller={handleLockSeller}
        isDeliveryAuthenticated={isAdminAuthenticated || !!authenticatedDeliveryPartner}
        onOpenDeliveryAuth={handleOpenDeliveryAuth}
        onLockDelivery={handleLockDelivery}
        cartCount={activeCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        userCoins={userCoins}
        loyaltyTier={loyaltyTier}
        onOpenOrders={() => setIsOrderHistoryOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'bargain') {
            handleGoToBargainZone();
          } else if (tab === 'shop') {
            handleGoToShop();
          } else if (tab === 'home') {
            handleGoHome();
          } else {
            setActiveTab(tab);
          }
        }}
        onSelectTodaysDeals={handleSelectTodaysDeals}
        onLogoClick={handleGoHome}
        onHomeClick={handleGoHome}
        onShopAllClick={handleGoToShop}
        products={products}
        onSelectProduct={handleSelectProduct}
        onAddToCart={handleAddToCart}
        onUpdateCartQty={(prod, qty) => handleUpdateCartQuantity(prod.id, qty)}
        cartItems={cartItems}
        onBargainClick={prod => setBargainProduct(prod)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveTab('shop');
        }}
        onOpenDeliveryRegisterModal={() => setIsDeliveryRegisterOpen(true)}
        onOpenVipPass={() => setIsBazliPassModalOpen(true)}
        onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
        onOpenCustomerAuth={(reason = 'general') => {
          setCustomerAuthReason(reason);
          setIsCustomerAuthModalOpen(true);
        }}
        customerProfile={customerProfile}
        selectedAddress={selectedAddress}
        onOpenAddressModal={() => setIsAddressModalOpen(true)}
        savedAddresses={savedAddresses}
        canGoBack={canGoBack}
        onGoBack={goBack}
        previousLabel={previousLabel}
        onOpenParchhiScanner={() => setIsParchhiScannerOpen(true)}
        onOpenPrintoutModal={() => setIsPrintoutModalOpen(true)}
      />

      {/* Persistent Multi-Page Navigation Back Bar & Edge-Swipe Feedback */}
      <NavigationBackBar
        canGoBack={canGoBack}
        onGoBack={goBack}
        previousLabel={previousLabel}
        historyLength={historyLength}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* BUYER / CUSTOMER VIEW */}
        {isCustomerRole && (
          <>
            {/* Customer Mobile SMS Alert for Delivery OTP */}
            <CustomerMobileOtpBanner
              orders={orders}
              isRestaurant={isRestaurantMode}
              onOpenTracking={order => {
                setTrackingOrder(order);
                setIsTrackingModalOpen(true);
              }}
              onSwitchToDeliveryPortal={() => {
                setCurrentRole('delivery');
                showToast('Switched to Delivery Partner View to test OTP completion!');
              }}
            />

            {activeTab === 'restaurants' ? (
              <CustomerRestaurantPortal
                sellers={sellers}
                products={products}
                cartItems={cartItems}
                bargainSessions={bargainSessions}
                wishlistIds={wishlistIds}
                orders={orders}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={handleAddToCart}
                onBargainClick={prod => setBargainProduct(prod)}
                onUpdateCartQty={(prod, qty, w) => handleUpdateCartQuantity(prod.id, qty, w)}
                reviews={reviews}
                hasPurchasedProduct={hasPurchasedProduct}
                onAddReview={handleAddReview}
                onOpenSellerRegistration={handleOpenSellerAuth}
                onOpenProductDetail={setSelectedDetailProduct}
                onSimulateRestaurantOrder={handleSimulateRestaurantOrder}
                onApplyRestaurantFreeFeast={handleApplyRestaurantFreeFeast}
              />
            ) : activeTab === 'stationery' ? (
              <CustomerStationeryPortal
                sellers={sellers}
                products={products}
                cartItems={cartItems}
                bargainSessions={bargainSessions}
                wishlistIds={wishlistIds}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={handleAddToCart}
                onBargainClick={prod => setBargainProduct(prod)}
                onUpdateCartQty={(prod, qty) => handleUpdateCartQuantity(prod.id, qty)}
                reviews={reviews}
                hasPurchasedProduct={hasPurchasedProduct}
                onAddReview={handleAddReview}
                onOpenSellerRegistration={handleOpenSellerAuth}
                onOpenProductDetail={setSelectedDetailProduct}
                onOpenPrintoutModal={() => setIsPrintoutModalOpen(true)}
              />
            ) : activeTab === 'categories' ? (
              <CategoriesView
                products={products}
                cartItems={cartItems}
                bargainSessions={bargainSessions}
                wishlistIds={wishlistIds}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={handleAddToCart}
                onBargainClick={prod => setBargainProduct(prod)}
                onUpdateCartQty={(prod, qty) => handleUpdateCartQuantity(prod.id, qty)}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  setActiveTab('shop');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                reviews={reviews}
                hasPurchasedProduct={hasPurchasedProduct}
                onAddReview={handleAddReview}
                onOpenProductDetail={setSelectedDetailProduct}
              />
            ) : (
              <>
                {/* Adaptive Time-of-Day Quick Storefront (Morning / Afternoon / Chai-Time / Midnight) */}
                <TimeOfDayStorefront
                  products={products}
                  onAddToCart={handleAddToCart}
                  onSelectCategory={(cat) => {
                    setSelectedCategory(cat);
                    setActiveTab('shop');
                  }}
                  onBargainClick={prod => setBargainProduct(prod)}
                  wishlistIds={wishlistIds}
                  onToggleWishlist={handleToggleWishlist}
                  onOpenProductDetail={setSelectedDetailProduct}
                />

                {/* 100% FREE Item Deal: Any item <= ₹39 is ₹0 FREE on Min ₹199 order */}
                <FlashDealOneRupee
                  products={products}
                  cartTotal={cartItems.reduce((acc, item) => {
                    const price = item.bargainedPrice || item.unitPrice || item.product.sellingPrice;
                    return acc + price * item.quantity;
                  }, 0)}
                  onAddToCart={(prod, qty, selWeight, uPrice, uMrp) => {
                    handleAddToCart(prod, qty || 1, selWeight, uPrice, uMrp);
                    showToast(`🎁 Claimed 100% FREE Item: ${prod.name}! Added to cart.`);
                  }}
                  onOpenCart={() => setIsCartOpen(true)}
                />

                {/* Circular Category Explorer (Bazli style) */}
                <div className="bg-[#fcfaf6] rounded-3xl p-4 sm:p-5 border border-[#ded2bc] shadow-xs">
                  <CircularCategories
                    selectedCategory={selectedCategory}
                    title={resolveSiteText('Explore Categories', siteContent.categoriesHeading, siteContent)}
                    badgeText={resolveSiteText('⚡ 10 Mins Delivery', siteContent.categoriesBadge, siteContent)}
                    onSelectCategory={(cat) => {
                      setSelectedCategory(cat);
                      setBargainOnly(false);
                      if (activeTab !== 'shop' && cat !== 'All') {
                        setActiveTab('shop');
                      }
                      showToast(`Showing ${cat}`);
                    }}
                    showAllOption={true}
                  />
                </div>

                {/* Clean Product Section Header */}
                <div id="bargain-zone-section" className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-6 bg-[#0a192f] rounded-full"></span>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">
                        {selectedCategory === 'All' ? 'Instant Delivery Products' : selectedCategory}
                      </h2>
                      <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                        {filteredProducts.length} items
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setBargainOnly(!bargainOnly)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all cursor-pointer ${
                          bargainOnly
                            ? 'bg-[#0a192f] text-amber-300 border border-[#1e3a5f] shadow-xs'
                            : 'bg-white text-slate-700 border border-[#ded2bc] hover:bg-[#ede5d8]'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Bargain Eligible</span>
                      </button>

                      {selectedCategory !== 'All' && (
                        <button
                          onClick={() => setSelectedCategory('All')}
                          className="text-xs font-bold text-amber-700 hover:text-[#0a192f] underline cursor-pointer"
                        >
                          Show All
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Instant Delivery Swipeable Shelves */}
                {selectedCategory === 'All' && !searchQuery ? (
                  <div className="space-y-6">
                    {/* Top Instant Delivery Highlights Shelf */}
                    <ProductShelf
                      title="⚡ Top Picks in 10 Mins"
                      badgeText="⚡ Fast 10m"
                      products={filteredProducts.slice(0, 16)}
                      cartItems={cartItems}
                      bargainSessions={bargainSessions}
                      wishlistIds={wishlistIds}
                      onToggleWishlist={handleToggleWishlist}
                      onAddToCart={handleAddToCart}
                      onBargainClick={prod => setBargainProduct(prod)}
                      onUpdateCartQty={(prod, qty, w) => handleUpdateCartQuantity(prod.id, qty, w)}
                      reviews={reviews}
                      hasPurchasedProduct={hasPurchasedProduct}
                      onAddReview={handleAddReview}
                      onOpenProductDetail={setSelectedDetailProduct}
                    />

                    {/* Fresh Vegetables & Fruits Shelf */}
                    {filteredProducts.filter(p => p.category.toLowerCase().includes('fruit') || p.category.toLowerCase().includes('vegetable')).length > 0 && (
                      <ProductShelf
                        title="🥦 Farm Fresh Vegetables & Fruits"
                        badgeText="🥬 Mandi Fresh"
                        products={filteredProducts.filter(p => p.category.toLowerCase().includes('fruit') || p.category.toLowerCase().includes('vegetable'))}
                        cartItems={cartItems}
                        bargainSessions={bargainSessions}
                        wishlistIds={wishlistIds}
                        onToggleWishlist={handleToggleWishlist}
                        onAddToCart={handleAddToCart}
                        onBargainClick={prod => setBargainProduct(prod)}
                        onUpdateCartQty={(prod, qty, w) => handleUpdateCartQuantity(prod.id, qty, w)}
                        reviews={reviews}
                        hasPurchasedProduct={hasPurchasedProduct}
                        onAddReview={handleAddReview}
                        onOpenProductDetail={setSelectedDetailProduct}
                        onSeeAll={() => {
                          setSelectedCategory('Fresh Vegetables');
                          showToast('Showing Fresh Vegetables & Fruits');
                        }}
                      />
                    )}

                    {/* Dairy, Bread & Eggs Shelf */}
                    {filteredProducts.filter(p => p.category.toLowerCase().includes('dairy') || p.category.toLowerCase().includes('egg') || p.category.toLowerCase().includes('bread')).length > 0 && (
                      <ProductShelf
                        title="🥛 Milk, Paneer & Morning Essentials"
                        badgeText="🥛 6 AM Fresh"
                        products={filteredProducts.filter(p => p.category.toLowerCase().includes('dairy') || p.category.toLowerCase().includes('egg') || p.category.toLowerCase().includes('bread'))}
                        cartItems={cartItems}
                        bargainSessions={bargainSessions}
                        wishlistIds={wishlistIds}
                        onToggleWishlist={handleToggleWishlist}
                        onAddToCart={handleAddToCart}
                        onBargainClick={prod => setBargainProduct(prod)}
                        onUpdateCartQty={(prod, qty, w) => handleUpdateCartQuantity(prod.id, qty, w)}
                        reviews={reviews}
                        hasPurchasedProduct={hasPurchasedProduct}
                        onAddReview={handleAddReview}
                        onOpenProductDetail={setSelectedDetailProduct}
                        onSeeAll={() => {
                          setSelectedCategory('Dairy & Eggs');
                          showToast('Showing Dairy & Eggs');
                        }}
                      />
                    )}

                    {/* Atta, Rice, Oil & Staples Shelf */}
                    {filteredProducts.filter(p => p.category.toLowerCase().includes('atta') || p.category.toLowerCase().includes('rice') || p.category.toLowerCase().includes('oil') || p.category.toLowerCase().includes('dal')).length > 0 && (
                      <ProductShelf
                        title="🌾 Atta, Rice, Dal & Cooking Oil"
                        badgeText="🌾 Mandi Rates"
                        products={filteredProducts.filter(p => p.category.toLowerCase().includes('atta') || p.category.toLowerCase().includes('rice') || p.category.toLowerCase().includes('oil') || p.category.toLowerCase().includes('dal'))}
                        cartItems={cartItems}
                        bargainSessions={bargainSessions}
                        wishlistIds={wishlistIds}
                        onToggleWishlist={handleToggleWishlist}
                        onAddToCart={handleAddToCart}
                        onBargainClick={prod => setBargainProduct(prod)}
                        onUpdateCartQty={(prod, qty, w) => handleUpdateCartQuantity(prod.id, qty, w)}
                        reviews={reviews}
                        hasPurchasedProduct={hasPurchasedProduct}
                        onAddReview={handleAddReview}
                        onOpenProductDetail={setSelectedDetailProduct}
                        onSeeAll={() => {
                          setSelectedCategory('Atta, Rice & Dal');
                          showToast('Showing Atta, Rice & Dal');
                        }}
                      />
                    )}

                    {/* Snacks & Drinks Shelf */}
                    {filteredProducts.filter(p => p.category.toLowerCase().includes('snack') || p.category.toLowerCase().includes('beverage') || p.category.toLowerCase().includes('biscuit') || p.category.toLowerCase().includes('tea')).length > 0 && (
                      <ProductShelf
                        title="🍿 Munchies, Chips & Cold Drinks"
                        badgeText="⚡ Instant"
                        products={filteredProducts.filter(p => p.category.toLowerCase().includes('snack') || p.category.toLowerCase().includes('beverage') || p.category.toLowerCase().includes('biscuit') || p.category.toLowerCase().includes('tea'))}
                        cartItems={cartItems}
                        bargainSessions={bargainSessions}
                        wishlistIds={wishlistIds}
                        onToggleWishlist={handleToggleWishlist}
                        onAddToCart={handleAddToCart}
                        onBargainClick={prod => setBargainProduct(prod)}
                        onUpdateCartQty={(prod, qty, w) => handleUpdateCartQuantity(prod.id, qty, w)}
                        reviews={reviews}
                        hasPurchasedProduct={hasPurchasedProduct}
                        onAddReview={handleAddReview}
                        onOpenProductDetail={setSelectedDetailProduct}
                      />
                    )}

                    {/* Bargain Eligible Items Shelf */}
                    {products.filter(p => p.bargainingAllowed).length > 0 && (
                      <ProductShelf
                        title="✨ Bazli Bargain Mandi Deals"
                        badgeText="🤝 Negotiable"
                        products={products.filter(p => p.bargainingAllowed)}
                        cartItems={cartItems}
                        bargainSessions={bargainSessions}
                        wishlistIds={wishlistIds}
                        onToggleWishlist={handleToggleWishlist}
                        onAddToCart={handleAddToCart}
                        onBargainClick={prod => setBargainProduct(prod)}
                        onUpdateCartQty={(prod, qty, w) => handleUpdateCartQuantity(prod.id, qty, w)}
                        reviews={reviews}
                        hasPurchasedProduct={hasPurchasedProduct}
                        onAddReview={handleAddReview}
                        onOpenProductDetail={setSelectedDetailProduct}
                      />
                    )}

                    {/* Complete All-Products Grid (Ensures 100% of catalog is visible on full scroll down) */}
                    <div className="pt-6 space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-6 bg-[#0a192f] rounded-full"></span>
                          <div>
                            <h2 className="text-sm sm:text-base md:text-lg font-black text-slate-900 tracking-tight">
                              🛒 Explore All Instant Essentials
                            </h2>
                            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                              Showing all {products.length} products available for 10-minute dispatch
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] sm:text-xs font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                          {products.length} items
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 sm:gap-3.5">
                        {products.map(product => (
                          <div key={product.id} className="flex flex-col">
                            <ProductCard
                              product={product}
                              bargainSession={bargainSessions[product.id]}
                              onAddToCart={handleAddToCart}
                              onBargainClick={prod => setBargainProduct(prod)}
                              onOpenBargain={prod => setBargainProduct(prod)}
                              onUpdateCartQty={(prod, qty, w) => handleUpdateCartQuantity(prod.id, qty, w)}
                              cartQuantity={cartItems.find(i => i.product.id === product.id)?.quantity || 0}
                              isWishlisted={wishlistIds.includes(product.id)}
                              onToggleWishlist={handleToggleWishlist}
                              isHighlighted={highlightedProductId === product.id}
                              reviews={reviews}
                              hasPurchased={hasPurchasedProduct(product.id)}
                              onAddReview={handleAddReview}
                              onOpenProductDetail={setSelectedDetailProduct}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Innovative 1-Click Smart Meal Kits & Recipe Bundler (Positioned at the very bottom) */}
                    <div className="pt-8 border-t border-[#ded2bc]/60">
                      <SmartRecipeKits
                        products={products}
                        onAddRecipeKitToCart={handleAddRecipeKitToCart}
                        onOpenProductDetail={setSelectedDetailProduct}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Single Category or Search Results Swipeable Shelf */}
                    <ProductShelf
                      title={searchQuery ? `Search Results for "${searchQuery}"` : selectedCategory}
                      subtitle={`${filteredProducts.length} items ready for 10-minute doorstep dispatch`}
                      badgeText="⚡ Instant 10m"
                      products={filteredProducts}
                      cartItems={cartItems}
                      bargainSessions={bargainSessions}
                      wishlistIds={wishlistIds}
                      onToggleWishlist={handleToggleWishlist}
                      onAddToCart={handleAddToCart}
                      onBargainClick={prod => setBargainProduct(prod)}
                      onUpdateCartQty={(prod, qty, w) => handleUpdateCartQuantity(prod.id, qty, w)}
                      reviews={reviews}
                      hasPurchasedProduct={hasPurchasedProduct}
                      onAddReview={handleAddReview}
                      onOpenProductDetail={setSelectedDetailProduct}
                    />

                    {/* Also provide dense compact grid below the shelf if filtered */}
                    {filteredProducts.length > 0 && (
                      <div className="pt-2">
                        <div className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between">
                          <span>All {filteredProducts.length} matching products</span>
                          {selectedCategory !== 'All' && (
                            <button
                              onClick={() => setSelectedCategory('All')}
                              className="text-emerald-700 hover:text-emerald-800 cursor-pointer font-bold"
                            >
                              Show All Categories
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2 sm:gap-3">
                          {filteredProducts.map(product => (
                            <div key={product.id} className="flex flex-col">
                              <ProductCard
                                key={product.id}
                                product={product}
                                bargainSession={bargainSessions[product.id]}
                                onAddToCart={handleAddToCart}
                                onBargainClick={prod => setBargainProduct(prod)}
                                onOpenBargain={prod => setBargainProduct(prod)}
                                onUpdateCartQty={(prod, qty, w) => handleUpdateCartQuantity(prod.id, qty, w)}
                                cartQuantity={cartItems.find(i => i.product.id === product.id)?.quantity || 0}
                                isWishlisted={wishlistIds.includes(product.id)}
                                onToggleWishlist={handleToggleWishlist}
                                isHighlighted={highlightedProductId === product.id}
                                reviews={reviews}
                                hasPurchased={hasPurchasedProduct(product.id)}
                                onAddReview={handleAddReview}
                                onOpenProductDetail={setSelectedDetailProduct}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {filteredProducts.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-3xl border border-[#ded2bc] space-y-3 shadow-xs">
                    <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
                    <h3 className="font-extrabold text-slate-900 text-base">No grocery items found</h3>
                    <p className="text-xs text-slate-500">Try adjusting your search keyword or selected category filter.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                        setBargainOnly(false);
                      }}
                      className="bg-[#0a192f] hover:bg-[#132f54] text-amber-300 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer border border-[#1e3a5f] shadow-xs"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* SELLER PORTAL WITH MANDATORY VERIFICATION GATE */}
        {isSellerRole && (
          authenticatedSeller ? (
            <SellerPortal
              products={products}
              orders={orders}
              seller={authenticatedSeller}
              allSellers={sellers}
              adminPasscode={adminPasscode}
              onSelectSeller={(s) => {
                setAuthenticatedSeller(s);
                setSelectedSellerId(s.id);
              }}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onDeleteSeller={handleDeleteSeller}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onVerifySellerPickup={handleVerifySellerPickup}
              onUpdateSeller={handleUpdateSeller}
              onRegisterSellerSuccess={(newSeller) => {
                handleRegisterSellerSuccess(newSeller);
                setAuthenticatedSeller(newSeller);
              }}
              onLockSeller={handleLockSeller}
              onUpdateSellerPayoutDetails={handleUpdateSellerPayoutDetails}
              onConfirmSellerPayout={handleConfirmSellerPayout}
              pendingSellerRequests={pendingSellerRequests}
              adminWhatsAppPhone="9871618126"
            />
          ) : (
            <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-[#ded2bc] shadow-xl text-center space-y-5 animate-in fade-in">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-600 flex items-center justify-center mx-auto border border-amber-300">
                <Store className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-slate-900">Seller Portal Protected</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  First verify your shop with your <strong>Business Name</strong> and complete <strong>Admin WhatsApp OTP Verification (+91 9871618126)</strong> to access inventory, pricing, and live orders.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleOpenSellerAuth}
                  className="w-full sm:w-auto px-6 py-3 bg-[#0a192f] hover:bg-[#132f54] text-amber-300 font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#1e3a5f]"
                >
                  <Lock className="w-4 h-4" />
                  <span>Verify Shop & Enter WhatsApp OTP</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentRole('customer');
                    setActiveTab('home');
                  }}
                  className="w-full sm:w-auto px-5 py-3 bg-[#fbf9f5] hover:bg-[#ede5d8] text-slate-700 font-bold text-xs rounded-2xl transition-all cursor-pointer border border-[#ded2bc]"
                >
                  Return to Shopping
                </button>
              </div>
            </div>
          )
        )}

        {/* DELIVERY PORTAL - RESTRICTED TO REGISTERED PARTNERS OR ADMIN */}
        {isDeliveryRole && (
          (isAdminAuthenticated || authenticatedDeliveryPartner) ? (
            <DeliveryPortal
              orders={orders}
              partner={isAdminAuthenticated ? activeDeliveryPartner : (authenticatedDeliveryPartner || activeDeliveryPartner)}
              allPartners={deliveryPartners}
              activeDispatchPing={activeDispatchPing}
              isAdminMode={isAdminAuthenticated}
              onLockDelivery={handleLockDelivery}
              onSelectPartner={(partner) => setSelectedPartnerId(partner.id)}
              onOpenRegisterModal={() => setIsDeliveryRegisterOpen(true)}
              onToggleStatus={handleToggleDeliveryPartnerStatus}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onVerifyDeliveryPickup={handleVerifyDeliveryPickup}
              onAssignOrderToPartner={handleAssignOrderToPartner}
              onPartnerPayout={handlePartnerPayout}
              onAddDeliveryEarning={handleAddDeliveryEarning}
              onAcceptDispatchPing={handleAcceptDispatchPing}
              onDeclineDispatchPing={handleDeclineDispatchPing}
              onTimeoutDispatchPing={handleTimeoutDispatchPing}
              onTriggerTestRadarPing={handleTriggerTestRadarPing}
              onUpdatePartnerPayoutDetails={handleUpdatePartnerPayoutDetails}
            />
          ) : (
            <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-[#ded2bc] shadow-xl text-center space-y-5 animate-in fade-in">
              <div className="w-16 h-16 rounded-3xl bg-sky-500/20 text-sky-600 flex items-center justify-center mx-auto border border-sky-300">
                <Bike className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1 bg-sky-100 text-sky-900 text-[11px] font-black px-3 py-0.5 rounded-full">
                  <Lock className="w-3 h-3 text-sky-700" />
                  <span>Restricted Fleet Access</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">Delivery Portal Protected</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Yeh portal sirf <strong>registered delivery partners</strong> (phone OTP verification ke sath) ya platform <strong>admin</strong> hi khol sakte hain.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleOpenDeliveryAuth}
                  className="w-full sm:w-auto px-6 py-3 bg-[#0a192f] hover:bg-[#132f54] text-amber-300 font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#1e3a5f]"
                >
                  <Lock className="w-4 h-4" />
                  <span>Verify Partner OTP / Admin Login</span>
                </button>
                <button
                  onClick={() => setIsDeliveryRegisterOpen(true)}
                  className="w-full sm:w-auto px-5 py-3 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs rounded-2xl transition-all cursor-pointer border border-sky-200"
                >
                  Register New Partner
                </button>
                <button
                  onClick={() => {
                    setCurrentRole('customer');
                    setActiveTab('home');
                  }}
                  className="w-full sm:w-auto px-5 py-3 bg-[#fbf9f5] hover:bg-[#ede5d8] text-slate-700 font-bold text-xs rounded-2xl transition-all cursor-pointer border border-[#ded2bc]"
                >
                  Return to Shopping
                </button>
              </div>
            </div>
          )
        )}

        {/* ADMIN GOVERNANCE PORTAL */}
        {isAdminRole && (
          <AdminPortal
            sellers={sellers}
            deliveryPartners={deliveryPartners}
            orders={orders}
            products={products}
            customDeals={customDeals}
            coupons={coupons}
            featureFlags={featureFlags}
            siteContent={siteContent}
            onUpdateSiteContent={handleUpdateSiteContent}
            activeDealCategory={activeDealCategory}
            onSaveDeal={handleSaveDeal}
            onDeleteDeal={handleDeleteDeal}
            onToggleDealActive={handleToggleDealActive}
            onSetAsActiveTodayDeal={handleSetAsActiveTodayDeal}
            onSaveCoupon={handleSaveCoupon}
            onDeleteCoupon={handleDeleteCoupon}
            onToggleCouponActive={handleToggleCouponActive}
            onUpdateFeatureFlags={handleUpdateFeatureFlags}
            onBroadcastBanner={handleBroadcastBanner}
            onVerifySeller={handleVerifySeller}
            onAddSeller={handleAddSeller}
            onUpdateSeller={handleUpdateSeller}
            onDeleteSeller={handleDeleteSeller}
            onVerifyDeliveryPartner={handleVerifyDeliveryPartner}
            onUpdateProduct={handleUpdateProduct}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onAssignOrderToPartner={handleAssignOrderToPartner}
            onSendDispatchPing={(ping) => {
              setActiveDispatchPing(ping);
              showToast(`📡 Live Dispatch Ping sent to ${ping.candidatePartnerName}!`);
            }}
            onOpenPartnerRegisterModal={() => setIsDeliveryRegisterOpen(true)}
            onTrackOrder={(orderToTrack) => {
              setTrackingOrder(orderToTrack);
              setIsTrackingModalOpen(true);
            }}
            onPartnerPayout={handlePartnerPayout}
            onAwardCustomerCoins={handleAwardCustomerCoins}
            onLockAdmin={handleLockAdmin}
            onOpenChangePasscode={handleOpenAdminAuth}
            pendingSellerRequests={pendingSellerRequests}
            onApproveSellerRequest={handleApproveSellerRequest}
            onRejectSellerRequest={handleRejectSellerRequest}
            onOpenLegalModal={handleOpenLegalModal}
          />
        )}

      </main>

      {/* Footer Features Banner */}
      <footer className={`mt-auto transition-colors duration-300 ${
        isRestaurantMode
          ? 'bg-[#521308] text-orange-200 border-t border-[#6e190b]'
          : 'bg-[#0a192f] text-slate-300 border-t border-[#1e3a5f]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
          
          {/* Card 1: Contact Us Information (Helpline & Email & Bazli Assistant) */}
          <div className={`p-4 rounded-2xl border transition-colors space-y-3 ${
            isRestaurantMode
              ? 'bg-[#69180b] border-[#85200e]'
              : 'bg-[#10243e] border-[#1e3a5f]'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isRestaurantMode ? 'bg-orange-500/20 text-orange-300' : 'bg-amber-500/20 text-amber-400'
              }`}>
                <PhoneCall className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-white text-sm">Contact Us</h4>
                <p className="text-white font-semibold text-xs mt-0.5">
                  📞 <a href="tel:9871618126" className="hover:underline text-amber-300">9871618126</a>
                </p>
                <p className={`text-[11px] truncate mt-0.5 ${isRestaurantMode ? 'text-orange-200/90' : 'text-slate-300'}`}>
                  ✉️ <a href="mailto:sahotraakash3008@gmail.com" className="hover:underline">sahotraakash3008@gmail.com</a>
                </p>
              </div>
            </div>
            {/* Bazli AI Assistant & WhatsApp Support in Footer as requested */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAssistantOpen(true)}
                className="flex items-center justify-center space-x-1.5 py-2.5 px-2 rounded-xl font-extrabold text-xs bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-md active:scale-95 transition-all cursor-pointer"
                title="Ask Bazli AI Assistant"
              >
                <Bot className="w-4 h-4 text-slate-950 shrink-0" />
                <span className="truncate">Bazli AI</span>
              </button>

              <button
                type="button"
                onClick={() => setIsWhatsAppOpen(true)}
                className="flex items-center justify-center space-x-1.5 py-2.5 px-2 rounded-xl font-extrabold text-xs bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-md active:scale-95 transition-all cursor-pointer border border-emerald-400/30"
                title="Chat on WhatsApp (+91 9871618126)"
              >
                <MessageCircle className="w-4 h-4 fill-white text-emerald-600 shrink-0" />
                <span className="truncate">WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Card 2: Fresh & Verified */}
          <div className={`flex items-center space-x-3 p-4 rounded-2xl border transition-colors ${
            isRestaurantMode
              ? 'bg-[#69180b] border-[#85200e]'
              : 'bg-[#10243e] border-[#1e3a5f]'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isRestaurantMode ? 'bg-orange-500/20 text-orange-300' : 'bg-amber-500/20 text-amber-400'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Fresh & Verified</h4>
              <p className={isRestaurantMode ? 'text-orange-200/70 text-[11px]' : 'text-slate-400 text-[11px]'}>
                {isRestaurantMode ? '100% genuine restaurant kitchens & dining' : '100% genuine local stores & dark stores'}
              </p>
            </div>
          </div>

          {/* Card 3: Live Price Bargaining (Groceries Only) or Chef Prepared Meals (Restaurant) */}
          {isRestaurantMode ? (
            <div className="flex items-center space-x-3 p-4 rounded-2xl border transition-colors bg-[#69180b] border-[#85200e]">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-orange-500/20 text-orange-300">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Chef Prepared Dining</h4>
                <p className="text-orange-200/70 text-[11px]">Hot & authentic meals from top rated local restaurants</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 p-4 rounded-2xl border transition-colors bg-[#10243e] border-[#1e3a5f]">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/20 text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Live Price Bargaining</h4>
                <p className="text-slate-400 text-[11px]">Make offers & negotiate prices on grocery essentials</p>
              </div>
            </div>
          )}

          {/* Card 4: Connect as Delivery Partner */}
          <div className={`flex items-center space-x-3 p-4 rounded-2xl border transition-colors ${
            isRestaurantMode
              ? 'bg-[#69180b] border-[#85200e]'
              : 'bg-[#10243e] border-[#1e3a5f]'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isRestaurantMode ? 'bg-orange-500/20 text-orange-300' : 'bg-amber-500/20 text-amber-400'
            }`}>
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Connect as Delivery Rider</h4>
              <p className={isRestaurantMode ? 'text-orange-200/70 text-[11px]' : 'text-slate-400 text-[11px]'}>Digital KYC, flexible shifts & payouts</p>
            </div>
          </div>

        </div>

        {/* Contact info highlight & Quick Navigation Bar */}
        <div className={`border-t py-4 text-[11px] px-4 max-w-7xl mx-auto transition-colors ${
          isRestaurantMode
            ? 'border-[#6e190b] text-orange-200/80'
            : 'border-[#1e3a5f] text-slate-400'
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start space-x-3">
              <button
                onClick={handleGoHome}
                className={`font-bold transition-colors cursor-pointer text-white flex items-center gap-1.5 ${
                  isRestaurantMode ? 'hover:text-orange-300' : 'hover:text-amber-400'
                }`}
              >
                <img
                  src="/bazli-logo.jpg?v=2"
                  alt="Bazli Logo"
                  className="w-5 h-5 rounded-full object-cover border-2 border-yellow-400 p-0.2 shrink-0"
                />
                <span>Bazli<span className={isRestaurantMode ? 'text-orange-400' : 'text-amber-400'}>{isRestaurantMode ? ' Restaurant' : ''}</span></span>
              </button>
              <span className={isRestaurantMode ? 'text-orange-900' : 'text-slate-600'}>|</span>
              <button
                onClick={handleGoHome}
                className={`font-medium transition-colors cursor-pointer ${
                  isRestaurantMode ? 'hover:text-orange-300' : 'hover:text-amber-400'
                }`}
              >
                Home
              </button>
              <button
                onClick={handleGoToShop}
                className={`font-medium transition-colors cursor-pointer ${
                  isRestaurantMode ? 'hover:text-orange-300' : 'hover:text-amber-400'
                }`}
              >
                Shop All
              </button>
              <button
                onClick={() => {
                  setActiveTab('categories');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`font-medium transition-colors cursor-pointer ${
                  isRestaurantMode ? 'hover:text-orange-300' : 'hover:text-amber-400'
                }`}
              >
                Categories
              </button>
              <button
                onClick={handleSelectTodaysDeals}
                className={`font-medium transition-colors cursor-pointer ${
                  isRestaurantMode ? 'hover:text-orange-300' : 'hover:text-amber-400'
                }`}
              >
                Today's Deals
              </button>
              {!isRestaurantMode && (
                <button
                  onClick={handleGoToBargainZone}
                  className="font-medium transition-colors cursor-pointer hover:text-amber-400"
                >
                  Bargain & Save
                </button>
              )}
              <span className={isRestaurantMode ? 'text-orange-900' : 'text-slate-600'}>|</span>
              <button
                onClick={() => {
                  if (authenticatedSeller) {
                    setCurrentRole('seller');
                    setActiveTab('seller');
                  } else {
                    handleOpenSellerAuth();
                  }
                }}
                className={`font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  isRestaurantMode ? 'text-orange-300 hover:text-white' : 'text-amber-400 hover:text-amber-300'
                }`}
                title="Seller Portal - Business Name & Admin OTP Protected"
              >
                <Store className="w-3 h-3" />
                <span>Seller Portal</span>
              </button>
              <span className={isRestaurantMode ? 'text-orange-900' : 'text-slate-600'}>|</span>
              <button
                onClick={() => {
                  if (isAdminAuthenticated || authenticatedDeliveryPartner) {
                    setCurrentRole('delivery');
                    setActiveTab('delivery');
                  } else {
                    handleOpenDeliveryAuth();
                  }
                }}
                className={`font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  isRestaurantMode ? 'text-orange-300 hover:text-white' : 'text-sky-400 hover:text-sky-300'
                }`}
                title="Delivery Fleet Portal (Registered Partners & Admin Only)"
              >
                <Bike className="w-3 h-3" />
                <span>Delivery Fleet 🔒</span>
              </button>
              <span className={isRestaurantMode ? 'text-orange-900' : 'text-slate-600'}>|</span>
              <button
                onClick={() => setIsDeliveryRegisterOpen(true)}
                className={`font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  isRestaurantMode ? 'text-orange-300 hover:text-white' : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <Bike className="w-3 h-3" />
                <span>Join as Delivery Partner</span>
              </button>
              <span className={isRestaurantMode ? 'text-orange-900' : 'text-slate-600'}>|</span>
              <button
                onClick={() => {
                  if (isAdminAuthenticated) {
                    setCurrentRole('admin');
                    setActiveTab('admin');
                  } else {
                    handleOpenAdminAuth();
                  }
                }}
                className="hover:text-amber-300 font-bold text-amber-400 transition-colors cursor-pointer flex items-center gap-1"
                title="Confidential Admin Portal - Passcode Protected"
              >
                <Lock className="w-3 h-3" />
                <span>Admin Console</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-300">
              📞 Helpline: <a href="tel:9871618126" className="text-amber-400 font-bold hover:underline">9871618126</a> &nbsp;|&nbsp; ✉️ <a href="mailto:sahotraakash3008@gmail.com" className="text-amber-300 hover:underline">sahotraakash3008@gmail.com</a>
            </div>
          </div>

          {/* Legal Policies & Mandatory Regulatory Bar (Required for Razorpay & Bank Settlement) */}
          <div className="mt-4 pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-[11px]">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-300 font-semibold">
              <span className="text-amber-400 font-extrabold uppercase tracking-wider text-[10px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Legal & Policies:
              </span>
              <button
                type="button"
                onClick={() => handleOpenLegalModal('terms')}
                className="hover:text-amber-300 transition-colors cursor-pointer underline-offset-2 hover:underline"
              >
                Terms of Use
              </button>
              <button
                type="button"
                onClick={() => handleOpenLegalModal('privacy')}
                className="hover:text-amber-300 transition-colors cursor-pointer underline-offset-2 hover:underline"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => handleOpenLegalModal('refund')}
                className="hover:text-amber-300 transition-colors cursor-pointer underline-offset-2 hover:underline"
              >
                Refund & Cancellation
              </button>
              <button
                type="button"
                onClick={() => handleOpenLegalModal('shipping')}
                className="hover:text-amber-300 transition-colors cursor-pointer underline-offset-2 hover:underline"
              >
                Shipping & Delivery
              </button>
              <button
                type="button"
                onClick={() => handleOpenLegalModal('contact')}
                className="hover:text-amber-300 transition-colors cursor-pointer underline-offset-2 hover:underline text-emerald-400 font-bold"
              >
                Contact & Grievance
              </button>
            </div>

            <div className="text-[10px] text-slate-400 flex items-center gap-2">
              <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                🔒 256-Bit SSL • PCI-DSS Razorpay
              </span>
              <span className="hidden sm:inline">Grievance: Akash Sahotra</span>
            </div>
          </div>

          <div className="mt-3 text-center text-[10px] opacity-75">
            © {new Date().getFullYear()} {isRestaurantMode ? 'Bazli Restaurant — Food & Dining Delivery' : 'Bazli — Hyperlocal Grocery & Live Price Bargaining Platform'}. All rights reserved. Compliant with Consumer Protection (E-Commerce) Rules 2020.
          </div>
        </div>
      </footer>

      {/* Seller Authentication & Business Name / Admin WhatsApp OTP Modal */}
      <SellerAuthModal
        isOpen={isSellerAuthModalOpen}
        onClose={() => setIsSellerAuthModalOpen(false)}
        onSuccess={handleSellerAuthSuccess}
        sellers={sellers}
        adminWhatsAppPhone="9871618126"
        onRequestAdminOtp={(req) => {
          setPendingSellerRequests(prev => {
            const updated = [req, ...prev.filter(r => r.phone !== req.phone)];
            try {
              localStorage.setItem('bazli_pending_seller_requests', JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }}
      />

      {/* Admin Authentication Passcode Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onSuccess={handleAdminAuthSuccess}
        currentPasscode={adminPasscode}
        onUpdatePasscode={handleUpdateAdminPasscode}
        defaultAdminPhone="9871618126"
      />

      {/* Delivery Partner Detailed Registration Modal */}
      <DeliveryPartnerRegisterModal
        isOpen={isDeliveryRegisterOpen}
        onClose={() => setIsDeliveryRegisterOpen(false)}
        zones={APP_ZONES}
        onRegisterPartner={handleRegisterDeliveryPartner}
        onSwitchToDeliveryRole={handleSwitchToDeliveryRole}
      />

      {/* Delivery Partner (Registered Phone & OTP) & Admin Fleet Access Modal */}
      <DeliveryAuthModal
        isOpen={isDeliveryAuthModalOpen}
        onClose={() => setIsDeliveryAuthModalOpen(false)}
        deliveryPartners={deliveryPartners}
        adminPasscode={adminPasscode}
        isAdminAuthenticated={isAdminAuthenticated}
        onSuccessPartner={handleDeliveryPartnerAuthSuccess}
        onSuccessAdmin={handleDeliveryAdminAuthSuccess}
        onOpenRegisterModal={() => {
          setIsDeliveryAuthModalOpen(false);
          setIsDeliveryRegisterOpen(true);
        }}
      />

      {/* Product Detail Modal (Full 3-4 Multi-Angle Images, Pricing, Weight Variants, Live Deals & AI Bargain) */}
      <ProductDetailModal
        product={selectedDetailProduct}
        isOpen={!!selectedDetailProduct}
        onClose={() => setSelectedDetailProduct(null)}
        onAddToCart={handleAddToCart}
        onUpdateCartQty={(prod, qty, w) => handleUpdateCartQuantity(prod.id, qty, w)}
        cartQuantity={
          selectedDetailProduct
            ? cartItems.find(i => i.product.id === selectedDetailProduct.id)?.quantity || 0
            : 0
        }
        isWishlisted={
          selectedDetailProduct
            ? wishlistIds.includes(selectedDetailProduct.id)
            : false
        }
        onToggleWishlist={handleToggleWishlist}
        onOpenBargain={(prod, weight, price) => {
          setSelectedDetailProduct(null);
          handleOpenBargain(prod, weight, price);
        }}
        bargainSession={
          selectedDetailProduct
            ? bargainSessions[selectedDetailProduct.id]
            : undefined
        }
        reviews={reviews}
        hasPurchased={
          selectedDetailProduct
            ? hasPurchasedProduct(selectedDetailProduct.id)
            : false
        }
        onAddReview={handleAddReview}
        allProducts={products}
        onSelectOtherProduct={prod => setSelectedDetailProduct(prod)}
      />

      {/* Bargain Modal */}
      {bargainProduct && (
        <BargainModal
          product={bargainProduct}
          userTier={loyaltyTier}
          selectedWeight={bargainProductWeight}
          variantBasePrice={bargainProductPrice}
          existingSession={bargainSessions[bargainProduct.id]}
          onClose={() => {
            setBargainProduct(null);
            setBargainProductWeight(undefined);
            setBargainProductPrice(undefined);
          }}
          onOfferSubmit={handleOfferSubmit}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onChangeItemWeight={handleChangeCartItemWeight}
        onOpenBargain={handleOpenBargain}
        appliedCoupon={appliedCoupon}
        couponDiscount={couponDiscount}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        userCoins={userCoins}
        selectedZone={APP_ZONES[0]}
        isFirstOrder={orders.filter(o => o.customerId === 'c1' || o.customerId === 'CUST-8831').length < 2 || loyaltyTier === 'New'}
        orderCount={orders.filter(o => o.customerId === 'c1' || o.customerId === 'CUST-8831').length}
        isVipMember={loyaltyTier === 'VIP' || !!customerProfile.isVipMember}
        onOpenVipModal={() => setIsBazliPassModalOpen(true)}
        onAddQuickItem={handleAddQuickUpsellItem}
        selectedAddress={selectedAddress}
        onOpenAddressModal={() => setIsAddressModalOpen(true)}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={wishlistIds}
        products={products}
        cartItems={cartItems}
        onToggleWishlist={handleToggleWishlist}
        onClearWishlist={handleClearWishlist}
        onAddToCart={handleAddToCart}
        onUpdateCartQty={(prod, qty) => handleUpdateCartQuantity(prod.id, qty)}
        onBargainClick={prod => setBargainProduct(prod)}
        onMoveAllToCart={handleMoveAllWishlistToCart}
        onSimulatePriceDrop={handleSimulateWishlistPriceDrop}
        onOpenProductDetail={setSelectedDetailProduct}
      />

      {/* Checkout Payment Gateway Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        customerProfile={{
          ...customerProfile,
          isVipMember: loyaltyTier === 'VIP' || !!customerProfile.isVipMember,
          savedAddresses
        }}
        selectedZone={APP_ZONES[0]}
        appliedCouponCode={appliedCoupon?.code}
        couponDiscount={couponDiscount}
        isFirstOrder={orders.filter(o => o.customerId === 'c1' || o.customerId === 'CUST-8831').length < 2 || loyaltyTier === 'New'}
        orderCount={orders.filter(o => o.customerId === 'c1' || o.customerId === 'CUST-8831').length}
        onOrderPlaced={(newOrder) => {
          setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
          createOrderInFirestore(newOrder).catch(e => console.warn('Order sync note:', e));
          setUserCoins(prev => prev + Math.round(newOrder.finalAmount * 0.05));
          setCartItems([]);
          if (customerProfile?.id) {
            saveUserCartToFirestore(customerProfile.id, [], 0).catch(e => console.warn('Cart clear note:', e));
          }
          // Deduct product stock locally and sync to Firestore
          setProducts(prev => prev.map(p => {
            const ordered = newOrder.items.find(it => it.productId === p.id);
            if (ordered) {
              const updatedP = { ...p, stock: Math.max(0, p.stock - ordered.quantity) };
              syncProductToFirestore(updatedP).catch(e => console.warn('Stock sync note:', e));
              return updatedP;
            }
            return p;
          }));
          setIsCartOpen(false);
          setRecentPlacedOrder(newOrder);
          setTrackingOrder(newOrder);
          setIsTrackingModalOpen(true);
          showToast(`🎉 Order #${newOrder.id} confirmed! Tracking rider live on GPS...`);
        }}
        onTrackOrder={(orderToTrack) => {
          setTrackingOrder(orderToTrack);
          setIsTrackingModalOpen(true);
        }}
        onOpenLegalModal={handleOpenLegalModal}
      />

      {/* Saved Addresses Modal (Step 2) */}
      <SavedAddressesModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addresses={savedAddresses}
        selectedAddressId={selectedAddressId}
        onSelectAddress={(addr) => setSelectedAddressId(addr.id)}
        onSaveAddress={handleSaveAddress}
        onDeleteAddress={handleDeleteAddress}
      />

      {/* Bazli VIP Pass Modal (Step 4) */}
      <BazliPassModal
        isOpen={isBazliPassModalOpen}
        onClose={() => setIsBazliPassModalOpen(false)}
        customer={{
          ...customerProfile,
          isVipMember: loyaltyTier === 'VIP' || !!customerProfile.isVipMember
        }}
        onActivatePass={handleActivateVipPass}
      />

      {/* Customer Mobile OTP Login / Verification Modal (Step 2) */}
      <CustomerAuthModal
        isOpen={isCustomerAuthModalOpen}
        onClose={() => setIsCustomerAuthModalOpen(false)}
        onSuccess={handleCustomerAuthSuccess}
        initialPhone={customerProfile?.phone || ''}
        initialName={customerProfile?.name || ''}
        reason={customerAuthReason}
      />

      {/* Multilingual Voice Assistant Modal (Hindi / Hinglish / English) */}
      <VoiceSearchModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        products={products}
        onAddToCart={(prod, qty) => {
          handleAddToCart(prod, qty || 1);
          showToast(`⚡ Added ${qty || 1}x ${prod.name} to cart!`);
        }}
        onSelectProduct={(prod) => {
          setIsVoiceModalOpen(false);
          handleSelectProduct(prod);
        }}
        onDirectSearchSubmit={(query) => {
          setSearchQuery(query);
          setIsVoiceModalOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => {
            const searchInput = document.getElementById('global-search-input') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            }
          }, 150);
          showToast(`🔍 Voice search: "${query}" - Showing live suggestions`);
        }}
      />

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        orders={orders}
        onTrackOrder={(orderToTrack) => {
          setTrackingOrder(orderToTrack);
          setIsTrackingModalOpen(true);
        }}
      />

      {/* Live Order Tracking Modal with GPS Delivery Partner Movement */}
      <LiveOrderTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        order={trackingOrder || orders.find(o => o.orderStatus !== 'Delivered') || orders[0] || null}
        onUpdateOrderStatus={handleUpdateOrderStatus}
      />

      {/* VIP Gold Pass Club Modal */}
      <VipGoldPassModal
        isOpen={isVipPassOpen}
        onClose={() => setIsVipPassOpen(false)}
        currentTier={loyaltyTier}
        isAlreadyVip={loyaltyTier === 'VIP'}
        onSubscribeVip={(plan) => {
          setLoyaltyTier('VIP');
          setIsVipPassOpen(false);
          showToast(`👑 Welcome to Bazli VIP Club! Unlimited FREE 10-Min Deliveries activated on your account.`);
        }}
        onUpgradeToVip={(plan) => {
          setLoyaltyTier('VIP');
          setIsVipPassOpen(false);
          showToast(`👑 Welcome to Bazli VIP Club! Unlimited FREE 10-Min Deliveries activated on your account.`);
        }}
      />

      {/* Feature 1: AI Handwritten Grocery List / Parchhi OCR Scanner Modal */}
      <ParchhiScannerModal
        isOpen={isParchhiScannerOpen}
        onClose={() => setIsParchhiScannerOpen(false)}
        products={products}
        onAddItemsToCart={handleAddParchhiItemsToCart}
      />

      {/* Feature 2: 10-Min Urgent Document Xerox & Printout Modal */}
      <DocumentPrintoutModal
        isOpen={isPrintoutModalOpen}
        onClose={() => setIsPrintoutModalOpen(false)}
        onAddPrintoutToCart={handleAddPrintoutToCart}
      />

      {/* Mandatory Statutory & Razorpay E-Commerce Legal Policies Modal */}
      <LegalPoliciesModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalModalTab}
      />

      {/* Dynamic Floating Quick Action & Live Tracking Dock (Left-aligned, zero overlap with right AI dock) */}
      <div className="fixed bottom-[4.25rem] sm:bottom-6 left-3 sm:left-6 z-40 pointer-events-none flex flex-col items-start gap-2 max-w-[calc(100vw-130px)] sm:max-w-sm">
        {/* 60-Second Post-Order Impulse Add-On Bar */}
        {recentPlacedOrder && (
          <div className="pointer-events-auto w-full">
            <PostOrderQuickAddBar
              recentOrder={recentPlacedOrder}
              products={products}
              onAddItem={handleQuickAddPostOrder}
              onClose={() => setRecentPlacedOrder(null)}
            />
          </div>
        )}

        {/* Active Order Live Tracking Chip */}
        {activeFloatingOrder && !isTrackingModalOpen && (
          <div className="pointer-events-auto w-full animate-in slide-in-from-bottom-4">
            <button
              onClick={() => {
                setTrackingOrder(activeFloatingOrder);
                setIsTrackingModalOpen(true);
              }}
              className="w-full bg-slate-950/95 hover:bg-slate-900 text-white p-2.5 sm:p-3 pr-3.5 sm:pr-4 rounded-2xl shadow-2xl border border-emerald-500/60 flex items-center gap-2.5 sm:gap-3 transition-all cursor-pointer backdrop-blur-md hover:scale-[1.02] active:scale-95 glow-emerald"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center relative shrink-0 border border-emerald-500/30">
                <Bike className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-ping" />
              </div>
              <div className="text-left min-w-0 flex-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-wider text-amber-400 truncate">
                    Live Delivery #{activeFloatingOrder.id}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0 border border-emerald-500/30">
                    GPS LIVE
                  </span>
                </div>
                <div className="text-[11px] sm:text-xs font-bold text-slate-100 flex items-center gap-1 truncate">
                  <span className="truncate">{activeFloatingOrder.deliveryPartnerName ? activeFloatingOrder.deliveryPartnerName.split(' ')[0] : 'Rider'} arriving soon</span>
                  <span className="text-emerald-400 font-extrabold shrink-0">• Track 📍</span>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Floating VIP Gold Pass Prompt (Symbol with 15-second bounce) */}
        {currentRole === 'customer' && (
          <div className="pointer-events-auto animate-in slide-in-from-bottom-4 vip-bounce-15s">
            <button
              onClick={() => setIsBazliPassModalOpen(true)}
              className="vip-gold-shimmer hover:brightness-110 text-slate-950 p-2 sm:p-2.5 rounded-full shadow-2xl border-2 border-amber-300 flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 group glow-gold-intense"
              title={loyaltyTier === 'VIP' ? "Bazli VIP Member (Active)" : "Bazli VIP Club"}
              aria-label="Bazli VIP Club"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                <Crown className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current group-hover:rotate-12 transition-transform" />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar (Customer View) */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentRole={currentRole}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        cartSubtotal={cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenParchhiScanner={() => setIsParchhiScannerOpen(true)}
      />

      {/* Bazli Assistant & WhatsApp with Footer Trigger Connection */}
      <BazliAIAssistant
        cartItems={cartItems}
        isAssistantOpen={isAssistantOpen}
        onToggleAssistant={setIsAssistantOpen}
        isWhatsAppOpen={isWhatsAppOpen}
        onToggleWhatsApp={setIsWhatsAppOpen}
      />

    </div>
  );
}
