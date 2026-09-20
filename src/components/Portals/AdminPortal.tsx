import React, { useState, useMemo, useEffect } from 'react';
import { Seller, DeliveryPartner, Order, Product, CustomerProfile, OrderStatus, SellerRegistrationRequest, CustomDeal, Coupon, AppFeatureFlags } from '../../types';
import { getEffectiveSellerCommission } from '../../utils/sellerCommission';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Store,
  Truck,
  BarChart3,
  Users,
  DollarSign,
  ArrowUpRight,
  Scale,
  UserPlus,
  IdCard,
  CreditCard,
  Phone,
  MapPin,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Plus,
  Settings,
  Zap,
  TrendingUp,
  Package,
  Bike,
  Sparkles,
  Coins,
  AlertTriangle,
  RefreshCw,
  Eye,
  Sliders,
  Navigation,
  CloudRain,
  Megaphone,
  Gift,
  Building2,
  Trash2,
  Clock,
  Layers,
  MessageSquare,
  Copy,
  Send,
  KeyRound,
  Percent,
  Flame,
  Ticket,
  UtensilsCrossed,
  ShoppingBag,
  ChefHat,
  Radio,
  Type,
  RotateCcw,
  Star,
  Award,
  Heart,
  ThumbsUp,
  BookOpen
} from 'lucide-react';
import {
  isGroceryProduct,
  isRestaurantProduct,
  isStationeryProduct,
  getProductSector,
  ProductSector,
  isGrocerySeller,
  isRestaurantSeller,
  isStationerySeller,
  isGroceryOrder,
  isRestaurantOrder,
  isStationeryOrder
} from '../../utils/productSector';
import { AdminAddSellerModal } from '../Admin/AdminAddSellerModal';
import { AdminEditSellerModal } from '../Admin/AdminEditSellerModal';
import { AdminPartnerKycModal } from '../Admin/AdminPartnerKycModal';
import { AdminOrderDetailModal } from '../Admin/AdminOrderDetailModal';
import { AdminAddProductModal } from '../Admin/AdminAddProductModal';
import { AdminEditProductModal } from '../Admin/AdminEditProductModal';
import { AdminCustomerCoinsModal } from '../Admin/AdminCustomerCoinsModal';
import { AdminBroadcastModal } from '../Admin/AdminBroadcastModal';
import { AdminDealsAndOffersTab } from '../Admin/AdminDealsAndOffersTab';
import { AdminFeaturesTab } from '../Admin/AdminFeaturesTab';
import { AdminPaymentGatewayTab } from '../Admin/AdminPaymentGatewayTab';
import { AdminAddDealModal } from '../Admin/AdminAddDealModal';
import { AdminAddCouponModal } from '../Admin/AdminAddCouponModal';
import { AdminFleetRadarMatrix } from '../Admin/AdminFleetRadarMatrix';
import { AdminSiteContentCMS } from '../Admin/AdminSiteContentCMS';
import { AdminRevenueGrowthSuite } from '../Admin/AdminRevenueGrowthSuite';
import { DispatchPingPayload, SiteContentConfig } from '../../types';
import { DEFAULT_SITE_CONTENT } from '../../data/initialData';

interface AdminPortalProps {
  sellers: Seller[];
  deliveryPartners: DeliveryPartner[];
  orders: Order[];
  products: Product[];
  customDeals?: CustomDeal[];
  coupons?: Coupon[];
  featureFlags?: AppFeatureFlags;
  siteContent?: SiteContentConfig;
  activeDealCategory?: string;
  onVerifySeller: (sellerId: string, status: 'Verified' | 'Rejected') => Promise<void>;
  onAddSeller?: (sellerData: Partial<Seller>) => Promise<void>;
  onUpdateSeller?: (sellerId: string, updates: Partial<Seller>) => Promise<void>;
  onDeleteSeller?: (sellerId: string) => Promise<void> | void;
  onVerifyDeliveryPartner: (partnerId: string, status: 'Verified' | 'Rejected') => Promise<void>;
  onUpdateProduct?: (productId: string, updates: Partial<Product>) => Promise<void>;
  onAddProduct?: (productData: Partial<Product>) => Promise<void>;
  onDeleteProduct?: (productId: string) => Promise<void>;
  onUpdateOrderStatus?: (orderId: string, status: string, otp?: string) => Promise<{ error?: string } | void>;
  onAssignOrderToPartner?: (orderId: string, partnerId: string, partnerName: string) => void;
  onSendDispatchPing?: (ping: DispatchPingPayload) => void;
  onOpenPartnerRegisterModal?: () => void;
  onTrackOrder?: (order: Order) => void;
  onPartnerPayout?: (partnerId: string, amount: number, method: string, destination: string) => void;
  onAwardCustomerCoins?: (amount: number, reason: string) => void;
  onLockAdmin?: () => void;
  onOpenChangePasscode?: () => void;
  pendingSellerRequests?: SellerRegistrationRequest[];
  onApproveSellerRequest?: (req: SellerRegistrationRequest) => void;
  onRejectSellerRequest?: (requestId: string) => void;
  onSaveDeal?: (deal: Partial<CustomDeal>) => Promise<void> | void;
  onDeleteDeal?: (dealId: string) => Promise<void> | void;
  onToggleDealActive?: (dealId: string) => Promise<void> | void;
  onSetAsActiveTodayDeal?: (deal: CustomDeal) => Promise<void> | void;
  onSaveCoupon?: (coupon: Coupon) => Promise<void> | void;
  onDeleteCoupon?: (couponCode: string) => Promise<void> | void;
  onToggleCouponActive?: (couponCode: string) => Promise<void> | void;
  onUpdateFeatureFlags?: (flags: Partial<AppFeatureFlags>) => Promise<void> | void;
  onBroadcastBanner?: (msg: string) => Promise<void> | void;
  onUpdateSiteContent?: (newContent: SiteContentConfig) => void;
  onOpenLegalModal?: (tab?: 'terms' | 'privacy' | 'refund' | 'shipping' | 'contact') => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  sellers,
  deliveryPartners,
  orders,
  products,
  customDeals = [],
  coupons = [],
  featureFlags = {
    enableAiBargaining: true,
    enableMandiWeights: true,
    enableExpressDelivery: true,
    enableRainSurge: false,
    enableCustomerCoins: true,
    enableSellerRegistration: true,
    enableDeliveryPartnerRegistration: true,
    enableDailyDealsCarousel: true,
    enableLiveOrderTracking: true,
    bargainBotMode: 'Balanced',
    freeDeliveryThreshold: 129,
    standardDeliveryFee: 19,
    platformFee: 0,
    monsoonSurgeFee: 25,
    nightShiftFee: 15,
    customerCoinCashbackPercent: 5,
    adminCommissionRate: 10,
    announcementTickerText: '🎉 Mega Savings: Flat ₹50 OFF on orders above ₹499 with code BAZLI50 + 10-Minute Delivery!',
    showAnnouncementTicker: true
  },
  activeDealCategory,
  siteContent = DEFAULT_SITE_CONTENT,
  onVerifySeller,
  onAddSeller,
  onUpdateSeller,
  onDeleteSeller,
  onVerifyDeliveryPartner,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onAssignOrderToPartner,
  onOpenPartnerRegisterModal,
  onTrackOrder,
  onPartnerPayout,
  onAwardCustomerCoins,
  onLockAdmin,
  onOpenChangePasscode,
  pendingSellerRequests = [],
  onApproveSellerRequest,
  onRejectSellerRequest,
  onSaveDeal,
  onDeleteDeal,
  onToggleDealActive,
  onSetAsActiveTodayDeal,
  onSaveCoupon,
  onDeleteCoupon,
  onToggleCouponActive,
  onUpdateFeatureFlags,
  onBroadcastBanner,
  onSendDispatchPing,
  onUpdateSiteContent,
  onOpenLegalModal
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'overview' | 'content' | 'sellers' | 'delivery' | 'orders' | 'products' | 'deals' | 'features' | 'customers' | 'settings' | 'payments' | 'ratings'
  >('overview');
  const [deliverySubView, setDeliverySubView] = useState<'radar' | 'roster'>('radar');

