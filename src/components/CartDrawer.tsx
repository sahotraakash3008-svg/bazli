import React, { useState } from 'react';
import { CartItem, DeliveryZone, Coupon, Product, CustomerAddress } from '../types';
import { auth } from '../lib/firebase';
import {
  ShoppingBag,
  X,
  Trash2,
  Plus,
  Minus,
  Tag,
  Check,
  ArrowRight,
  ShieldCheck,
  Scale,
  Sparkles,
  Heart,
  Leaf,
  UtensilsCrossed,
  MapPin,
  Flame,
  Zap
} from 'lucide-react';
import { WeightQuantityModal } from './WeightQuantityModal';
import { isWeightAdjustableProduct } from '../utils/weightUtils';
import { FREQUENTLY_BOUGHT_ADDONS } from '../data/initialData';
import {
  hapticAddToCart,
  hapticSelection,
  hapticCouponApplied
} from '../utils/haptics';

interface CartDrawerProps {
  isOpen: boolean;
  onOpenLogin?: () => void;
  onClose: () => void;
  cartItems?: CartItem[];
  items?: CartItem[];
  onUpdateQty?: (productId: string, qty: number, selectedWeight?: string) => void;
  onUpdateQuantity?: (productId: string, qty: number, selectedWeight?: string) => void;
  onRemoveItem?: (productId: string, selectedWeight?: string) => void;
  onAddQuickItem?: (item: typeof FREQUENTLY_BOUGHT_ADDONS[0]) => void;
  onChangeItemWeight?: (
    product: Product,
    oldWeight: string,
    newWeight: string,
    newUnitPrice: number,
    newUnitMrp: number,
    packQty: number
  ) => void;
  appliedCoupon?: Coupon | null;
  couponDiscount?: number;
  onApplyCoupon?: (code: string) => Promise<{ success: boolean; message: string }>;
  onRemoveCoupon?: () => void;
  selectedZone?: DeliveryZone;
  userCoins?: number;
  isFirstOrder?: boolean;
  orderCount?: number;
  selectedAddress?: CustomerAddress | null;
  onOpenAddressModal?: () => void;
  onProceedToCheckout?: () => void;
  onCheckout?: (payload: any) => void;
  onOpenBargain?: (product: Product, selectedWeight?: string, variantPrice?: number) => void;
  platformFee?: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onOpenLogin,
  onClose,
  cartItems: propCartItems,
  items: propItems,
  onUpdateQty,
  onUpdateQuantity,
  onRemoveItem,
  onAddQuickItem,
  onChangeItemWeight,
  appliedCoupon = null,
  couponDiscount = 0,
  onApplyCoupon,
  onRemoveCoupon,
  selectedZone = {
    id: 'zone-a',
    name: 'Zone A - Central City (0-5 km)',
    deliveryFee: 19,
    freeDeliveryThreshold: 129,
    estimatedTime: '15-25 Mins',
    availability: true
  },
  userCoins = 0,
  isFirstOrder = false,
  orderCount = 0,
  selectedAddress,
  onOpenAddressModal,
  onProceedToCheckout,
  onCheckout,
  onOpenBargain,
  platformFee: propPlatformFee = 0
}) => {
  const actualCartItems = propCartItems || propItems || [];

  // Weight edit modal state
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);

  // Rider Tip State in Cart Drawer (Default is 0 - fully optional for the customer)
  const [selectedTip, setSelectedTip] = useState<number>(0);
  const [showCustomTip, setShowCustomTip] = useState<boolean>(false);
  const [customTipInput, setCustomTipInput] = useState<string>('');
  const [noCutlery, setNoCutlery] = useState<boolean>(false);
  const [ecoBag, setEcoBag] = useState<boolean>(false);

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (!isOpen) return null;

  const handleQtyChange = (productId: string, newQty: number, selectedWeight?: string) => {
    if (newQty > 0) hapticAddToCart();
    else hapticSelection();
    if (onUpdateQty) onUpdateQty(productId, newQty, selectedWeight);
    else if (onUpdateQuantity) onUpdateQuantity(productId, newQty, selectedWeight);
  };

  const handleRemove = (productId: string, selectedWeight?: string) => {
    hapticSelection();
    if (onRemoveItem) onRemoveItem(productId, selectedWeight);
    else handleQtyChange(productId, 0, selectedWeight);
  };

