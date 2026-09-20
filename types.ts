export type UserRole = 'customer' | 'seller' | 'delivery' | 'admin' | 'system';

export type LoyaltyTier = 'New' | 'Bronze' | 'Silver' | 'Gold' | 'VIP';

export type SellerType = 'grocery' | 'restaurant' | 'stationery';

export interface Product {
  id: string;
  name: string;
  quantity: string;
  category: string;
  subcategory?: string;
  mrp: number;
  sellingPrice: number;
  discountPercentage: number;
  bargainingAllowed: boolean;
  minBargainPrice?: number;
  maxBargainDiscountPercent?: number;
  maxBargainAttempts?: number;
  weightType?: 'fixed' | 'flexible'; // 'fixed' = Sealed fixed pack (1x, 2x packs only), 'flexible' = Customer chooses weight/volume (100g, 250g, 500g, 1L, etc.)
  isWeightFlexible?: boolean; // true = custom weight/volume allowed, false = fixed pack only
  allowCustomWeight?: boolean; // alias
  unitType?: 'weight' | 'volume' | 'count';
  customWeightUnit?: 'g' | 'kg' | 'ml' | 'L' | 'pcs' | 'pack';
  minCustomQuantity?: number; // e.g., 50 (grams/ml)
  maxCustomQuantity?: number; // e.g., 10000 (grams/ml)
  stock: number;
  sellerId: string;
  sellerName: string;
  sellerType?: SellerType;
  image: string;
  images?: string[]; // 3-4 multi-photo gallery for rich product display
  description: string;
  highlights?: string[]; // Key selling points / bullet points
  shelfLife?: string; // e.g., '6 Months', 'Fresh Daily'
  origin?: string; // Country / Region of origin
  rating: number;
  reviewCount: number;
  tags?: string[];
  isPopular?: boolean;
  isTodayDeal?: boolean;
  availableQuantities?: string[];
  isAdminStoreProduct?: boolean;
  foodType?: 'veg' | 'non-veg' | 'egg';
  preparationTimeMinutes?: number;
  prepTimeMinutes?: number;
  isVeg?: boolean;
  isSoldOut?: boolean;
  spiceLevel?: 'Mild' | 'Medium' | 'Spicy';
  cuisine?: string;
  portionSize?: string;
  returnPolicy?: 'Non-Returnable' | 'Returnable' | 'Exchange-Only' | 'Replacement-Only';
  returnWindowDays?: number; // e.g. 0 for non-returnable, 1, 2, 3, 7 days
  refundPolicy?: 'No-Refund' | 'Full-Refund' | 'Replacement-Only' | 'Store-Credit-Only';
  refundDetails?: string; // e.g., '100% refund to original payment source upon pickup verification'
}

export interface BargainingRuleTier {
  tier: LoyaltyTier;
  maxDiscountPercent: number;
}

export interface BargainingRulesConfig {
  enabled: boolean;
  tierMaxDiscounts: Record<LoyaltyTier, number>;
  maxAttemptsPerProduct: number;
  offerExpirationMinutes: number;
  globalMinOrderValueForBargain: number;
}

export interface BargainingSession {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  originalPrice: number;
  customerOffer: number;
  counterOffer?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'counter';
  finalAgreedPrice?: number;
  attemptsUsed: number;
  maxAttempts: number;
  expiresAt: number; // timestamp
  message: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  bargainedPrice?: number;
  bargainSessionId?: string;
  selectedWeight?: string;
  selectedWeightGrams?: number;
  unitPrice?: number;
  unitMrp?: number;
}

export interface Coupon {
  id?: string;
  code: string;
  discountAmount?: number;
  discountPercent?: number;
  minOrder: number;
  maxDiscount: number;
  applicableCategory?: string;
  newCustomersOnly?: boolean;
  expiryDate: string;
  description: string;
  isActive?: boolean;
}

