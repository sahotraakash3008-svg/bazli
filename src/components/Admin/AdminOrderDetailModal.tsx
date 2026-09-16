import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import {
  X,
  Package,
  MapPin,
  Phone,
  Store,
  Bike,
  CheckCircle2,
  AlertCircle,
  Tag,
  CreditCard,
  Clock,
  ShieldCheck,
  Navigation,
  KeyRound,
  FileText,
  UtensilsCrossed,
  ShoppingBag,
  Star
} from 'lucide-react';

interface AdminOrderDetailModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: string, otp?: string) => Promise<{ error?: string } | void>;
  onTrackOrder?: (order: Order) => void;
}

export const AdminOrderDetailModal: React.FC<AdminOrderDetailModalProps> = ({
  isOpen,
  order,
  onClose,
  onUpdateStatus,
  onTrackOrder
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [targetStatus, setTargetStatus] = useState<OrderStatus | ''>('');

  if (!isOpen || !order) return null;

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      // In admin override mode, we pass the order's actual OTP so delivery can be completed directly
      await onUpdateStatus(order.id, newStatus, order.deliveryOtp);
    } finally {
      setIsUpdating(false);
    }
  };

  const isRestaurant = order.orderType === 'restaurant' ||
    order.sellerType === 'restaurant' ||
    order.sellerId.startsWith('rest-') ||
    order.items.some(i => i.productId.startsWith('rest-') || i.productId.startsWith('dish-') || i.foodType);

  // Financial calculations
  const isAdminStore = order.isAdminStoreOrder || order.sellerId === 's-admin' || order.sellerName.includes('Bazli');
  const platformCommissionAmt = isAdminStore
    ? order.finalAmount // 100% Admin Direct Store Revenue
    : Math.round(order.finalAmount * 0.10); // 10% Platform Commission from connected sellers
  const sellerPayoutAmt = isAdminStore
    ? 0
    : Math.max(0, order.finalAmount - platformCommissionAmt - (order.deliveryFee || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={`p-5 flex items-center justify-between text-white ${
          isRestaurant
            ? 'bg-gradient-to-r from-slate-950 via-orange-950 to-slate-900'
            : 'bg-slate-900'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isRestaurant ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {isRestaurant ? <UtensilsCrossed className="w-5 h-5" /> : <Package className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base">Order #{order.id}</h3>
                <span className={`px-2 py-0.5 text-[10px] font-black rounded-full border ${
                  isRestaurant
                    ? 'bg-orange-500 text-slate-950 border-orange-400'
                    : 'bg-emerald-500 text-slate-950 border-emerald-400'
                }`}>
                  {isRestaurant ? '🍽️ Bazli Restaurant Food Order' : '🛒 Bazli Grocery Order'}
                </span>
                <span className="bg-slate-800 text-amber-300 border border-slate-700 px-2 py-0.5 text-xs font-mono font-bold rounded-full">
                  OTP: {order.deliveryOtp}
                </span>
              </div>
              <p className="text-slate-400 text-xs">Placed on {new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Banner with Live Route Track Action */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Fulfillment Status</span>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                  order.orderStatus === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : order.orderStatus === 'Cancelled'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {order.orderStatus}
                </span>
                {order.orderStatus === 'Delivered' && (
                  <span className="text-xs bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> OTP {order.deliveryOtp} Verified
                  </span>
                )}
                <span className="text-xs text-slate-500 font-medium">Payment: <strong className="text-slate-900 font-bold">{order.paymentMethod} ({order.paymentStatus})</strong></span>
              </div>
            </div>

            {onTrackOrder && order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
              <button
                type="button"
                onClick={() => {
                  onTrackOrder(order);
                  onClose();
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-all"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Live GPS Map Tracker</span>
              </button>
            )}
          </div>

          {/* Verification Badges & OTP Tracking Hub */}
          <div className="p-4 bg-gradient-to-br from-amber-50 via-sky-50/40 to-emerald-50/40 rounded-2xl border-2 border-amber-300/80 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-700" />
                <span>Admin Dual-Handover Verification System</span>
              </span>
              <span className="text-[10px] font-mono font-black bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full">
                Real-Time Confirmation Engine
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* 1. Store Pickup Handover (Seller ↔ Rider) */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-amber-600" />
                    <span className="font-extrabold text-xs text-slate-900">1. Store Pickup Handover</span>
                  </div>
                  <span className="font-mono font-black text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                    Code: {order.pickupOtp}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500">
                  Code sent to Seller ({order.sellerName}) & Delivery Partner ({order.deliveryPartnerName || 'Rider'}).
                </p>

                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 font-bold">
                  <div className={`p-2 rounded-lg border ${
                    order.sellerPickupConfirmed ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <div>Store Merchant</div>
                    <div className="font-black mt-0.5">{order.sellerPickupConfirmed ? '✓ Code Entered' : '⏳ Pending'}</div>
                  </div>

                  <div className={`p-2 rounded-lg border ${
                    order.deliveryPickupConfirmed ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <div>Delivery Rider</div>
                    <div className="font-black mt-0.5">{order.deliveryPickupConfirmed ? '✓ Code Entered' : '⏳ Pending'}</div>
                  </div>
                </div>

                {order.sellerPickupConfirmed && order.deliveryPickupConfirmed ? (
                  <div className="text-[11px] bg-emerald-100 text-emerald-900 p-2 rounded-lg font-bold flex items-center gap-1.5 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Handover Confirmed! Order collected from {order.sellerName} and moving forward to customer.</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    ⏳ Both parties must enter code <strong>{order.pickupOtp}</strong> on their respective portals to confirm collection.
                  </div>
                )}
              </div>

              {/* 2. Customer Delivery Handover (Rider ↔ Customer) */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Bike className="w-4 h-4 text-emerald-600" />
                    <span className="font-extrabold text-xs text-slate-900">2. Customer Delivery OTP</span>
                  </div>
                  <span className="font-mono font-black text-xs bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300">
                    OTP: {order.deliveryOtp}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500">
                  SMS sent to Customer (+91 {order.customerPhone || order.deliveryAddress.phone}).
                </p>

                <div className="p-2 rounded-lg border bg-slate-50 border-slate-200 text-slate-600 text-[10px] font-bold">
                  <div>Customer Delivery Verification</div>
                  <div className={`text-xs font-black mt-0.5 ${order.orderStatus === 'Delivered' ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {order.orderStatus === 'Delivered' ? '✓ Delivery Completed with Customer OTP' : '⏳ Awaiting Handover at Customer Doorstep'}
                  </div>
                </div>

                {order.orderStatus === 'Delivered' ? (
                  <div className="text-[11px] bg-emerald-100 text-emerald-900 p-2 rounded-lg font-bold flex items-center gap-1.5 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Delivered Successfully to {order.customerName}!</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 bg-slate-100 p-2 rounded-lg">
                    Rider will collect OTP <strong>{order.deliveryOtp}</strong> from {order.customerName} at delivery time.
                  </div>
                )}
              </div>
            </div>

            {/* 3. Customer Post-Delivery Experience & Review Tracking */}
            {order.orderStatus === 'Delivered' && (
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-100/40 to-emerald-500/10 p-4 rounded-2xl border border-amber-300/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Customer Shopping & Delivery Review</h4>
                      <p className="text-[11px] text-slate-500">Post-order feedback for service quality tracking</p>
                    </div>
                  </div>
                  {order.review ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-300">
                      ✓ Verified Customer Rating
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300">
                      ⏳ Rating Pending
                    </span>
                  )}
                </div>

                {order.review ? (
                  <div className="bg-white/90 rounded-xl p-3.5 border border-amber-200/80 space-y-2.5">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Store Items Quality</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-base font-black text-amber-900">{order.review.orderRating}.0</span>
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${s <= order.review!.orderRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Delivery Rider Courtesy</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-base font-black text-sky-900">{order.review.riderRating}.0</span>
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${s <= order.review!.riderRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {order.review.tags && order.review.tags.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">Customer Compliments:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {order.review.tags.map(t => (
                            <span key={t} className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-amber-300">
                              ✓ {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {order.review.orderFeedback && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 block">Customer Comments:</span>
                        <p className="text-xs text-slate-800 font-medium italic mt-0.5">"{order.review.orderFeedback}"</p>
                      </div>
                    )}

                    {order.review.addedTip && order.review.addedTip > 0 ? (
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 font-bold text-emerald-800">
                        <span>Extra Rider Tip Added:</span>
                        <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-lg border border-emerald-300">
                          +₹{order.review.addedTip}
                        </span>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    The customer has received their order and can submit a star rating and feedback through their Bazli app or order history.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Quick Admin Status Transition Override */}
          <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-2">
            <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> Admin Live Status Override
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(['Confirmed', 'Preparing', 'Ready for Pickup', 'Picked Up', 'Out for Delivery', 'Delivered', 'Cancelled'] as OrderStatus[]).map(st => (
                <button
                  key={st}
                  type="button"
                  disabled={isUpdating || order.orderStatus === st}
                  onClick={() => handleStatusChange(st)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                    order.orderStatus === st
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white hover:bg-amber-100 text-slate-700 border border-amber-300/60'
                  } disabled:opacity-40`}
                >
                  Mark as {st}
                </button>
              ))}
            </div>
          </div>

          {/* Customer & Delivery Partner Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Customer & Delivery Address
              </div>
              <div className="font-bold text-slate-800">{order.customerName}</div>
              <div className="text-slate-500 font-mono">{order.customerPhone}</div>
              <div className="text-slate-600 text-[11px] leading-relaxed pt-1">
                {order.deliveryAddress.street}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
                {order.deliveryAddress.landmark && <span className="block text-slate-400">Landmark: {order.deliveryAddress.landmark}</span>}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-amber-600" /> Merchant & Delivery Partner
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Fulfilling Store</span>
                <span className="font-bold text-slate-800">{order.sellerName} (ID: {order.sellerId})</span>
              </div>
              <div className="pt-1">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Assigned Rider</span>
                <span className="font-bold text-sky-800 flex items-center gap-1">
                  <Bike className="w-3.5 h-3.5 text-sky-600" />
                  {order.deliveryPartnerName || 'Auto-Dispatch Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Ordered Items Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Basket Items ({order.items.length})
            </h4>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={item.image} alt={item.productName} className="w-9 h-9 rounded-lg object-cover border border-slate-200" />
                    <div>
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      <div className="text-[10px] text-slate-400">{item.unitQuantity} × {item.quantity} Qty</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900">₹{item.paidPrice * item.quantity}</div>
                    {item.paidPrice < item.originalPrice && (
                      <div className="text-[10px] text-emerald-600 font-bold">
                        Saved ₹{(item.originalPrice - item.paidPrice) * item.quantity} (Bargained)
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown & Commission Ledger */}
          <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Items Subtotal</span>
              <span className="font-mono">₹{order.subtotal}</span>
            </div>
            {order.bargainDiscount > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Bazli Bargain Savings</span>
                <span className="font-mono">-₹{order.bargainDiscount}</span>
              </div>
            )}
            {order.couponDiscount > 0 && (
              <div className="flex justify-between text-amber-400 font-bold">
                <span>Coupon Applied ({order.couponCode || 'PROMO'})</span>
                <span className="font-mono">-₹{order.couponDiscount}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Hyperlocal Delivery Fee</span>
              <span className="font-mono">₹{order.deliveryFee || 0}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Bazli Platform Fee</span>
              <span className="font-mono">₹{order.platformFee ?? 9}</span>
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between text-slate-400">
                <span>GST & Taxes (5% + 18%)</span>
                <span className="font-mono">₹{order.tax || 0}</span>
              </div>
              {order.tax ? (
                <div className="flex justify-between text-[10px] text-slate-500 font-mono pl-1">
                  <span>CGST: ₹{(order.tax / 2).toFixed(1)}</span>
                  <span>SGST: ₹{(order.tax / 2).toFixed(1)}</span>
                </div>
              ) : null}
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between font-black text-base text-white">
              <span>Customer Paid Total</span>
              <span className="text-emerald-400 font-mono">₹{order.finalAmount}</span>
            </div>

            {/* Platform Margin Box */}
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-slate-800/80 p-2 rounded-xl">
                <span className="text-slate-400 block font-bold">
                  {isAdminStore ? 'Admin Direct Sales Revenue (100%)' : 'Bazli Commission (10%)'}
                </span>
                <span className="text-amber-300 font-mono font-black text-xs">₹{platformCommissionAmt}</span>
              </div>
              <div className="bg-slate-800/80 p-2 rounded-xl">
                <span className="text-slate-400 block font-bold">
                  {isAdminStore ? 'Connected Seller Payout' : 'Net Merchant Payout (90%)'}
                </span>
                <span className="text-emerald-300 font-mono font-black text-xs">₹{sellerPayoutAmt}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
