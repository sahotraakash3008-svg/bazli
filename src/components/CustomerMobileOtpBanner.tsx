import React, { useState } from 'react';
import { Order } from '../types';
import {
  Smartphone,
  ShieldCheck,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Bike,
  Navigation,
  CheckCircle2,
  Clock,
  Share2
} from 'lucide-react';
import { openWhatsAppOrderInvoice } from '../utils/whatsappNotification';

interface CustomerMobileOtpBannerProps {
  orders: Order[];
  onOpenTracking?: (order: Order) => void;
  onSwitchToDeliveryPortal?: () => void;
  isRestaurant?: boolean;
}

export const CustomerMobileOtpBanner: React.FC<CustomerMobileOtpBannerProps> = ({
  orders,
  onOpenTracking,
  isRestaurant = false
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Find the most recent active order that is not delivered or cancelled
  const activeOrders = orders.filter(
    o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled'
  );

  if (activeOrders.length === 0) return null;

  const currentOrder = activeOrders[0];

  const handleCopy = (otp: string, orderId: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className={`w-full text-white rounded-2xl p-3 sm:p-4 shadow-lg relative overflow-hidden transition-all ${
      isRestaurant
        ? 'bg-gradient-to-r from-[#581208] via-[#7a1a0d] to-[#9e2412] border border-[#c2410c]/50'
        : 'bg-gradient-to-r from-[#0a192f] via-[#10243e] to-[#163359] border border-[#1e3a5f]'
    }`}>
      {/* Background soft glow */}
      <div className={`absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full blur-xl pointer-events-none ${
        isRestaurant ? 'bg-orange-500/20' : 'bg-amber-500/15'
      }`} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        {/* Left: Order Info & Status */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
            <Bike className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                {currentOrder.orderStatus === 'Out for Delivery' ? '⚡ OUT FOR DELIVERY' : currentOrder.orderStatus.toUpperCase()}
              </span>
              <span className="text-xs text-amber-300 font-extrabold">
                Order #{currentOrder.id}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium flex items-center gap-1.5 mt-0.5">
              <span>Delivery partner: <strong className="text-white">{currentOrder.deliveryPartnerName || 'Rider Assigned'}</strong></span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-bold">Live GPS ETA</span>
            </p>
          </div>
        </div>

        {/* Right: Delivery OTP & Track GPS button */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="bg-slate-950/90 border border-amber-400/50 px-3 py-1 rounded-xl flex items-center gap-2 shadow-inner">
            <div>
              <span className="text-[8px] uppercase tracking-wider text-amber-400/90 font-black block leading-none">Share at Doorstep</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] text-slate-400 font-semibold">OTP:</span>
                <span className="font-mono text-lg font-black text-amber-300 tracking-wider leading-none">
                  {currentOrder.deliveryOtp}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleCopy(currentOrder.deliveryOtp, currentOrder.id)}
              className="p-1.5 bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-slate-950 rounded-lg transition-colors cursor-pointer"
              title="Copy OTP"
            >
              {copiedId === currentOrder.id ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <button
            onClick={() => openWhatsAppOrderInvoice(currentOrder)}
            className="p-2 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-emerald-500/50 shadow-sm"
            title="Open WhatsApp Bill & Live GPS"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden sm:inline">WhatsApp Bill</span>
          </button>

          {onOpenTracking && (
            <button
              onClick={() => onOpenTracking(currentOrder)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Track Live</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer bg-slate-900/60 border border-slate-800"
            title={isExpanded ? 'Hide details' : 'Show details'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded SMS Message Details for Customer */}
      {isExpanded && (
        <div className="mt-3 pt-2.5 border-t border-slate-800 text-xs text-slate-300 space-y-1.5 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure Handover Guarantee</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Please share confidential OTP <strong className="font-mono text-amber-300">{currentOrder.deliveryOtp}</strong> with delivery rider <strong className="text-white">{currentOrder.deliveryPartnerName}</strong> only after inspecting your grocery package at your doorstep.
          </p>
        </div>
      )}
    </div>
  );
};