export interface CustomDeal {
  id: string;
  title: string;
  category: string;
  categoryAliases?: string[];
  icon: string;
  badge: string;
  description: string;
  discountPercent: number;
  gradient: string;
  image: string;
  isActive: boolean;
  isFlashSale?: boolean;
  expiryDate?: string;
  applicableProductIds?: string[];
  createdAt: string;
}

export interface AppFeatureFlags {
  enableAiBargaining: boolean;
  enableMandiWeights: boolean;
  enableExpressDelivery: boolean;
  enableRainSurge: boolean;
  enableCustomerCoins: boolean;
  enableSellerRegistration: boolean;
  enableDeliveryPartnerRegistration: boolean;
  enableDailyDealsCarousel: boolean;
  enableLiveOrderTracking: boolean;
  bargainBotMode: 'Generous' | 'Balanced' | 'Strict';
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  monsoonSurgeFee: number;
  nightShiftFee: number;
  customerCoinCashbackPercent: number;
  adminCommissionRate: number;
  announcementTickerText: string;
  showAnnouncementTicker: boolean;
}

export interface HeroBannerSlide {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  buttonText: string;
  actionType: 'category' | 'deals' | 'bargain' | 'shop';
  targetValue?: string;
  gradient: string;
  image: string;
  isActive: boolean;
}

export interface DeliveryZone {
  id: string;
  name: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  estimatedTime: string;
  availability: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  originalPrice: number;
  paidPrice: number; // bargained or standard
  image: string;
  unitQuantity: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready for Pickup'
  | 'Picked Up'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

export type PaymentStatus =
  | 'Pending'
  | 'Payment Initiated'
  | 'Paid'
  | 'Failed'
  | 'Cancelled'
  | 'Refunded';

export type PaymentMethodType =
  | 'Razorpay'
  | 'UPI'
  | 'Credit/Debit Card'
  | 'Cash on Delivery'
  | 'NetBanking'
  | 'Wallet';

export interface Order {
  id: string;
  orderId?: string; // Standard alias for order id
  userId?: string; // Standard alias for customer id
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount?: number; // Total discount (bargain + coupon)
  bargainDiscount: number;
  couponDiscount: number;
  couponCode?: string;
  deliveryFee: number;
  deliveryTip?: number; // 100% tip passed to partner
  deliveryInstructions?: string[]; // e.g. ["Don't ring bell", "Leave at door"]
  cookingInstructions?: string; // e.g. "Extra spicy, less oil, cut into small pieces"
  specialInstructions?: string; // Cooking / grocery notes
  riderChatHistory?: Array<{ id: string; sender: 'customer' | 'rider'; text: string; time: string }>;
  platformFee?: number; // Bazli Platform Fee (₹9)
  tax: number; // GST Taxes (Groceries 5% + Platform 18%)
  gstBreakdown?: {
    cgst: number;
    sgst: number;
    rate: number;
    itemsGst: number;
    platformFeeGst: number;
  };
  finalAmount: number;
  currency?: string; // e.g. 'INR'
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethodType;
  paymentId?: string;
  // Razorpay Production Integration Fields
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentVerifiedAt?: string;
  razorpayWebhookEventId?: string;
  deliveryAddress: {
    fullName: string;
    street: string;
    city: string;
    pincode: string;
    phone: string;
    landmark?: string;
    flatNo?: string;
    floor?: string;
    instructions?: string[];
  };
  deliveryZoneId: string;
  ecoPackaging?: boolean;
  noCutlery?: boolean;
  isVipOrder?: boolean;
  sellerId: string;
  sellerName: string;
  sellerType?: SellerType;
  orderType?: 'grocery' | 'restaurant' | 'stationery';
  kitchenStatus?: 'Pending Acceptance' | 'Preparing in Kitchen' | 'Food Ready for Pickup' | 'Handed Over to Rider';
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  orderStatus: OrderStatus;
  deliveryOtp: string;
  pickupOtp: string; // Store/Restaurant Pickup Handover Code shared with Seller & Rider by Admin
  sellerPickupConfirmed?: boolean; // True when Seller enters/confirms code on Seller Portal
  deliveryPickupConfirmed?: boolean; // True when Delivery Partner enters/confirms code on Delivery Portal
  pickupConfirmedAt?: string; // Timestamp when both confirmed and order moved to customer
  createdAt: string;
  updatedAt: string;
  // Marketplace Commission Fields
  adminCommissionRate?: number; // 10% for 3rd party, 0% for Admin
  adminCommissionAmount?: number; // Amount going to Bazli Admin account
  sellerPayoutAmount?: number; // 90% net payout for 3rd party, 100% for Admin
  isAdminStoreOrder?: boolean; // True if sold directly by Admin
}

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  date: string;
}

