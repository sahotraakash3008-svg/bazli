import React, { useState } from 'react';
import { Product, Seller, SellerRegistrationRequest, Order, SellerType, PayoutAccountDetails, SellerPayoutRecord } from '../../types';
import { getEffectiveSellerCommission } from '../../utils/sellerCommission';
import {
  Store,
  Plus,
  Edit,
  Package,
  DollarSign,
  TrendingUp,
  Sparkles,
  Check,
  Save,
  ShieldCheck,
  Phone,
  MessageSquare,
  AlertCircle,
  Clock,
  UserPlus,
  RefreshCw,
  Building,
  ChevronDown,
  LogOut,
  Lock,
  Percent,
  Wallet,
  IndianRupee,
  HelpCircle,
  KeyRound,
  Bike,
  CheckCircle2,
  Send,
  Smartphone,
  ArrowRight,
  UtensilsCrossed,
  Flame,
  ChefHat,
  Timer,
  ShoppingBag,
  Layers,
  CheckSquare,
  Camera,
  Image as ImageIcon,
  Trash2,
  Eye,
  ZoomIn,
  UploadCloud,
  X,
  ArrowUpRight,
  Search,
  ShieldAlert,
  AlertTriangle,
  Settings,
  Scale,
  Box,
  Tag,
  Zap,
  Receipt,
  CreditCard,
  Edit3,
  BookOpen
} from 'lucide-react';
import {
  getProductSector,
  ProductSector,
  getCategoriesForSector,
  isGroceryProduct,
  isRestaurantProduct,
  isStationeryProduct,
  getSellerSector,
  isRestaurantSeller,
  isStationerySeller,
  isGrocerySeller,
  isRestaurantOrder,
  isStationeryOrder,
  isGroceryOrder
} from '../../utils/productSector';
import { SellerOnboardingModal } from '../Seller/SellerOnboardingModal';
import { KitchenDisplaySystem } from '../Seller/KitchenDisplaySystem';
import { isWeightAdjustableProduct } from '../../utils/weightUtils';
import { FirebaseImageUploader } from '../Common/FirebaseImageUploader';
import { uploadProductImage, uploadMenuCardPhoto } from '../../lib/storageService';
import { ManagePayoutAccountModal } from './ManagePayoutAccountModal';
import { SellerPayoutModal } from './SellerPayoutModal';
import { SellerGrowthHub } from '../Seller/SellerGrowthHub';

interface SellerPortalProps {
  products: Product[];
  seller: Seller;
  allSellers?: Seller[];
  orders?: Order[];
  onSelectSeller?: (seller) => void;
  onAddProduct: (prod: Partial<Product>) => Promise<void>;
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  onDeleteProduct?: (productId: string) => Promise<void> | void;
  onDeleteSeller?: (sellerId: string) => Promise<void> | void;
  onUpdateSeller?: (sellerId: string, updates: Partial<Seller>) => void;
  onRegisterSellerSuccess?: (newSeller: Seller) => void;
  onLockSeller?: () => void;
  onVerifySellerPickup?: (orderId: string, code: string) => Promise<{ error?: string; success?: boolean }>;
  pendingSellerRequests?: SellerRegistrationRequest[];
  adminWhatsAppPhone?: string;
  adminPasscode?: string;
  onUpdateOrderStatus?: (orderId: string, status: string) => void;
  onUpdateSellerPayoutDetails?: (sellerId: string, details: PayoutAccountDetails) => void;
  onConfirmSellerPayout?: (sellerId: string, amount: number, method: string, destination: string) => void;
}

const DEFAULT_ADMIN_PHONE = '9871618126';

