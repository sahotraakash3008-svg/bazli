import React from 'react';
import { Order, OrderStatus } from '../types';
import { X, PackageCheck, Clock, MapPin, Truck, CheckCircle2, ShieldCheck, Copy, Phone, Navigation, ArrowRight, Star, ThumbsUp, Heart } from 'lucide-react';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onTrackOrder?: (order: Order) => void;
  onRateOrder?: (order: Order) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  onTrackOrder,
  onRateOrder
}) => {
  if (!isOpen) return null;

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Out for Delivery':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Preparing':
      case 'Ready for Pickup':
        return 'bg-sky-100 text-sky-900 border-sky-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const steps: OrderStatus[] = [
    'Confirmed',
    'Preparing',
    'Ready for Pickup',
    'Out for Delivery',
    'Delivered'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-emerald-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <PackageCheck className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base">My Grocery Orders ({orders.length})</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-emerald-800 text-emerald-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders List */}
        <div className="p-6 overflow-y-auto space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <PackageCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700 text-base">No orders placed yet</h4>
              <p className="text-xs text-slate-400">Your recent grocery orders will appear here.</p>
            </div>
          ) : (
            orders.map(order => {
              const currentStepIdx = steps.indexOf(order.orderStatus);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 hover:border-emerald-300 transition-colors"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-slate-900 text-sm">Order #{order.id}</span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleString()} • Seller: {order.sellerName}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-emerald-700">₹{order.finalAmount}</span>
                      <span className="text-[10px] text-slate-400 block">
                        Payment: {order.paymentMethod} ({order.paymentStatus})
                      </span>
                    </div>
                  </div>

                  {/* Delivery OTP Banner & Live Track Action */}
                  {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-amber-950">
                      <div className="flex items-center space-x-2">
                        <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Delivery OTP for Partner: <strong className="font-black text-amber-900 text-sm font-mono">{order.deliveryOtp}</strong></span>
                      </div>
                      
                      {onTrackOrder && (
                        <button
                          onClick={() => {
                            onTrackOrder(order);
                            onClose();
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Navigation className="w-3.5 h-3.5 animate-pulse" />
                          <span>Track Live GPS Route</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* If delivered, allow rating experience and viewing map route */}
                  {order.orderStatus === 'Delivered' && (
                    <div className="space-y-2 pt-1">
                      {order.review ? (
                        <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200/80 rounded-2xl p-3 text-xs text-amber-950 space-y-1.5 shadow-2xs">
                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-amber-900 flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                <span>Order Rated:</span>
                              </span>
                              <span className="bg-white px-2 py-0.5 rounded-lg font-extrabold text-amber-900 border border-amber-200 text-[11px]">
                                Store: {order.review.orderRating}★
                              </span>
                              <span className="bg-white px-2 py-0.5 rounded-lg font-extrabold text-sky-900 border border-sky-200 text-[11px]">
                                Delivery: {order.review.riderRating}★
                              </span>
                            </div>
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                              ✓ +25 Coins Credited
                            </span>
                          </div>

                          {order.review.tags && order.review.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {order.review.tags.map(tag => (
                                <span key={tag} className="bg-amber-200/60 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {order.review.orderFeedback && (
                            <p className="text-[11px] text-slate-700 italic font-medium bg-white/60 p-1.5 rounded-lg border border-amber-100">
                              "{order.review.orderFeedback}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-950">
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
                            <div>
                              <span className="font-black block text-amber-900">How was your shopping & delivery experience?</span>
                              <span className="text-[11px] text-amber-800">Share your rating and get +25 Bazli loyalty coins.</span>
                            </div>
                          </div>

                          {onRateOrder && (
                            <button
                              onClick={() => onRateOrder(order)}
                              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>Rate Order & Delivery</span>
                            </button>
                          )}
                        </div>
                      )}

                      {onTrackOrder && (
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              onTrackOrder(order);
                              onClose();
                            }}
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>View Route History & Receipt</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step Progress */}
                  <div className="py-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                      {steps.map((step, idx) => {
                        const isDone = idx <= currentStepIdx;
                        return (
                          <span key={step} className={isDone ? 'text-emerald-700 font-black' : 'text-slate-300'}>
                            {step}
                          </span>
                        );
                      })}
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                      {steps.map((_, idx) => {
                        const isDone = idx <= currentStepIdx;
                        return (
                          <div
                            key={idx}
                            className={`flex-1 h-full border-r border-white last:border-0 ${
                              isDone ? 'bg-emerald-500' : 'bg-slate-200'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Items Purchased:</span>
                    <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <img src={item.image} alt="" className="w-8 h-8 rounded bg-white object-cover border" />
                            <div>
                              <span className="font-bold text-slate-900">{item.productName}</span>
                              <span className="text-slate-500 text-[10px] block">Qty: {item.quantity} × {item.unitQuantity}</span>
                            </div>
                          </div>
                          <span className="font-extrabold text-slate-800">
                            ₹{item.paidPrice * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Breakdown Details */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-100 gap-2">
                    <div className="flex items-center gap-2">
                      <span>Delivery: <strong className="text-slate-700">{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</strong></span>
                      <span>•</span>
                      <span>Platform Fee: <strong className="text-slate-700">₹{order.platformFee ?? 9}</strong></span>
                      {order.tax && order.tax > 0 ? (
                        <>
                          <span>•</span>
                          <span>Taxes: <strong className="text-slate-700">₹{order.tax}</strong></span>
                        </>
                      ) : null}
                    </div>
                    <span className="font-bold text-emerald-700">Total: ₹{order.finalAmount}</span>
                  </div>

                  {/* Delivery Address */}
                  <div className="text-[11px] text-slate-500 flex items-start space-x-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      Deliver to: <strong>{order.deliveryAddress.fullName}</strong> — {order.deliveryAddress.street}, {order.deliveryAddress.city} ({order.deliveryAddress.pincode})
                    </span>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
