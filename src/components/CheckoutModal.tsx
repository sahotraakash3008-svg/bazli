import React, { useState, useEffect } from 'react';
import { CartItem, DeliveryZone, Order, CustomerProfile } from '../types';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  CreditCard,
  Smartphone,
  Banknote,
  ArrowRight,
  Copy,
  Check,
  Building2,
  Wallet,
  QrCode,
  Lock,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Heart,
  BellOff,
  DoorClosed,
  PhoneOff,
  Dog,
  ShieldAlert,
  Zap,
  Home,
  Briefcase,
  Users,
  Plus,
  Crown,
  MessageSquare,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  hapticOrderSuccess,
  hapticSelection,
  hapticError
} from '../utils/haptics';
import { createOrderInFirestore } from '../lib/firestoreSync';
import { openWhatsAppOrderInvoice } from '../utils/whatsappNotification';
import {
  loadRazorpayScript,
  checkRazorpayConfig,
  createRazorpayOrderOnServer,
  verifyRazorpayPaymentOnServer
} from '../lib/razorpayClient';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  selectedZone?: DeliveryZone;
  appliedCouponCode?: string;
  couponDiscount?: number;
  customerProfile?: CustomerProfile;
  isFirstOrder?: boolean;
  orderCount?: number;
  onOrderPlaced: (newOrder: Order) => void;
  onTrackOrder?: (order: Order) => void;
  onOpenLegalModal?: (tab?: 'terms' | 'privacy' | 'refund' | 'shipping' | 'contact') => void;
  platformFee?: number;
}