export const SellerPortal: React.FC<SellerPortalProps> = ({
  products,
  seller,
  allSellers = [],
  orders = [],
  onSelectSeller,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onDeleteSeller,
  onUpdateSeller,
  onRegisterSellerSuccess,
  onLockSeller,
  onVerifySellerPickup,
  pendingSellerRequests = [],
  adminWhatsAppPhone = DEFAULT_ADMIN_PHONE,
  adminPasscode = 'BAZLI777',
  onUpdateOrderStatus,
  onUpdateSellerPayoutDetails,
  onConfirmSellerPayout
}) => {
  // Sub-Portal Selection: 'grocery' vs 'restaurant' vs 'stationery'
  const [sellerSubPortal, setSellerSubPortal] = useState<SellerType>(
    seller ? getSellerSector(seller) : 'grocery'
  );

  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'kds' | 'finances' | 'menu-photos' | 'growth'>('inventory');
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isManageAccountModalOpen, setIsManageAccountModalOpen] = useState(false);
  const [selectedSellerSlipRecord, setSelectedSellerSlipRecord] = useState<SellerPayoutRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [isStoreSwitchModalOpen, setIsStoreSwitchModalOpen] = useState(false);
  const [storeFilterTab, setStoreFilterTab] = useState<'all' | 'grocery' | 'restaurant' | 'stationery'>('all');
  const [storeSearchText, setStoreSearchText] = useState('');

  // Menu Photos State
  const [isAddMenuPhotoModalOpen, setIsAddMenuPhotoModalOpen] = useState(false);
  const [newMenuPhotoUrl, setNewMenuPhotoUrl] = useState('');
  const [newMenuPhotoTitle, setNewMenuPhotoTitle] = useState('');
  const [newMenuPhotoCategory, setNewMenuPhotoCategory] = useState('Main Course');
  const [previewPhotoModal, setPreviewPhotoModal] = useState<{ url: string; title: string } | null>(null);

  // Preset sample menu card templates for quick 1-click addition
  const SAMPLE_MENU_TEMPLATES = [
    { title: 'Biryani & Tandoor Card', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=80', category: 'Biryani Special' },
    { title: 'Chef Special Curries & Starters', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80', category: 'Main Course' },
    { title: 'Dine-In Barbeque & Kebabs', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80', category: 'Starters' },
    { title: 'Amritsari Kulcha & Breads Menu', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80', category: 'Breads' },
    { title: 'Royal Desserts & Lassi Price Board', url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=1000&q=80', category: 'Desserts' },
    { title: 'Fast Bites & Kolkata Rolls Card', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1000&q=80', category: 'Rolls & Fast Food' }
  ];

  // Restaurant Kitchen State
  const [kitchenStatus, setKitchenStatus] = useState<'Accepting Orders' | 'Kitchen Rush (+15m)' | 'Paused'>('Accepting Orders');

  // Pickup Handover Code input state
  const [pickupCodeInputs, setPickupCodeInputs] = useState<Record<string, string>>({});
  const [pickupErrors, setPickupErrors] = useState<Record<string, string>>({});
  const [pickupSuccesses, setPickupSuccesses] = useState<Record<string, string>>({});
  const [loadingPickupId, setLoadingPickupId] = useState<string | null>(null);

  // Admin Store Removal State
  const [sellerToDelete, setSellerToDelete] = useState<Seller | null>(null);
  const [adminPasscodeInput, setAdminPasscodeInput] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletingSeller, setIsDeletingSeller] = useState(false);

  const handleInitiateDeleteStore = (targetSeller?: Seller) => {
    const s = targetSeller || seller;
    if (!s) return;
    setSellerToDelete(s);
    setAdminPasscodeInput('');
    setDeleteError(null);
    setIsDeletingSeller(false);
  };

  const handleConfirmDeleteStore = async () => {
    if (!sellerToDelete) return;
    const cleanInput = adminPasscodeInput.trim();
    const expected = adminPasscode || 'BAZLI777';

    // Allow master passcode, BAZLI777, or typed confirmation "DELETE"
    if (cleanInput !== expected && cleanInput.toUpperCase() !== 'BAZLI777' && cleanInput.toUpperCase() !== 'DELETE') {
      setDeleteError(`Invalid passcode. Please enter Master Admin Passcode ("${expected}") or type "DELETE".`);
      return;
    }

    try {
      setIsDeletingSeller(true);
      setDeleteError(null);
      if (onDeleteSeller) {
        await onDeleteSeller(sellerToDelete.id);
      }
      setIsDeletingSeller(false);
      setSellerToDelete(null);
      setIsStoreSwitchModalOpen(false);
    } catch (err: any) {
      setIsDeletingSeller(false);
      setDeleteError(err?.message || 'Error occurred while removing store. Please try again.');
    }
  };

  // Form State
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('Atta, Rice & Dal');
  const [mrp, setMrp] = useState(100);
  const [sellingPrice, setSellingPrice] = useState(90);
  const [stock, setStock] = useState(50);
  const [bargainingAllowed, setBargainingAllowed] = useState(false);
  const [maxBargainDiscountPercent, setMaxBargainDiscountPercent] = useState(20);
  const [minBargainPrice, setMinBargainPrice] = useState(80);
  const [weightType, setWeightType] = useState<'fixed' | 'flexible'>('fixed');
  const [unitType, setUnitType] = useState<'weight' | 'volume' | 'count'>('weight');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80');
  
  // Multi-Image & Rich Description State (Allows 3-4 photos per product/dish)
  const [productImages, setProductImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'
  ]);
  const [productDescription, setProductDescription] = useState('');
  const [productHighlights, setProductHighlights] = useState('');
  const [productShelfLife, setProductShelfLife] = useState('');
  const [productOrigin, setProductOrigin] = useState('');

  // Curated Preset Photo Library for 1-Click Seller Multi-Image Auto-Fill
  const PRESET_PHOTO_TEMPLATES = [
    {
      title: 'Handi Dum Biryani Set (4 Photos)',
      type: 'restaurant',
      images: [
        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      title: 'Paneer Butter Masala (3 Photos)',
      type: 'restaurant',
      images: [
        'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      title: 'Tandoori Starters & Kebabs (3 Photos)',
      type: 'restaurant',
      images: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      title: 'Aashirvaad Atta / Grain Sack (3 Photos)',
      type: 'grocery',
      images: [
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      title: 'Fresh Farm Produce (4 Photos)',
      type: 'grocery',
      images: [
        'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      title: 'Pure Desi Ghee & Dairy (3 Photos)',
      type: 'grocery',
      images: [
        'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80'
      ]
    }
  ];
  
  // Restaurant Dish Specific Form Fields
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number>(15);
  const [isVeg, setIsVeg] = useState<boolean>(true);
  const [spiceLevel, setSpiceLevel] = useState<'Mild' | 'Medium' | 'Spicy' | 'Extra Hot'>('Medium');

  // Filter sellers matching current subportal type
  const matchingSellers = allSellers.filter(s => getSellerSector(s) === sellerSubPortal);

  // Filter sellers for the store switch modal
  const filteredSwitchSellers = allSellers.filter(s => {
    const sSector = getSellerSector(s);
    if (storeFilterTab !== 'all' && sSector !== storeFilterTab) return false;

    if (!storeSearchText.trim()) return true;
    const q = storeSearchText.toLowerCase();
    return (
      s.businessName.toLowerCase().includes(q) ||
      s.ownerName.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q) ||
      (s.address && s.address.toLowerCase().includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q))
    );
  });

  // Current active seller
  const currentSeller = seller || (matchingSellers.length > 0 ? matchingSellers[0] : allSellers[0]);

  const currentSector: ProductSector = currentSeller ? getSellerSector(currentSeller) : (sellerSubPortal as ProductSector);
  const isCurrentRestaurant = currentSector === 'restaurant';
  const isCurrentStationery = currentSector === 'stationery';
  const isCurrentGrocery = currentSector === 'grocery';

  const commissionInfo = getEffectiveSellerCommission(currentSeller);

  // Strict seller products isolation: ONLY show products of this seller AND matching this seller's sector
  const sellerProducts = currentSeller
    ? products.filter(p => {
        const belongsToSeller =
          p.sellerId === currentSeller.id ||
          (p.sellerName &&
            currentSeller.businessName &&
            p.sellerName.toLowerCase().trim() === currentSeller.businessName.toLowerCase().trim() &&
            p.sellerId === currentSeller.id);
        if (!belongsToSeller) return false;

        return getProductSector(p) === currentSector;
      })
    : [];

  // Strict seller orders isolation
  const sellerOrders = currentSeller
    ? orders.filter(o => {
        const belongsToSeller =
          o.sellerId === currentSeller.id ||
          (o.sellerName &&
            currentSeller.businessName &&
            o.sellerName.toLowerCase().trim() === currentSeller.businessName.toLowerCase().trim());
        if (!belongsToSeller) return false;

        return isCurrentRestaurant
          ? isRestaurantOrder(o)
          : isCurrentStationery
          ? isStationeryOrder(o)
          : isGroceryOrder(o);
      })
    : [];

  const pendingPickupOrdersCount = sellerOrders.filter(
    o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled' && !o.sellerPickupConfirmed
  ).length;

  const handleSubPortalChange = (type: SellerType) => {
    setSellerSubPortal(type);
    const targetMatch = allSellers.find(s => getSellerSector(s) === type);
    if (targetMatch && onSelectSeller) {
      onSelectSeller(targetMatch);
    }
  };

  const handleVerifyPickupSubmit = async (orderId: string) => {
    const code = pickupCodeInputs[orderId];
    if (!code) {
      setPickupErrors({ ...pickupErrors, [orderId]: 'Please enter the 4-digit pickup code.' });
      return;
    }

    setLoadingPickupId(orderId);
    if (onVerifySellerPickup) {
      const res = await onVerifySellerPickup(orderId, code);
      if (res.error) {
        setPickupErrors({ ...pickupErrors, [orderId]: res.error });
        setPickupSuccesses({ ...pickupSuccesses, [orderId]: '' });
      } else {
        setPickupErrors({ ...pickupErrors, [orderId]: '' });
        setPickupSuccesses({ ...pickupSuccesses, [orderId]: 'Handover Code verified successfully!' });
      }
    }
    setLoadingPickupId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSeller) return;
    const discountPercentage = Math.round(((mrp - sellingPrice) / mrp) * 100);

    // Clean valid images list (1-4 photos)
    const validImages = productImages.filter(img => img && img.trim().length > 0);
    const primaryImg = validImages[0] || image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80';
    const finalImagesList = validImages.length > 0 ? validImages : [primaryImg];

    const highlightsList = productHighlights
      .split(',')
      .map(h => h.trim())
      .filter(h => h.length > 0);

    if (editingProd) {
      await onUpdateProduct(editingProd.id, {
        name,
        quantity: isCurrentRestaurant ? `${quantity || '1 Portion'} • ${prepTimeMinutes}m prep` : quantity,
        category,
        sellerType: currentSector,
        mrp: Number(mrp),
        sellingPrice: Number(sellingPrice),
        discountPercentage,
        stock: Number(stock),
        bargainingAllowed: isCurrentRestaurant ? false : bargainingAllowed,
        maxBargainDiscountPercent: (isCurrentRestaurant || !bargainingAllowed) ? 0 : Number(maxBargainDiscountPercent),
        minBargainPrice: (isCurrentRestaurant || !bargainingAllowed) ? Number(sellingPrice) : Number(minBargainPrice),
        weightType: isCurrentRestaurant ? 'fixed' : weightType,
        isWeightFlexible: isCurrentRestaurant ? false : weightType === 'flexible',
        allowCustomWeight: isCurrentRestaurant ? false : weightType === 'flexible',
        unitType: isCurrentRestaurant ? 'count' : unitType,
        image: primaryImg,
        images: finalImagesList,
        description:
          productDescription ||
          (isCurrentRestaurant
            ? `Freshly prepared from ${currentSeller.businessName}`
            : isCurrentStationery
            ? `Genuine stationery product from ${currentSeller.businessName}`
            : `Fresh authentic product from ${currentSeller.businessName}`),
        highlights: highlightsList.length > 0 ? highlightsList : undefined,
        shelfLife: productShelfLife || undefined,
        origin: productOrigin || undefined,
        prepTimeMinutes: isCurrentRestaurant ? prepTimeMinutes : undefined,
        isVeg: isCurrentRestaurant ? isVeg : undefined,
        spiceLevel: isCurrentRestaurant ? spiceLevel : undefined,
      });
      setEditingProd(null);
    } else {
      await onAddProduct({
        name,
        quantity: isCurrentRestaurant ? `${quantity || '1 Portion'} • ${prepTimeMinutes}m prep` : quantity,
        category,
        sellerType: currentSector,
        mrp: Number(mrp),
        sellingPrice: Number(sellingPrice),
        discountPercentage,
        stock: Number(stock),
        bargainingAllowed: isCurrentRestaurant ? false : bargainingAllowed,
        maxBargainDiscountPercent: (isCurrentRestaurant || !bargainingAllowed) ? 0 : Number(maxBargainDiscountPercent),
        minBargainPrice: (isCurrentRestaurant || !bargainingAllowed) ? Number(sellingPrice) : Number(minBargainPrice),
        weightType: isCurrentRestaurant ? 'fixed' : weightType,
        isWeightFlexible: isCurrentRestaurant ? false : weightType === 'flexible',
        allowCustomWeight: isCurrentRestaurant ? false : weightType === 'flexible',
        unitType: isCurrentRestaurant ? 'count' : unitType,
        sellerId: currentSeller.id,
        sellerName: currentSeller.businessName,
        image: primaryImg,
        images: finalImagesList,
        description:
          productDescription ||
          (isCurrentRestaurant
            ? `Freshly prepared from ${currentSeller.businessName}`
            : isCurrentStationery
            ? `Genuine stationery product from ${currentSeller.businessName}`
            : `Fresh product from ${currentSeller.businessName}`),
        highlights: highlightsList.length > 0 ? highlightsList : undefined,
        shelfLife: productShelfLife || undefined,
        origin: productOrigin || undefined,
        prepTimeMinutes: isCurrentRestaurant ? prepTimeMinutes : undefined,
        isVeg: isCurrentRestaurant ? isVeg : undefined,
        spiceLevel: isCurrentRestaurant ? spiceLevel : undefined,
      });
      setShowAddModal(false);
    }
  };

  const startEdit = (p: Product) => {
    setEditingProd(p);
    setName(p.name);
    setQuantity(p.quantity);
    setCategory(p.category);
    setMrp(p.mrp);
    setSellingPrice(p.sellingPrice);
    setStock(p.stock);
    
    // Bargain settings
    const isBargainPermitted = Boolean(p.bargainingAllowed);
    setBargainingAllowed(isBargainPermitted);
    const maxDiscount = typeof p.maxBargainDiscountPercent === 'number' ? p.maxBargainDiscountPercent : 20;
    setMaxBargainDiscountPercent(maxDiscount);
    setMinBargainPrice(p.minBargainPrice || Math.round(p.sellingPrice * (1 - maxDiscount / 100)));

    // Weight & Quantity Customization
    const isFlex = p.weightType ? p.weightType === 'flexible' : (p.isWeightFlexible ?? isWeightAdjustableProduct(p));
    setWeightType(isFlex ? 'flexible' : 'fixed');
    setUnitType(p.unitType || (p.quantity?.toLowerCase().includes('l') || p.quantity?.toLowerCase().includes('ml') ? 'volume' : p.quantity?.toLowerCase().includes('pc') || p.quantity?.toLowerCase().includes('pack') ? 'count' : 'weight'));

    setImage(p.image);
    
    // Multi-Image Initialization
    if (p.images && p.images.length > 0) {
      setProductImages(p.images);
    } else {
      setProductImages([p.image]);
    }
    setProductDescription(p.description || '');
    setProductHighlights(p.highlights ? p.highlights.join(', ') : '');
    setProductShelfLife(p.shelfLife || '');
    setProductOrigin(p.origin || '');

    setPrepTimeMinutes(p.prepTimeMinutes || 15);
    setIsVeg(p.isVeg ?? true);
    setSpiceLevel(p.spiceLevel || 'Medium');
    setShowAddModal(true);
  };

  const openAddDishModal = () => {
    setEditingProd(null);
    setName('');
    if (isCurrentRestaurant) {
      setQuantity('1 Portion');
      setCategory('Biryani & Rice Bowls');
      setMrp(280);
      setSellingPrice(240);
      setStock(100);
      setBargainingAllowed(false);
      setMaxBargainDiscountPercent(0);
      setMinBargainPrice(240);
      setWeightType('fixed');
      setUnitType('count');
      const initialImg = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80';
      setImage(initialImg);
      setProductImages([
        initialImg,
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80'
      ]);
      setProductDescription('Prepared with aged long-grain basmati rice, tender cuts, aromatic saffron, and secret shahi spices.');
      setProductHighlights('Freshly Dum Cooked, Authentic Clay Pot Fragrance, Halal & Hygienic');
      setProductShelfLife('Cooked fresh to order');
      setProductOrigin('Master Kitchen Special');
      setPrepTimeMinutes(20);
      setIsVeg(false);
      setSpiceLevel('Medium');
    } else if (isCurrentStationery) {
      setQuantity('1 Unit / Pack');
      setCategory('Notebooks & Registers');
      setMrp(60);
      setSellingPrice(50);
      setStock(100);
      setBargainingAllowed(false);
      setMaxBargainDiscountPercent(15);
      setMinBargainPrice(42);
      setWeightType('fixed');
      setUnitType('count');
      const initialImg = 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80';
      setImage(initialImg);
      setProductImages([
        initialImg,
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80'
      ]);
      setProductDescription(`Genuine quality stationery supplies from ${currentSeller.businessName}. Perfect for school, college, and office use.`);
      setProductHighlights('High GSM Paper, Smooth Writing, Trusted Brand Quality');
      setProductShelfLife('No Expiry');
      setProductOrigin('India');
      setPrepTimeMinutes(0);
      setIsVeg(true);
      setSpiceLevel('Mild');
    } else {
      setQuantity('1 kg');
      setCategory('Atta, Rice & Dal');
      setMrp(120);
      setSellingPrice(105);
      setStock(50);
      setBargainingAllowed(false); // Default to fixed price unless seller enables it
      setMaxBargainDiscountPercent(20);
      setMinBargainPrice(84);
      setWeightType('fixed'); // Default to standard packaged unless seller enables custom weight
      setUnitType('weight');
      const initialImg = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80';
      setImage(initialImg);
      setProductImages([
        initialImg,
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
      ]);
      setProductDescription('100% natural, premium grain sourced directly from local trusted farms. Triple cleaned and packed securely.');
      setProductHighlights('100% Pure & Unadulterated, Chemical Free, Farm Sourced');
      setProductShelfLife('Best before 6 months from packaging');
      setProductOrigin('Punjab, India');
    }
    setShowAddModal(true);
  };

  return (
    <div className="space-y-5 max-w-full overflow-hidden">
      
      {/* Sub-Portal Navigation Selector: 1. Grocery vs 2. Restaurants vs 3. Stationery */}
      <div className="bg-slate-900 p-2 sm:p-2.5 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center p-1 bg-slate-950/80 rounded-2xl border border-slate-800/80 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => handleSubPortalChange('grocery')}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              sellerSubPortal === 'grocery'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>🥦 1. Grocery</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubPortalChange('restaurant')}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              sellerSubPortal === 'restaurant'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>🍳 2. Restaurant</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubPortalChange('stationery')}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              sellerSubPortal === 'stationery'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📚 3. Stationery</span>
          </button>
        </div>

        {/* Sub-Portal Operational Status */}
        <div className="flex items-center justify-between sm:justify-end gap-2 px-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-emerald-400">Live Portal</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-mono text-[10px]">
              {isCurrentRestaurant
                ? 'Kitchen Handover Mode'
                : isCurrentStationery
                ? 'Stationery Order Pickup Mode'
                : 'Store Pickup Mode'}
            </span>
          </div>

          {sellerSubPortal === 'restaurant' && (
            <select
              value={kitchenStatus}
              onChange={(e) => setKitchenStatus(e.target.value as any)}
              className="bg-orange-950/80 text-orange-200 border border-orange-700/60 rounded-xl px-2.5 py-1 text-[11px] font-bold focus:outline-none cursor-pointer"
            >
              <option value="Accepting Orders">🟢 Kitchen: Accepting</option>
              <option value="Kitchen Rush (+15m)">🟡 Kitchen: Rush (+15m)</option>
              <option value="Paused">🔴 Kitchen: Paused</option>
            </select>
          )}
        </div>
      </div>

      {/* Top Banner with Merchant Branding & Phone Verification Actions */}
      <div className={`text-white p-4 sm:p-7 rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
        isCurrentRestaurant
          ? 'bg-gradient-to-r from-stone-900 via-orange-950 to-amber-950 border border-orange-700/40'
          : isCurrentStationery
          ? 'bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 border border-purple-700/40'
          : currentSeller?.isAdminStore
          ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-700/40'
          : 'bg-gradient-to-r from-amber-900 via-amber-800 to-yellow-900 border border-amber-600/30'
      }`}>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner shrink-0 ${
              isCurrentRestaurant
                ? 'bg-orange-500/20 text-orange-300 border-orange-400/40'
                : isCurrentStationery
                ? 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                : currentSeller?.isAdminStore
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
            }`}>
              {isCurrentRestaurant ? (
                <UtensilsCrossed className="w-6 h-6" />
              ) : isCurrentStationery ? (
                <BookOpen className="w-6 h-6" />
              ) : currentSeller?.isAdminStore ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <Store className="w-6 h-6" />
              )}
            </div>
            
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black truncate">
                  {currentSeller ? currentSeller.businessName : isCurrentRestaurant ? 'Restaurant Kitchen' : isCurrentStationery ? 'Stationery Store' : 'Grocery Store'}
                </h2>
                
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1 ${
                  isCurrentRestaurant
                    ? 'bg-orange-400 text-slate-950'
                    : isCurrentStationery
                    ? 'bg-purple-400 text-slate-950'
                    : 'bg-amber-300 text-amber-950'
                }`}>
                  <Percent className="w-3 h-3" />
                  <span>{isCurrentRestaurant ? 'Restaurant Sub-Portal' : isCurrentStationery ? 'Stationery Sub-Portal' : 'Grocery Sub-Portal'} ({commissionInfo.isPromotionalZeroCommission ? '0% Promo' : '10% Fee'})</span>
                </span>

                <span className="bg-slate-950/80 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Admin WhatsApp: +91 {adminWhatsAppPhone}</span>
                </span>
              </div>

              {currentSeller && (
                <p className="text-slate-200 text-[11px] sm:text-xs mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-medium">
                  <span>Merchant: <strong>{currentSeller.ownerName}</strong></span>
                  <span>•</span>
                  <span>Phone: <strong className="font-mono">{currentSeller.phone}</strong></span>
                  <span>•</span>
                  <span>GSTIN/FSSAI: <strong className="font-mono">{currentSeller.fssaiLicenseNumber || currentSeller.gstNumber}</strong></span>
                  {currentSeller.averagePrepTimeMinutes && (
                    <>
                      <span>•</span>
                      <span>Avg Prep: <strong className="font-mono text-amber-300">{currentSeller.averagePrepTimeMinutes} mins</strong></span>
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Store Switcher Modal Trigger */}
          {onSelectSeller && (
            <button
              onClick={() => setIsStoreSwitchModalOpen(true)}
              className="px-3.5 py-2 bg-black/40 hover:bg-black/60 text-amber-200 text-xs font-bold rounded-2xl border border-amber-600/40 flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
              title="Switch Active Store or Restaurant"
            >
              <Building className="w-3.5 h-3.5 text-amber-300" />
              <span>Switch {isCurrentRestaurant ? 'Restaurant' : isCurrentStationery ? 'Stationery' : 'Shop'}</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                {allSellers.length}
              </span>
            </button>
          )}

          {/* Button to Onboard / Register New Seller with Phone & Admin OTP */}
          <button
            onClick={() => setIsOnboardingModalOpen(true)}
            className="px-3.5 py-2 bg-black/40 hover:bg-black/60 text-amber-300 font-black text-xs rounded-2xl border border-amber-500/40 flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>+ Onboard {isCurrentRestaurant ? 'Restaurant' : isCurrentStationery ? 'Stationery' : 'Store'}</span>
          </button>

          {/* Admin Remove Store Button */}
          {onDeleteSeller && currentSeller && !currentSeller.isAdminStore && currentSeller.id !== 's-admin' && (
            <button
              onClick={() => handleInitiateDeleteStore(currentSeller)}
              className="px-3 py-2 bg-rose-950/70 hover:bg-rose-900 text-rose-300 font-bold text-xs rounded-2xl border border-rose-600/40 flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
              title="Admin: Deregister & Remove this store from Bazli"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Admin: Remove Store</span>
            </button>
          )}

          {onLockSeller && (
            <button
              onClick={onLockSeller}
              className="px-3 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-2xl border border-slate-700/50 flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
              title="Lock Seller Portal session"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Lock</span>
            </button>
          )}

          {currentSeller && (
            <button
              onClick={openAddDishModal}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2 rounded-2xl shadow-md transition-all flex items-center space-x-1.5 text-xs cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isCurrentRestaurant ? 'Add Dish / Menu Item' : isCurrentStationery ? 'Add Stationery Item' : 'Add Grocery Item'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Commission Status Banner: 2-Months 0% Offer or 10% Standard Policy */}
      {commissionInfo.isPromotionalZeroCommission ? (
        <div className="p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-gradient-to-r from-emerald-950 via-[#0a2e1d] to-slate-950 border-emerald-500/80 text-white shadow-lg relative overflow-hidden">
          <div className="flex items-center space-x-3 relative z-10">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black bg-gradient-to-br from-amber-400 to-emerald-400 text-slate-950 shadow-md text-sm">
              0%
            </div>
            <div>
              <div className="font-black flex items-center gap-1.5 flex-wrap">
                <span className="text-white text-sm">🎉 Welcome Offer: 0% Commission Active!</span>
                <span className="bg-emerald-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  {commissionInfo.daysRemainingInPromo} Days Remaining
                </span>
                <span className="bg-white/10 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Valid till {commissionInfo.promoExpiryDate}
                </span>
              </div>
              <div className="text-emerald-100/90 text-[11px] leading-relaxed mt-0.5">
                New Merchant Welcome Window: Enjoy <strong>0% admin commission</strong> with <strong>100% net settlement</strong> credited to your wallet for your first 2 months (60 days). After 2 months, Bazli's standard 10% platform fee will automatically take effect.
              </div>
            </div>
          </div>

          <div className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 rounded-xl font-mono font-black text-xs shrink-0 flex items-center gap-1 shadow-md relative z-10">
            <span>Net Payout: 100% (0% Fee)</span>
          </div>
        </div>
      ) : (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
          isCurrentRestaurant
            ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 text-orange-950'
            : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 text-amber-950'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold shadow-xs ${
              isCurrentRestaurant ? 'bg-orange-500 text-white' : 'bg-amber-500 text-slate-950'
            }`}>
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black flex items-center gap-1.5">
                <span>Bazli {isCurrentRestaurant ? 'Restaurant & Cloud Kitchen' : 'Grocery Merchant'} Agreement</span>
                <span className="bg-amber-200 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  10% PLATFORM FEE
                </span>
                {currentSeller?.joinedDate && (
                  <span className="bg-slate-200 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded-full">
                    2-Month Promo Completed
                  </span>
                )}
              </div>
              <div className="text-slate-600 text-[11px] leading-relaxed">
                Standard terms active: <strong>10% admin platform commission</strong> per completed order with <strong>90% net earnings</strong> credited directly to your merchant wallet. Delivery riders follow the same 4-digit pickup code procedure.
              </div>
            </div>
          </div>

          <div className="px-3 py-1.5 bg-amber-200/90 text-amber-950 rounded-xl font-mono font-black text-xs shrink-0 flex items-center gap-1">
            <span>Net Payout: 90%</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {currentSeller && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-semibold block">
              {isCurrentRestaurant ? 'Menu Dishes Listed' : 'Active Grocery Items'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">{sellerProducts.length}</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">{currentSeller.totalSales} fulfilled orders</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-semibold block">Gross Processed Value</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">₹{currentSeller.totalRevenue.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">Customer billings</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-semibold block">
              {commissionInfo.isPromotionalZeroCommission ? 'Platform Fee (0% Promo)' : '10% Platform Fee'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-700 mt-1 block">
              ₹{(currentSeller.totalCommissionPaid !== undefined 
                  ? currentSeller.totalCommissionPaid 
                  : (commissionInfo.isPromotionalZeroCommission ? 0 : Math.round(currentSeller.totalRevenue * 0.10))
                ).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              {commissionInfo.isPromotionalZeroCommission ? `${commissionInfo.daysRemainingInPromo}d promo left (0% fee)` : 'Bazli Admin Share'}
            </span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-semibold block">
              Net Settlement ({commissionInfo.isPromotionalZeroCommission ? '100%' : '90%'})
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 block">
              ₹{(currentSeller.walletBalance !== undefined 
                  ? currentSeller.walletBalance 
                  : (commissionInfo.isPromotionalZeroCommission ? currentSeller.totalRevenue : Math.round(currentSeller.totalRevenue * 0.90))
                ).toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">
              {commissionInfo.isPromotionalZeroCommission ? '100% Payout Window' : 'Wallet Balance'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
            activeTab === 'inventory'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          {isCurrentRestaurant ? <UtensilsCrossed className="w-4 h-4 text-orange-400" /> : <Package className="w-4 h-4 text-amber-400" />}
          <span>{isCurrentRestaurant ? 'Menu & Dish Pricing' : 'Store Inventory & Pricing'}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
            activeTab === 'inventory' ? 'bg-slate-800 text-amber-300' : 'bg-slate-100 text-slate-600'
          }`}>
            {sellerProducts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
            activeTab === 'orders'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Bike className="w-4 h-4 text-sky-400" />
          <span>{isCurrentRestaurant ? 'Kitchen Live Orders & Rider Pickup' : 'Orders & Rider Handover'}</span>
          {pendingPickupOrdersCount > 0 ? (
            <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
              {pendingPickupOrdersCount} Pickup OTP
            </span>
          ) : (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
              activeTab === 'orders' ? 'bg-slate-800 text-sky-300' : 'bg-slate-100 text-slate-600'
            }`}>
              {sellerOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('kds')}
          className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
            activeTab === 'kds'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <ChefHat className="w-4 h-4 text-orange-400" />
          <span>{isCurrentRestaurant ? 'Kitchen Live Display (KDS)' : 'Store Dispatch Queue (KDS)'}</span>
          <span className="bg-orange-500/20 text-orange-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
            Live
          </span>
        </button>

        <button
          onClick={() => setActiveTab('growth')}
          className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
            activeTab === 'growth'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 font-black shadow-xs'
              : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-extrabold'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>🚀 0% Commission & Profit Booster</span>
        </button>

        <button
          onClick={() => setActiveTab('finances')}
          className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
            activeTab === 'finances'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Wallet className="w-4 h-4 text-emerald-400" />
          <span>Settlement & Commission</span>
        </button>

        {isCurrentRestaurant && (
          <button
            onClick={() => setActiveTab('menu-photos')}
            className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
              activeTab === 'menu-photos'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <Camera className="w-4 h-4 text-pink-400" />
            <span>Menu Cards & Photos</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
              activeTab === 'menu-photos' ? 'bg-slate-800 text-pink-300' : 'bg-slate-100 text-slate-600'
            }`}>
              {currentSeller?.menuPhotos?.length || 0}
            </span>
          </button>
        )}
      </div>

      {/* TAB: SELLER GROWTH & 0% COMMISSION HUB */}
      {activeTab === 'growth' && (
        <SellerGrowthHub
          seller={currentSeller || seller}
          adminWhatsAppPhone={adminWhatsAppPhone}
        />
      )}

      {/* TAB 1: INVENTORY & PRICING */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                {isCurrentRestaurant ? <ChefHat className="w-5 h-5 text-orange-600" /> : <Store className="w-5 h-5 text-amber-600" />}
                <span>{isCurrentRestaurant ? 'Restaurant Menu & Dish Pricing' : 'Dark Store Grocery Inventory'}</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isCurrentRestaurant
                  ? 'Manage kitchen menu, prep timing, spice level, and bargain discounts.'
                  : 'Manage grocery staples, FMCG stock quantities, and minimum bargain floors.'}
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full font-mono">
              {sellerProducts.length} Items Listed
            </span>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3.5">Item / Dish</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">MRP / Selling</th>
                  <th className="p-3.5">Merchant Discount</th>
                  <th className="p-3.5">Weight / Quantity Mode</th>
                  <th className="p-3.5">Bargain Control</th>
                  <th className="p-3.5">Floor Price</th>
                  <th className="p-3.5">{isCurrentRestaurant ? 'Kitchen Prep' : 'Stock'}</th>
                  <th className="p-3.5">Availability</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {sellerProducts.map(p => {
                  const isFlexible = p.weightType === 'flexible' || p.isWeightFlexible === true;
                  const isBargainOn = p.bargainingAllowed === true && !isCurrentRestaurant;
                  const currentDiscount = typeof p.maxBargainDiscountPercent === 'number' ? p.maxBargainDiscountPercent : 20;
                  const currentFloor = p.minBargainPrice || Math.round(p.sellingPrice * (1 - currentDiscount / 100));

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 flex items-center space-x-2.5">
                        <img src={p.image} alt="" className="w-11 h-11 rounded-xl object-cover border border-slate-200" />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {p.isVeg !== undefined && (
                              <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                                p.isVeg ? 'border-emerald-600' : 'border-rose-600'
                              }`}>
                                <span className={`w-2 h-2 rounded-full ${p.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                              </span>
                            )}
                            <span className={p.isSoldOut ? 'text-slate-400 line-through' : ''}>{p.name}</span>
                            {p.isSoldOut && (
                              <span className="bg-rose-100 text-rose-700 font-bold text-[9px] px-1.5 py-0.5 rounded">
                                SOLD OUT
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.quantity}</div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium text-[11px]">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {p.mrp && p.mrp > p.sellingPrice ? (
                          <span className="text-slate-400 line-through mr-1 text-[11px]">₹{p.mrp}</span>
                        ) : null}
                        <span className="font-bold text-slate-900 text-sm">₹{p.sellingPrice}</span>
                      </td>

                      {/* Merchant Discount Setting */}
                      <td className="p-3.5">
                        <select
                          value={p.discountPercentage || 0}
                          onChange={async e => {
                            const pct = Number(e.target.value);
                            const baseMrp = p.mrp || p.sellingPrice;
                            if (onUpdateProduct) {
                              if (pct === 0) {
                                await onUpdateProduct(p.id, {
                                  mrp: baseMrp,
                                  sellingPrice: baseMrp,
                                  discountPercentage: 0
                                });
                              } else {
                                const newSelling = Math.max(1, Math.round(baseMrp * (1 - pct / 100)));
                                await onUpdateProduct(p.id, {
                                  mrp: baseMrp,
                                  sellingPrice: newSelling,
                                  discountPercentage: pct
                                });
                              }
                            }
                          }}
                          className={`text-[10px] font-black px-2 py-1 rounded-lg border outline-none cursor-pointer transition-all ${
                            (p.discountPercentage || 0) > 0
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

                      {/* Weight & Quantity Mode (Fixed Packaged vs Flexible Custom Weights) */}
                      <td className="p-3.5">
                        {isCurrentRestaurant ? (
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            Standard Portion
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={async () => {
                              const newWeightType = isFlexible ? 'fixed' : 'flexible';
                              await onUpdateProduct(p.id, {
                                weightType: newWeightType,
                                isWeightFlexible: newWeightType === 'flexible',
                                allowCustomWeight: newWeightType === 'flexible'
                              });
                            }}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 border transition-all cursor-pointer ${
                              isFlexible
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                            }`}
                            title="Click to toggle between Fixed Sealed Pack vs Flexible Mandi Weights (100g, 250g, 500g, 1L...)"
                          >
                            <Scale className="w-3 h-3" />
                            <span>{isFlexible ? 'Flexible (Custom g/ml)' : 'Fixed Packaged'}</span>
                          </button>
                        )}
                      </td>

                      {/* Bargain Negotiation Mode (Fixed Price vs Bargaining Allowed) */}
                      <td className="p-3.5">
                        {isCurrentRestaurant ? (
                          <span className="text-[10px] text-slate-400 font-semibold">Fixed Menu Price</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={async () => {
                                await onUpdateProduct(p.id, {
                                  bargainingAllowed: !isBargainOn,
                                  maxBargainDiscountPercent: !isBargainOn ? currentDiscount : 0,
                                  minBargainPrice: !isBargainOn ? currentFloor : p.sellingPrice
                                });
                              }}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                                isBargainOn
                                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                              title="Toggle Bazli Bargaining permission for this item"
                            >
                              {isBargainOn ? '⚡ Bargain ON' : 'Fixed Price'}
                            </button>

                            {isBargainOn && (
                              <select
                                value={currentDiscount}
                                onChange={async e => {
                                  const newPct = Number(e.target.value);
                                  const newFloor = Math.round(p.sellingPrice * (1 - newPct / 100));
                                  await onUpdateProduct(p.id, {
                                    maxBargainDiscountPercent: newPct,
                                    minBargainPrice: newFloor,
                                    bargainingAllowed: true
                                  });
                                }}
                                className="bg-amber-50 border border-amber-300 text-amber-950 font-black text-[11px] px-1.5 py-0.5 rounded-lg outline-none"
                              >
                                <option value={5}>5% Max</option>
                                <option value={10}>10% Max</option>
                                <option value={15}>15% Max</option>
                                <option value={20}>20% Max</option>
                                <option value={25}>25% Max</option>
                                <option value={30}>30% Max</option>
                              </select>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 font-bold text-emerald-700 font-mono">
                        ₹{isBargainOn ? currentFloor : p.sellingPrice}
                      </td>

                      <td className="p-3.5">
                        {isCurrentRestaurant ? (
                          <span className="text-orange-950 bg-orange-50 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border border-orange-200">
                            ⏱️ {p.prepTimeMinutes || 15} mins
                          </span>
                        ) : (
                          <span className={p.stock < 20 ? 'text-rose-600 font-bold' : 'text-slate-900 font-bold'}>
                            {p.stock} units
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => onUpdateProduct(p.id, { isSoldOut: !p.isSoldOut })}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all border ${
                            p.isSoldOut
                              ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          }`}
                          title="Click to toggle availability"
                        >
                          <span className={`w-2 h-2 rounded-full ${p.isSoldOut ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                          <span>{p.isSoldOut ? 'Out of Stock' : 'In Stock'}</span>
                        </button>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(p)}
                            className="p-2 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl font-bold cursor-pointer transition-colors"
                            title="Edit Item"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {onDeleteProduct && (
                            <button
                              type="button"
                              onClick={async () => {
                                await onDeleteProduct(p.id);
                              }}
                              className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl font-bold cursor-pointer transition-colors"
                              title="Remove / Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {sellerProducts.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400">
                      No items listed for {currentSeller?.businessName} yet. Click "+ Add New {isCurrentRestaurant ? 'Dish' : 'Product'}" to begin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View (Zero horizontal scroll needed) */}
          <div className="block md:hidden p-3 space-y-3 divide-y divide-slate-100">
            {sellerProducts.map(p => {
              const isFlexible = p.weightType === 'flexible' || p.isWeightFlexible === true;
              const isBargainOn = p.bargainingAllowed === true && !isCurrentRestaurant;
              const currentDiscount = typeof p.maxBargainDiscountPercent === 'number' ? p.maxBargainDiscountPercent : 20;
              const currentFloor = p.minBargainPrice || Math.round(p.sellingPrice * (1 - currentDiscount / 100));

              return (
                <div key={p.id} className="pt-3 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <img src={p.image} alt="" className="w-12 h-12 rounded-xl object-cover border shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-xs truncate flex items-center gap-1">
                          {p.isVeg !== undefined && (
                            <span className={`w-3 h-3 rounded-xs border flex items-center justify-center shrink-0 ${
                              p.isVeg ? 'border-emerald-600' : 'border-rose-600'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${p.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                            </span>
                          )}
                          <span className={`truncate ${p.isSoldOut ? 'text-slate-400 line-through' : ''}`}>{p.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">{p.quantity} • {p.category}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onUpdateProduct(p.id, { isSoldOut: !p.isSoldOut })}
                        className={`px-2 py-1 rounded-lg text-[9px] font-bold border ${
                          p.isSoldOut ? 'bg-rose-50 text-rose-700 border-rose-300' : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        }`}
                      >
                        {p.isSoldOut ? 'Sold Out' : 'Available'}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className="p-2 bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 rounded-xl cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {onDeleteProduct && (
                        <button
                          type="button"
                          onClick={async () => {
                            await onDeleteProduct(p.id);
                          }}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Weight & Bargain Toggle Pill Controls for Mobile */}
                  {!isCurrentRestaurant && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={async () => {
                          const newWeightType = isFlexible ? 'fixed' : 'flexible';
                          await onUpdateProduct(p.id, {
                            weightType: newWeightType,
                            isWeightFlexible: newWeightType === 'flexible',
                            allowCustomWeight: newWeightType === 'flexible'
                          });
                        }}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 cursor-pointer ${
                          isFlexible ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <Scale className="w-2.5 h-2.5" />
                        <span>{isFlexible ? 'Flexible Weight (100g, 250g...)' : 'Fixed Packaged'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          await onUpdateProduct(p.id, {
                            bargainingAllowed: !isBargainOn,
                            maxBargainDiscountPercent: !isBargainOn ? currentDiscount : 0,
                            minBargainPrice: !isBargainOn ? currentFloor : p.sellingPrice
                          });
                        }}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 cursor-pointer ${
                          isBargainOn ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>{isBargainOn ? `Bargain: Max ${currentDiscount}%` : 'Fixed Price'}</span>
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-2 rounded-xl text-[11px]">
                    <div>
                      <span className="text-[9px] text-slate-400 block">Price</span>
                      <span className="font-bold text-slate-900">₹{p.sellingPrice}</span>
                      <span className="text-[9px] text-slate-400 line-through ml-1">₹{p.mrp}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">{isBargainOn ? 'Floor Price' : 'Fixed Price'}</span>
                      <span className="font-bold text-emerald-700">₹{isBargainOn ? currentFloor : p.sellingPrice}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">{isCurrentRestaurant ? 'Prep Time' : 'Stock'}</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {isCurrentRestaurant ? `${p.prepTimeMinutes || 15}m` : `${p.stock} pcs`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {sellerProducts.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                No items listed yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS & DUAL-CODE PICKUP HANDOVER */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                {isCurrentRestaurant ? <UtensilsCrossed className="w-5 h-5 text-orange-600" /> : <Store className="w-5 h-5 text-amber-600" />}
                <span>{isCurrentRestaurant ? 'Restaurant Kitchen Orders & Rider Pickup' : 'Store Pickup & Rider Handover'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isCurrentRestaurant
                  ? 'Live food preparation queue. When order is packed, verify the 4-Digit Handover Code sent to your mobile (+91 ' + (currentSeller?.phone || '') + ') with the delivery rider.'
                  : 'Dark store dispatch queue. When rider arrives, verify the 4-Digit Handover Code sent to your mobile (+91 ' + (currentSeller?.phone || '') + ').'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 text-amber-950 p-2.5 rounded-2xl font-bold shrink-0">
              <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Same 4-Digit OTP System</span>
            </div>
          </div>

          {sellerOrders.length === 0 ? (
            <div className="bg-white p-10 sm:p-14 rounded-3xl border border-slate-200 text-center space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-700">No Orders Received Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Customer orders for {currentSeller?.businessName} will appear here with live rider assignment and pickup handover codes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sellerOrders.map(order => {
                const isFullyCollected = order.sellerPickupConfirmed && order.deliveryPickupConfirmed;
                const isDelivered = order.orderStatus === 'Delivered';

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-3xl border transition-all p-4 sm:p-6 shadow-sm space-y-4 ${
                      isDelivered
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : isFullyCollected
                        ? 'border-sky-200 bg-sky-50/10'
                        : 'border-amber-300 shadow-amber-500/5 ring-1 ring-amber-400/30'
                    }`}
                  >
                    {/* Order Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-400 font-mono font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                          #{order.id.slice(-4)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-black text-slate-900 text-sm">Order #{order.id}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide flex items-center gap-1 ${
                              order.orderStatus === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : order.orderStatus === 'Picked Up' || order.orderStatus === 'Out for Delivery'
                                ? 'bg-sky-100 text-sky-800 border border-sky-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}>
                              {order.orderStatus === 'Delivered' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              <span>{order.orderStatus}</span>
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                            Placed: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Customer: <strong className="text-slate-700">{order.customerName}</strong> ({order.customerPhone})
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <div className="font-mono font-black text-slate-900 text-base">₹{order.finalAmount}</div>
                        <div className="text-[10px] text-slate-500">
                          Store Net Payout: <strong className="text-emerald-700 font-mono">₹{order.sellerPayoutAmount ?? Math.round(order.finalAmount * 0.9)}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Basket items summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200/70">
                          <img src={it.image} alt={it.productName} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-900 truncate">{it.productName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{it.unitQuantity} × {it.quantity} Qty</div>
                          </div>
                          <span className="font-mono font-bold text-slate-800 text-xs">₹{it.paidPrice * it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Assigned Delivery Partner Details */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 text-white p-3.5 rounded-2xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center border border-sky-400/30 shrink-0">
                          <Bike className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Assigned Delivery Partner</div>
                          <div className="font-bold text-sm text-white flex items-center gap-1.5">
                            <span>{order.deliveryPartnerName || 'Assigned Rider'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2.5 py-1 bg-white/10 text-slate-200 rounded-xl font-mono text-[11px]">
                          Zone: {order.deliveryZoneId}
                        </span>
                        <a
                          href={`tel:${order.customerPhone || '9876543210'}`}
                          className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Rider</span>
                        </a>
                      </div>
                    </div>

                    {/* Store Pickup Handover Verification Matrix */}
                    <div className="bg-gradient-to-br from-amber-50 via-yellow-50/50 to-orange-50/40 p-4 sm:p-5 rounded-2xl border-2 border-amber-300/80 space-y-3.5">
                      {/* Simulated SMS Alert from Admin to Seller Mobile */}
                      <div className="bg-white/90 border border-amber-200 p-3 rounded-xl flex items-start gap-2.5 text-xs shadow-2xs">
                        <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-2xs">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-extrabold text-amber-950 flex flex-wrap items-center justify-between gap-1">
                            <span>SMS to Seller Mobile (+91 {currentSeller?.phone})</span>
                            <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.2 rounded-full font-bold">
                              From: Bazli Admin
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            "{isCurrentRestaurant ? 'Restaurant Kitchen Alert' : 'Store Dispatch Alert'}: Order #{order.id} pickup handover code is <strong className="font-mono text-base font-black text-amber-900 bg-amber-200/80 px-1.5 py-0.2 rounded">{order.pickupOtp}</strong>. Verify with rider to release package."
                          </p>
                        </div>
                      </div>

                      {/* Dual Status Progress Tracker */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className={`p-3 rounded-xl border flex items-center justify-between ${
                          order.sellerPickupConfirmed
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                            : 'bg-white border-amber-300 text-amber-950'
                        }`}>
                          <div className="flex items-center gap-2">
                            {isCurrentRestaurant ? <UtensilsCrossed className="w-4 h-4 text-orange-600" /> : <Store className="w-4 h-4 text-amber-600" />}
                            <div>
                              <span className="font-extrabold block">1. {isCurrentRestaurant ? 'Kitchen Verification' : 'Merchant Verification'}</span>
                              <span className="text-[10px] text-slate-500">
                                {order.sellerPickupConfirmed ? 'Handover code entered by store' : 'Pending store code entry'}
                              </span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full font-mono ${
                            order.sellerPickupConfirmed ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                          }`}>
                            {order.sellerPickupConfirmed ? '✓ Confirmed' : '⏳ Pending'}
                          </span>
                        </div>

                        <div className={`p-3 rounded-xl border flex items-center justify-between ${
                          order.deliveryPickupConfirmed
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                            : 'bg-white border-sky-300 text-sky-950'
                        }`}>
                          <div className="flex items-center gap-2">
                            <Bike className="w-4 h-4 text-sky-600" />
                            <div>
                              <span className="font-extrabold block">2. Rider Verification</span>
                              <span className="text-[10px] text-slate-500">
                                {order.deliveryPickupConfirmed ? 'Pickup code entered on Delivery Portal' : 'Rider entering code at pickup'}
                              </span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full font-mono ${
                            order.deliveryPickupConfirmed ? 'bg-emerald-200 text-emerald-900' : 'bg-sky-200 text-sky-900'
                          }`}>
                            {order.deliveryPickupConfirmed ? '✓ Confirmed' : '⏳ Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Feedback Banner or Input Box */}
                      {isFullyCollected ? (
                        <div className="bg-emerald-100 border border-emerald-300 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-950 font-bold">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div>
                              <div>Package Released & Collected by {order.deliveryPartnerName}!</div>
                              <div className="text-[11px] text-emerald-800 font-normal">
                                Transmitted to Admin. Order moving to customer.
                              </div>
                            </div>
                          </div>
                          <span className="bg-emerald-200 text-emerald-900 text-[10px] font-mono font-black px-2.5 py-1 rounded-lg shrink-0">
                            Code: {order.pickupOtp} (Verified)
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2 pt-1">
                          {order.sellerPickupConfirmed ? (
                            <div className="bg-amber-100/70 border border-amber-300 p-3 rounded-xl text-xs text-amber-950 font-bold flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-emerald-700" />
                                <span>Merchant Code Verified! Waiting for rider to enter code on Delivery Portal.</span>
                              </div>
                              <span className="text-[10px] font-mono bg-amber-200 px-2 py-0.5 rounded font-bold">
                                Waiting Rider
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <div className="relative">
                                <input
                                  type="text"
                                  maxLength={4}
                                  placeholder="4-Digit Code"
                                  value={pickupCodeInputs[order.id] || ''}
                                  onChange={e => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    setPickupCodeInputs({ ...pickupCodeInputs, [order.id]: val });
                                    if (pickupErrors[order.id]) {
                                      setPickupErrors({ ...pickupErrors, [order.id]: '' });
                                    }
                                  }}
                                  className="w-full sm:w-36 bg-white text-sm px-3.5 py-2.5 border-2 border-amber-400 rounded-xl font-mono font-black tracking-widest text-center text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setPickupCodeInputs({ ...pickupCodeInputs, [order.id]: order.pickupOtp });
                                }}
                                className="px-3 py-2.5 bg-amber-200/80 hover:bg-amber-200 text-amber-950 font-black text-xs rounded-xl border border-amber-300 cursor-pointer flex items-center justify-center gap-1 transition-all"
                              >
                                <span>⚡ Autofill SMS Code ({order.pickupOtp})</span>
                              </button>

                              <button
                                onClick={() => handleVerifyPickupSubmit(order.id)}
                                disabled={loadingPickupId === order.id || !pickupCodeInputs[order.id]}
                                className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all transform active:scale-95 shrink-0"
                              >
                                {loadingPickupId === order.id ? (
                                  'Verifying...'
                                ) : (
                                  <>
                                    <KeyRound className="w-4 h-4" />
                                    <span>Verify & Handover to Rider</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          {pickupErrors[order.id] && (
                            <div className="text-xs text-rose-600 font-bold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span>{pickupErrors[order.id]}</span>
                            </div>
                          )}
                          {pickupSuccesses[order.id] && (
                            <div className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{pickupSuccesses[order.id]}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: KITCHEN DISPLAY SYSTEM (KDS) */}
      {activeTab === 'kds' && currentSeller && (
        <KitchenDisplaySystem
          orders={orders}
          seller={currentSeller}
          onUpdateOrderStatus={onUpdateOrderStatus}
          onVerifySellerPickup={onVerifySellerPickup}
        />
      )}

      {/* TAB 3: COMMISSION & PASSBOOK */}
      {activeTab === 'finances' && currentSeller && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-6 shadow-2xs">
          
          {/* Header & Primary Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-100 pb-5 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200 mb-1.5">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Bazli FastPay • RazorpayX & IMPS Payouts</span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                {isCurrentRestaurant ? 'Restaurant Settlements & Bank Payouts' : 'Store Settlements & Bank Payouts'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {commissionInfo.isPromotionalZeroCommission ? (
                  <span className="text-emerald-700 font-semibold">
                    🎉 Welcome Promo Active: <strong>0% Commission for 2 Months</strong> ({commissionInfo.daysRemainingInPromo} days remaining till {commissionInfo.promoExpiryDate}). 100% of customer orders are credited to your merchant wallet with zero deductions.
                  </span>
                ) : (
                  <span>
                    Transparent 10% platform fee ledger with 24/7 instant cashout to your linked Bank Account or UPI ID (Promotional 2-month 0% period completed).
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setIsManageAccountModalOpen(true)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Building className="w-4 h-4 text-slate-600" />
                <span>Link / Edit Bank & UPI</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md hover:shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Withdraw Balance (₹{(currentSeller.walletBalance !== undefined ? currentSeller.walletBalance : (commissionInfo.isPromotionalZeroCommission ? currentSeller.totalRevenue : Math.round(currentSeller.totalRevenue * 0.90))).toLocaleString()})</span>
              </button>
            </div>
          </div>

          {/* Wallet and Revenue Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-bold block">Gross Processed Value (100%)</span>
              <span className="text-2xl font-mono font-black text-slate-900 mt-1 block">
                ₹{currentSeller.totalRevenue.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                From completed customer orders
              </span>
            </div>

            <div className="p-4.5 bg-amber-50 rounded-2xl border border-amber-200">
              <span className="text-xs text-amber-800 font-bold block">
                {commissionInfo.isPromotionalZeroCommission ? 'Platform Fee (0% Promo)' : 'Platform Fee (10% Commission)'}
              </span>
              <span className="text-2xl font-mono font-black text-amber-900 mt-1 block">
                ₹{(currentSeller.totalCommissionPaid !== undefined 
                    ? currentSeller.totalCommissionPaid 
                    : (commissionInfo.isPromotionalZeroCommission ? 0 : Math.round(currentSeller.totalRevenue * 0.10))
                  ).toLocaleString()}
              </span>
              <span className="text-[11px] text-amber-700/80 mt-1 block">
                {commissionInfo.isPromotionalZeroCommission 
                  ? `₹0 fee active (${commissionInfo.daysRemainingInPromo}d left until 10% auto-applies)`
                  : 'Bazli server hosting & dispatch'}
              </span>
            </div>

            <div className="p-4.5 bg-emerald-50 rounded-2xl border border-emerald-300 ring-2 ring-emerald-500/10">
              <span className="text-xs text-emerald-800 font-bold block">
                Available for Withdrawal ({commissionInfo.isPromotionalZeroCommission ? '100%' : '90%'})
              </span>
              <span className="text-2xl font-mono font-black text-emerald-950 mt-1 block">
                ₹{(currentSeller.walletBalance !== undefined 
                    ? currentSeller.walletBalance 
                    : (commissionInfo.isPromotionalZeroCommission ? currentSeller.totalRevenue : Math.round(currentSeller.totalRevenue * 0.90))
                  ).toLocaleString()}
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                ● 24x7 Instant Direct Deposit ({commissionInfo.isPromotionalZeroCommission ? '100% Net' : '90% Net'})
              </span>
            </div>
          </div>

          {/* Linked Payout Beneficiary Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-900 text-sm">Linked Payout Destination</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full border border-emerald-300">
                      RazorpayX Ready
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Payouts and automated nightly settlements are routed to this verified account.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsManageAccountModalOpen(true)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Change Account / UPI</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block font-semibold">Beneficiary Name:</span>
                <span className="font-bold text-slate-900">
                  {currentSeller.payoutDetails?.accountHolderName || currentSeller.ownerName || currentSeller.businessName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-semibold">Active Mode:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {currentSeller.payoutDetails?.payoutMode || 'UPI / Bank IMPS'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-semibold">Account / UPI Identifier:</span>
                <span className="font-mono font-black text-emerald-800 break-all">
                  {currentSeller.payoutDetails?.upiId || (currentSeller.payoutDetails?.accountNumber ? `A/C •••• ${currentSeller.payoutDetails.accountNumber.slice(-4)} (${currentSeller.payoutDetails.ifscCode})` : currentSeller.bankAccountOrUpi || (currentSeller.phone ? `${currentSeller.phone}@upi` : 'merchant@upi'))}
                </span>
              </div>
            </div>
          </div>

          {/* Settlement Passbook & Transaction Ledger */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-700" />
                <span>Settlement History & Passbook</span>
              </h4>
              <span className="text-xs text-slate-400 font-semibold">
                Auto-updated upon withdrawal
              </span>
            </div>

            {currentSeller.payoutHistory && currentSeller.payoutHistory.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Ref ID</th>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Channel</th>
                      <th className="p-3">Beneficiary Destination</th>
                      <th className="p-3">Bank UTR / Payout ID</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Voucher</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {currentSeller.payoutHistory.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-800">{rec.id}</td>
                        <td className="p-3 text-slate-600 whitespace-nowrap">
                          {new Date(rec.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-3 font-medium text-slate-700">{rec.payoutMethod}</td>
                        <td className="p-3 font-mono text-slate-600">{rec.destination}</td>
                        <td className="p-3 font-mono text-slate-500 text-[11px]">{rec.utrNumber || rec.razorpayPayoutId || 'NPCI-DIRECT'}</td>
                        <td className="p-3 font-mono font-black text-emerald-700 text-sm">₹{rec.amount.toLocaleString()}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{rec.status}</span>
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedSellerSlipRecord(rec)}
                            className="text-xs font-bold text-slate-700 hover:text-emerald-700 underline cursor-pointer"
                          >
                            View Slip
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-2">
                <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No Past Withdrawals Yet</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  When you withdraw your available balance (90%), settlement records with UTR numbers and printable vouchers will appear here.
                </p>
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(true)}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Withdraw First Settlement</span>
                </button>
              </div>
            )}
          </div>

          {/* Store Governance & Danger Zone (Admin Action) */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="bg-rose-50/70 rounded-2xl border border-rose-200/80 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    Admin Governance
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm">Store Deregistration & Removal</h4>
                </div>
                <p className="text-xs text-slate-600 max-w-xl">
                  Admins can permanently remove this store profile, purge its catalog, and deregister merchant operations from the Bazli network. Requires Master Admin PIN verification.
                </p>
              </div>

              {onDeleteSeller && !currentSeller.isAdminStore && currentSeller.id !== 's-admin' ? (
                <button
                  type="button"
                  onClick={() => handleInitiateDeleteStore(currentSeller)}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove This Store (Admin)</span>
                </button>
              ) : (
                <span className="text-xs text-slate-400 font-medium italic">
                  Protected System Store
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DIGITIZED MENU PHOTOS & RATE CARDS (RESTAURANT PORTAL) */}
      {activeTab === 'menu-photos' && currentSeller && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-pink-100 text-pink-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  Live Menu Cards
                </span>
                <span className="text-[11px] text-slate-400 font-bold">
                  Visible to Customers in Bazli Restaurant
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg mt-1 flex items-center gap-2">
                <span>Digitized Restaurant Menu Cards & Food Gallery</span>
              </h3>
              <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
                Upload clear high-resolution photos of your physical dine-in menu cards, rate lists, chef's specials board, or food spreads. Customers can view and zoom into these menu photos directly from your restaurant's page!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-bold">
                Visible to Customers in Bazli Restaurant
              </span>
            </div>

            <button
              onClick={() => setIsAddMenuPhotoModalOpen(true)}
              className="bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Menu Photo</span>
            </button>
          </div>

          {/* Quick preset templates banner */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-pink-50 rounded-2xl p-4 border border-orange-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-orange-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-600" />
                Quick 1-Click Menu Photo Templates (Instant Add)
              </span>
              <span className="text-[10px] text-orange-700 font-bold">Click any card to add instantly</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {SAMPLE_MENU_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const newDetail = {
                      id: `mp-${Date.now()}-${idx}`,
                      url: tmpl.url,
                      title: tmpl.title,
                      category: tmpl.category,
                      uploadDate: new Date().toISOString().split('T')[0]
                    };
                    const updatedPhotos = [...(currentSeller.menuPhotos || []), tmpl.url];
                    const updatedDetails = [...(currentSeller.menuPhotoDetails || []), newDetail];
                    if (onUpdateSeller) {
                      onUpdateSeller(currentSeller.id, {
                        menuPhotos: updatedPhotos,
                        menuPhotoDetails: updatedDetails
                      });
                    }
                  }}
                  className="bg-white/90 hover:bg-white p-2 rounded-xl border border-orange-200 text-left transition-all hover:shadow-xs group cursor-pointer"
                >
                  <img
                    src={tmpl.url}
                    alt={tmpl.title}
                    className="w-full h-16 object-cover rounded-lg mb-1.5 group-hover:scale-[1.02] transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-[10px] font-bold text-slate-800 line-clamp-1">{tmpl.title}</div>
                  <div className="text-[9px] text-orange-600 font-bold flex items-center gap-0.5 mt-0.5">
                    <Plus className="w-2.5 h-2.5" /> Quick Add
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Uploaded Menu Photos Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-slate-800">
                Uploaded Menu Cards ({(currentSeller.menuPhotos || []).length})
              </span>
              <span className="text-[11px] text-slate-400">
                Tip: Click any photo to view in high resolution zoom
              </span>
            </div>

            {(!currentSeller.menuPhotos || currentSeller.menuPhotos.length === 0) ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
                <Camera className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-extrabold text-slate-700 text-sm">No menu photos added yet</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Add photos of your menu card so customers can browse your full offerings and dish rates on Bazli.
                </p>
                <button
                  onClick={() => setIsAddMenuPhotoModalOpen(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  + Add Your First Menu Photo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentSeller.menuPhotos.map((photoUrl, index) => {
                  const detail = currentSeller.menuPhotoDetails?.[index] || {
                    id: `mp-${index}`,
                    url: photoUrl,
                    title: `Menu Card Page ${index + 1}`,
                    category: 'Main Menu',
                    uploadDate: 'Recent'
                  };
                  const isCover = currentSeller.bannerImage === photoUrl;

                  return (
                    <div
                      key={index}
                      className="group bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
                    >
                      {/* Photo Thumbnail */}
                      <div className="relative aspect-4/3 overflow-hidden bg-slate-950">
                        <img
                          src={photoUrl}
                          alt={detail.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                          onClick={() => setPreviewPhotoModal({ url: photoUrl, title: detail.title })}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                        
                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            Page {index + 1}
                          </span>
                          {isCover && (
                            <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                              <Check className="w-2.5 h-2.5" /> Cover Photo
                            </span>
                          )}
                        </div>

                        {/* Top Right Zoom Action */}
                        <button
                          onClick={() => setPreviewPhotoModal({ url: photoUrl, title: detail.title })}
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white text-slate-800 p-1.5 rounded-lg backdrop-blur-xs transition-colors cursor-pointer"
                          title="Zoom In"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>

                        {/* Bottom Title on Image */}
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="text-white font-bold text-xs line-clamp-1 drop-shadow-sm">
                            {detail.title}
                          </div>
                          <div className="text-white/80 text-[10px] font-medium flex items-center gap-2">
                            <span>{detail.category || 'Menu Card'}</span>
                            {detail.uploadDate && <span>• {detail.uploadDate}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Card Action Controls */}
                      <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                        <button
                          onClick={() => {
                            if (onUpdateSeller) {
                              onUpdateSeller(currentSeller.id, {
                                bannerImage: photoUrl
                              });
                            }
                          }}
                          disabled={isCover}
                          className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
                            isCover
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isCover ? '✓ Primary Cover' : 'Set as Cover'}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setPreviewPhotoModal({ url: photoUrl, title: detail.title })}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Preview Fullscreen"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove "${detail.title}" from your menu photos?`)) {
                                const updatedPhotos = (currentSeller.menuPhotos || []).filter((_, i) => i !== index);
                                const updatedDetails = (currentSeller.menuPhotoDetails || []).filter((_, i) => i !== index);
                                if (onUpdateSeller) {
                                  onUpdateSeller(currentSeller.id, {
                                    menuPhotos: updatedPhotos,
                                    menuPhotoDetails: updatedDetails
                                  });
                                }
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {(showAddModal || editingProd) && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base sm:text-lg text-slate-900">
                {editingProd
                  ? `Edit ${isCurrentRestaurant ? 'Dish' : 'Product'}: ${editingProd.name}`
                  : `Add New ${isCurrentRestaurant ? 'Restaurant Dish' : 'Grocery Product'}`}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProd(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isCurrentRestaurant ? 'Dish / Food Name' : 'Product Name'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  placeholder={isCurrentRestaurant ? 'e.g. Handi Dum Biryani' : 'e.g. Aashirvaad Atta'}
                />
              </div>

              {isCurrentRestaurant && (
                <div className="grid grid-cols-2 gap-2 bg-orange-50/50 p-3 rounded-2xl border border-orange-200/70">
                  <div>
                    <label className="font-bold text-orange-950 block mb-1">Dietary Type</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsVeg(true)}
                        className={`flex-1 py-1.5 rounded-xl font-bold text-xs border cursor-pointer ${
                          isVeg ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        🟢 Pure Veg
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsVeg(false)}
                        className={`flex-1 py-1.5 rounded-xl font-bold text-xs border cursor-pointer ${
                          !isVeg ? 'bg-rose-600 text-white border-rose-700' : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        🔴 Non-Veg
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-orange-950 block mb-1">Average Prep Time</label>
                    <select
                      value={prepTimeMinutes}
                      onChange={e => setPrepTimeMinutes(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-xs outline-none"
                    >
                      <option value={10}>⚡ 10 mins (Quick Snack)</option>
                      <option value={15}>⏱️ 15 mins (Standard)</option>
                      <option value={20}>🍲 20 mins (Fresh Cooked)</option>
                      <option value={30}>🔥 30 mins (Biryani / Handi)</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isCurrentRestaurant ? 'Portion Size' : 'Quantity Tag'}
                  </label>
                  <input
                    type="text"
                    required
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none"
                    placeholder={isCurrentRestaurant ? 'e.g. 1 Full Plate (500g)' : 'e.g. 5 kg, 1 L'}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Category</label>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${
                      isCurrentRestaurant
                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                        : isCurrentStationery
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {isCurrentRestaurant ? '🍽️ Restaurant' : isCurrentStationery ? '📚 Stationery' : '🛒 Grocery'}
                    </span>
                  </div>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none font-bold text-xs sm:text-sm text-slate-800"
                  >
                    {getCategoriesForSector(currentSector).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={mrp}
                    onChange={e => {
                      const newMrp = Number(e.target.value);
                      setMrp(newMrp);
                    }}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={sellingPrice}
                    onChange={e => {
                      const newSelling = Number(e.target.value);
                      setSellingPrice(newSelling);
                    }}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isCurrentRestaurant ? 'Daily Limit' : 'Stock Qty'}
                  </label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={e => setStock(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Merchant Discount Setting Controller */}
              {(() => {
                const currentDisc = mrp > 0 ? Math.max(0, Math.round(((mrp - sellingPrice) / mrp) * 100)) : 0;
                return (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-amber-950 block text-xs flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5 text-amber-700" />
                        <span>Discount Setting (Merchant Controlled)</span>
                      </label>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        currentDisc > 0
                          ? 'bg-amber-200 text-amber-950 border border-amber-300'
                          : 'bg-slate-200 text-slate-700 border border-slate-300'
                      }`}>
                        {currentDisc > 0 ? `🔥 ${currentDisc}% OFF (Save ₹${Math.max(0, mrp - sellingPrice)})` : '🏷️ 0% (No Discount)'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {[0, 5, 10, 15, 20, 25, 30, 40, 50].map(pct => {
                        const isSelected = currentDisc === pct;
                        return (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => {
                              if (pct === 0) {
                                setSellingPrice(mrp);
                              } else {
                                const calculated = Math.max(1, Math.round(mrp * (1 - pct / 100)));
                                setSellingPrice(calculated);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                              isSelected
                                ? pct === 0
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                  : 'bg-amber-600 text-white border-amber-700 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-100 hover:border-amber-300'
                            }`}
                          >
                            {pct === 0 ? '0% (No Discount)' : `${pct}% OFF`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Financial Revenue Split per Item:</span>
                  <span className="font-bold text-slate-900">Selling Price: ₹{sellingPrice}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block">10% Platform Fee</span>
                    <span className="font-mono font-black text-amber-700 text-sm">
                      ₹{Math.round(sellingPrice * 0.10)}
                    </span>
                    <span className="text-[9px] text-slate-400 block">Bazli Commission</span>
                  </div>

                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block">90% Net Merchant Earning</span>
                    <span className="font-mono font-black text-emerald-700 text-sm">
                      ₹{Math.round(sellingPrice * 0.90)}
                    </span>
                    <span className="text-[9px] text-slate-400 block">Credited to wallet</span>
                  </div>
                </div>
              </div>

              {/* Weight & Quantity Customization Control */}
              {!isCurrentRestaurant && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold text-slate-900 block text-xs flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-emerald-600" />
                      <span>Weight & Quantity Flexibility Mode</span>
                    </label>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      weightType === 'flexible' ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {weightType === 'flexible' ? '⚖️ Flexible / Custom Weight' : '📦 Fixed Packaged'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setWeightType('fixed')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        weightType === 'fixed'
                          ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                        <Box className="w-3.5 h-3.5 text-slate-600" />
                        <span>Fixed Packaged</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                        Standard sealed pack (e.g., 5kg bag, 1L bottle, biscuit box). Customer buys in fixed quantities.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWeightType('flexible')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        weightType === 'flexible'
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs">
                        <Scale className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Flexible Custom Weight</span>
                      </div>
                      <p className="text-[10px] text-emerald-800/80 mt-1 leading-tight">
                        Loose mandi staples or liquids. Customer can order 100g, 250g, 500g, 1kg, 2L, etc.
                      </p>
                    </button>
                  </div>

                  {weightType === 'flexible' && (
                    <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-emerald-950">Measurement Unit:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setUnitType('weight')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${
                            unitType === 'weight'
                              ? 'bg-emerald-700 text-white border-emerald-800'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          Weight (g / kg)
                        </button>
                        <button
                          type="button"
                          onClick={() => setUnitType('volume')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${
                            unitType === 'volume'
                              ? 'bg-emerald-700 text-white border-emerald-800'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          Volume (ml / L)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bargain Negotiation Permission & Rules Control */}
              {!isCurrentRestaurant && (
                <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>Bazli Bargain Negotiation Control</span>
                      </span>
                      <p className="text-[11px] text-amber-900/80 mt-0.5">
                        Control whether customer can negotiate price via Bazli bargaining bot.
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const nextAllowed = !bargainingAllowed;
                        setBargainingAllowed(nextAllowed);
                        if (!nextAllowed) {
                          setMaxBargainDiscountPercent(0);
                          setMinBargainPrice(sellingPrice);
                        } else {
                          const pct = 20;
                          setMaxBargainDiscountPercent(pct);
                          setMinBargainPrice(Math.round(sellingPrice * (1 - pct / 100)));
                        }
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        bargainingAllowed
                          ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                          : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      {bargainingAllowed ? '⚡ Bargaining Allowed' : '🔒 Fixed Price Only'}
                    </button>
                  </div>

                  {bargainingAllowed ? (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="font-bold text-amber-900 block mb-1 text-xs">Max Bargain Discount %</label>
                        <select
                          value={maxBargainDiscountPercent}
                          onChange={e => {
                            const pct = Number(e.target.value);
                            setMaxBargainDiscountPercent(pct);
                            setMinBargainPrice(Math.round(sellingPrice * (1 - pct / 100)));
                          }}
                          className="w-full p-2 bg-white border border-amber-300 rounded-xl font-bold text-xs text-amber-950 outline-none"
                        >
                          <option value={5}>5% Max Off</option>
                          <option value={10}>10% Max Off</option>
                          <option value={15}>15% Max Off</option>
                          <option value={20}>20% Max Off (Recommended)</option>
                          <option value={25}>25% Max Off</option>
                          <option value={30}>30% Max Off</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-amber-900 block mb-1 text-xs">Floor Price (Minimum ₹)</label>
                        <input
                          type="number"
                          value={minBargainPrice}
                          onChange={e => setMinBargainPrice(Number(e.target.value))}
                          className="w-full p-2 bg-white border border-amber-300 rounded-xl font-bold text-xs text-emerald-800 outline-none font-mono"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 bg-amber-100/60 rounded-xl text-[11px] text-amber-900 font-medium">
                      ℹ️ Customers will see fixed selling price of <strong className="font-bold">₹{sellingPrice}</strong> with bargaining disabled.
                    </div>
                  )}
                </div>
              )}

              {/* Multi-Photo Manager (3-4 Photos) */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-extrabold text-slate-900 block text-xs flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-amber-600" />
                      <span>Product Photos (Upload 3–4 Photos for Full-Screen View)</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Add multiple angles, packaging, or serving photos for customer detail view.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                    {productImages.filter(i => i.trim().length > 0).length}/4 Photos
                  </span>
                </div>

                {/* 1-Click Preset Template Autofill */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-600 flex items-center justify-between">
                    <span>⚡ Quick Preset Multi-Photo Packs (1-Click Fill):</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {PRESET_PHOTO_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setProductImages([...tmpl.images]);
                          setImage(tmpl.images[0]);
                        }}
                        className="p-1.5 text-left rounded-lg border border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <img
                            src={tmpl.images[0]}
                            alt=""
                            className="w-5 h-5 rounded object-cover"
                          />
                          <span className="text-[9px] font-bold text-slate-800 truncate group-hover:text-amber-900">
                            {tmpl.title}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Slots Grid (Up to 4 slots) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[0, 1, 2, 3].map(slotIdx => {
                    const slotImg = productImages[slotIdx] || '';
                    const isCover = slotIdx === 0;

                    return (
                      <div
                        key={slotIdx}
                        className={`p-2.5 rounded-2xl border transition-all ${
                          isCover
                            ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300/40'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1">
                            {isCover ? '⭐ Photo 1 (Cover / Main)' : `📷 Photo ${slotIdx + 1} (${slotIdx === 1 ? 'Angle' : slotIdx === 2 ? 'Details' : 'Serving'})`}
                          </span>
                          {slotImg && !isCover && (
                            <button
                              type="button"
                              onClick={() => {
                                const newImgs = [...productImages];
                                newImgs.splice(slotIdx, 1);
                                setProductImages(newImgs);
                              }}
                              className="text-[10px] text-rose-600 hover:underline font-bold cursor-pointer"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center relative group">
                            {slotImg ? (
                              <img
                                src={slotImg}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-slate-300" />
                            )}
                          </div>

                          <div className="flex-1 space-y-1 min-w-0">
                            <input
                              type="text"
                              placeholder={isCover ? 'Cover Photo URL (Required)' : `Photo ${slotIdx + 1} URL (Optional)`}
                              required={isCover}
                              value={slotImg}
                              onChange={e => {
                                const newImgs = [...productImages];
                                newImgs[slotIdx] = e.target.value;
                                setProductImages(newImgs);
                                if (isCover) setImage(e.target.value);
                              }}
                              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-[11px] outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                            />

                            {/* Firebase Storage Device Upload Button */}
                            <label className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-md text-[10px] font-bold cursor-pointer transition-colors">
                              <UploadCloud className="w-3 h-3 text-amber-600" />
                              <span>Upload to Cloud</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async e => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const downloadUrl = await uploadProductImage(file, currentSeller?.id || 'seller');
                                      const newImgs = [...productImages];
                                      newImgs[slotIdx] = downloadUrl;
                                      setProductImages(newImgs);
                                      if (isCover) setImage(downloadUrl);
                                    } catch (uploadErr) {
                                      console.error('Storage upload failed, falling back to local reader:', uploadErr);
                                      const reader = new FileReader();
                                      reader.onload = () => {
                                        if (typeof reader.result === 'string') {
                                          const newImgs = [...productImages];
                                          newImgs[slotIdx] = reader.result;
                                          setProductImages(newImgs);
                                          if (isCover) setImage(reader.result);
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rich Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Full Product / Dish Description
                </label>
                <textarea
                  rows={2}
                  value={productDescription}
                  onChange={e => setProductDescription(e.target.value)}
                  placeholder="Describe ingredients, taste, quality, freshness, and packaging details..."
                  className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-xs font-medium"
                />
              </div>

              {/* Highlights, Shelf Life & Origin */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Highlights (comma-separated)</label>
                  <input
                    type="text"
                    value={productHighlights}
                    onChange={e => setProductHighlights(e.target.value)}
                    placeholder="e.g. 100% Pure, Organic, Desi Ghee"
                    className="w-full p-2 bg-slate-50 border rounded-xl outline-none text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Shelf Life / Prep Tag</label>
                  <input
                    type="text"
                    value={productShelfLife}
                    onChange={e => setProductShelfLife(e.target.value)}
                    placeholder="e.g. Freshly Cooked, 6 Months"
                    className="w-full p-2 bg-slate-50 border rounded-xl outline-none text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Origin / Sourced From</label>
                  <input
                    type="text"
                    value={productOrigin}
                    onChange={e => setProductOrigin(e.target.value)}
                    placeholder="e.g. Kitchen Fresh, Punjab, MP"
                    className="w-full p-2 bg-slate-50 border rounded-xl outline-none text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                {editingProd && onDeleteProduct ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await onDeleteProduct(editingProd.id);
                      setShowAddModal(false);
                      setEditingProd(null);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Item</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingProd(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 font-black text-slate-950 rounded-xl shadow-xs cursor-pointer"
                  >
                    Save {isCurrentRestaurant ? 'Dish' : 'Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Menu Photo Modal */}
      {isAddMenuPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Upload / Add Menu Photo</h3>
                  <p className="text-[11px] text-slate-400">Add physical menu card or food spread photos</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddMenuPhotoModalOpen(false);
                  setNewMenuPhotoUrl('');
                  setNewMenuPhotoTitle('');
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Preset Sample Picker */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                  <span>Quick Pick from High-Res Templates:</span>
                  <span className="text-[10px] text-orange-600 font-normal">Click to auto-fill</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_MENU_TEMPLATES.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNewMenuPhotoUrl(item.url);
                        setNewMenuPhotoTitle(item.title);
                        setNewMenuPhotoCategory(item.category);
                      }}
                      className="p-1.5 rounded-xl border border-slate-200 hover:border-orange-500 bg-slate-50 hover:bg-orange-50/50 text-left transition-all group cursor-pointer"
                    >
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-12 object-cover rounded-lg mb-1"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-[10px] font-bold text-slate-800 line-clamp-1">{item.title}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Menu Card Title / Page Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Royal Biryani & Kebabs Menu, Dine-In Rate Card"
                  value={newMenuPhotoTitle}
                  onChange={e => setNewMenuPhotoTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category / Section</label>
                  <select
                    value={newMenuPhotoCategory}
                    onChange={e => setNewMenuPhotoCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-medium text-slate-900"
                  >
                    <option value="Main Course">Main Course</option>
                    <option value="Biryani Special">Biryani Special</option>
                    <option value="Starters & Tandoor">Starters & Tandoor</option>
                    <option value="Breads & Combos">Breads & Combos</option>
                    <option value="Desserts & Beverages">Desserts & Beverages</option>
                    <option value="All Day Dine-In Menu">All Day Dine-In Menu</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Upload Date</label>
                  <input
                    type="text"
                    disabled
                    value={new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <FirebaseImageUploader
                  label="Menu Card Photo (Cloud Upload or Direct URL) *"
                  value={newMenuPhotoUrl}
                  onChange={url => setNewMenuPhotoUrl(url)}
                  uploadType="menu_photo"
                  targetId={currentSeller?.id || 'restaurant'}
                  aspectRatio="wide"
                  placeholder="https://... or upload photo from device"
                  helperText="Upload a crisp photo of your physical menu card, combo flyer, or specials board."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddMenuPhotoModalOpen(false);
                    setNewMenuPhotoUrl('');
                    setNewMenuPhotoTitle('');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!newMenuPhotoUrl.trim() || !currentSeller}
                  onClick={() => {
                    if (!newMenuPhotoUrl.trim() || !currentSeller) return;
                    const newDetail = {
                      id: `mp-${Date.now()}`,
                      url: newMenuPhotoUrl.trim(),
                      title: newMenuPhotoTitle.trim() || `Menu Card Page ${(currentSeller.menuPhotos?.length || 0) + 1}`,
                      category: newMenuPhotoCategory,
                      uploadDate: new Date().toISOString().split('T')[0]
                    };
                    const updatedPhotos = [...(currentSeller.menuPhotos || []), newDetail.url];
                    const updatedDetails = [...(currentSeller.menuPhotoDetails || []), newDetail];

                    if (onUpdateSeller) {
                      onUpdateSeller(currentSeller.id, {
                        menuPhotos: updatedPhotos,
                        menuPhotoDetails: updatedDetails
                      });
                    }
                    setNewMenuPhotoUrl('');
                    setNewMenuPhotoTitle('');
                    setIsAddMenuPhotoModalOpen(false);
                  }}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 font-black text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save & Publish Menu Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Zoom Preview Modal */}
      {previewPhotoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewPhotoModal(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 flex items-center justify-between border-b border-white/10 bg-slate-950/80">
              <div>
                <h4 className="text-white font-extrabold text-sm">{previewPhotoModal.title}</h4>
                <p className="text-[11px] text-slate-400">High-Resolution Menu Preview</p>
              </div>
              <button
                onClick={() => setPreviewPhotoModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-black p-2">
              <img
                src={previewPhotoModal.url}
                alt={previewPhotoModal.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Switch Store / Restaurant Centered Responsive Modal */}
      {isStoreSwitchModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
          onClick={() => setIsStoreSwitchModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Switch Active {isCurrentRestaurant ? 'Restaurant' : 'Store'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Currently managing: <strong className="text-amber-300 font-bold">{currentSeller?.businessName}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStoreSwitchModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs & Search */}
            <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 space-y-2.5">
              {/* Type Switcher Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setStoreFilterTab('all')}
                  className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    storeFilterTab === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  All ({allSellers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStoreFilterTab('grocery')}
                  className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    storeFilterTab === 'grocery'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🥦 Grocery ({allSellers.filter(s => getSellerSector(s) === 'grocery').length})
                </button>
                <button
                  type="button"
                  onClick={() => setStoreFilterTab('restaurant')}
                  className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    storeFilterTab === 'restaurant'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🍽️ Dining ({allSellers.filter(s => getSellerSector(s) === 'restaurant').length})
                </button>
                <button
                  type="button"
                  onClick={() => setStoreFilterTab('stationery')}
                  className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    storeFilterTab === 'stationery'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  📚 Stationery ({allSellers.filter(s => getSellerSector(s) === 'stationery').length})
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search store name, phone, owner, address..."
                  value={storeSearchText}
                  onChange={e => setStoreSearchText(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Store List */}
            <div className="p-3 sm:p-4 overflow-y-auto max-h-[50vh] space-y-2 divide-y divide-slate-100">
              {filteredSwitchSellers.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No matching store or restaurant found for "{storeSearchText}".
                </div>
              ) : (
                filteredSwitchSellers.map(s => {
                  const sSector = getSellerSector(s);
                  const isRest = sSector === 'restaurant';
                  const isStat = sSector === 'stationery';
                  const isSelected = s.id === currentSeller?.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        if (onSelectSeller) {
                          onSelectSeller(s);
                        }
                        setSellerSubPortal(sSector);
                        setIsStoreSwitchModalOpen(false);
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isRest
                            ? 'bg-orange-50 text-orange-600 border-orange-200'
                            : isStat
                            ? 'bg-purple-50 text-purple-600 border-purple-200'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        }`}>
                          {isRest ? (
                            <UtensilsCrossed className="w-5 h-5" />
                          ) : isStat ? (
                            <BookOpen className="w-5 h-5" />
                          ) : (
                            <Store className="w-5 h-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                              {s.businessName}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              isRest
                                ? 'bg-orange-100 text-orange-800'
                                : isStat
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {isRest ? '🍽️ Restaurant' : isStat ? '📚 Stationery' : '🥦 Grocery'}
                            </span>
                            {s.isVerified && (
                              <span className="text-[9px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                <ShieldCheck className="w-2.5 h-2.5" /> Verified
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2">
                            <span>Owner: <strong className="text-slate-700">{s.ownerName}</strong></span>
                            <span>•</span>
                            <span className="font-mono">{s.phone}</span>
                            {s.address && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[180px]">{s.address}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isSelected ? (
                          <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
                          >
                            Select
                          </button>
                        )}

                        {onDeleteSeller && !s.isAdminStore && s.id !== 's-admin' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInitiateDeleteStore(s);
                            }}
                            className="p-1.5 hover:bg-rose-100 text-rose-500 hover:text-rose-700 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                            title={`Admin: Remove store "${s.businessName}"`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsStoreSwitchModalOpen(false);
                  setIsOnboardingModalOpen(true);
                }}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Onboard New {isCurrentRestaurant ? 'Restaurant' : 'Store'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsStoreSwitchModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN REMOVE SELLER / STORE CONFIRMATION MODAL */}
      {sellerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-rose-200 shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className="bg-rose-900 text-white p-5 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-800 border border-rose-700 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-rose-200" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-300 block">
                    Admin Governance Action
                  </span>
                  <h3 className="font-black text-base leading-tight text-white">
                    Remove & Deregister Store
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSellerToDelete(null)}
                className="p-1 rounded-lg text-rose-300 hover:text-white hover:bg-rose-800/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Store Details Card */}
              <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">{sellerToDelete.businessName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-200 text-rose-900">
                    {sellerToDelete.sellerType === 'restaurant' ? 'Restaurant' : 'Grocery Store'}
                  </span>
                </div>
                <div className="text-slate-600 space-y-0.5 text-[11px]">
                  <div>Owner: <strong>{sellerToDelete.ownerName}</strong> ({sellerToDelete.phone})</div>
                  <div>Address: {sellerToDelete.address || 'Local Zone'}</div>
                  <div>GSTIN/FSSAI: {sellerToDelete.fssaiLicenseNumber || sellerToDelete.gstNumber || 'N/A'}</div>
                  <div className="text-rose-700 font-bold mt-1">
                    ⚠️ {products.filter(p => p.sellerId === sellerToDelete.id).length} listed products/dishes will also be deleted.
                  </div>
                </div>
              </div>

              {/* Warning Text */}
              <p className="text-xs text-slate-600 leading-relaxed">
                This action is <strong>irreversible</strong>. The store will be completely removed from Bazli, inventory catalog purged, and WhatsApp communication disabled.
              </p>

              {/* Admin Passcode Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Enter Master Admin Passcode or type <span className="font-mono text-rose-600">DELETE</span> to confirm:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Admin PIN (e.g. BAZLI777) or DELETE"
                    value={adminPasscodeInput}
                    onChange={(e) => setAdminPasscodeInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleConfirmDeleteStore();
                      }
                    }}
                  />
                </div>
                {deleteError && (
                  <p className="text-xs text-rose-600 font-bold flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{deleteError}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSellerToDelete(null)}
                disabled={isDeletingSeller}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStore}
                disabled={isDeletingSeller || !adminPasscodeInput.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isDeletingSeller ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing Store...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Remove Store</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seller Registration & Phone 2FA Modal */}
      <SellerOnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        adminWhatsAppPhone={adminWhatsAppPhone}
        onRegisterSuccess={(newSeller) => {
          if (onRegisterSellerSuccess) {
            onRegisterSellerSuccess(newSeller);
          }
          if (onSelectSeller) {
            onSelectSeller(newSeller);
          }
        }}
      />

      {/* Manage Bank / UPI Account Modal */}
      {currentSeller && (
        <ManagePayoutAccountModal
          isOpen={isManageAccountModalOpen}
          onClose={() => setIsManageAccountModalOpen(false)}
          entityType="seller"
          entityName={currentSeller.businessName}
          entityPhone={currentSeller.phone || ''}
          accountHolderName={currentSeller.payoutDetails?.accountHolderName || currentSeller.ownerName || currentSeller.businessName}
          initialDetails={currentSeller.payoutDetails}
          onSaveDetails={(details) => {
            if (onUpdateSellerPayoutDetails && currentSeller) {
              onUpdateSellerPayoutDetails(currentSeller.id, details);
            }
          }}
        />
      )}

      {/* Seller Payout & Instant Cashout Modal */}
      {currentSeller && (
        <SellerPayoutModal
          isOpen={isPayoutModalOpen}
          onClose={() => setIsPayoutModalOpen(false)}
          seller={currentSeller}
          onOpenManageAccount={() => {
            setIsPayoutModalOpen(false);
            setIsManageAccountModalOpen(true);
          }}
          onConfirmPayout={(amount, method, destination) => {
            if (onConfirmSellerPayout && currentSeller) {
              onConfirmSellerPayout(currentSeller.id, amount, method, destination);
            }
          }}
        />
      )}

      {/* Settlement Voucher Slip Modal */}
      {selectedSellerSlipRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-sm text-white">Settlement Voucher Slip</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Ref: {selectedSellerSlipRecord.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSellerSlipRecord(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="text-center py-2 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Settlement Amount</span>
                <div className="text-3xl font-black font-mono text-emerald-700 mt-0.5">
                  ₹{selectedSellerSlipRecord.amount.toLocaleString()}
                </div>
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full mt-1.5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Directly Settled</span>
                </span>
              </div>

              <div className="space-y-2 font-mono text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Beneficiary Store:</span>
                  <span className="font-bold text-slate-900 font-sans">{selectedSellerSlipRecord.sellerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Payment Method:</span>
                  <span className="font-bold">{selectedSellerSlipRecord.payoutMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Destination:</span>
                  <span className="font-bold text-emerald-800 break-all">{selectedSellerSlipRecord.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">NPCI / IMPS UTR:</span>
                  <span className="font-bold text-slate-900">{selectedSellerSlipRecord.utrNumber || 'NPCI-DIRECT'}</span>
                </div>
                {selectedSellerSlipRecord.razorpayPayoutId && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">RazorpayX Ref:</span>
                    <span className="font-bold text-indigo-700">{selectedSellerSlipRecord.razorpayPayoutId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Date & Time:</span>
                  <span>{new Date(selectedSellerSlipRecord.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
                This digital voucher confirms that 100% of this settlement has been initiated and credited to the registered merchant account.
              </div>

              <button
                type="button"
                onClick={() => setSelectedSellerSlipRecord(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