  // Search & Filter States
  const [ratingSearch, setRatingSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'All' | '5-Stars' | '4-Stars' | 'Critical'>('All');
  
  const [sellerSearch, setSellerSearch] = useState('');
  const [sellerStatusFilter, setSellerStatusFilter] = useState<'All' | 'Verified' | 'Pending' | 'Rejected'>('All');
  
  const [partnerSearch, setPartnerSearch] = useState('');
  const [partnerStatusFilter, setPartnerStatusFilter] = useState<'All' | 'On Duty' | 'Available' | 'Offline'>('All');
  const [partnerKycFilter, setPartnerKycFilter] = useState<'All' | 'Verified' | 'Pending' | 'Rejected'>('All');

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');

  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('All');
  const [productPolicyFilter, setProductPolicyFilter] = useState<'All' | 'Returnable' | 'Non-Returnable' | 'Exchange-Only' | 'Replacement-Only'>('All');
  const [productRefundFilter, setProductRefundFilter] = useState<'All' | 'Full-Refund' | 'No-Refund' | 'Store-Credit-Only' | 'Replacement-Only'>('All');
  const [bulkBargainPct, setBulkBargainPct] = useState<number>(20);
  const [bulkDiscountPct, setBulkDiscountPct] = useState<number>(0);
  const [isApplyingBulkDiscount, setIsApplyingBulkDiscount] = useState<boolean>(false);
  const [bulkReturnPolicy, setBulkReturnPolicy] = useState<'Returnable' | 'Non-Returnable' | 'Exchange-Only' | 'Replacement-Only'>('Returnable');
  const [bulkRefundPolicy, setBulkRefundPolicy] = useState<'Full-Refund' | 'No-Refund' | 'Store-Credit-Only' | 'Replacement-Only'>('Full-Refund');
  const [bulkReturnDays, setBulkReturnDays] = useState<number>(2);
  const [isApplyingBulkPolicy, setIsApplyingBulkPolicy] = useState<boolean>(false);

  // Modals Active State
  const [isAddSellerOpen, setIsAddSellerOpen] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [inspectingPartner, setInspectingPartner] = useState<DeliveryPartner | null>(null);
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCoinsModalOpen, setIsCoinsModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  // Deals & Coupons Modals State
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<CustomDeal | null>(null);
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Live Platform Config & Hyperlocal State
  const [rainSurgeActive, setRainSurgeActive] = useState<boolean>(featureFlags?.enableRainSurge || false);
  const [commissionRate, setCommissionRate] = useState<number>(featureFlags?.adminCommissionRate || 10.0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(featureFlags?.freeDeliveryThreshold ?? 129);
  const [standardDeliveryFee, setStandardDeliveryFee] = useState<number>(featureFlags?.standardDeliveryFee ?? 19);
  const [platformFee, setPlatformFee] = useState<number>(featureFlags?.platformFee ?? 0);
  const [bargainBotMode, setBargainBotMode] = useState<'Generous' | 'Balanced' | 'Strict'>(featureFlags?.bargainBotMode || 'Balanced');
  const [liveConfigSavedNotice, setLiveConfigSavedNotice] = useState<boolean>(false);
  const [confirmDeleteSellerId, setConfirmDeleteSellerId] = useState<string | null>(null);
  const [copiedOtpId, setCopiedOtpId] = useState<string | null>(null);
  const [isUpdatingBulkBargain, setIsUpdatingBulkBargain] = useState<boolean>(false);
  const [bulkBargainNotice, setBulkBargainNotice] = useState<string | null>(null);

  useEffect(() => {
    if (featureFlags) {
      if (featureFlags.freeDeliveryThreshold !== undefined) setFreeDeliveryThreshold(featureFlags.freeDeliveryThreshold);
      if (featureFlags.standardDeliveryFee !== undefined) setStandardDeliveryFee(featureFlags.standardDeliveryFee);
      if (featureFlags.platformFee !== undefined) setPlatformFee(featureFlags.platformFee);
      if (featureFlags.adminCommissionRate !== undefined) setCommissionRate(featureFlags.adminCommissionRate);
      if (featureFlags.bargainBotMode !== undefined) setBargainBotMode(featureFlags.bargainBotMode);
      if (featureFlags.enableRainSurge !== undefined) setRainSurgeActive(featureFlags.enableRainSurge);
    }
  }, [featureFlags]);

  const handleSaveOverviewLiveConfig = () => {
    if (onUpdateFeatureFlags) {
      onUpdateFeatureFlags({
        freeDeliveryThreshold,
        standardDeliveryFee,
        platformFee,
        adminCommissionRate: commissionRate,
        bargainBotMode,
        enableRainSurge: rainSurgeActive
      });
    }
    setLiveConfigSavedNotice(true);
    setTimeout(() => setLiveConfigSavedNotice(false), 2500);
  };
  const [broadcastAlert, setBroadcastAlert] = useState<string | null>(null);
  const [productOriginFilter, setProductOriginFilter] = useState<'All' | 'Admin' | 'Seller'>('All');
  const [sellerSectorFilter, setSellerSectorFilter] = useState<'All' | 'grocery' | 'restaurant' | 'stationery'>('All');
  const [orderSectorFilter, setOrderSectorFilter] = useState<'All' | 'grocery' | 'restaurant' | 'stationery'>('All');
  const [productSectorFilter, setProductSectorFilter] = useState<'All' | 'grocery' | 'restaurant' | 'stationery'>('All');

  // Mock CRM Customers
  const [mockCustomers, setMockCustomers] = useState<CustomerProfile[]>([
    {
      id: 'c1',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+91 98765 43210',
      loyaltyLevel: 'Gold',
      totalOrders: 18,
      totalSpending: 8450,
      savedAddresses: [
        { id: 'a1', title: 'Home', street: 'Flat 402, Sunshine Heights', city: 'Mumbai', pincode: '400050', isDefault: true }
      ]
    },
    {
      id: 'c2',
      name: 'Pooja Verma',
      email: 'pooja.verma@example.com',
      phone: '+91 98112 34567',
      loyaltyLevel: 'VIP',
      totalOrders: 32,
      totalSpending: 16900,
      savedAddresses: [
        { id: 'a2', title: 'Home', street: 'Villa 12, Green Meadows', city: 'Mumbai', pincode: '400053', isDefault: true }
      ]
    },
    {
      id: 'c3',
      name: 'Amit Patel',
      email: 'amit.patel@example.com',
      phone: '+91 97234 56789',
      loyaltyLevel: 'Silver',
      totalOrders: 9,
      totalSpending: 3820,
      savedAddresses: [
        { id: 'a3', title: 'Flat', street: 'B-201, River View Towers', city: 'Mumbai', pincode: '400051', isDefault: true }
      ]
    },
    {
      id: 'c4',
      name: 'Sneha Kulkarni',
      email: 'sneha.k@example.com',
      phone: '+91 99880 12345',
      loyaltyLevel: 'Bronze',
      totalOrders: 4,
      totalSpending: 1420,
      savedAddresses: [
        { id: 'a4', title: 'Apartment', street: '702, Maple Woods', city: 'Mumbai', pincode: '400058', isDefault: true }
      ]
    }
  ]);

  // Aggregate Metrics & Admin Direct Store vs Connected Seller Separation
  const adminStore = sellers.find(s => s.isAdminStore || s.id === 's-admin');
  const adminStoreProducts = products.filter(p => p.isAdminStoreProduct || p.sellerId === 's-admin' || p.sellerId === adminStore?.id);
  const sellerDirectProducts = products.filter(p => !p.isAdminStoreProduct && p.sellerId !== 's-admin' && p.sellerId !== adminStore?.id);

  const totalGMV = orders.reduce((sum, o) => sum + o.finalAmount, 0);
  const totalBargainSavings = orders.reduce((sum, o) => sum + (o.bargainDiscount || 0), 0);

  // Sector-specific metric separation
  const grocerySellers = useMemo(() => sellers.filter(isGrocerySeller), [sellers]);
  const restaurantSellers = useMemo(() => sellers.filter(isRestaurantSeller), [sellers]);

  const groceryOrders = useMemo(() => orders.filter(isGroceryOrder), [orders]);
  const restaurantOrders = useMemo(() => orders.filter(isRestaurantOrder), [orders]);

  const groceryGMV = useMemo(() => groceryOrders.reduce((sum, o) => sum + o.finalAmount, 0), [groceryOrders]);
  const restaurantGMV = useMemo(() => restaurantOrders.reduce((sum, o) => sum + o.finalAmount, 0), [restaurantOrders]);

  const groceryProducts = useMemo(() => products.filter(isGroceryProduct), [products]);
  const restaurantProducts = useMemo(() => products.filter(isRestaurantProduct), [products]);

  const adminStoreOrders = orders.filter(o => o.isAdminStoreOrder || o.sellerId === 's-admin' || o.sellerId === adminStore?.id);
  const connectedSellerOrders = orders.filter(o => !o.isAdminStoreOrder && o.sellerId !== 's-admin' && o.sellerId !== adminStore?.id);

  const adminStoreGMV = adminStoreOrders.reduce((sum, o) => sum + o.finalAmount, 0);
  const connectedSellerGMV = connectedSellerOrders.reduce((sum, o) => sum + o.finalAmount, 0);

  // 10% platform commission on connected seller orders
  const connectedSellerCommission = Math.round((connectedSellerGMV * commissionRate) / 100);
  // Total Admin Account Revenue = 100% of admin direct store sales + 10% commission from connected merchants
  const totalAdminAccountRevenue = adminStoreGMV + connectedSellerCommission;
  const netMerchantSettlement = connectedSellerGMV - connectedSellerCommission;

  const platformRevenue = totalAdminAccountRevenue;
  const pendingSellers = sellers.filter(s => s.verificationStatus === 'Pending');
  const pendingPartners = deliveryPartners.filter(d => d.verificationStatus === 'Pending');
  const activeFleetCount = deliveryPartners.filter(d => d.currentStatus === 'On Duty' || d.currentStatus === 'Delivering').length;
  const unassignedOrders = orders.filter(o => o.orderStatus === 'Confirmed' && !o.deliveryPartnerId);

  // Customer Experience & Performance Ratings Metrics
  const ratedOrders = useMemo(() => orders.filter(o => o.review), [orders]);
  const deliveredOrders = useMemo(() => orders.filter(o => o.orderStatus === 'Delivered'), [orders]);

  const avgShoppingRating = useMemo(() => {
    if (ratedOrders.length === 0) return 5.0;
    const total = ratedOrders.reduce((sum, o) => sum + (o.review?.orderRating || 5), 0);
    return Number((total / ratedOrders.length).toFixed(1));
  }, [ratedOrders]);

  const avgDeliveryRating = useMemo(() => {
    if (ratedOrders.length === 0) return 5.0;
    const total = ratedOrders.reduce((sum, o) => sum + (o.review?.riderRating || 5), 0);
    return Number((total / ratedOrders.length).toFixed(1));
  }, [ratedOrders]);

  const overallAvgRating = useMemo(() => {
    if (ratedOrders.length === 0) return 5.0;
    return Number(((avgShoppingRating + avgDeliveryRating) / 2).toFixed(1));
  }, [avgShoppingRating, avgDeliveryRating]);

  // Star Distribution
  const starDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratedOrders.forEach(o => {
      const r = Math.round(o.review?.orderRating || 5);
      if (dist[r as keyof typeof dist] !== undefined) {
        dist[r as keyof typeof dist]++;
      }
    });
    return dist;
  }, [ratedOrders]);