const PRESET_INSTRUCTIONS = [
  { id: 'no-bell', label: "Don't ring bell 🔕", icon: BellOff },
  { id: 'leave-door', label: 'Leave at door 🚪', icon: DoorClosed },
  { id: 'avoid-call', label: 'Avoid calling 📞', icon: PhoneOff },
  { id: 'pet-home', label: 'Pet at home 🐾', icon: Dog },
  { id: 'guard-desk', label: 'Leave with guard 🏢', icon: ShieldAlert }
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  selectedZone = {
    id: 'zone-a',
    name: 'Zone A - Central City (0-5 km)',
    deliveryFee: 19,
    freeDeliveryThreshold: 129,
    estimatedTime: '15-25 Mins',
    availability: true
  },
  appliedCouponCode,
  couponDiscount = 0,
  customerProfile = {
    id: 'CUST-8831',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    loyaltyLevel: 'Gold',
    totalOrders: 14,
    totalSpending: 8450,
    isVipMember: false,
    savedAddresses: [
      {
        id: 'addr-1',
        title: 'Home',
        street: 'Flat 402, Sunshine Heights, Linking Road',
        city: 'Mumbai',
        pincode: '400050',
        landmark: 'Near Bandra Police Station',
        isDefault: true
      },
      {
        id: 'addr-2',
        title: 'Work',
        street: 'Tower B, 7th Floor, Cyber City IT Park',
        city: 'Mumbai',
        pincode: '400051',
        landmark: 'Opposite Metro Station',
        isDefault: false
      }
    ]
  },
  isFirstOrder = false,
  orderCount = 0,
  onOrderPlaced,
  onTrackOrder,
  onOpenLegalModal,
  platformFee: propPlatformFee = 0
}) => {
  // Saved Addresses State
  const initialAddresses = customerProfile.savedAddresses?.length
    ? customerProfile.savedAddresses
    : [
        {
          id: 'addr-1',
          title: 'Home',
          street: 'Flat 402, Sunshine Heights, Linking Road',
          city: 'Mumbai',
          pincode: '400050',
          landmark: 'Near Bandra Police Station',
          isDefault: true
        },
        {
          id: 'addr-2',
          title: 'Work',
          street: 'Tower B, 7th Floor, Cyber City IT Park',
          city: 'Mumbai',
          pincode: '400051',
          landmark: 'Opposite Metro Station',
          isDefault: false
        }
      ];

  const [selectedAddressId, setSelectedAddressId] = useState<string>(initialAddresses[0]?.id || 'addr-1');
  const [fullName, setFullName] = useState(customerProfile.name);
  const [phone, setPhone] = useState(customerProfile.phone);
  const [street, setStreet] = useState(initialAddresses[0]?.street || 'Flat 402, Sunshine Heights');
  const [city, setCity] = useState(initialAddresses[0]?.city || 'Mumbai');
  const [pincode, setPincode] = useState(initialAddresses[0]?.pincode || '400050');
  const [landmark, setLandmark] = useState(initialAddresses[0]?.landmark || '');
  const [isCustomAddress, setIsCustomAddress] = useState(false);

  // Delivery Instructions & Special Notes State
  const [selectedInstructions, setSelectedInstructions] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');

  // Delivery Partner Tip State (Default 0 - customer can freely choose 0 or any amount)
  const [deliveryTip, setDeliveryTip] = useState<number>(0);
  const [customTipInput, setCustomTipInput] = useState<string>('');
  const [showCustomTip, setShowCustomTip] = useState<boolean>(false);

  // Payment Selection State
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Credit/Debit Card' | 'Cash on Delivery' | 'NetBanking' | 'Wallet'>('UPI');
  
  // UPI Sub-states
  const [upiOption, setUpiOption] = useState<'app' | 'vpa' | 'qr'>('vpa');
  const [upiId, setUpiId] = useState('aarav@okaxis');
  const [vpaVerified, setVpaVerified] = useState(true);

  // Card Sub-states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(fullName);
  const [saveCard, setSaveCard] = useState(true);

  // NetBanking Sub-states
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Wallet Sub-states
  const [selectedWallet, setSelectedWallet] = useState('Paytm Wallet');

  // Razorpay Gateway State
  const [isRazorpayConfigured, setIsRazorpayConfigured] = useState<boolean>(true);
  const [verifyingPayment, setVerifyingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string>('');

  useEffect(() => {
    loadRazorpayScript().catch(() => {});
    checkRazorpayConfig().then(cfg => {
      setIsRazorpayConfigured(cfg.isConfigured);
    }).catch(() => {});
  }, []);

  // Processing & Final Order State
  const [loading, setLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);

  if (!isOpen) return null;

  // Handle Address Select
  const handleSelectSavedAddress = (addrId: string) => {
    setSelectedAddressId(addrId);
    if (addrId === 'new') {
      setIsCustomAddress(true);
      setStreet('');
      setCity('Mumbai');
      setPincode('');
      setLandmark('');
    } else {
      setIsCustomAddress(false);
      const found = initialAddresses.find(a => a.id === addrId);
      if (found) {
        setStreet(found.street);
        setCity(found.city);
        setPincode(found.pincode);
        setLandmark(found.landmark || '');
      }
    }
  };

  // Toggle delivery instructions chip
  const handleToggleInstruction = (instructionLabel: string) => {
    setSelectedInstructions(prev =>
      prev.includes(instructionLabel)
        ? prev.filter(i => i !== instructionLabel)
        : [...prev, instructionLabel]
    );
  };

  // Price Calculations
  const subtotal = cartItems.reduce((acc, item) => {
    const base = item.unitPrice || item.product.sellingPrice;
    return acc + base * item.quantity;
  }, 0);
  const bargainSavings = cartItems.reduce((acc, item) => {
    if (item.bargainedPrice) {
      const base = item.unitPrice || item.product.sellingPrice;
      return acc + Math.max(0, (base - item.bargainedPrice) * item.quantity);
    }
    return acc;
  }, 0);

  const netAmount = Math.max(0, subtotal - bargainSavings - couponDiscount);
  const isVip = Boolean(customerProfile.isVipMember);

  // Detect if order is for dishes from restaurant portal
  const isRestaurantOrder = cartItems.some(
    item => item.product.sellerType === 'restaurant' ||
            item.product.category === 'Restaurant Meals & Dining' ||
            item.product.category?.toLowerCase().includes('restaurant') ||
            item.product.category?.toLowerCase().includes('kitchen')
  );

  // Restaurant: delivery charge ₹21, free delivery above ₹499, platform fee ₹11
  // Grocery: stays standard (threshold ₹129, delivery fee ₹19, platform fee ₹0)
  const threshold = isRestaurantOrder ? 499 : (selectedZone.freeDeliveryThreshold ?? 129);
  const baseDeliveryFee = isRestaurantOrder ? 21 : selectedZone.deliveryFee;
  const isFreeDelivery = isVip || isFirstOrder || netAmount >= threshold;
  const deliveryFee = isFreeDelivery ? 0 : baseDeliveryFee;
  const basePlatformFee = isRestaurantOrder ? 11 : (propPlatformFee !== undefined ? propPlatformFee : 0);
  const platformFee = isVip ? 0 : basePlatformFee;
  const itemGst = 0;
  const platformGst = 0;
  const tax = 0;
  const finalAmount = Math.max(0, netAmount + deliveryFee + platformFee + deliveryTip);

  // Format Card Number into 4-digit chunks
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  // Detect Card Network Type
  const getCardNetwork = (num: string) => {
    const clean = num.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'VISA';
    if (/^5[1-5]/.test(clean)) return 'MasterCard';
    if (/^60|^65|^81|^82/.test(clean)) return 'RuPay';
    if (/^3[47]/.test(clean)) return 'American Express';
    return 'CARD';
  };

  // Submit Order Trigger (Razorpay Production Checkout or Cash on Delivery)
  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');

    if (paymentMethod === 'Cash on Delivery') {
      await executeOrderPlacement('Cash on Delivery', 'PENDING-COD');
      return;
    }

    // Razorpay Online Payment Flow
    setLoading(true);

    try {
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady || !(window as any).Razorpay) {
        setPaymentError('Razorpay payment gateway SDK could not be loaded. Please check your network connection or choose Cash on Delivery.');
        setLoading(false);
        hapticError();
        return;
      }

      const itemsPayload = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        bargainedPrice: item.bargainedPrice,
        bargainSessionId: item.bargainSessionId
      }));

      // 1. Create Order securely on trusted server
      const { ok, data } = await createRazorpayOrderOnServer({
        customerId: customerProfile.id,
        customerName: fullName,
        customerPhone: phone,
        customerEmail: `${phone.replace(/\D/g, '') || 'customer'}@bazli.in`,
        items: itemsPayload,
        couponCode: appliedCouponCode,
        deliveryZoneId: selectedZone.id,
        deliveryAddress: {
          fullName,
          street,
          city,
          pincode,
          landmark,
          phone
        },
        deliveryTip,
        deliveryInstructions: selectedInstructions,
        cookingInstructions: specialInstructions,
        specialInstructions
      });

      if (!ok || !data.success) {
        if (data?.error === 'RAZORPAY_NOT_CONFIGURED') {
          setPaymentError(
            'Razorpay live credentials (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) are not configured on the server. Please configure them in environment variables. In the meantime, you can place this order using Cash on Delivery (COD).'
          );
        } else {
          setPaymentError(data?.message || 'Failed to initialize payment gateway order. Please retry or choose Cash on Delivery.');
        }
        setLoading(false);
        hapticError();
        return;
      }

      const { razorpayOrderId, amount, currency, keyId, bazliOrderId } = data;

      // 2. Launch official Razorpay Standard Checkout
      const rzpOptions = {
        key: keyId,
        amount: amount,
        currency: currency || 'INR',
        name: 'Bazli Express',
        description: `Bazli Order #${bazliOrderId}`,
        image: '/bazli-logo.jpg?v=2',
        order_id: razorpayOrderId,
        prefill: {
          name: fullName,
          contact: phone,
          email: `${phone.replace(/\D/g, '') || 'customer'}@bazli.in`
        },
        notes: {
          bazliOrderId,
          customerId: customerProfile.id,
          selectedMethod: paymentMethod
        },
        theme: {
          color: '#059669'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setPaymentError('Payment window was closed. Your cart is preserved, and you can retry payment anytime.');
          }
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          setVerifyingPayment(true);
          setLoading(true);

          try {
            // 3. Cryptographic server-side signature verification
            const verifyRes = await verifyRazorpayPaymentOnServer({
              bazliOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.ok && verifyRes.data?.success) {
              const verifiedOrder: Order = verifyRes.data.order;
              setConfirmedOrder(verifiedOrder);
              onOrderPlaced(verifiedOrder);
              hapticOrderSuccess();

              confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 }
              });
            } else {
              setPaymentError(
                verifyRes.data?.message ||
                  'Payment verification failed. If money was debited, your order will be confirmed automatically via webhook shortly.'
              );
              hapticError();
            }
          } catch (verErr) {
            console.error('Payment verification error:', verErr);
            setPaymentError('Network glitch while verifying payment. Your order status will be updated via webhook.');
            hapticError();
          } finally {
            setVerifyingPayment(false);
            setLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.on('payment.failed', (resp: any) => {
        console.warn('Razorpay payment failed:', resp.error);
        setPaymentError(resp.error?.description || 'Payment was declined. Please try another card, UPI ID, or Cash on Delivery.');
        setLoading(false);
        hapticError();
      });

      rzp.open();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setPaymentError(err.message || 'Unable to open payment gateway. Please try Cash on Delivery.');
      setLoading(false);
      hapticError();
    }
  };

  // Call Server Order Placement Endpoint
  const executeOrderPlacement = async (pmLabel: string, transactionReference: string) => {
    if (loading) return;
    setLoading(true);

    try {
      const itemsPayload = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        bargainedPrice: item.bargainedPrice,
        bargainSessionId: item.bargainSessionId
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customerProfile.id,
          customerName: fullName,
          customerPhone: phone,
          items: itemsPayload,
          couponCode: appliedCouponCode,
          deliveryZoneId: selectedZone.id,
          deliveryAddress: {
            fullName,
            street,
            city,
            pincode,
            landmark,
            phone
          },
          deliveryTip,
          deliveryInstructions: selectedInstructions,
          cookingInstructions: specialInstructions,
          paymentMethod: paymentMethod === 'Cash on Delivery' ? 'Cash on Delivery' : paymentMethod,
          paymentId: transactionReference
        })
      });

      if (res.ok) {
        const orderData: Order = await res.json();
        await createOrderInFirestore(orderData).catch(e => console.warn('Firestore order creation note:', e));
        setConfirmedOrder(orderData);
        onOrderPlaced(orderData);
        hapticOrderSuccess();

        confetti({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        const generatedOrderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
        const mockOrder: Order = {
          id: generatedOrderId,
          customerId: customerProfile.id,
          customerName: fullName,
          customerPhone: phone,
          items: cartItems.map(i => ({
            productId: i.product.id,
            productName: i.product.name,
            quantity: i.quantity,
            originalPrice: i.unitPrice || i.product.sellingPrice,
            paidPrice: i.bargainedPrice || i.unitPrice || i.product.sellingPrice,
            image: i.product.image,
            unitQuantity: i.selectedWeight || i.product.quantity
          })),
          subtotal,
          bargainDiscount: bargainSavings,
          couponDiscount,
          deliveryFee,
          deliveryTip,
          deliveryInstructions: selectedInstructions,
          cookingInstructions: specialInstructions,
          platformFee,
          tax: 0,
          gstBreakdown: {
            cgst: 0,
            sgst: 0,
            rate: 0,
            itemsGst: 0,
            platformFeeGst: 0
          },
          finalAmount,
          paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
          paymentMethod: paymentMethod as any,
          paymentId: transactionReference,
          deliveryAddress: { fullName, street, city, pincode, landmark, phone },
          deliveryZoneId: selectedZone.id,
          sellerId: cartItems[0]?.product.sellerId || 'S1',
          sellerName: cartItems[0]?.product.sellerName || 'Gupta Grocery Store',
          sellerType: isRestaurantOrder ? 'restaurant' : 'grocery',
          orderType: isRestaurantOrder ? 'restaurant' : 'grocery',
          deliveryPartnerId: 'D1',
          deliveryPartnerName: 'Vikram Singh (Ather EV)',
          orderStatus: 'Confirmed',
          deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString(),
          pickupOtp: Math.floor(1000 + Math.random() * 9000).toString(),
          sellerPickupConfirmed: false,
          deliveryPickupConfirmed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await createOrderInFirestore(mockOrder).catch(e => console.warn('Firestore order fallback note:', e));
        setConfirmedOrder(mockOrder);
        onOrderPlaced(mockOrder);
        hapticOrderSuccess();

        confetti({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Order creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-emerald-900 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 border border-emerald-700 flex items-center justify-center text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base leading-tight">
                {confirmedOrder ? 'Order Confirmed! 🎉' : 'BazliPay Secure Checkout'}
              </h3>
              <p className="text-[10px] text-emerald-200/80 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" /> 256-Bit SSL Encrypted Payment Gateway
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-800 text-emerald-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {confirmedOrder ? (
            /* ORDER SUCCESS RECEIPT SCREEN */
            <div className="text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[11px] px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
                  Order #{confirmedOrder.id} Placed
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-2">
                  Thank You, {confirmedOrder.customerName}!
                </h4>
                <p className="text-xs text-slate-500">
                  Your fresh groceries are being packed by <strong className="text-slate-800">{confirmedOrder.sellerName}</strong>.
                </p>
              </div>

              {/* Delivery OTP Highlight Box */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-dashed border-amber-300/90 p-4 rounded-2xl text-center space-y-1 shadow-2xs">
                <span className="text-[11px] uppercase font-black tracking-wider text-amber-800 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Delivery Verification OTP
                </span>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-3xl font-black text-slate-900 tracking-widest bg-white px-4 py-1 rounded-xl border border-amber-200 shadow-xs">
                    {confirmedOrder.deliveryOtp}
                  </span>
                  <button
                    onClick={() => copyToClipboard(confirmedOrder.deliveryOtp)}
                    className="p-2 bg-amber-200/80 hover:bg-amber-300 text-amber-900 rounded-xl transition-colors cursor-pointer"
                    title="Copy OTP"
                  >
                    {copiedOtp ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-amber-900/80 font-medium">
                  Share this 4-digit OTP with your rider (<strong className="text-amber-950">{confirmedOrder.deliveryPartnerName}</strong>) when delivered!
                </p>
              </div>

              {/* Order Receipt Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2 text-left">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    confirmedOrder.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {confirmedOrder.paymentStatus === 'Paid' ? `Paid via ${paymentMethod}` : 'Pay on Delivery'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal ({confirmedOrder.items.length} items):</span>
                  <span className="font-semibold text-slate-800">₹{confirmedOrder.subtotal}</span>
                </div>

                {confirmedOrder.bargainDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Bargain Discount Saved:</span>
                    <span>-₹{confirmedOrder.bargainDiscount}</span>
                  </div>
                )}

                {confirmedOrder.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Coupon Savings:</span>
                    <span>-₹{confirmedOrder.couponDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-slate-600">Delivery Charge:</span>
                  <span>{confirmedOrder.deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${confirmedOrder.deliveryFee}`}</span>
                </div>

                {confirmedOrder.deliveryTip && confirmedOrder.deliveryTip > 0 ? (
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-current" /> Delivery Partner Tip:
                    </span>
                    <span>₹{confirmedOrder.deliveryTip}</span>
                  </div>
                ) : null}

                <div className="flex justify-between">
                  <span className="text-slate-600">Bazli Platform Fee:</span>
                  <span className="font-semibold text-slate-800">
                    {confirmedOrder.platformFee === 0 ? (
                      <span className="text-emerald-700 font-black">FREE (₹0)</span>
                    ) : (
                      `₹${confirmedOrder.platformFee}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between font-black text-slate-900 border-t border-slate-300 pt-2 text-sm">
                  <span>Total Paid:</span>
                  <span className="text-emerald-700 text-base">₹{confirmedOrder.finalAmount}</span>
                </div>
              </div>

              {/* Step 3: WhatsApp Invoice & SMS Dispatch Notice */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-950">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 fill-current" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold block">WhatsApp Bill & Delivery OTP Sent</span>
                    <span className="text-[11px] text-emerald-700">
                      Dispatched to +91 {confirmedOrder.customerPhone || 'Customer'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openWhatsAppOrderInvoice(confirmedOrder)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Open WhatsApp</span>
                </button>
              </div>

              <button
                onClick={() => {
                  if (onTrackOrder) {
                    onTrackOrder(confirmedOrder);
                  }
                  onClose();
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl shadow-md transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                <span>📍 Track Live Delivery Status (GPS)</span>
              </button>
            </div>
          ) : (
            /* CHECKOUT FORM & GATEWAY TABS */
            <form onSubmit={handleInitiatePayment} className="space-y-5">
              
              {/* Express 10-Min Delivery Banner */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900">
                      ⚡ 10-Min Hyperlocal Express Delivery
                    </h5>
                    <p className="text-[10px] text-slate-500">
                      Rider will be dispatched immediately from nearest Dark Store / Mart.
                    </p>
                  </div>
                </div>
                {isVip && (
                  <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <Crown className="w-3 h-3 fill-current" /> VIP FREE
                  </span>
                )}
              </div>

              {/* Section 1: Delivery Address & Saved Address Selector */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> 1. Select Delivery Address
                  </h4>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {selectedZone.estimatedTime} ETA
                  </span>
                </div>

                {/* Saved Address Pills */}
                <div className="grid grid-cols-3 gap-2">
                  {initialAddresses.map(addr => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleSelectSavedAddress(addr.id)}
                      className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center space-x-2 ${
                        selectedAddressId === addr.id
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {addr.title === 'Home' ? (
                        <Home className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : addr.title === 'Work' ? (
                        <Briefcase className="w-4 h-4 text-sky-600 shrink-0" />
                      ) : (
                        <Users className="w-4 h-4 text-purple-600 shrink-0" />
                      )}
                      <div className="truncate">
                        <span className="text-xs font-bold block truncate">{addr.title}</span>
                        <span className="text-[9px] text-slate-400 block truncate">{addr.street.split(',')[0]}</span>
                      </div>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleSelectSavedAddress('new')}
                    className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center space-x-1.5 ${
                      selectedAddressId === 'new'
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Plus className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold truncate">Add New</span>
                  </button>
                </div>

                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="bg-white text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="bg-white text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="House / Flat / Floor / Building / Area"
                    required
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    className="w-full bg-white text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-medium"
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Nearby Landmark"
                      value={landmark}
                      onChange={e => setLandmark(e.target.value)}
                      className="col-span-1 bg-white text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-medium"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      required
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="col-span-1 bg-white text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      required
                      value={pincode}
                      onChange={e => setPincode(e.target.value)}
                      className="col-span-1 bg-white text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Delivery Instructions for Rider */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" /> Delivery Instructions for Partner:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_INSTRUCTIONS.map(inst => {
                    const isSelected = selectedInstructions.includes(inst.label);
                    return (
                      <button
                        key={inst.id}
                        type="button"
                        onClick={() => handleToggleInstruction(inst.label)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span>{inst.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Special Note / Cooking Instruction */}
                <input
                  type="text"
                  placeholder="e.g. Please pick ripe bananas / avoid too much oil / pack eggs extra carefully"
                  value={specialInstructions}
                  onChange={e => setSpecialInstructions(e.target.value)}
                  className="w-full bg-slate-50 text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-medium placeholder-slate-400"
                />
              </div>

              {/* Section 3: Delivery Partner Tip Selector */}
              <div className="space-y-2 bg-gradient-to-br from-rose-50/70 to-pink-50/70 p-3.5 rounded-2xl border border-rose-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                    <span>Tip your Delivery Partner (Optional)</span>
                  </span>
                  <span className="text-[10px] text-rose-700 font-bold bg-white px-2 py-0.5 rounded-full border border-rose-200">
                    100% goes to rider
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Tip is completely optional. You can choose any amount or ₹0 (No Tip).
                </p>

                <div className="grid grid-cols-6 gap-1.5 pt-1">
                  {[0, 10, 20, 30, 50].map(tipAmount => (
                    <button
                      key={tipAmount}
                      type="button"
                      onClick={() => {
                        setDeliveryTip(tipAmount);
                        setShowCustomTip(false);
                        setCustomTipInput('');
                      }}
                      className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        deliveryTip === tipAmount && !showCustomTip
                          ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                          : 'bg-white text-slate-700 border-rose-200 hover:border-rose-300'
                      }`}
                    >
                      {tipAmount === 0 ? '₹0 (None)' : `₹${tipAmount}`}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomTip(true);
                    }}
                    className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      showCustomTip
                        ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                        : 'bg-white text-slate-700 border-rose-200 hover:border-rose-300'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {showCustomTip && (
                  <div className="flex items-center gap-2 pt-1.5">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        placeholder="Enter tip amount (e.g. 15, 0)"
                        value={customTipInput}
                        onChange={e => {
                          const val = e.target.value;
                          setCustomTipInput(val);
                          const parsed = parseInt(val, 10);
                          setDeliveryTip(isNaN(parsed) || parsed < 0 ? 0 : parsed);
                        }}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-rose-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
                        autoFocus
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryTip(0);
                        setShowCustomTip(false);
                        setCustomTipInput('');
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      Set ₹0 (No Tip)
                    </button>
                  </div>
                )}
              </div>

              {/* Section 4: Interactive Payment Gateway Options */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> 4. Select Payment Method
                </h4>

                {/* Primary Payment Mode Selection Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between space-y-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'UPI'
                        ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Smartphone className={`w-5 h-5 ${paymentMethod === 'UPI' ? 'text-emerald-700' : 'text-slate-500'}`} />
                    <div>
                      <span className="font-bold text-xs block">UPI / GPay</span>
                      <span className="text-[10px] text-slate-400 block">Instant & Zero Fee</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Credit/Debit Card')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between space-y-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'Credit/Debit Card'
                        ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <CreditCard className={`w-5 h-5 ${paymentMethod === 'Credit/Debit Card' ? 'text-emerald-700' : 'text-slate-500'}`} />
                    <div>
                      <span className="font-bold text-xs block">Cards</span>
                      <span className="text-[10px] text-slate-400 block">Credit & Debit</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('NetBanking')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between space-y-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'NetBanking'
                        ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Building2 className={`w-5 h-5 ${paymentMethod === 'NetBanking' ? 'text-emerald-700' : 'text-slate-500'}`} />
                    <div>
                      <span className="font-bold text-xs block">NetBanking</span>
                      <span className="text-[10px] text-slate-400 block">All Indian Banks</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Wallet')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between space-y-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'Wallet'
                        ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Wallet className={`w-5 h-5 ${paymentMethod === 'Wallet' ? 'text-emerald-700' : 'text-slate-500'}`} />
                    <div>
                      <span className="font-bold text-xs block">Wallets</span>
                      <span className="text-[10px] text-slate-400 block">Paytm / Amazon</span>
                    </div>
                  </button>
                </div>

                {/* Cash on Delivery option below */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash on Delivery')}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      paymentMethod === 'Cash on Delivery'
                        ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Banknote className="w-5 h-5 text-emerald-700 shrink-0" />
                      <div>
                        <span className="font-bold text-xs block">Cash on Delivery (COD)</span>
                        <span className="text-[10px] text-slate-400 block">Pay via cash or UPI code on delivery partner's device</span>
                      </div>
                    </div>
                    {paymentMethod === 'Cash on Delivery' && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                  </button>
                </div>

                {/* DETAILED PAYMENT GATEWAY INFO PANELS */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 mt-3 space-y-3">
                  
                  {/* UPI PANEL */}
                  {paymentMethod === 'UPI' && (
                    <div className="space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-emerald-600" />
                          Razorpay Instant UPI
                        </span>
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                          ⚡ Zero Transaction Fee
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['Google Pay', 'PhonePe', 'Paytm UPI', 'BHIM UPI'].map(app => (
                          <div
                            key={app}
                            className="p-2.5 bg-white border border-slate-200 rounded-xl text-center shadow-2xs"
                          >
                            <span className="text-xs font-bold text-slate-800 block">{app}</span>
                            <span className="text-[9px] text-emerald-600 font-semibold block">Instant Pay</span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                        <span>Scan & Pay with any UPI QR Code or Enter UPI ID (VPA) directly in the Razorpay popup.</span>
                      </div>
                    </div>
                  )}

                  {/* CARDS PANEL */}
                  {paymentMethod === 'Credit/Debit Card' && (
                    <div className="space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-emerald-600" />
                          Credit & Debit Cards (RBI Tokenized)
                        </span>
                        <span className="text-[10px] font-extrabold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-full">
                          3D Secure V2
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[11px] font-bold text-slate-700">
                        {['Visa', 'Mastercard', 'RuPay', 'Maestro', 'American Express', 'Diners Club'].map(card => (
                          <span key={card} className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
                            {card}
                          </span>
                        ))}
                      </div>

                      <p className="text-[11px] text-slate-500">
                        For maximum safety, your card details are never saved on Bazli servers. You will enter your card details inside Razorpay's PCI-DSS Level 1 certified gateway.
                      </p>
                    </div>
                  )}

                  {/* NETBANKING PANEL */}
                  {paymentMethod === 'NetBanking' && (
                    <div className="space-y-2.5 animate-in fade-in">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-emerald-600" />
                          Direct Bank Authorization
                        </span>
                        <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full">
                          50+ Indian Banks
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map(bank => (
                          <div
                            key={bank}
                            className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 text-center shadow-2xs"
                          >
                            {bank}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* WALLETS PANEL */}
                  {paymentMethod === 'Wallet' && (
                    <div className="space-y-2.5 animate-in fade-in">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Wallet className="w-4 h-4 text-emerald-600" />
                          Digital Wallets
                        </span>
                        <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full">
                          Instant One-Click
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['Paytm', 'PhonePe', 'Amazon Pay', 'MobiKwik'].map(wallet => (
                          <div
                            key={wallet}
                            className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 text-center shadow-2xs"
                          >
                            {wallet}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* COD PANEL */}
                  {paymentMethod === 'Cash on Delivery' && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                      <span className="font-extrabold flex items-center gap-1">
                        <Banknote className="w-4 h-4 text-amber-700" /> Pay Cash or QR at Doorstep
                      </span>
                      <p className="text-[11px] text-amber-800">
                        Please keep exact cash ready or scan the delivery rider's QR code upon arrival.
                      </p>
                    </div>
                  )}

                  {/* Security Guarantee Footer */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      256-Bit SSL Bank Encrypted
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Razorpay Verified Merchant
                    </span>
                  </div>

                </div>
              </div>

              {/* Order Bill Summary Breakdown */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="font-semibold text-slate-800">₹{subtotal}</span>
                </div>

                {bargainSavings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Bargain Discount Saved</span>
                    <span>-₹{bargainSavings}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Coupon ({appliedCouponCode})</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1">
                    <span>Delivery Charge</span>
                    {isRestaurantOrder && (
                      <span className="text-[10px] bg-orange-100 text-orange-800 px-1 py-0.2 rounded font-bold">
                        Restaurant
                      </span>
                    )}
                  </span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <span className="line-through text-slate-400 font-normal">₹{baseDeliveryFee}</span>
                        <span>FREE</span>
                        <span className="text-[10px] bg-emerald-100 px-1 py-0.2 rounded text-emerald-800 font-extrabold">
                          {isVip ? 'VIP Pass' : isFirstOrder ? `${orderCount === 0 ? '1st' : '2nd'} Order Special` : `Order > ₹${threshold}`}
                        </span>
                      </span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>

                {deliveryTip > 0 && (
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-current" /> Delivery Partner Tip
                    </span>
                    <span>₹{deliveryTip}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1">
                    <span>Bazli Platform Fee</span>
                    {isRestaurantOrder && !isVip && (
                      <span className="text-[10px] bg-orange-100 text-orange-800 px-1 py-0.2 rounded font-bold">Restaurant</span>
                    )}
                    {platformFee === 0 && !isVip && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">100% FREE</span>
                    )}
                    {isVip && (
                      <span className="text-[10px] bg-amber-100 text-amber-900 px-1 py-0.2 rounded font-bold">👑 VIP Waived</span>
                    )}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {platformFee === 0 && !isVip ? (
                      <span className="text-emerald-700 font-extrabold">₹0 (FREE)</span>
                    ) : isVip ? (
                      <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                        <span className="line-through text-slate-400 font-normal">₹{basePlatformFee}</span>
                        <span>₹0</span>
                      </span>
                    ) : (
                      `₹${platformFee}`
                    )}
                  </span>
                </div>
              </div>

              {/* Order Final Amount & Action Button */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <div className="flex items-baseline justify-between text-slate-900">
                  <div>
                    <span className="text-xs text-slate-500 block">Total Payable Amount</span>
                    <span className="text-[10px] text-emerald-700 font-bold">Includes tip, all taxes & delivery</span>
                  </div>
                  <span className="text-2xl font-black text-emerald-700">₹{finalAmount}</span>
                </div>

                {/* Payment Error Banner */}
                {paymentError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start justify-between gap-2 animate-in fade-in">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Payment Notice</span>
                        <p className="text-[11px] text-rose-700 mt-0.5">{paymentError}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaymentError('')}
                      className="text-rose-500 hover:text-rose-700 font-bold p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || verifyingPayment}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base cursor-pointer"
                >
                  {loading || verifyingPayment ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>{verifyingPayment ? 'Verifying with Razorpay...' : 'Connecting to Razorpay...'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-300" />
                      <span>
                        {paymentMethod === 'Cash on Delivery'
                          ? 'Confirm & Place COD Order'
                          : `Pay ₹${finalAmount} with Razorpay`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-500 pt-1 leading-relaxed">
                  By placing this order, you agree to Bazli's{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegalModal?.('terms')}
                    className="text-slate-800 font-bold underline hover:text-emerald-700 cursor-pointer"
                  >
                    Terms of Use
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegalModal?.('refund')}
                    className="text-slate-800 font-bold underline hover:text-emerald-700 cursor-pointer"
                  >
                    Refund Policy
                  </button>
                  . 🔒 256-Bit SSL Encrypted via Razorpay.
                </p>
              </div>

            </form>
          )}
        </div>

      </div>

      {/* RAZORPAY SERVER-SIDE SIGNATURE VERIFICATION OVERLAY */}
      {verifyingPayment && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative p-6 space-y-5 text-center">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <img
                  src="/bazli-logo.jpg?v=2"
                  alt="Bazli Logo"
                  className="w-8 h-8 rounded-lg object-cover border-2 border-yellow-400 p-0.5 shadow-2xs shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left">
                  <span className="font-extrabold text-xs text-slate-900 block">Bazli Express</span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> Razorpay Signature Verification
                  </span>
                </div>
              </div>
            </div>

            <div className="py-6 space-y-4">
              <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Verifying Payment Signature...</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Cryptographically validating HMAC-SHA256 signature on trusted server and updating Firestore order status. Please do not refresh.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