export interface PayoutAccountDetails {
  payoutMode: 'UPI' | 'Bank Transfer';
  accountHolderName: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountType?: 'Savings' | 'Current';
  upiId?: string;
  isVerified?: boolean;
  beneficiaryContactId?: string; // RazorpayX / Cashfree Beneficiary Contact ID
  fundAccountId?: string; // RazorpayX Fund Account ID (fa_xxx)
  updatedAt?: string;
}

export interface SellerPayoutRecord {
  id: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  payoutMethod: 'UPI Instant Settlement' | 'Bank Transfer (IMPS)' | 'Bank Transfer (NEFT)' | 'RazorpayX Automated Payout';
  destination: string;
  utrNumber: string;
  razorpayPayoutId?: string; // e.g., pout_xxxx
  status: 'Success' | 'Processing' | 'Pending Approval' | 'Failed';
  grossSalesAmount: number;
  platformFeeDeducted: number; // 10%
  netSettlementAmount: number;
  ordersCount: number;
  timestamp: string;
  notes?: string;
}

export interface Seller {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  gstNumber: string;
  fssaiNumber?: string;
  sellerType?: SellerType; // 'grocery' | 'restaurant'
  cuisineSpecialties?: string[];
  isKitchenOpen?: boolean;
  avgPrepTimeMinutes?: number;
  verificationStatus: 'Verified' | 'Pending' | 'Rejected';
  totalSales: number;
  totalRevenue: number;
  rating: number;
  active: boolean;
  isAdminStore?: boolean; // If true, this is the official Admin store (0% commission / 100% Admin revenue)
  commissionRate?: number; // Default 10% for connected 3rd party sellers
  totalCommissionPaid?: number; // Total 10% commission deposited into Bazli Admin account
  walletBalance?: number; // Net earnings available for settlement / withdrawal
  bankAccountOrUpi?: string;
  payoutDetails?: PayoutAccountDetails;
  payoutHistory?: SellerPayoutRecord[];
  menuPhotos?: string[]; // Menu card photos / digitized menu board images
  menuPhotoDetails?: { id: string; url: string; title: string; category?: string; uploadDate?: string }[];
  bannerImage?: string; // Restaurant header cover photo
}

export interface SellerRegistrationRequest {
  id: string;
  phone: string;
  businessName: string;
  ownerName: string;
  email?: string;
  category: string;
  sellerType?: SellerType; // 'grocery' | 'restaurant'
  cuisineSpecialties?: string[];
  fssaiNumber?: string;
  gstNumber?: string;
  address?: string;
  generatedOtp: string;
  status: 'Awaiting Admin OTP Share' | 'Verified' | 'Rejected';
  createdAt: string;
}

export interface OrderEarningBreakdown {
  orderId: string;
  basePay: number; // Base drop pay (e.g. ₹35)
  distanceKm: number; // Delivery distance in KM
  distancePay: number; // ₹10/km for distance beyond base 2km
  surgePay: number; // Peak hour rush bonus (e.g. ₹15)
  rainAllowance: number; // Rain/weather surge (e.g. ₹25)
  nightAllowance: number; // Night shift incentive (e.g. ₹15)
  customerTip: number; // 100% tip passed to partner
  totalEarning: number;
  timestamp: string;
}

