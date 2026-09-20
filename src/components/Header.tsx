import React from 'react';
import { Navbar } from './Navbar';
import { UserRole, LoyaltyTier, Product, CartItem, CustomerProfile, CustomerAddress, AppFeatureFlags, SiteContentConfig } from '../types';
import { SiteTheme } from '../utils/themeUtils';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isAdminAuthenticated?: boolean;
  onOpenAdminAuth?: () => void;
  onLockAdmin?: () => void;
  isSellerAuthenticated?: boolean;
  onOpenSellerAuth?: () => void;
  onLockSeller?: () => void;
  isDeliveryAuthenticated?: boolean;
  onOpenDeliveryAuth?: () => void;
  onLockDelivery?: () => void;
  cartCount: number;
  onOpenCart: () => void;
  wishlistCount?: number;
  onOpenWishlist?: () => void;
  userCoins: number;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'New' | 'VIP';
  onOpenOrders: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onSelectTodaysDeals?: () => void;
  onLogoClick?: () => void;
  onHomeClick?: () => void;
  onShopAllClick?: () => void;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onUpdateCartQty?: (product: Product, qty: number) => void;
  cartItems?: CartItem[];
  onBargainClick?: (product: Product) => void;
  onSelectCategory?: (category: string) => void;
  onOpenDeliveryRegisterModal?: () => void;
  onOpenVoiceAssistant?: () => void;
  onOpenCustomerAuth?: (reason?: 'checkout' | 'profile' | 'bargain' | 'general') => void;
  customerProfile?: CustomerProfile;
  selectedAddress?: CustomerAddress;
  onOpenAddressModal?: () => void;
  savedAddresses?: CustomerAddress[];
  canGoBack?: boolean;
  onGoBack?: () => void;
  previousLabel?: string;
  onOpenParchhiScanner?: () => void;
  onOpenPrintoutModal?: () => void;
  onSubmitSearch?: (query: string) => void;
  currentTheme?: SiteTheme;
  onThemeChange?: (theme: SiteTheme) => void;
  featureFlags?: AppFeatureFlags;
  siteContent?: SiteContentConfig;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  isAdminAuthenticated = false,
  onOpenAdminAuth,
  onLockAdmin,
  isSellerAuthenticated = false,
  onOpenSellerAuth,
  onLockSeller,
  isDeliveryAuthenticated = false,
  onOpenDeliveryAuth,
  onLockDelivery,
  cartCount,
  onOpenCart,
  wishlistCount = 0,
  onOpenWishlist = () => {},
  userCoins,
  loyaltyTier,
  onOpenOrders,
  searchQuery,
  onSearchChange,
  activeTab = 'home',
  setActiveTab = () => {},
  onSelectTodaysDeals,
  onLogoClick,
  onHomeClick,
  onShopAllClick,
  products = [],
  onSelectProduct,
  onAddToCart,
  onUpdateCartQty,
  cartItems = [],
  onBargainClick,
  onSelectCategory,
  onOpenDeliveryRegisterModal,
  onOpenVoiceAssistant,
  onOpenCustomerAuth,
  customerProfile,
  selectedAddress,
  onOpenAddressModal,
  savedAddresses = [],
  canGoBack,
  onGoBack,
  previousLabel,
  onOpenParchhiScanner,
  onOpenPrintoutModal,
  onSubmitSearch,
  currentTheme,
  onThemeChange,
  featureFlags,
  siteContent
}) => {
  return (
    <Navbar
      currentRole={currentRole}
      onRoleChange={onRoleChange}
      isAdminAuthenticated={isAdminAuthenticated}
      onOpenAdminAuth={onOpenAdminAuth}
      onLockAdmin={onLockAdmin}
      isSellerAuthenticated={isSellerAuthenticated}
      onOpenSellerAuth={onOpenSellerAuth}
      onLockSeller={onLockSeller}
      isDeliveryAuthenticated={isDeliveryAuthenticated}
      onOpenDeliveryAuth={onOpenDeliveryAuth}
      onLockDelivery={onLockDelivery}
      loyaltyTier={loyaltyTier as any}
      onTierChange={() => {}}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      onOpenCart={onOpenCart}
      onOpenWishlist={onOpenWishlist}
      onOpenOrders={onOpenOrders}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onSelectTodaysDeals={onSelectTodaysDeals}
      onLogoClick={onLogoClick}
      onHomeClick={onHomeClick}
      onShopAllClick={onShopAllClick}
      searchQuery={searchQuery}
      setSearchQuery={onSearchChange}
      selectedZone="zone-a"
      setSelectedZone={() => {}}
      zones={[
        { id: 'zone-a', name: 'Zone A - Central City (0-5 km)', estimatedTime: '15-25 Mins' },
        { id: 'zone-b', name: 'Zone B - Extended Suburbs', estimatedTime: '25-40 Mins' }
      ]}
      selectedAddress={selectedAddress}
      onOpenAddressModal={onOpenAddressModal}
      savedAddresses={savedAddresses}
      products={products}
      onSelectProduct={onSelectProduct}
      onAddToCart={onAddToCart}
      onUpdateCartQty={onUpdateCartQty}
      cartItems={cartItems}
      onBargainClick={onBargainClick}
      onSelectCategory={onSelectCategory}
      onOpenDeliveryRegisterModal={onOpenDeliveryRegisterModal}
      onOpenVoiceAssistant={onOpenVoiceAssistant}
      onOpenCustomerAuth={onOpenCustomerAuth}
      customerProfile={customerProfile}
      canGoBack={canGoBack}
      onGoBack={onGoBack}
      previousLabel={previousLabel}
      onOpenParchhiScanner={onOpenParchhiScanner}
      onOpenPrintoutModal={onOpenPrintoutModal}
      onSubmitSearch={onSubmitSearch}
      currentTheme={currentTheme}
      onThemeChange={onThemeChange}
      freeDeliveryThreshold={featureFlags?.freeDeliveryThreshold ?? 129}
      standardDeliveryFee={featureFlags?.standardDeliveryFee ?? 19}
      announcementTickerText={featureFlags?.announcementTickerText}
      showAnnouncementTicker={featureFlags?.showAnnouncementTicker ?? true}
      siteContent={siteContent}
    />
  );
};