const handleCheckoutClick = () => {
    const user = auth.currentUser;
    if (!user) {
      if (onOpenLogin) {
        onOpenLogin();
      } else {
        alert("Please login first to proceed with checkout!");
      }
      return;
    }

    hapticSelection();
    if (onProceedToCheckout) {
      onProceedToCheckout();
    } else if (onCheckout) {
      onCheckout({
        paymentMethod: 'UPI',
        coinsRedeemed: 0,
        couponDiscount: couponDiscount || 0,
        isExpress: false,
        deliveryTip: selectedTip || 0,
        noCutlery,
        ecoPackaging: ecoBag
      });
    }
  };

  // Calculations taking each item's chosen weight unitPrice into account
  const subtotal = actualCartItems.reduce((acc, item) => {
    const itemPrice = item.unitPrice || item.product.sellingPrice;
    return acc + itemPrice * item.quantity;
  }, 0);

  const totalBargainDiscount = actualCartItems.reduce((acc, item) => {
    if (item.bargainedPrice) {
      const basePrice = item.unitPrice || item.product.sellingPrice;
      return acc + Math.max(0, (basePrice - item.bargainedPrice) * item.quantity);
    }
    return acc;
  }, 0);

  const netBeforeDelivery = Math.max(0, subtotal - totalBargainDiscount - couponDiscount);
  
  // Detect if order is for dishes from restaurant portal
  const isRestaurantCart = actualCartItems.some(
    item => item.product.sellerType === 'restaurant' || 
            item.product.category === 'Restaurant Meals & Dining' ||
            item.product.category?.toLowerCase().includes('restaurant') ||
            item.product.category?.toLowerCase().includes('kitchen')
  );

  // Restaurant: delivery charge ₹21, free delivery above ₹499, platform fee ₹11
  // Grocery: stays standard (threshold ₹129, delivery fee ₹19, platform fee ₹0)
  const threshold = isRestaurantCart ? 499 : (selectedZone.freeDeliveryThreshold ?? 129);
  const baseDeliveryFee = isRestaurantCart ? 21 : selectedZone.deliveryFee;
  
  // 1st & 2nd orders, or order amount >= threshold
  const isFreeDelivery = isFirstOrder || netBeforeDelivery >= threshold;
  const deliveryFee = isFreeDelivery ? 0 : baseDeliveryFee;
  const platformFee = isRestaurantCart ? 11 : (propPlatformFee !== undefined ? propPlatformFee : 0);
  const ecoBagFee = ecoBag ? 9 : 0;
  const itemGst = 0;
  const platformGst = 0;
  const tax = 0;
  const finalTotal = netBeforeDelivery + deliveryFee + platformFee + selectedTip + ecoBagFee;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setCouponLoading(true);
    setCouponMsg('');

    if (onApplyCoupon) {
      const res = await onApplyCoupon(couponCodeInput);
      setCouponMsg(res.message);
      setCouponLoading(false);
      if (res.success) {
        hapticCouponApplied();
        setCouponCodeInput('');
      }
    }
  };

  // Filter add-ons that are not already in the cart
  const availableUpsells = FREQUENTLY_BOUGHT_ADDONS.filter(
    addon => !actualCartItems.some(item => item.product.name.toLowerCase().includes(addon.name.toLowerCase()))
  );

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in">
        <div className="bg-[#fcfaf6] w-full max-w-md h-full flex flex-col justify-between shadow-2xl border-l border-[#ded2bc]">
          {/* Header */}
          <div className="p-4 bg-[#0a192f] text-white flex items-center justify-between border-b border-[#1e3a5f]">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-extrabold text-base tracking-tight flex items-center gap-1.5">
                  <span>Your Cart ({actualCartItems.length})</span>
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 text-stone-300 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery Address Pill & Free Delivery Bar */}
          <div className="bg-stone-100/90 px-4 py-2 border-b border-stone-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="text-stone-700 font-bold truncate">
                Delivering to: <strong className="text-stone-900">{selectedAddress ? selectedAddress.title : 'Home'}</strong>
              </span>
            </div>
            {onOpenAddressModal && (
              <button
                type="button"
                onClick={onOpenAddressModal}
                className="text-[11px] font-black text-amber-800 hover:text-amber-950 underline shrink-0 cursor-pointer"
              >
                Change
              </button>
            )}
          </div>

          {/* Free Delivery Bar */}
          <div className="bg-amber-50/80 px-4 py-2 border-b border-amber-200/70 text-xs text-amber-950 font-semibold flex items-center justify-between">
            {isFirstOrder ? (
              <span className="text-amber-900 font-bold flex items-center gap-1">
                🎉 {orderCount === 0 ? '1st Order' : '2nd Order'} Welcome: 100% FREE Delivery Unlocked!
              </span>
            ) : netBeforeDelivery >= threshold ? (
              <span className="text-amber-900 font-bold flex items-center gap-1">
                🎉 Congratulations! You unlocked FREE Delivery (Above ₹{threshold})!
              </span>
            ) : (
              <span>
                Add ₹{threshold - netBeforeDelivery} more for FREE Delivery ({isRestaurantCart ? 'Free above ₹499 • Standard ₹21' : `Free above ₹${threshold}`})
              </span>
            )}
            <span className="text-[10px] bg-amber-200/80 px-1.5 py-0.5 rounded text-amber-950 font-bold border border-amber-300">
              {isRestaurantCart ? '⚡ Hot Delivery' : selectedZone.estimatedTime}
            </span>
          </div>

          {/* Items List & Upsell Scroll Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {actualCartItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 bg-[#ede4d3] text-stone-500 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-stone-900 text-base">Your cart is empty</h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Explore fresh vegetables, fruits, and snacks with live Bazli Mandi bargaining!
                </p>
              </div>
            ) : (
              actualCartItems.map((item, idx) => {
                const itemKey = `${item.product.id}-${item.selectedWeight || 'base'}-${idx}`;
                const baseSellingPrice = item.unitPrice || item.product.sellingPrice;
                const unitPrice = item.bargainedPrice || baseSellingPrice;
                const unitMrp = item.unitMrp || item.product.mrp;
                const isBargained = !!item.bargainedPrice;
                const displayWeight = item.selectedWeight || item.product.quantity;
                const isAdjustable = isWeightAdjustableProduct(item.product);

                return (
                  <div
                    key={itemKey}
                    className="bg-white p-3 rounded-2xl border border-[#ded2bc] flex items-center space-x-3 shadow-xs"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 object-cover rounded-xl bg-stone-50 border border-stone-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-stone-900 text-xs truncate">
                        {item.product.name}
                      </h5>

                      {/* Weight Tag with Change Weight button */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded-md inline-flex items-center gap-1">
                          <Scale className="w-2.5 h-2.5 text-amber-700" />
                          <span>{displayWeight}</span>
                        </span>

                        {isAdjustable && (
                          <button
                            type="button"
                            onClick={() => setEditingItem(item)}
                            className="text-[10px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                            title="Change weight quantity (g/kg)"
                          >
                            Change
                          </button>
                        )}
                      </div>

                      <div className="flex items-baseline space-x-1.5 mt-1">
                        <span className="text-xs font-black text-stone-950 font-mono">
                          ₹{unitPrice}
                        </span>
                        {isBargained && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-extrabold border border-amber-300">
                            Bargained!
                          </span>
                        )}
                        {unitMrp > unitPrice && (
                          <span className="text-[10px] text-stone-400 line-through font-mono">
                            ₹{unitMrp}
                          </span>
                        )}
                        <span className="text-[10px] text-stone-500 font-semibold ml-1 font-mono">
                          (₹{unitPrice * item.quantity})
                        </span>
                      </div>
                    </div>

                    {/* Quantity Stepper for this pack */}
                    <div className="flex items-center space-x-1 bg-[#f7f3eb] border border-[#ded2bc] rounded-lg p-1 text-xs font-bold shrink-0">
                      <button
                        onClick={() =>
                          handleQtyChange(
                            item.product.id,
                            item.quantity - 1,
                            item.selectedWeight
                          )
                        }
                        className="w-5 h-5 flex items-center justify-center hover:bg-[#ede4d3] rounded text-stone-700 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-1.5 text-stone-900 font-mono">{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleQtyChange(
                            item.product.id,
                            item.quantity + 1,
                            item.selectedWeight
                          )
                        }
                        className="w-5 h-5 flex items-center justify-center hover:bg-[#ede4d3] rounded text-stone-700 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.product.id, item.selectedWeight)}
                      className="p-1 text-stone-400 hover:text-rose-500 cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}

            {/* ========================================================================= */}
            {/* STEP 1: SMART "FREQUENTLY BOUGHT TOGETHER" UPSELL RAIL (Bazli Quick Commerce style) */}
            {/* ========================================================================= */}
            {actualCartItems.length > 0 && availableUpsells.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-yellow-50/60 p-3.5 rounded-2xl border border-amber-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">
                      Frequently Bought Together
                    </h4>
                  </div>
                  <span className="text-[10px] bg-amber-200/80 text-amber-950 font-black px-1.5 py-0.5 rounded">
                    ⚡ Quick Add
                  </span>
                </div>

                <div className="flex space-x-2.5 overflow-x-auto pb-1 scrollbar-thin">
                  {availableUpsells.map(addon => (
                    <div
                      key={addon.id}
                      className="w-28 bg-white p-2 rounded-xl border border-amber-200/80 shrink-0 flex flex-col justify-between shadow-2xs space-y-1.5"
                    >
                      <img
                        src={addon.image}
                        alt={addon.name}
                        className="w-full h-16 object-cover rounded-lg bg-stone-100"
                      />
                      <div>
                        <h6 className="font-bold text-[11px] text-stone-900 line-clamp-1">
                          {addon.name}
                        </h6>
                        <span className="text-[10px] text-stone-500 font-medium block">
                          {addon.quantity}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                        <div className="text-[11px] font-black text-stone-900 font-mono">
                          ₹{addon.price}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (onAddQuickItem) {
                              onAddQuickItem(addon);
                            } else {
                              const syntheticProd: Product = {
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
                              handleQtyChange(syntheticProd.id, 1, addon.quantity);
                            }
                          }}
                          className="bg-amber-400 hover:bg-amber-300 text-stone-950 text-[10px] font-black px-2 py-1 rounded-md shadow-2xs cursor-pointer flex items-center gap-0.5 transition-all transform active:scale-95"
                        >
                          <Plus className="w-3 h-3" />
                          <span>ADD</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* RIDER TIPPING & ECO-PACKAGING OPTIONS */}
            {/* ========================================================================= */}
            {actualCartItems.length > 0 && (
              <div className="bg-white p-3.5 rounded-2xl border border-[#ded2bc] space-y-3 shadow-xs">
                {/* Rider Tipping */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-900 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      <span>Tip your delivery partner (Optional)</span>
                    </span>
                    <span className="text-[10px] text-stone-500">100% goes to rider</span>
                  </div>

                  <div className="grid grid-cols-6 gap-1">
                    {[0, 10, 20, 30, 50].map(tip => (
                      <button
                        key={tip}
                        type="button"
                        onClick={() => {
                          setSelectedTip(tip);
                          setShowCustomTip(false);
                          setCustomTipInput('');
                        }}
                        className={`py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                          selectedTip === tip && !showCustomTip
                            ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-2xs font-black'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {tip === 0 ? '₹0' : `₹${tip}`}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomTip(true);
                      }}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        showCustomTip
                          ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-2xs font-black'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      Custom
                    </button>
                  </div>

                  {showCustomTip && (
                    <div className="flex items-center gap-2 pt-1">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-xs">₹</span>
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          placeholder="Enter tip (e.g. 15, 0)"
                          value={customTipInput}
                          onChange={e => {
                            const val = e.target.value;
                            setCustomTipInput(val);
                            const parsed = parseInt(val, 10);
                            setSelectedTip(isNaN(parsed) || parsed < 0 ? 0 : parsed);
                          }}
                          className="w-full pl-7 pr-3 py-1.5 bg-stone-50 border border-amber-400 rounded-xl text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          autoFocus
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTip(0);
                          setShowCustomTip(false);
                          setCustomTipInput('');
                        }}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 cursor-pointer"
                      >
                        Reset (₹0)
                      </button>
                    </div>
                  )}
                </div>

                {/* Eco-Friendly Cutlery & Bag Preferences */}
                <div className="pt-2 border-t border-stone-100 space-y-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={noCutlery}
                      onChange={e => setNoCutlery(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 accent-amber-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-stone-700 flex items-center gap-1">
                      <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Don't send plastic cutlery (Eco-friendly)</span>
                    </span>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer select-none">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={ecoBag}
                        onChange={e => setEcoBag(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 accent-amber-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-stone-700 flex items-center gap-1">
                        <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Add reusable eco-cotton bag</span>
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-stone-900">+₹9</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Footer Checkout Summary */}
          {actualCartItems.length > 0 && (
            <div className="p-4 bg-white border-t border-[#ded2bc] space-y-3">
              {/* Coupon Code Box */}
              <div>
                {appliedCoupon ? (
                  <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-xl flex items-center justify-between text-xs text-amber-950">
                    <div className="flex items-center space-x-1.5">
                      <Tag className="w-4 h-4 text-amber-700" />
                      <span className="font-bold">
                        Applied: {appliedCoupon.code} (-₹{couponDiscount})
                      </span>
                    </div>
                    <button
                      onClick={onRemoveCoupon}
                      className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : onApplyCoupon ? (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Coupon (BAZLI50, WELCOME100)"
                      value={couponCodeInput}
                      onChange={e => setCouponCodeInput(e.target.value)}
                      className="flex-1 bg-[#f7f3eb] text-xs px-3 py-2 border border-[#ded2bc] rounded-xl outline-none focus:border-amber-500 text-stone-900"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="bg-[#0a192f] hover:bg-[#132f54] text-amber-300 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer border border-[#1e3a5f]"
                    >
                      Apply
                    </button>
                  </form>
                ) : null}
                {couponMsg && (
                  <p className="text-[11px] text-amber-800 font-medium mt-1">{couponMsg}</p>
                )}
              </div>

              {/* Price Calculations Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600 border-t border-[#ded2bc] pt-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900 font-mono">₹{subtotal}</span>
                </div>

                {totalBargainDiscount > 0 && (
                  <div className="flex justify-between text-amber-800 font-bold font-mono">
                    <span>Bargain Savings</span>
                    <span>-₹{totalBargainDiscount}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-amber-800 font-bold font-mono">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <span>Delivery Fee</span>
                    {isRestaurantCart && (
                      <span className="text-[10px] bg-orange-100 text-orange-800 px-1 py-0.2 rounded font-bold">
                        Restaurant
                      </span>
                    )}
                  </span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <span className="line-through text-stone-400 font-normal">
                          ₹{baseDeliveryFee}
                        </span>
                        <span>FREE</span>
                        <span className="text-[10px] bg-emerald-100 px-1.5 py-0.2 rounded text-emerald-800 font-extrabold">
                          {isFirstOrder ? (orderCount === 0 ? '1st Order' : '2nd Order') : `> ₹${threshold}`}
                        </span>
                      </span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center text-stone-700">
                  <span className="flex items-center gap-1">
                    <span>Platform Fee</span>
                    {isRestaurantCart && (
                      <span className="text-[10px] bg-orange-100 text-orange-800 px-1 py-0.2 rounded font-bold">
                        Restaurant
                      </span>
                    )}
                    {platformFee === 0 && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">
                        FREE
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-stone-900 font-mono">
                    {platformFee === 0 ? (
                      <span className="text-emerald-700 font-extrabold">₹0</span>
                    ) : (
                      `₹${platformFee}`
                    )}
                  </span>
                </div>

                {selectedTip > 0 && (
                  <div className="flex justify-between text-stone-800 font-medium">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                      <span>Rider Tip</span>
                    </span>
                    <span className="font-mono font-bold">₹{selectedTip}</span>
                  </div>
                )}

                {ecoBagFee > 0 && (
                  <div className="flex justify-between text-emerald-800 font-medium">
                    <span className="flex items-center gap-1">
                      <Leaf className="w-3 h-3 text-emerald-600" />
                      <span>Eco-Cotton Bag</span>
                    </span>
                    <span className="font-mono font-bold">+₹{ecoBagFee}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-black text-stone-900 pt-1.5 border-t border-[#ded2bc]">
                  <span>Final Total</span>
                  <span className="text-amber-900 text-base font-mono font-black">₹{finalTotal}</span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full bg-[#0a192f] hover:bg-[#132f54] text-amber-300 font-black py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer border border-[#1e3a5f]"
              >
                <span>Proceed to Checkout (₹{finalTotal})</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Weight In-Cart Dialog */}
      {editingItem && (
        <WeightQuantityModal
          product={editingItem.product}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          initialWeightLabel={editingItem.selectedWeight}
          onConfirmAddToCart={(_prod, newWeight, newUnitPrice, newUnitMrp, packQty) => {
            if (onChangeItemWeight) {
              onChangeItemWeight(
                editingItem.product,
                editingItem.selectedWeight || editingItem.product.quantity,
                newWeight,
                newUnitPrice,
                newUnitMrp,
                packQty
              );
            }
            setEditingItem(null);
          }}
          onOpenBargainWithWeight={(prod, weight, price) => {
            if (onOpenBargain) {
              onOpenBargain(prod, weight, price);
            }
          }}
        />
      )}
    </>
  );
};