export interface DeliveryPayoutRecord {
  id: string;
  partnerId: string;
  amount: number;
  payoutMethod: 'UPI Instant Cashout' | 'Daily Auto Settlement' | 'Weekly Milestone Settlement' | 'Bank Transfer (IMPS)';
  destination: string;
  utrNumber: string;
  status: 'Success' | 'Processing' | 'Failed';
  ordersCovered: number;
  timestamp: string;
  notes?: string;
}

export interface DeliveryRateCard {
  basePay: number; // ₹35 per order up to 2 km
  baseDistanceKm: number; // 2.0 km
  perKmRate: number; // ₹10 per km beyond 2 km
  peakHourSurge: number; // ₹15 (12-3 PM & 7-11 PM)
  rainSurge: number; // ₹25 during monsoon/rain
  nightAllowance: number; // ₹15 (11 PM - 6 AM)
  minGuaranteePay: number; // ₹600 for 8hr shift
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  vehicleNumber: string;
  verificationStatus: 'Verified' | 'Pending' | 'Rejected';
  currentStatus: 'Available' | 'On Duty' | 'Delivering' | 'Offline';
  assignedOrdersCount: number;
  completedOrdersCount: number;
  totalEarnings: number;
  walletBalance: number; // Unwithdrawn balance available for instant cashout
  todayEarnings: number; // Today's cumulative earnings
  weeklyEarnings: number; // This week's cumulative earnings
  rating: number;
  drivingLicenseNumber?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  operatingZoneId?: string;
  operatingZoneName?: string;
  city?: string;
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  payoutDetails?: PayoutAccountDetails;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  preferredShift?: string;
  experienceYears?: string;
  profileImage?: string;
  joiningDate?: string;
  rateCard?: DeliveryRateCard;
  earningsLedger?: OrderEarningBreakdown[];
  payoutHistory?: DeliveryPayoutRecord[];
  currentDistanceToHubKm?: number; // e.g., 0.4 km, 1.2 km
  activeLoadCount?: number; // Current active orders in bag
  acceptanceRate?: number; // e.g., 98.5%
  onTimeRate?: number; // e.g., 99.2%
  batteryOrFuelPercent?: number; // e.g., 85%
  liveCoordinates?: { lat: number; lng: number };
}

export interface DispatchPingPayload {
  orderId: string;
  order: Order;
  candidatePartnerId: string;
  candidatePartnerName: string;
  distanceToStoreKm: number;
  distanceStoreToCustomerKm: number;
  estimatedEarnings: number;
  expiresAt: number; // epoch ms
  priorityRank: number;
  matchScore: number; // e.g., 96%
  status: 'pinging' | 'accepted' | 'declined' | 'timed_out';
}

export interface CustomerAddress {
  id: string;
  title: 'Home' | 'Work' | 'Friends & Family' | 'Other' | string;
  receiverName: string;
  receiverPhone: string;
  flatNo?: string;
  floor?: string;
  street: string;
  city: string;
  pincode: string;
  landmark?: string;
  deliveryInstructions?: string[];
  isDefault?: boolean;
  coordinates?: { lat: number; lng: number };
  isLiveGps?: boolean;
}

export interface BazliVipPlan {
  id: 'monthly' | 'quarterly' | 'annual';
  name: string;
  price: number;
  durationDays: number;
  savingsEstimate: number;
  badge?: string;
  popular?: boolean;
  perks: string[];
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyLevel: LoyaltyTier;
  totalOrders: number;
  totalSpending: number;
  isVipMember?: boolean;
  vipPlan?: 'monthly' | 'quarterly' | 'annual';
  vipExpiryDate?: string;
  vipSavingsToDate?: number;
  savedAddresses: CustomerAddress[];
}

export interface OrderReview {
  id: string;
  orderId: string;
  customerName: string;
  orderRating: number; // 1 to 5
  riderRating: number; // 1 to 5
  orderFeedback?: string;
  riderFeedback?: string;
  tags?: string[];
  addedTip?: number;
  createdAt: string;
}