  // Customer Compliment Tags tally
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ratedOrders.forEach(o => {
      o.review?.tags?.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [ratedOrders]);

  // Total Tips Rewarded
  const totalCustomerTips = useMemo(() => {
    return ratedOrders.reduce((sum, o) => sum + (o.review?.addedTip || 0), 0);
  }, [ratedOrders]);

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    return ratedOrders.filter(o => {
      const rev = o.review;
      if (!rev) return false;
      const matchesSearch =
        o.id.toLowerCase().includes(ratingSearch.toLowerCase()) ||
        rev.customerName.toLowerCase().includes(ratingSearch.toLowerCase()) ||
        (o.deliveryPartnerName && o.deliveryPartnerName.toLowerCase().includes(ratingSearch.toLowerCase())) ||
        (rev.orderFeedback && rev.orderFeedback.toLowerCase().includes(ratingSearch.toLowerCase()));

      let matchesFilter = true;
      if (ratingFilter === '5-Stars') {
        matchesFilter = rev.orderRating === 5 && rev.riderRating === 5;
      } else if (ratingFilter === '4-Stars') {
        matchesFilter = (rev.orderRating === 4 || rev.riderRating === 4) && rev.orderRating >= 4 && rev.riderRating >= 4;
      } else if (ratingFilter === 'Critical') {
        matchesFilter = rev.orderRating <= 3 || rev.riderRating <= 3;
      }
      return matchesSearch && matchesFilter;
    });
  }, [ratedOrders, ratingSearch, ratingFilter]);

  // Filtered Sellers
  const filteredSellers = useMemo(() => {
    return sellers.filter(s => {
      const matchesSector =
        sellerSectorFilter === 'All' ||
        (sellerSectorFilter === 'grocery' && isGrocerySeller(s)) ||
        (sellerSectorFilter === 'restaurant' && isRestaurantSeller(s)) ||
        (sellerSectorFilter === 'stationery' && isStationerySeller(s));
      const matchesSearch =
        s.businessName.toLowerCase().includes(sellerSearch.toLowerCase()) ||
        s.ownerName.toLowerCase().includes(sellerSearch.toLowerCase()) ||
        s.phone.includes(sellerSearch) ||
        (s.cuisineSpecialties && s.cuisineSpecialties.some(c => c.toLowerCase().includes(sellerSearch.toLowerCase())));
      const matchesStatus = sellerStatusFilter === 'All' || s.verificationStatus === sellerStatusFilter;
      return matchesSector && matchesSearch && matchesStatus;
    });
  }, [sellers, sellerSearch, sellerStatusFilter, sellerSectorFilter]);

  // Filtered Partners
  const filteredPartners = useMemo(() => {
    return deliveryPartners.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(partnerSearch.toLowerCase()) ||
        p.phone.includes(partnerSearch) ||
        p.id.toLowerCase().includes(partnerSearch.toLowerCase());
      const matchesStatus = partnerStatusFilter === 'All' || p.currentStatus === partnerStatusFilter;
      const matchesKyc = partnerKycFilter === 'All' || p.verificationStatus === partnerKycFilter;
      return matchesSearch && matchesStatus && matchesKyc;
    });
  }, [deliveryPartners, partnerSearch, partnerStatusFilter, partnerKycFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSector =
        orderSectorFilter === 'All' ||
        (orderSectorFilter === 'grocery' && isGroceryOrder(o)) ||
        (orderSectorFilter === 'restaurant' && isRestaurantOrder(o)) ||
        (orderSectorFilter === 'stationery' && isStationeryOrder(o));
      const matchesSearch =
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerPhone.includes(orderSearch) ||
        o.sellerName.toLowerCase().includes(orderSearch.toLowerCase());
      const matchesStatus = orderStatusFilter === 'All' || o.orderStatus === orderStatusFilter;
      return matchesSector && matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter, orderSectorFilter]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSector =
        productSectorFilter === 'All' ||
        (productSectorFilter === 'grocery' && isGroceryProduct(p)) ||
        (productSectorFilter === 'restaurant' && isRestaurantProduct(p)) ||
        (productSectorFilter === 'stationery' && isStationeryProduct(p));
      const matchesSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sellerName.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCategory = productCategoryFilter === 'All' || p.category === productCategoryFilter;
      const isAdminProd = p.isAdminStoreProduct || p.sellerId === 's-admin' || p.sellerId === adminStore?.id;
      const matchesOrigin =
        productOriginFilter === 'All' ||
        (productOriginFilter === 'Admin' && isAdminProd) ||
        (productOriginFilter === 'Seller' && !isAdminProd);

      const effectiveReturnPolicy = p.returnPolicy || 'Returnable';
      const matchesPolicy =
        productPolicyFilter === 'All' || effectiveReturnPolicy === productPolicyFilter;

      const effectiveRefundPolicy = p.refundPolicy || 'Full-Refund';
      const matchesRefund =
        productRefundFilter === 'All' || effectiveRefundPolicy === productRefundFilter;

      return matchesSector && matchesSearch && matchesCategory && matchesOrigin && matchesPolicy && matchesRefund;
    });
  }, [products, productSearch, productCategoryFilter, productOriginFilter, productSectorFilter, productPolicyFilter, productRefundFilter, adminStore]);

  // Categories list
  const categoriesList = useMemo(() => {
    const set = new Set(products.map(p => p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Handle Bulk Bargain update
  const handleApplyBulkBargain = async () => {
    if (!onUpdateProduct) return;
    const targetProducts = productCategoryFilter === 'All'
      ? products
      : products.filter(p => p.category === productCategoryFilter);

    setIsUpdatingBulkBargain(true);
    try {
      for (const prod of targetProducts) {
        const newFloor = Math.round(prod.sellingPrice * (1 - bulkBargainPct / 100));
        await onUpdateProduct(prod.id, {
          maxBargainDiscountPercent: bulkBargainPct,
          minBargainPrice: newFloor,
          bargainingAllowed: true
        });
      }
      setBulkBargainNotice(`✓ Enabled ${bulkBargainPct}% bargain on ${targetProducts.length} items`);
      setTimeout(() => setBulkBargainNotice(null), 3500);
    } finally {
      setIsUpdatingBulkBargain(false);
    }
  };

  // Handle Bulk Product Discount update
  const handleApplyBulkDiscount = async () => {
    if (!onUpdateProduct) return;
    setIsApplyingBulkDiscount(true);
    try {
      const targetProducts = productCategoryFilter === 'All'
        ? products
        : products.filter(p => p.category === productCategoryFilter);

      for (const prod of targetProducts) {
        const baseMrp = prod.mrp || prod.sellingPrice;
        if (bulkDiscountPct === 0) {
          // Remove discount: set selling price equal to MRP and discount to 0
          await onUpdateProduct(prod.id, {
            mrp: baseMrp,
            sellingPrice: baseMrp,
            discountPercentage: 0
          });
        } else {
          const newSelling = Math.max(1, Math.round(baseMrp * (1 - bulkDiscountPct / 100)));
          await onUpdateProduct(prod.id, {
            mrp: baseMrp,
            sellingPrice: newSelling,
            discountPercentage: bulkDiscountPct
          });
        }
      }
    } finally {
      setIsApplyingBulkDiscount(false);
    }
  };

  // Handle Bulk Return & Refund Policy update
  const handleApplyBulkReturnAndRefund = async () => {
    if (!onUpdateProduct) return;
    setIsApplyingBulkPolicy(true);
    try {
      const targetProducts = productCategoryFilter === 'All'
        ? products
        : products.filter(p => p.category === productCategoryFilter);

      for (const prod of targetProducts) {
        await onUpdateProduct(prod.id, {
          returnPolicy: bulkReturnPolicy,
          returnWindowDays: bulkReturnPolicy === 'Non-Returnable' ? 0 : bulkReturnDays,
          refundPolicy: bulkRefundPolicy,
          refundDetails: bulkRefundPolicy === 'Full-Refund'
            ? '100% full refund upon doorstep return verification.'
            : bulkRefundPolicy === 'Store-Credit-Only'
            ? 'Instant wallet credit to Bazli Coins upon return.'
            : bulkRefundPolicy === 'Replacement-Only'
            ? 'Free replacement piece dispatched for defective/damaged item.'
            : 'No return/refund permitted once delivered.'
        });
      }
    } finally {
      setIsApplyingBulkPolicy(false);
    }
  };

  // Quick Dispatch Order to Rider
  const handleQuickDispatch = (orderId: string, partner: DeliveryPartner) => {
    if (onAssignOrderToPartner) {
      onAssignOrderToPartner(orderId, partner.id, partner.name);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Superadmin Header with Live Telemetry */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-800/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black tracking-tight">Bazli Super-Console</h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/40 animate-pulse">
                  ● LIVE RUNTIME ACTIVE
                </span>
                <span className="bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                  <span>📱 Owner WhatsApp: +91 9871618126 (2FA Active)</span>
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Full-Platform Governance • Merchant KYC Audit • Live Rider Dispatch & GPS • Bazli Bargain Margin Engine
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Chips */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenChangePasscode && (
            <button
              onClick={onOpenChangePasscode}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold rounded-2xl border border-purple-500/30 flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
              title="Change secret admin passcode"
            >
              <Settings className="w-4 h-4" />
              <span>Change PIN</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('content')}
            className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-2xl flex items-center gap-1.5 cursor-pointer transition-all shadow-md border border-indigo-400"
            title="Edit all site copy, banners, headers, and portal texts"
          >
            <Type className="w-4 h-4 text-amber-300" />
            <span>Edit Site Text & Banners</span>
          </button>

          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-2xl border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
          >
            <Megaphone className="w-4 h-4" />
            <span>Broadcast Alert</span>
          </button>

          <button
            onClick={() => setIsCoinsModalOpen(true)}
            className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-2xl flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
          >
            <Gift className="w-4 h-4" />
            <span>Award BazliCoins</span>
          </button>

          <button
            onClick={() => setIsAddSellerOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-2xl flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Merchant</span>
          </button>

          {onLockAdmin && (
            <button
              onClick={onLockAdmin}
              className="px-4 py-2.5 bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-black rounded-2xl flex items-center gap-1.5 cursor-pointer transition-all shadow-md border border-rose-500"
              title="Securely lock and exit to customer store"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Lock Admin Console</span>
            </button>
          )}
        </div>
      </div>

      {/* Broadcast Alert Display if active */}
      {broadcastAlert && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-900 font-bold animate-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <Megaphone className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Active Broadcast: {broadcastAlert}</span>
          </div>
          <button
            onClick={() => setBroadcastAlert(null)}
            className="text-amber-800 hover:text-amber-950 text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Key KPI Header Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Gross Platform Sales</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">₹{totalGMV.toLocaleString()}</span>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
            <TrendingUp className="w-3 h-3" /> All Store Volume
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-300 shadow-2xs bg-emerald-50/40">
          <span className="text-[11px] text-emerald-800 font-bold uppercase block">Admin Account Inflow</span>
          <span className="text-xl font-black text-emerald-700 mt-1 block">₹{totalAdminAccountRevenue.toLocaleString()}</span>
          <span className="text-[10px] text-emerald-800 font-bold">100% Direct + 10% Seller Cut</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Admin Direct Store</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">₹{adminStoreGMV.toLocaleString()}</span>
          <span className="text-[10px] text-slate-500 font-medium">0% Fee (100% Retained)</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-300 shadow-2xs bg-amber-50/40">
          <span className="text-[11px] text-amber-900 font-bold uppercase block">10% Seller Commission</span>
          <span className="text-xl font-black text-amber-700 mt-1 block">₹{connectedSellerCommission.toLocaleString()}</span>
          <span className="text-[10px] text-amber-800 font-bold">From {sellers.length - 1} Connected Stores</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Shopper Savings</span>
          <span className="text-xl font-black text-amber-600 mt-1 block">₹{totalBargainSavings.toLocaleString()}</span>
          <span className="text-[10px] text-amber-700 font-bold">Via Live Bazli Bargains</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Catalog SKUs</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{products.length}</span>
          <span className="text-[10px] text-slate-500 font-medium">
            {adminStoreProducts.length} Admin • {sellerDirectProducts.length} Sellers
          </span>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'overview', label: 'Dashboard & Analytics', icon: BarChart3 },
          { key: 'payments', label: '💳 Razorpay & Settlements', icon: CreditCard, highlight: true },
          { key: 'content', label: '✏️ Site Text & Banners CMS', icon: Type, highlight: true },
          { key: 'deals', label: `Deals, Offers & Promo (${customDeals.length + coupons.length})`, icon: Flame },
          { key: 'features', label: 'Feature Switchboard & Ticker', icon: Zap },
          { key: 'sellers', label: `Merchants & Stores (${sellers.length})`, icon: Store },
          { key: 'delivery', label: `Delivery Fleet (${deliveryPartners.length})`, icon: Bike },
          { key: 'orders', label: `Order Dispatch (${orders.length})`, icon: Package },
          { key: 'ratings', label: `⭐ Customer Ratings (${ratedOrders.length})`, icon: Star, highlight: true },
          { key: 'products', label: `Catalog & Bazli Bargain (${products.length})`, icon: Scale },
          { key: 'customers', label: `Customers CRM (${mockCustomers.length})`, icon: Users },
          { key: 'settings', label: 'Hyperlocal Config', icon: Sliders }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : (tab as any).highlight
                  ? 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200 font-black'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : (tab as any).highlight ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================
          TAB 0: SITE-WIDE TEXT, BANNERS & HEADINGS CMS
         ========================================================= */}
      {activeTab === 'content' && (
        <AdminSiteContentCMS
          contentConfig={siteContent}
          onSaveContent={(newContent) => {
            if (onUpdateSiteContent) {
              onUpdateSiteContent(newContent);
            }
          }}
          onResetToDefault={() => {
            if (onUpdateSiteContent) {
              onUpdateSiteContent(DEFAULT_SITE_CONTENT);
            }
          }}
        />
      )}

      {/* =========================================================
          TAB 1: EXECUTIVE DASHBOARD & REAL-TIME ANALYTICS
         ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Admin Platform Monetization & Margin Dashboard */}
          <AdminRevenueGrowthSuite
            orders={orders}
            sellers={sellers}
            deliveryPartners={deliveryPartners}
            featureFlags={featureFlags}
            onUpdateFeatureFlags={onUpdateFeatureFlags}
          />

          {/* Urgent Dispatch & Action Alerts */}
          {unassignedOrders.length > 0 && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-amber-950 text-xs">
                    {unassignedOrders.length} Confirmed Order(s) Awaiting Rider Dispatch
                  </h4>
                  <p className="text-[11px] text-amber-800">
                    Assign these orders to online delivery partners in Central Zone to maintain 15-minute SLA.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('orders')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-xs cursor-pointer shrink-0"
              >
                Go to Order Dispatch →
              </button>
            </div>
          )}

          {/* Revenue Breakdown & Visual Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Financial Flow Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Platform Financial Flow & Sales Volume</h3>
                  <p className="text-xs text-slate-400">Real-time GMV aggregation across all dark stores</p>
                </div>
                <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  +18.4% WoW Growth
                </span>
              </div>

              {/* Visual Simulated Metric Bars */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-600">Total Customer Gross Volume (All Stores GMV)</span>
                    <span className="font-black text-slate-900">₹{totalGMV.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-600">Admin Direct Store Sales (100% Retained)</span>
                    <span className="font-black text-emerald-800">₹{adminStoreGMV.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${totalGMV > 0 ? Math.round((adminStoreGMV / totalGMV) * 100) : 40}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-600">Connected Merchants Gross Sales (₹{connectedSellerGMV.toLocaleString()})</span>
                    <span className="font-black text-slate-700">Net 90% Payout: ₹{netMerchantSettlement.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-sky-500 h-full rounded-full"
                      style={{ width: `${totalGMV > 0 ? Math.round((netMerchantSettlement / totalGMV) * 100) : 50}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-600">
                      Bazli 10% Platform Commission from Sellers (Admin Account Inflow)
                    </span>
                    <span className="font-black text-amber-700">₹{connectedSellerCommission.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${totalGMV > 0 ? Math.max(10, Math.round((connectedSellerCommission / totalGMV) * 100)) : 10}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-600">Customer Bargain Savings Generated</span>
                    <span className="font-black text-purple-700">₹{totalBargainSavings.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: '35%' }} />
                  </div>
                </div>
              </div>

              {/* Order Status Distribution */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-emerald-50 rounded-2xl">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">Completed</span>
                  <span className="text-lg font-black text-emerald-900">
                    {orders.filter(o => o.orderStatus === 'Delivered').length}
                  </span>
                </div>
                <div className="p-3 bg-sky-50 rounded-2xl">
                  <span className="text-[10px] text-sky-800 font-bold uppercase block">Active In Transit</span>
                  <span className="text-lg font-black text-sky-900">
                    {orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Cancelled / Refunds</span>
                  <span className="text-lg font-black text-slate-700">
                    {orders.filter(o => o.orderStatus === 'Cancelled').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: AI Bargaining Engine & Dark Store SLA Box */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-sm">Bazli Bargain Engine Telemetry</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-amber-900 uppercase block">Engine Policy</span>
                  <span className="font-black text-slate-900 text-sm block">{bargainBotMode} Margin Guard</span>
                  <p className="text-[11px] text-slate-600">
                    Dynamic counters calculate profit floors with customer loyalty level multipliers.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg. Saving / Order</span>
                    <span className="text-sm font-black text-slate-900 mt-0.5 block">
                      ₹{orders.length > 0 ? Math.round(totalBargainSavings / orders.length) : 18}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Offer Acceptance</span>
                    <span className="text-sm font-black text-emerald-700 mt-0.5 block">78.4%</span>
                  </div>
                </div>

                {/* Dark Store 15-Min SLA */}
                <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> 15-Min Delivery SLA
                    </span>
                    <span className="font-mono font-bold text-emerald-400">96.2% On-Time</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                    <div>
                      <span className="text-slate-500 block">Avg. Store Pack Time:</span>
                      <strong className="text-white font-mono">3.8 mins</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Avg. Rider Transit:</span>
                      <strong className="text-white font-mono">9.4 mins</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sector Dual Operations Matrix (Grocery Dark Stores vs Restaurant Dining) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" /> Sector Operations Matrix (Grocery vs Restaurant)
                </h3>
                <p className="text-xs text-slate-400">
                  Separated operational metrics, order volumes, revenue channels, and merchant fulfillment SLAs.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl">
                  🛒 {grocerySellers.length} Grocery Stores
                </span>
                <span className="text-[11px] font-bold bg-orange-50 text-orange-800 border border-orange-200 px-2.5 py-1 rounded-xl">
                  🍽️ {restaurantSellers.length} Restaurants
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Grocery & Dark Stores Operations */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 border-2 border-emerald-200/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-emerald-950">Bazli (Grocery & Essentials)</h4>
                      <p className="text-[11px] text-emerald-800 font-medium">Dark Stores, Mandi Fresh & Kirana Partners</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                    ₹{groceryGMV.toLocaleString()} GMV
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Orders</span>
                    <span className="font-black text-slate-900 text-sm mt-0.5 block">{groceryOrders.length}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Live Stores</span>
                    <span className="font-black text-emerald-700 text-sm mt-0.5 block">{grocerySellers.filter(s => s.active).length} / {grocerySellers.length}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Delivery SLA</span>
                    <span className="font-black text-slate-900 text-sm mt-0.5 block">10-15 Min</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Catalog: <strong>{groceryProducts.length} items</strong> (Mandi, Staples, Dairy)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSellerSectorFilter('grocery');
                        setActiveTab('sellers');
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Inspect Stores →
                    </button>
                    <button
                      onClick={() => {
                        setOrderSectorFilter('grocery');
                        setActiveTab('orders');
                      }}
                      className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Orders →
                    </button>
                  </div>
                </div>
              </div>

              {/* Restaurant Dining Operations */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-50/70 via-white to-orange-50/30 border-2 border-orange-200/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
                      <UtensilsCrossed className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-orange-950">Bazli Restaurant (Dining & Kitchens)</h4>
                      <p className="text-[11px] text-orange-800 font-medium">FSSAI Certified Restaurants & Cloud Kitchens</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-orange-800 bg-orange-100 px-2.5 py-1 rounded-lg border border-orange-300">
                    ₹{restaurantGMV.toLocaleString()} GMV
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-orange-100 shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Food Orders</span>
                    <span className="font-black text-slate-900 text-sm mt-0.5 block">{restaurantOrders.length}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-orange-100 shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Live Kitchens</span>
                    <span className="font-black text-orange-700 text-sm mt-0.5 block">{restaurantSellers.filter(s => s.active).length} / {restaurantSellers.length}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-orange-100 shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Avg Kitchen Prep</span>
                    <span className="font-black text-slate-900 text-sm mt-0.5 block">18 Mins</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Menu Dishes: <strong>{restaurantProducts.length} dishes</strong> (Menu Card photos)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSellerSectorFilter('restaurant');
                        setActiveTab('sellers');
                      }}
                      className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Inspect Kitchens →
                    </button>
                    <button
                      onClick={() => {
                        setOrderSectorFilter('restaurant');
                        setActiveTab('orders');
                      }}
                      className="px-2.5 py-1 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Food Orders →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Experience & Delivery Performance Summary Banner */}
          <div className="bg-gradient-to-br from-amber-500/10 via-white to-amber-50/20 p-6 rounded-3xl border-2 border-amber-300/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    Customer Experience & Delivery Performance Tracking
                  </h3>
                  <p className="text-xs text-slate-500">
                    Aggregated shopper ratings, delivery partner scorecards, and customer sentiment metrics.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('ratings')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <span>Open Full Ratings Console ({ratedOrders.length}) →</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 bg-white rounded-2xl border border-amber-200 shadow-2xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Overall CSAT</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="text-2xl font-black text-slate-900">{overallAvgRating}</span>
                  <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
                </div>
                <div className="flex items-center justify-center text-amber-500 gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(overallAvgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-amber-200 shadow-2xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Store Items Quality</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="text-2xl font-black text-amber-700">{avgShoppingRating}</span>
                  <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                  Freshness & Packaging
                </span>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-amber-200 shadow-2xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Rider Service & Speed</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="text-2xl font-black text-sky-700">{avgDeliveryRating}</span>
                  <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
                </div>
                <span className="text-[10px] text-sky-800 font-bold block mt-1">
                  10-Min SLA & Courtesy
                </span>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-amber-200 shadow-2xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Customer Response Rate</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="text-2xl font-black text-emerald-700">
                    {deliveredOrders.length > 0 ? Math.round((ratedOrders.length / deliveredOrders.length) * 100) : 100}%
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-bold block mt-1">
                  {ratedOrders.length} of {deliveredOrders.length} Delivered
                </span>
              </div>
            </div>

            {/* Top Compliment Badges */}
            {tagCounts.length > 0 && (
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Top Customer Compliments:</span>
                {tagCounts.slice(0, 5).map(([tag, count]) => (
                  <span
                    key={tag}
                    className="bg-white px-2.5 py-1 rounded-xl text-xs font-black text-amber-900 border border-amber-300 shadow-2xs flex items-center gap-1"
                  >
                    <span>✓ {tag}</span>
                    <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full">
                      {count}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB: CUSTOMER RATINGS, EXPERIENCE & PERFORMANCE TRACKING
         ========================================================= */}
      {activeTab === 'ratings' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-amber-500/10 border border-amber-400/50 rounded-3xl p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                  <Star className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">Customer Ratings & Experience Tracking</h2>
                    <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                      Live Performance Matrix
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Monitor post-delivery shopper satisfaction, delivery partner courtesy, item quality, and customer compliments.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-white px-4 py-2 rounded-2xl border border-amber-200 shadow-2xs text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Verified Reviews</span>
                  <span className="text-lg font-black text-amber-900">{ratedOrders.length} Submissions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key KPI Scorecards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs">
              <span className="text-[11px] text-slate-400 font-bold uppercase block">Overall CSAT</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-2xl font-black text-slate-900">{overallAvgRating}</span>
                <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
              </div>
              <div className="flex text-amber-400 mt-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(overallAvgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs">
              <span className="text-[11px] text-slate-400 font-bold uppercase block">Items & Packing</span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-2xl font-black text-amber-700">{avgShoppingRating}</span>
                <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                Freshness & Accuracy
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-sky-200 shadow-2xs">
              <span className="text-[11px] text-slate-400 font-bold uppercase block">Rider Speed & SLA</span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-2xl font-black text-sky-700">{avgDeliveryRating}</span>
                <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
              </div>
              <span className="text-[10px] text-sky-800 font-bold block mt-1">
                Politeness & Courtesy
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-400 font-bold uppercase block">Feedback Rate</span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-2xl font-black text-emerald-700">
                  {deliveredOrders.length > 0 ? Math.round((ratedOrders.length / deliveredOrders.length) * 100) : 100}%
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block mt-1">
                {ratedOrders.length} of {deliveredOrders.length} orders
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
              <span className="text-[11px] text-emerald-800 font-bold uppercase block">Customer Tips</span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-2xl font-black text-emerald-700">₹{totalCustomerTips}</span>
              </div>
              <span className="text-[10px] text-emerald-800 font-bold block mt-1">
                Rewarded to Fleet Heroes
              </span>
            </div>
          </div>

          {/* Rating Distribution & Customer Compliment Tags */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Star Distribution Progress Bars */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" /> Star Rating Distribution
                </h3>
                <span className="text-xs font-bold text-slate-400">Total {ratedOrders.length} ratings</span>
              </div>

              <div className="space-y-2.5">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = starDistribution[stars as keyof typeof starDistribution] || 0;
                  const pct = ratedOrders.length > 0 ? Math.round((count / ratedOrders.length) * 100) : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1 w-14 shrink-0 font-bold text-slate-700">
                        <span>{stars}</span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </div>

                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            stars === 5
                              ? 'bg-emerald-500'
                              : stars === 4
                              ? 'bg-amber-400'
                              : stars === 3
                              ? 'bg-yellow-400'
                              : 'bg-rose-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="w-16 text-right shrink-0">
                        <span className="font-mono font-bold text-slate-700">{count}</span>
                        <span className="text-[10px] text-slate-400 ml-1">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer Compliment Tags & Feedback Cloud */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-emerald-600" /> Customer Compliment Badges
                </h3>
                <span className="text-xs font-bold text-slate-400">Most appreciated traits</span>
              </div>

              {tagCounts.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No compliment tags recorded yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {tagCounts.map(([tag, count]) => (
                    <div
                      key={tag}
                      className="bg-amber-50 border border-amber-200/80 px-3.5 py-2 rounded-2xl flex items-center gap-2 text-xs font-black text-amber-950 shadow-2xs"
                    >
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>{tag}</span>
                      <span className="bg-amber-200/80 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                        {count} orders
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 text-xs">
                <span className="font-bold block text-slate-800 mb-0.5">Quality Assurance Benchmark</span>
                Bazli riders and dark store pickers maintain a 98.4% positive sentiment threshold across all Central Delhi pin codes.
              </div>
            </div>
          </div>

          {/* Delivery Fleet Partner Customer Rating Scorecard */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Bike className="w-4 h-4 text-sky-600" /> Delivery Fleet Customer Rating Scorecard
                </h3>
                <p className="text-xs text-slate-400">Performance ratings tied to individual delivery heroes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {deliveryPartners.map(p => {
                const partnerReviews = ratedOrders.filter(o => o.deliveryPartnerId === p.id || o.deliveryPartnerName === p.name);
                const partnerAvg = partnerReviews.length > 0
                  ? (partnerReviews.reduce((sum, o) => sum + (o.review?.riderRating || 5), 0) / partnerReviews.length).toFixed(1)
                  : (p.rating || 4.9);
                const partnerTips = partnerReviews.reduce((sum, o) => sum + (o.review?.addedTip || 0), 0);

                return (
                  <div key={p.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-xs text-slate-900">{p.name}</div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        p.currentStatus === 'On Duty' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {p.currentStatus}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Customer Rating:</span>
                      <span className="font-black text-amber-700 flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-amber-200">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{partnerAvg}★</span>
                        <span className="text-[10px] text-slate-400">({partnerReviews.length})</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Extra Tips Earned:</span>
                      <span className="font-mono font-black text-emerald-700">₹{partnerTips}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Reviews & Feedback Ledger */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs space-y-4 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-500" /> Verified Customer Reviews & Feedback Ledger
                </h3>
                <p className="text-xs text-slate-400">
                  Search ratings, review comments, praise, and customer improvement suggestions.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {(['All', '5-Stars', '4-Stars', 'Critical'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setRatingFilter(f)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      ratingFilter === f
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Toolbar */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search reviews by customer name, order #ID, or delivery partner..."
                value={ratingSearch}
                onChange={e => setRatingSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50 text-xs"
              />
            </div>

            {/* Reviews Grid / Table */}
            {filteredReviews.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Star className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">No reviews found matching criteria</h4>
                <p className="text-xs text-slate-400">Try adjusting your search terms or filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReviews.map(order => {
                  const rev = order.review!;
                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-2xs hover:border-amber-300 transition-all space-y-3"
                    >
                      {/* Top Bar */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-black text-slate-900 text-xs">Order #{order.id}</span>
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                              Delivered ✓
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Customer: <strong className="text-slate-700">{rev.customerName}</strong> ({order.customerPhone})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setInspectingOrder(order)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[10px] cursor-pointer"
                        >
                          Inspect Order
                        </button>
                      </div>

                      {/* Dual Ratings Display */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">Store Items Quality</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-sm font-black text-amber-900">{rev.orderRating}.0</span>
                            <div className="flex text-amber-400">
                              {[1, 2, 3, 4, 5].map(s => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${s <= rev.orderRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-200">
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">Delivery Hero</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-sm font-black text-sky-900">{rev.riderRating}.0</span>
                            <div className="flex text-amber-400">
                              {[1, 2, 3, 4, 5].map(s => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${s <= rev.riderRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Compliment Tags */}
                      {rev.tags && rev.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {rev.tags.map(t => (
                            <span key={t} className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-amber-300">
                              ✓ {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Feedback Comment */}
                      {rev.orderFeedback && (
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <p className="text-xs text-slate-700 italic font-medium">"{rev.orderFeedback}"</p>
                        </div>
                      )}

                      {/* Footer Details */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <div>
                          Rider: <strong className="text-slate-800">{order.deliveryPartnerName || 'Central Fleet'}</strong>
                        </div>
                        {rev.addedTip && rev.addedTip > 0 ? (
                          <span className="bg-emerald-100 text-emerald-900 font-black text-[10px] px-2 py-0.5 rounded border border-emerald-300">
                            +₹{rev.addedTip} Tip
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: MERCHANTS & DARK STORE GOVERNANCE
         ========================================================= */}
      {activeTab === 'sellers' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600" /> Vendor Partner & Dark Store Registry
              </h3>
              <p className="text-xs text-slate-400">
                Audit GSTIN licenses, manage active selling states, and inspect store fulfillment history.
              </p>
            </div>

            <button
              onClick={() => setIsAddSellerOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard New Merchant</span>
            </button>
          </div>

          {/* Pending Seller Registrations & WhatsApp OTP Dispatch Card */}
          {pendingSellerRequests && pendingSellerRequests.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/10 rounded-2xl border border-amber-500/30 space-y-3 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-amber-950 flex items-center gap-1.5">
                      <span>Pending Seller WhatsApp OTP Dispatches</span>
                      <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.2 rounded-full">
                        {pendingSellerRequests.filter(r => r.status === 'Awaiting Admin OTP Share').length} PENDING
                      </span>
                    </h4>
                    <p className="text-[11px] text-amber-900">
                      Sellers have verified their mobile numbers. Admin members can review details and share the OTP with the seller.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {pendingSellerRequests.filter(r => r.status === 'Awaiting Admin OTP Share').map(req => (
                  <div
                    key={req.id}
                    className="p-3.5 bg-white rounded-2xl border border-amber-300/70 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-amber-600" />
                          <span>{req.businessName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Owner: <strong>{req.ownerName}</strong> • Phone: <strong className="font-mono text-slate-800">+91 {req.phone}</strong>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Cat: {req.category} • Req: {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Generated OTP</span>
                        <span className="font-mono font-black text-base text-purple-700 bg-purple-100 px-2 py-0.5 rounded-lg border border-purple-200 inline-block tracking-wider">
                          {req.generatedOtp}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          const cleanPhone = (req.phone || '').replace(/\D/g, '');
                          const msg = encodeURIComponent(
                            `Hello ${req.ownerName}! 👋\n\nYour Bazli merchant onboarding verification OTP for *${req.businessName}* is:\n\n👉 *${req.generatedOtp}*\n\nPlease enter this 6-digit PIN in your Seller Portal to activate your store.`
                          );
                          window.open(`https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${msg}`, '_blank');
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs transition-all"
                        title="Open WhatsApp chat with prefilled OTP to seller"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Share OTP on WhatsApp</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(req.generatedOtp);
                            setCopiedOtpId(req.id);
                            setTimeout(() => setCopiedOtpId(null), 2500);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold cursor-pointer flex items-center gap-1"
                          title="Copy OTP to clipboard"
                        >
                          {copiedOtpId === req.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700 font-black">Copied!</span>
                            </>
                          ) : (
                            <span>Copy</span>
                          )}
                        </button>

                        {onApproveSellerRequest && (
                          <button
                            onClick={() => onApproveSellerRequest(req)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-[11px] font-black cursor-pointer shadow-xs"
                            title="Auto-approve and create verified store"
                          >
                            Auto-Activate Store
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by store name, owner, or phone..."
                value={sellerSearch}
                onChange={e => setSellerSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto">
              {(['All', 'Verified', 'Pending', 'Rejected'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setSellerStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    sellerStatusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Sellers Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3.5">Business Name</th>
                  <th className="p-3.5">Owner & Contact</th>
                  <th className="p-3.5">GSTIN / Trade UID</th>
                  <th className="p-3.5">Rating & Volume</th>
                  <th className="p-3.5">Store State</th>
                  <th className="p-3.5">Commission Rate</th>
                  <th className="p-3.5">Verification</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSellers.map(s => {
                  const comm = getEffectiveSellerCommission(s);
                  return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-black text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{s.businessName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{s.address}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800">{s.ownerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{s.phone}</div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-800">{s.gstNumber}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-amber-600">⭐ {s.rating}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{s.totalSales} orders (₹{s.totalRevenue})</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        s.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {s.active ? '● Live Open' : '○ Closed / Paused'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {comm.isPromotionalZeroCommission ? (
                        <div>
                          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-black inline-flex items-center gap-1">
                            0% Promo Active
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">
                            {comm.daysRemainingInPromo}d left (till {comm.promoExpiryDate})
                          </span>
                        </div>
                      ) : s.isAdminStore ? (
                        <span className="bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded text-[10px] font-black">
                          0% Admin Store
                        </span>
                      ) : (
                        <div>
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-black">
                            10% Standard Fee
                          </span>
                          {s.joinedDate && (
                            <span className="text-[9px] text-slate-400 block mt-0.5">
                              2mo promo done
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          s.verificationStatus === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : s.verificationStatus === 'Rejected'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {s.verificationStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setEditingSeller(s)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[10px] cursor-pointer"
                      >
                        Edit Store
                      </button>

                      {s.verificationStatus !== 'Verified' && (
                        <button
                          onClick={() => onVerifySeller(s.id, 'Verified')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-[10px] cursor-pointer"
                        >
                          Approve
                        </button>
                      )}

                      {s.verificationStatus !== 'Rejected' && (
                        <button
                          onClick={() => onVerifySeller(s.id, 'Rejected')}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-lg text-[10px] cursor-pointer"
                        >
                          Reject
                        </button>
                      )}

                      {onDeleteSeller && !s.isAdminStore && s.id !== 's-admin' && (
                        confirmDeleteSellerId === s.id ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => {
                                onDeleteSeller(s.id);
                                setConfirmDeleteSellerId(null);
                              }}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-lg text-[10px] cursor-pointer shadow-xs"
                              title="Click to permanently delete this store"
                            >
                              Confirm Delete
                            </button>
                            <button
                              onClick={() => setConfirmDeleteSellerId(null)}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-[10px] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setConfirmDeleteSellerId(s.id);
                              setTimeout(() => {
                                setConfirmDeleteSellerId(prev => (prev === s.id ? null : prev));
                              }, 6000);
                            }}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[10px] cursor-pointer border border-rose-200"
                            title="Admin: Remove Store"
                          >
                            Delete Store
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: DELIVERY FLEET AUDIT & LIVE DISPATCH
         ========================================================= */}
      {activeTab === 'delivery' && (
        <div className="space-y-6">
          {/* Sub-view navigation header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDeliverySubView('radar')}
                className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center space-x-2 transition-all cursor-pointer ${
                  deliverySubView === 'radar'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-sky-400" />
                <span>Live Zone Radar & Dispatch Engine</span>
              </button>

              <button
                onClick={() => setDeliverySubView('roster')}
                className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center space-x-2 transition-all cursor-pointer ${
                  deliverySubView === 'roster'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Partner Directory & KYC Roster ({deliveryPartners.length})</span>
              </button>
            </div>

            {onOpenPartnerRegisterModal && (
              <button
                onClick={onOpenPartnerRegisterModal}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs rounded-2xl shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Onboard Fleet Rider</span>
              </button>
            )}
          </div>

          {/* Sub-view 1: Multi-Rider Radar & Dispatch Matrix */}
          {deliverySubView === 'radar' && (
            <AdminFleetRadarMatrix
              orders={orders}
              partners={deliveryPartners}
              onAssignOrder={onAssignOrderToPartner || (() => {})}
              onSendDispatchPing={onSendDispatchPing}
            />
          )}

          {/* Sub-view 2: Partner Roster & KYC Registry Table */}
          {deliverySubView === 'roster' && (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs space-y-4 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <Bike className="w-5 h-5 text-sky-600" /> Delivery Fleet Roster & KYC Registry
                  </h3>
                  <p className="text-xs text-slate-400">
                    Driving license inspection, live duty toggle, instant payout settlements, and SLA monitoring.
                  </p>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search rider name, phone, or partner ID..."
                    value={partnerSearch}
                    onChange={e => setPartnerSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50"
                  />
                </div>

                <div className="flex items-center space-x-1.5 overflow-x-auto">
                  {(['All', 'On Duty', 'Available', 'Offline'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setPartnerStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                        partnerStatusFilter === st
                          ? 'bg-sky-900 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Partners Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="p-3.5">Partner Name & ID</th>
                      <th className="p-3.5">Vehicle & Zone</th>
                      <th className="p-3.5">Duty State</th>
                      <th className="p-3.5">Deliveries & Rating</th>
                      <th className="p-3.5">Unpaid Wallet Balance</th>
                      <th className="p-3.5">KYC Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredPartners.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span>{p.name}</span>
                            <span className="font-mono text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                              {p.id.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{p.phone}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{p.vehicleType}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{p.vehicleNumber} • {p.operatingZoneName || 'Zone A'}</div>
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            p.currentStatus === 'On Duty'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.currentStatus === 'Available'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {p.currentStatus}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{p.completedOrdersCount} orders</div>
                          <div className="text-[10px] text-amber-600 font-bold">⭐ {p.rating || 4.9} rating</div>
                        </td>

                        <td className="p-3.5">
                          <span className="font-mono font-black text-emerald-700 text-sm">
                            ₹{p.walletBalance || 0}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              p.verificationStatus === 'Verified'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : p.verificationStatus === 'Rejected'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {p.verificationStatus}
                          </span>
                        </td>

                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setInspectingPartner(p)}
                            className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold rounded-lg text-[10px] border border-sky-200 cursor-pointer"
                          >
                            Inspect KYC
                          </button>

                          {p.walletBalance > 0 && onPartnerPayout && (
                            <button
                              onClick={() => {
                                onPartnerPayout(
                                  p.id,
                                  p.walletBalance,
                                  'UPI Instant Cashout',
                                  p.upiId || `${p.phone}@upi`
                                );
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                            >
                              Settle ₹{p.walletBalance}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 4: PLATFORM ORDERS & LIVE GPS DISPATCH AUDIT
         ========================================================= */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" /> Platform Order Fulfillment & Dispatch Matrix
              </h3>
              <p className="text-xs text-slate-400">
                Track live vector GPS routes, advance order fulfillment states, and audit financial commissions.
              </p>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by order #ID, customer name, phone..."
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto">
              {['All', 'Confirmed', 'Preparing', 'Picked Up', 'Out for Delivery', 'Delivered', 'Cancelled'].map(st => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    orderStatusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3.5">Order ID & OTP</th>
                  <th className="p-3.5">Customer & Drop</th>
                  <th className="p-3.5">Merchant Store</th>
                  <th className="p-3.5">Assigned Rider</th>
                  <th className="p-3.5">Items & Amount</th>
                  <th className="p-3.5">Fulfillment Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-mono font-black text-slate-900">#{order.id}</div>
                      <div className="flex flex-col gap-1 mt-1">
                        <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border font-bold flex items-center gap-1 w-fit ${
                          order.sellerPickupConfirmed && order.deliveryPickupConfirmed
                            ? 'text-sky-900 bg-sky-50 border-sky-300'
                            : 'text-amber-900 bg-amber-50 border-amber-300'
                        }`}>
                          <Store className="w-2.5 h-2.5" />
                          <span>Pickup: {order.pickupOtp}</span>
                          {order.sellerPickupConfirmed && order.deliveryPickupConfirmed ? ' (✓)' : ''}
                        </span>
                        <span className="font-mono text-[9px] text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300 font-bold flex items-center gap-1 w-fit">
                          <KeyRound className="w-2.5 h-2.5 text-emerald-700" />
                          <span>Deliv OTP: {order.deliveryOtp}</span>
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-extrabold text-slate-900">{order.customerName}</div>
                      <div className="text-[10px] text-slate-400">{order.deliveryAddress.city} • {order.customerPhone}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-slate-800">{order.sellerName}</div>
                      <div className="text-[10px] text-slate-400">ID: {order.sellerId}</div>
                    </td>

                    <td className="p-3.5">
                      {order.deliveryPartnerName ? (
                        <div className="font-bold text-sky-800 flex items-center gap-1">
                          <Bike className="w-3.5 h-3.5 text-sky-600" />
                          <span>{order.deliveryPartnerName}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Unassigned
                          </span>
                          {/* Quick Assign Dropdown */}
                          <select
                            onChange={e => {
                              const partner = deliveryPartners.find(p => p.id === e.target.value);
                              if (partner) handleQuickDispatch(order.id, partner);
                            }}
                            className="text-[10px] bg-sky-50 border border-sky-300 text-sky-900 rounded p-0.5 outline-none font-bold"
                            defaultValue=""
                          >
                            <option value="" disabled>Assign Rider</option>
                            {deliveryPartners.filter(p => p.currentStatus !== 'Offline').map(p => (
                              <option key={p.id} value={p.id}>{p.name} ({p.currentStatus})</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </td>

                    <td className="p-3.5">
                      <div className="font-mono font-black text-slate-900 text-sm">₹{order.finalAmount}</div>
                      <div className="text-[10px] text-slate-400">{order.items.length} items ({order.paymentMethod})</div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold inline-flex items-center gap-1 w-fit ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : order.orderStatus === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : order.orderStatus === 'Picked Up' || order.orderStatus === 'Out for Delivery'
                            ? 'bg-sky-100 text-sky-800 border border-sky-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          {order.orderStatus === 'Delivered' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          <span>{order.orderStatus}</span>
                        </span>

                        {/* Store Pickup Handover Status */}
                        {order.sellerPickupConfirmed && order.deliveryPickupConfirmed ? (
                          <span className="text-[9px] text-sky-800 font-mono font-bold flex items-center gap-1 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 w-fit">
                            <Check className="w-2.5 h-2.5 text-sky-600" /> Store Handover Done
                          </span>
                        ) : order.sellerPickupConfirmed ? (
                          <span className="text-[9px] text-amber-800 font-mono font-bold flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 w-fit">
                            ⏳ Store Verified • Rider Pending
                          </span>
                        ) : order.deliveryPickupConfirmed ? (
                          <span className="text-[9px] text-sky-800 font-mono font-bold flex items-center gap-1 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 w-fit">
                            ⏳ Rider Verified • Store Pending
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                            ⏳ Pickup Pending (Code: {order.pickupOtp})
                          </span>
                        )}

                        {order.orderStatus === 'Delivered' && (
                          <div className="space-y-1 mt-0.5">
                            <span className="text-[9px] text-emerald-700 font-mono font-bold flex items-center gap-0.5">
                              <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" /> Deliv OTP {order.deliveryOtp} Done
                            </span>
                            {order.review ? (
                              <button
                                type="button"
                                onClick={() => setInspectingOrder(order)}
                                className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black px-1.5 py-0.5 rounded cursor-pointer transition-colors shadow-2xs"
                                title="Click to view full customer feedback & tags"
                              >
                                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                <span>{order.review.orderRating}★ Items • {order.review.riderRating}★ Rider</span>
                              </button>
                            ) : (
                              <span className="text-[9px] text-slate-400 font-medium italic block">
                                Rating Pending
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {onTrackOrder && order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                        <button
                          onClick={() => onTrackOrder(order)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>GPS Map</span>
                        </button>
                      )}

                      <button
                        onClick={() => setInspectingOrder(order)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[10px] cursor-pointer"
                      >
                        Inspect Bill & Margin
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 5: CATALOG, INVENTORY & AI BARGAIN ENGINE
         ========================================================= */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600" /> Platform Catalog, Direct Admin Selling & Bazli Bargains
              </h3>
              <p className="text-xs text-slate-400">
                Sell directly as Admin (100% revenue retained) or manage connected seller inventory (10% platform commission).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Product (Admin / Seller)</span>
              </button>
            </div>
          </div>

          {/* Admin Selling vs Connected Seller Info Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-emerald-950 block">Admin Direct Store Catalog ({adminStoreProducts.length} Items)</span>
                <span className="text-emerald-800 text-[11px] leading-tight block mt-0.5">
                  Products listed directly by Admin. 100% of customer payments go to the Admin UPI/Bank with zero platform deduction.
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5">
              <Percent className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-amber-950 block">Connected Seller Catalog ({sellerDirectProducts.length} Items)</span>
                <span className="text-amber-800 text-[11px] leading-tight block mt-0.5">
                  Listed by external merchants. 10% platform commission is automatically routed to the Bazli Admin account.
                </span>
              </div>
            </div>
          </div>

          {/* Bulk Bargain, Bulk Discount & Bulk Return/Refund Configurator Banners */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
            {/* Bulk Product Discount Master Banner */}
            <div className="p-4 bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl border border-rose-200 flex flex-col justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-black text-rose-950 flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-rose-600" /> Bulk Product Discount Master
                </span>
                <p className="text-slate-600 text-[11px]">
                  Set or clear discounts on filtered items ({productCategoryFilter}). Only Admin and Seller have discount controls.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <select
                  value={bulkDiscountPct}
                  onChange={e => setBulkDiscountPct(Number(e.target.value))}
                  className="bg-white border border-rose-300 text-rose-950 font-black text-xs px-2.5 py-1.5 rounded-xl outline-none"
                >
                  <option value={0}>0% (Remove All Discounts)</option>
                  <option value={5}>5% Discount</option>
                  <option value={10}>10% Discount</option>
                  <option value={15}>15% Discount</option>
                  <option value={20}>20% Discount</option>
                  <option value={25}>25% Discount</option>
                  <option value={30}>30% Discount</option>
                </select>

                <button
                  disabled={isApplyingBulkDiscount}
                  onClick={handleApplyBulkDiscount}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer transition-all disabled:opacity-50"
                >
                  {isApplyingBulkDiscount ? 'Applying...' : bulkDiscountPct === 0 ? 'Clear Discounts' : 'Apply Discount'}
                </button>
              </div>
            </div>

            {/* Bulk Bargain Banner */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-emerald-50 rounded-2xl border border-amber-200 flex flex-col justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-black text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" /> Bulk Bazli Bargain Control Master
                </span>
                <p className="text-slate-600 text-[11px]">
                  Allow or Close Bazli bargaining across filtered items ({productCategoryFilter}).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <select
                  value={bulkBargainPct}
                  onChange={e => setBulkBargainPct(Number(e.target.value))}
                  className="bg-white border border-amber-300 text-amber-950 font-black text-xs px-3 py-1.5 rounded-xl outline-none"
                >
                  <option value={5}>5% Max Bargain</option>
                  <option value={10}>10% Max Bargain</option>
                  <option value={15}>15% Max Bargain</option>
                  <option value={20}>20% Max Bargain</option>
                  <option value={25}>25% Max Bargain</option>
                  <option value={30}>30% Max Bargain</option>
                </select>

                <button
                  type="button"
                  disabled={isUpdatingBulkBargain}
                  onClick={handleApplyBulkBargain}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs cursor-pointer transition-all disabled:opacity-50"
                >
                  {isUpdatingBulkBargain ? 'Updating...' : `Allow Bargain (${bulkBargainPct}%)`}
                </button>

                <button
                  type="button"
                  disabled={isUpdatingBulkBargain}
                  onClick={async () => {
                    if (!onUpdateProduct) return;
                    const targetProducts = productCategoryFilter === 'All'
                      ? products
                      : products.filter(p => p.category === productCategoryFilter);
                    setIsUpdatingBulkBargain(true);
                    try {
                      for (const prod of targetProducts) {
                        await onUpdateProduct(prod.id, {
                          bargainingAllowed: false
                        });
                      }
                      setBulkBargainNotice(`✓ Bargaining disabled on ${targetProducts.length} items`);
                      setTimeout(() => setBulkBargainNotice(null), 3500);
                    } finally {
                      setIsUpdatingBulkBargain(false);
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Close / Disable Bargain
                </button>

                {bulkBargainNotice && (
                  <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-xl animate-in fade-in">
                    {bulkBargainNotice}
                  </span>
                )}
              </div>
            </div>

            {/* Bulk Return & Refund Policy Banner */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 flex flex-col justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-black text-blue-950 flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-blue-600" /> Bulk Return, Exchange & Refund Master
                </span>
                <p className="text-slate-600 text-[11px]">
                  Set Return & Refund eligibility for category items ({productCategoryFilter}).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <select
                  value={bulkReturnPolicy}
                  onChange={e => setBulkReturnPolicy(e.target.value as any)}
                  className="bg-white border border-blue-300 text-blue-950 font-black text-xs px-2.5 py-1.5 rounded-xl outline-none"
                >
                  <option value="Returnable">✅ Returnable (2d)</option>
                  <option value="Exchange-Only">🔄 Exchange Only</option>
                  <option value="Replacement-Only">🔁 Replacement Only</option>
                  <option value="Non-Returnable">❌ Non-Returnable</option>
                </select>

                <select
                  value={bulkRefundPolicy}
                  onChange={e => setBulkRefundPolicy(e.target.value as any)}
                  className="bg-white border border-blue-300 text-blue-950 font-black text-xs px-2.5 py-1.5 rounded-xl outline-none"
                >
                  <option value="Full-Refund">💰 100% Full Refund</option>
                  <option value="Store-Credit-Only">🪙 Store Credit</option>
                  <option value="Replacement-Only">🔁 Item Replace</option>
                  <option value="No-Refund">❌ No Refund</option>
                </select>

                <button
                  disabled={isApplyingBulkPolicy}
                  onClick={handleApplyBulkReturnAndRefund}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer transition-all disabled:opacity-50"
                >
                  {isApplyingBulkPolicy ? 'Saving...' : 'Apply Policy'}
                </button>
              </div>
            </div>
          </div>

          {/* Search, Store Origin, Category & Return/Refund Policy Filter */}
          <div className="space-y-2.5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search product title, store..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                />
              </div>

              {/* Portal Section Switcher */}
              <div className="flex items-center space-x-1 overflow-x-auto bg-slate-200/70 p-1 rounded-2xl">
                <button
                  onClick={() => {
                    setProductSectorFilter('All');
                    setProductCategoryFilter('All');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                    productSectorFilter === 'All'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  All Portals ({products.length})
                </button>
                <button
                  onClick={() => {
                    setProductSectorFilter('grocery');
                    setProductCategoryFilter('All');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs flex items-center gap-1 ${
                    productSectorFilter === 'grocery'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Grocery ({products.filter(isGroceryProduct).length})</span>
                </button>
                <button
                  onClick={() => {
                    setProductSectorFilter('restaurant');
                    setProductCategoryFilter('All');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs flex items-center gap-1 ${
                    productSectorFilter === 'restaurant'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-orange-900 hover:bg-orange-100'
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Restaurant ({products.filter(isRestaurantProduct).length})</span>
                </button>
                <button
                  onClick={() => {
                    setProductSectorFilter('stationery');
                    setProductCategoryFilter('All');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs flex items-center gap-1 ${
                    productSectorFilter === 'stationery'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-purple-900 hover:bg-purple-100'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Stationery ({products.filter(isStationeryProduct).length})</span>
                </button>
              </div>

              {/* Store Origin Toggle */}
              <div className="flex items-center space-x-1.5 overflow-x-auto bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => setProductOriginFilter('All')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                    productOriginFilter === 'All'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({products.length})
                </button>

                <button
                  onClick={() => setProductOriginFilter('Admin')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs flex items-center gap-1 ${
                    productOriginFilter === 'Admin'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Direct ({adminStoreProducts.length})</span>
                </button>

                <button
                  onClick={() => setProductOriginFilter('Seller')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs flex items-center gap-1 ${
                    productOriginFilter === 'Seller'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" />
                  <span>Connected Sellers ({sellerDirectProducts.length})</span>
                </button>
              </div>

              <div className="flex items-center space-x-1.5 overflow-x-auto">
                {categoriesList.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setProductCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      productCategoryFilter === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Return & Refund Policy Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" /> Filter Policy:
              </span>

              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
                {(['All', 'Returnable', 'Exchange-Only', 'Replacement-Only', 'Non-Returnable'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setProductPolicyFilter(p)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      productPolicyFilter === p
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p === 'All' ? 'All Returns' : p === 'Returnable' ? '✅ Returnable' : p === 'Exchange-Only' ? '🔄 Exchange' : p === 'Replacement-Only' ? '🔁 Replace' : '❌ Non-Return'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
                {(['All', 'Full-Refund', 'Store-Credit-Only', 'Replacement-Only', 'No-Refund'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setProductRefundFilter(r)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      productRefundFilter === r
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r === 'All' ? 'All Refunds' : r === 'Full-Refund' ? '💰 100% Refund' : r === 'Store-Credit-Only' ? '🪙 Store Credit' : r === 'Replacement-Only' ? '🔁 Replace' : '❌ No Refund'}
                  </button>
                ))}
              </div>

              {(productPolicyFilter !== 'All' || productRefundFilter !== 'All') && (
                <button
                  onClick={() => {
                    setProductPolicyFilter('All');
                    setProductRefundFilter('All');
                  }}
                  className="text-xs text-rose-600 hover:underline font-bold ml-1 cursor-pointer"
                >
                  Reset Policy Filters
                </button>
              )}
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3.5">Product Details</th>
                  <th className="p-3.5">Merchant & Fee Model</th>
                  <th className="p-3.5">Selling Price</th>
                  <th className="p-3.5">Admin Discount</th>
                  <th className="p-3.5">Stock Level</th>
                  <th className="p-3.5">Weight / Mode</th>
                  <th className="p-3.5">Admin Bargain</th>
                  <th className="p-3.5">Return & Exchange</th>
                  <th className="p-3.5">Refund Terms</th>
                  <th className="p-3.5">Floor Price</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredProducts.map(product => {
                  const currentDiscount = typeof product.maxBargainDiscountPercent === 'number' ? product.maxBargainDiscountPercent : 20;
                  const currentFloor = product.minBargainPrice || Math.round(product.sellingPrice * (1 - currentDiscount / 100));
                  const isAdminProduct = product.isAdminStoreProduct || product.sellerId === 's-admin' || product.sellerId === adminStore?.id;
                  const isFlexible = product.weightType === 'flexible' || product.isWeightFlexible === true;
                  const isBargainOn = product.bargainingAllowed === true;
                  const currentReturnPolicy = product.returnPolicy || 'Returnable';
                  const currentRefundPolicy = product.refundPolicy || 'Full-Refund';
                  const currentDays = product.returnWindowDays ?? (currentReturnPolicy === 'Non-Returnable' ? 0 : 2);

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-black text-slate-900 flex flex-wrap items-center gap-1.5">
                              <span>{product.name}</span>
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                                isRestaurantProduct(product)
                                  ? 'bg-orange-100 text-orange-800 border-orange-200'
                                  : isStationeryProduct(product)
                                  ? 'bg-purple-100 text-purple-800 border-purple-200'
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              }`}>
                                {isRestaurantProduct(product) ? '🍽️ Restaurant' : isStationeryProduct(product) ? '📚 Stationery' : '🛒 Grocery'}
                              </span>
                              {isAdminProduct && (
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-emerald-300">
                                  Admin Direct
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">{product.quantity} • {product.category}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{product.sellerName}</div>
                        {isAdminProduct ? (
                          <div className="text-[10px] font-bold text-emerald-700">0% Fee (100% Admin Account)</div>
                        ) : (
                          <div className="text-[10px] font-bold text-amber-700">10% Platform Commission</div>
                        )}
                      </td>

                      <td className="p-3.5 font-mono font-black text-slate-900">
                        ₹{product.sellingPrice}
                        {product.mrp && product.mrp > product.sellingPrice ? (
                          <span className="line-through text-slate-400 text-[10px] font-medium ml-1">₹{product.mrp}</span>
                        ) : null}
                      </td>

                      {/* Admin Discount Control */}
                      <td className="p-3.5">
                        <select
                          value={product.discountPercentage || 0}
                          onChange={async e => {
                            const pct = Number(e.target.value);
                            const baseMrp = product.mrp || product.sellingPrice;
                            if (onUpdateProduct) {
                              if (pct === 0) {
                                await onUpdateProduct(product.id, {
                                  mrp: baseMrp,
                                  sellingPrice: baseMrp,
                                  discountPercentage: 0
                                });
                              } else {
                                const newSelling = Math.max(1, Math.round(baseMrp * (1 - pct / 100)));
                                await onUpdateProduct(product.id, {
                                  mrp: baseMrp,
                                  sellingPrice: newSelling,
                                  discountPercentage: pct
                                });
                              }
                            }
                          }}
                          className={`text-[10px] font-black px-2 py-1 rounded-lg border outline-none cursor-pointer transition-all ${
                            (product.discountPercentage || 0) > 0
                              ? 'bg-amber-100 text-amber-950 border-amber-300 font-bold'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value={0}>0% (No Disc)</option>
                          <option value={5}>5% OFF</option>
                          <option value={10}>10% OFF</option>
                          <option value={15}>15% OFF</option>
                          <option value={20}>20% OFF</option>
                          <option value={25}>25% OFF</option>
                          <option value={30}>30% OFF</option>
                          <option value={40}>40% OFF</option>
                          <option value={50}>50% OFF</option>
                        </select>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          product.stock > 10
                            ? 'bg-emerald-100 text-emerald-800'
                            : product.stock > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                        </span>
                      </td>

                      {/* Weight Dispatch Mode (Admin Controlled: Fixed Pack vs Flexible Mandi Weights) */}
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={async () => {
                            if (onUpdateProduct) {
                              const newWeightType = isFlexible ? 'fixed' : 'flexible';
                              await onUpdateProduct(product.id, {
                                weightType: newWeightType,
                                isWeightFlexible: newWeightType === 'flexible',
                                allowCustomWeight: newWeightType === 'flexible'
                              });
                            }
                          }}
                          className={`px-2 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 border transition-all cursor-pointer ${
                            isFlexible
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                          }`}
                          title="Click to toggle between Fixed Sealed Pack vs Flexible Mandi Custom Weights (100g, 250g, 500g, 1L...)"
                        >
                          <Scale className="w-3 h-3" />
                          <span>{isFlexible ? 'Flexible' : 'Fixed'}</span>
                        </button>
                      </td>

                      {/* Bargain Control (Admin Controlled: Disabled vs Allowed up to X%) */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={async () => {
                              if (onUpdateProduct) {
                                await onUpdateProduct(product.id, {
                                  bargainingAllowed: !isBargainOn
                                });
                              }
                            }}
                            className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                              isBargainOn
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                            title="Toggle Bazli Bargaining permission for this item"
                          >
                            {isBargainOn ? 'ON' : 'OFF'}
                          </button>

                          {isBargainOn && (
                            <select
                              value={currentDiscount}
                              onChange={async e => {
                                const newPct = Number(e.target.value);
                                const newFloor = Math.round(product.sellingPrice * (1 - newPct / 100));
                                if (onUpdateProduct) {
                                  await onUpdateProduct(product.id, {
                                    maxBargainDiscountPercent: newPct,
                                    minBargainPrice: newFloor,
                                    bargainingAllowed: true
                                  });
                                }
                              }}
                              className="bg-amber-50 border border-amber-300 text-amber-950 font-black text-[10px] px-1 py-0.5 rounded-lg outline-none"
                            >
                              <option value={5}>5%</option>
                              <option value={10}>10%</option>
                              <option value={15}>15%</option>
                              <option value={20}>20%</option>
                              <option value={25}>25%</option>
                              <option value={30}>30%</option>
                            </select>
                          )}
                        </div>
                      </td>

                      {/* Admin Return & Exchange Policy Control */}
                      <td className="p-3.5">
                        <div className="flex flex-col gap-1">
                          <select
                            value={currentReturnPolicy}
                            onChange={async e => {
                              const newPolicy = e.target.value as any;
                              if (onUpdateProduct) {
                                await onUpdateProduct(product.id, {
                                  returnPolicy: newPolicy,
                                  returnWindowDays: newPolicy === 'Non-Returnable' ? 0 : (currentDays || 2)
                                });
                              }
                            }}
                            className={`text-[10px] font-black px-2 py-1 rounded-lg border outline-none cursor-pointer transition-all ${
                              currentReturnPolicy === 'Returnable'
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                : currentReturnPolicy === 'Exchange-Only' || currentReturnPolicy === 'Replacement-Only'
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : 'bg-rose-50 text-rose-900 border-rose-300'
                            }`}
                          >
                            <option value="Returnable">✅ Returnable</option>
                            <option value="Exchange-Only">🔄 Exchange Only</option>
                            <option value="Replacement-Only">🔁 Replace Only</option>
                            <option value="Non-Returnable">❌ Non-Returnable</option>
                          </select>
                          {currentReturnPolicy !== 'Non-Returnable' && (
                            <span className="text-[9px] text-slate-500 font-bold">
                              Window: {currentDays} Day{currentDays > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Admin Refund Policy Control */}
                      <td className="p-3.5">
                        <select
                          value={currentRefundPolicy}
                          onChange={async e => {
                            const newRefund = e.target.value as any;
                            if (onUpdateProduct) {
                              await onUpdateProduct(product.id, {
                                refundPolicy: newRefund
                              });
                            }
                          }}
                          className={`text-[10px] font-black px-2 py-1 rounded-lg border outline-none cursor-pointer transition-all ${
                            currentRefundPolicy === 'Full-Refund'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : currentRefundPolicy === 'Store-Credit-Only'
                              ? 'bg-indigo-50 text-indigo-900 border-indigo-300'
                              : currentRefundPolicy === 'Replacement-Only'
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : 'bg-rose-50 text-rose-900 border-rose-300'
                          }`}
                        >
                          <option value="Full-Refund">💰 100% Refund</option>
                          <option value="Store-Credit-Only">🪙 Store Credit</option>
                          <option value="Replacement-Only">🔁 Replace Only</option>
                          <option value="No-Refund">❌ No Refund</option>
                        </select>
                      </td>

                      <td className="p-3.5">
                        <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 text-xs">
                          ₹{isBargainOn ? currentFloor : product.sellingPrice}
                        </span>
                      </td>

                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(product)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[10px] cursor-pointer"
                        >
                          Edit SKU
                        </button>
                        {onDeleteProduct && (
                          <button
                            type="button"
                            onClick={async () => {
                              await onDeleteProduct(product.id);
                            }}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg text-[10px] cursor-pointer transition-colors"
                            title="Delete SKU"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 6: CUSTOMER CRM & LOYALTY MANAGEMENT
         ========================================================= */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" /> Customer Profiles & Loyalty CRM
              </h3>
              <p className="text-xs text-slate-400">
                Inspect loyalty tiers (VIP / Gold / Silver / Bronze), spend metrics, and award customer BazliCoins.
              </p>
            </div>

            <button
              onClick={() => setIsCoinsModalOpen(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 transition-all"
            >
              <Gift className="w-4 h-4" />
              <span>Credit Bonus BazliCoins</span>
            </button>
          </div>

          {/* Customers Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3.5">Customer Name & Phone</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Loyalty Tier</th>
                  <th className="p-3.5">Total Orders</th>
                  <th className="p-3.5">Lifetime Spend</th>
                  <th className="p-3.5">Primary Address</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {mockCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-black text-slate-900">{c.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.phone}</div>
                    </td>

                    <td className="p-3.5 text-slate-600 font-mono">{c.email}</td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        c.loyaltyLevel === 'VIP'
                          ? 'bg-purple-100 text-purple-900 border border-purple-300'
                          : c.loyaltyLevel === 'Gold'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : c.loyaltyLevel === 'Silver'
                          ? 'bg-slate-200 text-slate-800 border border-slate-300'
                          : 'bg-orange-100 text-orange-900 border border-orange-200'
                      }`}>
                        👑 {c.loyaltyLevel} Tier
                      </span>
                    </td>

                    <td className="p-3.5 font-bold text-slate-900">{c.totalOrders} orders</td>

                    <td className="p-3.5 font-mono font-black text-emerald-700 text-sm">
                      ₹{c.totalSpending.toLocaleString()}
                    </td>

                    <td className="p-3.5 text-[11px] text-slate-500">
                      {c.savedAddresses[0]?.street}, {c.savedAddresses[0]?.city}
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setIsCoinsModalOpen(true)}
                        className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl text-[10px] border border-amber-300 cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>Credit Coins</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 7: HYPERLOCAL CONFIG & SYSTEM SETTINGS
         ========================================================= */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weather & Dynamic Delivery Surge */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <CloudRain className="w-5 h-5 text-sky-600" />
              <h3 className="font-black text-slate-900 text-sm">Monsoon & Weather Surge Controller</h3>
            </div>

            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-900 text-xs block">
                  Enable Rain / Monsoon Fleet Surge (+₹15)
                </span>
                <span className="text-[11px] text-slate-500">
                  Adds ₹15 weather surge to delivery fee and allocates 100% directly as rider incentive.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                <input
                  type="checkbox"
                  checked={rainSurgeActive}
                  onChange={e => {
                    setRainSurgeActive(e.target.checked);
                    if (e.target.checked) {
                      setBroadcastAlert('🌧️ Rain Alert Active: Fleet riders active with monsoon gear.');
                    } else {
                      setBroadcastAlert(null);
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>

            {/* Delivery Fee & Free Delivery Thresholds */}
            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Free Delivery Cart Threshold (₹)
                </label>
                <input
                  type="number"
                  value={freeDeliveryThreshold}
                  onChange={e => setFreeDeliveryThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-bold font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Standard Hyperlocal Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  value={standardDeliveryFee}
                  onChange={e => setStandardDeliveryFee(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-bold font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Customer Platform Fee (₹) <span className="text-emerald-600 font-extrabold">(Currently ₹0)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={platformFee}
                  onChange={e => setPlatformFee(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-bold font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveOverviewLiveConfig}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Live Delivery & Fee Charges</span>
              </button>

              {liveConfigSavedNotice && (
                <div className="p-2 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-center font-bold text-[11px] animate-in fade-in">
                  ✨ Updated! Customer portal now shows Free Delivery above ₹{freeDeliveryThreshold}, Standard Fee ₹{standardDeliveryFee}, and Platform Fee ₹{platformFee}!
                </div>
              )}
            </div>
          </div>

          {/* Platform Commission & AI Bot Personality */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Sliders className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-slate-900 text-sm">Platform Commission & Bazli Pricing Guard</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bazli Platform Commission Rate (%)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="0.5"
                    value={commissionRate}
                    onChange={e => setCommissionRate(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <span className="font-mono font-black text-sm text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    {commissionRate}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bazli Bargain Counter-Offer Strictness
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Generous', 'Balanced', 'Strict'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setBargainBotMode(mode)}
                      className={`py-2 rounded-xl text-xs font-black cursor-pointer transition-all border ${
                        bargainBotMode === mode
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveOverviewLiveConfig}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Save Commission ({commissionRate}%) & Bot Strictness</span>
              </button>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-950">
                🔒 All rules apply in real time across the buyer checkout, vendor settlement ledger, and rider app payouts.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 1.5: DEALS, FLASH SALES & PROMO COUPONS STUDIO
         ========================================================= */}
      {activeTab === 'deals' && (
        <AdminDealsAndOffersTab
          deals={customDeals}
          coupons={coupons}
          products={products}
          activeDealCategory={activeDealCategory}
          onOpenAddDeal={() => {
            setEditingDeal(null);
            setIsAddDealOpen(true);
          }}
          onOpenEditDeal={(deal) => {
            setEditingDeal(deal);
            setIsAddDealOpen(true);
          }}
          onDeleteDeal={(dealId) => {
            if (onDeleteDeal) onDeleteDeal(dealId);
          }}
          onToggleDealActive={(dealId) => {
            if (onToggleDealActive) onToggleDealActive(dealId);
          }}
          onSetAsActiveTodayDeal={(deal) => {
            if (onSetAsActiveTodayDeal) onSetAsActiveTodayDeal(deal);
          }}
          onOpenAddCoupon={() => {
            setEditingCoupon(null);
            setIsAddCouponOpen(true);
          }}
          onOpenEditCoupon={(coupon) => {
            setEditingCoupon(coupon);
            setIsAddCouponOpen(true);
          }}
          onDeleteCoupon={(couponCode) => {
            if (onDeleteCoupon) onDeleteCoupon(couponCode);
          }}
          onToggleCouponActive={(couponCode) => {
            if (onToggleCouponActive) onToggleCouponActive(couponCode);
          }}
          onBroadcastCoupon={(coupon) => {
            const msg = `🏷️ Use Coupon Code ${coupon.code} for ${coupon.discountAmount ? `₹${coupon.discountAmount} Flat OFF` : `${coupon.discountPercent}% OFF`} on orders above ₹${coupon.minOrder}!`;
            setBroadcastAlert(msg);
            if (onBroadcastBanner) onBroadcastBanner(msg);
          }}
          onUpdateProduct={onUpdateProduct}
        />
      )}

      {/* =========================================================
          TAB 1.6: FEATURE SWITCHBOARD & DYNAMIC ENGINE
         ========================================================= */}
      {activeTab === 'features' && (
        <AdminFeaturesTab
          featureFlags={featureFlags}
          onUpdateFeatureFlags={(updates) => {
            if (onUpdateFeatureFlags) onUpdateFeatureFlags(updates);
          }}
          onBroadcastBanner={(msg) => {
            setBroadcastAlert(msg);
            if (onBroadcastBanner) onBroadcastBanner(msg);
          }}
        />
      )}

      {/* =========================================================
          TAB 1.7: RAZORPAY PRODUCTION GATEWAY & SETTLEMENTS
         ========================================================= */}
      {activeTab === 'payments' && (
        <AdminPaymentGatewayTab onOpenLegalModal={onOpenLegalModal} />
      )}

      {/* =========================================================
          MODALS INTEGRATION
         ========================================================= */}
      
      {/* 1. Add Merchant Modal */}
      <AdminAddSellerModal
        isOpen={isAddSellerOpen}
        onClose={() => setIsAddSellerOpen(false)}
        onAddSeller={async (sellerData) => {
          if (onAddSeller) {
            await onAddSeller(sellerData);
          }
        }}
      />

      {/* 2. Edit Merchant Modal */}
      <AdminEditSellerModal
        isOpen={!!editingSeller}
        seller={editingSeller}
        onClose={() => setEditingSeller(null)}
        onUpdateSeller={async (sellerId, updates) => {
          if (onUpdateSeller) {
            await onUpdateSeller(sellerId, updates);
          }
        }}
      />

      {/* 3. Partner KYC Document Inspector Modal */}
      <AdminPartnerKycModal
        isOpen={!!inspectingPartner}
        partner={inspectingPartner}
        onClose={() => setInspectingPartner(null)}
        onVerify={onVerifyDeliveryPartner}
        onTriggerPayout={onPartnerPayout}
      />

      {/* 4. Order Detail & Financial Audit Modal */}
      <AdminOrderDetailModal
        isOpen={!!inspectingOrder}
        order={inspectingOrder}
        onClose={() => setInspectingOrder(null)}
        onUpdateStatus={async (orderId, status, otp) => {
          if (onUpdateOrderStatus) {
            return await onUpdateOrderStatus(orderId, status, otp);
          }
        }}
        onTrackOrder={onTrackOrder}
      />

      {/* 5. Add Product SKU Modal */}
      <AdminAddProductModal
        isOpen={isAddProductOpen}
        sellers={sellers}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={async (prodData) => {
          if (onAddProduct) {
            await onAddProduct(prodData);
          }
        }}
      />

      {/* 6. Edit Product SKU Modal */}
      <AdminEditProductModal
        isOpen={!!editingProduct}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onUpdateProduct={async (prodId, updates) => {
          if (onUpdateProduct) {
            await onUpdateProduct(prodId, updates);
          }
        }}
        onDeleteProduct={onDeleteProduct}
      />

      {/* 7. Award Customer Coins Modal */}
      <AdminCustomerCoinsModal
        isOpen={isCoinsModalOpen}
        onClose={() => setIsCoinsModalOpen(false)}
        onAwardCoins={(amount, reason) => {
          if (onAwardCustomerCoins) {
            onAwardCustomerCoins(amount, reason);
          }
        }}
      />

      {/* 8. Broadcast Announcement Modal */}
      <AdminBroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        onBroadcast={(msg) => {
          setBroadcastAlert(msg);
          if (onBroadcastBanner) onBroadcastBanner(msg);
        }}
      />

      {/* 9. Add / Edit Deal Modal */}
      <AdminAddDealModal
        isOpen={isAddDealOpen}
        initialDeal={editingDeal}
        onClose={() => {
          setIsAddDealOpen(false);
          setEditingDeal(null);
        }}
        onSaveDeal={async (dealData) => {
          if (onSaveDeal) {
            await onSaveDeal(dealData);
          }
        }}
      />

      {/* 10. Add / Edit Promo Coupon Modal */}
      <AdminAddCouponModal
        isOpen={isAddCouponOpen}
        initialCoupon={editingCoupon}
        onClose={() => {
          setIsAddCouponOpen(false);
          setEditingCoupon(null);
        }}
        onSaveCoupon={async (couponData) => {
          if (onSaveCoupon) {
            await onSaveCoupon(couponData);
          }
        }}
      />

    </div>
  );
};