export interface ScratchCardReward {
  id: string;
  orderId: string;
  rewardType: 'coins' | 'coupon';
  coinsAmount?: number;
  couponCode?: string;
  couponDiscount?: number;
  isScratched: boolean;
  title: string;
  description: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorRole: UserRole;
  actorName: string;
  action: string;
  details: string;
}

export interface SiteContentConfig {
  // 1. Global Branding, Header & Ticker
  brandName: string;
  brandTagline: string;
  headerTickerText: string;
  showAnnouncementTicker: boolean;
  deliveryTimePromise: string;
  searchPlaceholder: string;
  contactPhone: string;
  contactEmail: string;

  // 2. Grocery & Daily Mandi Portal
  groceryPortalTabLabel: string;
  groceryPortalBadge: string;
  groceryHeroHeadline: string;
  groceryHeroHeadlineHighlight: string;
  groceryHeroSubheadline: string;
  groceryHeroBadge: string;
  groceryHeroShopButtonText: string;
  groceryHeroDealsButtonText: string;
  groceryExploreCategoriesTitle: string;
  groceryExploreCategoriesSubtitle: string;
  groceryBargainTitle: string;
  groceryBargainSubtitle: string;
  groceryTodaysDealsTitle: string;
  groceryTodaysDealsSubtitle: string;
  groceryProductsShelfTitle: string;
  groceryProductsShelfSubtitle: string;

  // 3. Restaurant & Cloud Kitchen Portal
  restaurantPortalTabLabel: string;
  restaurantPortalBadge: string;
  restaurantHeroTitle: string;
  restaurantHeroSubtitle: string;
  restaurantSearchPlaceholder: string;
  restaurantSectionTitle: string;
  restaurantSectionSubtitle: string;
  restaurantCuisinesTitle: string;
  restaurantMenuTitle: string;
  restaurantLiveKitchenBadge: string;

  // 4. Stationery & Books Portal
  stationeryPortalTabLabel: string;
  stationeryPortalBadge: string;
  stationeryHeroTitle: string;
  stationeryHeroSubtitle: string;
  stationerySearchPlaceholder: string;
  stationeryCategoriesTitle: string;
  stationeryShopsTitle: string;
  stationeryShopsSubtitle: string;
  stationeryProductsTitle: string;

  // 5. Global Actions, Badges & Footer
  bargainButtonText: string;
  addToCartButtonText: string;
  freeDeliveryThresholdText: string;
  footerContactTitle: string;
  footerVerifiedTitle: string;
  footerVerifiedText: string;
  footerDiningTitle: string;
  footerDiningText: string;

  // 6. Custom arbitrary text overrides dictionary (for dynamic string replacement everywhere)
  customTextOverrides: Record<string, string>;
}

export interface ParchhiItemMatch {
  id: string;
  originalText: string;
  requestedQty?: string;
  matchedProduct?: Product;
  confidence: number; // 0 to 100
  selected: boolean;
  quantity: number;
  note?: string;
  status: 'matched' | 'fuzzy' | 'unmatched';
}

export interface ParchhiScanResponse {
  rawDetectedText: string;
  items: ParchhiItemMatch[];
  matchedCount: number;
  totalDetected: number;
  estimatedCartValue: number;
  potentialSavings: number;
}

export interface PrintoutConfig {
  id: string;
  fileName: string;
  fileSize?: string;
  fileType: 'pdf' | 'docx' | 'image' | 'doc';
  pageCount: number;
  copies: number;
  colorMode: 'bw' | 'color' | 'photo_hd';
  paperType: 'standard_75gsm' | 'bond_100gsm' | 'glossy_photo' | 'stamp_legal';
  printSide: 'single' | 'duplex';
  binding: 'none' | 'staple' | 'spiral_coil' | 'transparent_folder' | 'hardcover_gold';
  orientation: 'portrait' | 'landscape';
  urgentExpress: boolean;
  specialInstructions?: string;
  pricePerPage: number;
  totalPagesToPrint: number;
  bindingCost: number;
  paperUpgradeCost: number;
  basePrintingCost: number;
  subtotal: number;
  discount: number;
  finalPrice: number;
}

