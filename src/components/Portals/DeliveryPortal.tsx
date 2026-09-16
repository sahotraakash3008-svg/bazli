import React, { useState } from 'react';
import { Order, DeliveryPartner, OrderEarningBreakdown, DeliveryPayoutRecord, PayoutAccountDetails, DispatchPingPayload } from '../../types';
import {
  Truck,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Phone,
  AlertCircle,
  UserPlus,
  UserCheck,
  CreditCard,
  Building2,
  Clock,
  IdCard,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Bike,
  Receipt,
  TrendingUp,
  CloudRain,
  Sun,
  Flame,
  Award,
  ArrowUpRight,
  Info,
  DollarSign,
  Gift,
  HelpCircle,
  FileText,
  Smartphone,
  KeyRound,
  Store,
  Check,
  Lock,
  Building,
  Edit3,
  LogOut,
  Radio,
  Navigation
} from 'lucide-react';
import { BazliPayoutModal } from './BazliPayoutModal';
import { BazliPayoutSlipModal } from './BazliPayoutSlipModal';
import { RiderOrderRadarModal } from './RiderOrderRadarModal';
import { ManagePayoutAccountModal } from './ManagePayoutAccountModal';
import { RiderMilestoneHub } from '../Delivery/RiderMilestoneHub';
import { useLanguage } from '../../utils/translations';

interface DeliveryPortalProps {
  orders: Order[];
  partner: DeliveryPartner;
  allPartners?: DeliveryPartner[];
  activeDispatchPing?: DispatchPingPayload | null;
  onSelectPartner?: (partner: DeliveryPartner) => void;
  onOpenRegisterModal?: () => void;
  onToggleStatus?: (partnerId: string, status: 'Available' | 'On Duty' | 'Delivering' | 'Offline') => void;
  onUpdateOrderStatus: (orderId: string, status: string, otp?: string) => Promise<{ error?: string }>;
  onVerifyDeliveryPickup?: (orderId: string, code: string) => Promise<{ error?: string; success?: boolean }>;
  onAssignOrderToPartner?: (orderId: string, partnerId: string, partnerName: string) => void;
  onPartnerPayout?: (partnerId: string, amount: number, method: string, destination: string) => void;
  onAddDeliveryEarning?: (partnerId: string, earning: OrderEarningBreakdown) => void;
  onAcceptDispatchPing?: (orderId: string) => void;
  onDeclineDispatchPing?: (orderId: string, reason?: string) => void;
  onTimeoutDispatchPing?: (orderId: string) => void;
  onTriggerTestRadarPing?: () => void;
  onUpdatePartnerPayoutDetails?: (partnerId: string, details: PayoutAccountDetails) => void;
  isAdminMode?: boolean;
  onLockDelivery?: () => void;
}

export const DeliveryPortal: React.FC<DeliveryPortalProps> = ({
  orders,
  partner,
  allPartners = [],
  activeDispatchPing,
  onSelectPartner,
  onOpenRegisterModal,
  onToggleStatus,
  onUpdateOrderStatus,
  onVerifyDeliveryPickup,
  onAssignOrderToPartner,
  onPartnerPayout,
  onAddDeliveryEarning,
  onAcceptDispatchPing,
  onDeclineDispatchPing,
  onTimeoutDispatchPing,
  onTriggerTestRadarPing,
  onUpdatePartnerPayoutDetails,
  isAdminMode = false,
  onLockDelivery
}) => {
  const [activeTab, setActiveTab] = useState<'deliveries' | 'passbook' | 'payouts' | 'ratecard'>('deliveries');
  const [isCashoutModalOpen, setIsCashoutModalOpen] = useState<boolean>(false);
  const [isManageAccountModalOpen, setIsManageAccountModalOpen] = useState<boolean>(false);
  const [selectedSlipRecord, setSelectedSlipRecord] = useState<DeliveryPayoutRecord | null>(null);
  const { language, t } = useLanguage();

  // Real-time Mobile GPS Broadcasting State
  const [isGpsBroadcasting, setIsGpsBroadcasting] = useState<boolean>(true);
  const [gpsTelemetry, setGpsTelemetry] = useState<{
    lat: number;
    lng: number;
    speed: number;
    accuracy: number;
    lastSent: number;
  } | null>(null);
  
  // Real-time Surge Simulation Toggles
  const [isRainSurgeActive, setIsRainSurgeActive] = useState<boolean>(false);
  const [isPeakHourActive, setIsPeakHourActive] = useState<boolean>(true);

  // OTP inputs for verifying delivery to customer
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [errorMsgs, setErrorMsgs] = useState<Record<string, string>>({});
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [lastDeliveredEarning, setLastDeliveredEarning] = useState<OrderEarningBreakdown | null>(null);
  const [showProfileDetails, setShowProfileDetails] = useState<boolean>(false);

  // Pickup Handover Code inputs for verifying collection from store
  const [pickupCodeInputs, setPickupCodeInputs] = useState<Record<string, string>>({});
  const [pickupErrors, setPickupErrors] = useState<Record<string, string>>({});
  const [pickupSuccesses, setPickupSuccesses] = useState<Record<string, string>>({});
  const [loadingPickupId, setLoadingPickupId] = useState<string | null>(null);

  // Real-time Mobile GPS Broadcast Loop
  React.useEffect(() => {
    if (!isGpsBroadcasting || partner.status === 'Offline') return;

    let watchId: number | null = null;

    const broadcastLocation = async (lat: number, lng: number, speed = 28, heading = 45) => {
      setGpsTelemetry({ lat, lng, speed, accuracy: 4, lastSent: Date.now() });

      // Find active orders assigned to this rider
      const activePartnerOrders = orders.filter(
        o => (o.deliveryPartnerId === partner.id || o.deliveryPartnerName?.includes(partner.name)) &&
             o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled'
      );

      // Broadcast coordinates for each active order
      for (const ord of activePartnerOrders) {
        try {
          await fetch('/api/delivery/broadcast-location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: ord.id,
              partnerId: partner.id,
              partnerName: partner.name,
              lat,
              lng,
              speed,
              heading,
              accuracy: 4,
              status: ord.orderStatus
            })
          });
        } catch {
          // ignore transient broadcast network drops
        }
      }
    };

    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          broadcastLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.speed || 28, pos.coords.heading || 0);
        },
        () => {
          // Fallback simulation when device GPS is blocked
          const baseLat = 28.5355;
          const baseLng = 77.3910;
          const tick = (Date.now() / 10000) % 100;
          broadcastLocation(baseLat + Math.sin(tick) * 0.005, baseLng + Math.cos(tick) * 0.005, 30, 45);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }

    const fallbackInterval = setInterval(() => {
      if (!watchId) {
        const baseLat = 28.5355;
        const baseLng = 77.3910;
        const tick = (Date.now() / 10000) % 100;
        broadcastLocation(baseLat + Math.sin(tick) * 0.005, baseLng + Math.cos(tick) * 0.005, 30, 45);
      }
    }, 5000);

    return () => {
      if (watchId !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
      clearInterval(fallbackInterval);
    };
  }, [isGpsBroadcasting, partner.id, partner.name, partner.status, orders]);

  const handleVerifyPickupSubmit = async (orderId: string) => {
    const code = pickupCodeInputs[orderId];
    if (!code) {
      setPickupErrors({ ...pickupErrors, [orderId]: 'Please enter the 4-digit store pickup code.' });
      return;
    }

    setLoadingPickupId(orderId);
    if (onVerifyDeliveryPickup) {
      const res = await onVerifyDeliveryPickup(orderId, code);
      if (res.error) {
        setPickupErrors({ ...pickupErrors, [orderId]: res.error });
        setPickupSuccesses({ ...pickupSuccesses, [orderId]: '' });
      } else {
        setPickupErrors({ ...pickupErrors, [orderId]: '' });
        setPickupSuccesses({ ...pickupSuccesses, [orderId]: 'Store Pickup Code verified!' });
      }
    } else {
      // Fallback
      await onUpdateOrderStatus(orderId, 'Picked Up');
    }
    setLoadingPickupId(null);
  };

  const partnerOrders = orders.filter(
    o => o.deliveryPartnerId === partner.id || o.deliveryPartnerName?.includes(partner.name)
  );

  const unassignedOrders = orders.filter(
    o => !o.deliveryPartnerId && o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled'
  );

  // Milestone Progress calculations (Bazli Daily Target Bonanza)
  const todayOrderCount = (partner.earningsLedger?.length || 0) + (partner.completedOrdersCount % 10);
  const milestones = [
    { target: 5, bonus: 75, label: 'Starter' },
    { target: 10, bonus: 180, label: 'Cruiser' },
    { target: 16, bonus: 350, label: 'Super Pro' },
    { target: 22, bonus: 650, label: 'Ultra Bonanza' }
  ];

  const nextMilestone = milestones.find(m => m.target > todayOrderCount) || milestones[milestones.length - 1];
  const ordersNeeded = Math.max(0, nextMilestone.target - todayOrderCount);
  const progressPercent = Math.min(100, (todayOrderCount / 22) * 100);

  // Status Change & Earning Credit Handler
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setLoadingOrderId(orderId);
    setErrorMsgs(prev => ({ ...prev, [orderId]: '' }));

    const otp = otpInputs[orderId] || '';
    const result = await onUpdateOrderStatus(orderId, newStatus, otp);

    if (result.error) {
      setErrorMsgs(prev => ({ ...prev, [orderId]: result.error || 'Failed' }));
      setLoadingOrderId(null);
      return;
    }

    // Automatically trigger Real-time SMS / WhatsApp Order Alert
    const targetOrder = orders.find(o => o.id === orderId);
    try {
      fetch('/api/notifications/order-status-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          newStatus,
          customerPhone: targetOrder?.customerPhone,
          customerName: targetOrder?.customerName,
          riderName: partner.name,
          deliveryOtp: targetOrder?.deliveryOtp || otp,
          trackingUrl: `${window.location.origin}/#track=${orderId}`
        })
      }).catch(err => console.warn('Alert dispatch note:', err));
    } catch {
      // ignore
    }

    // If order was successfully delivered, calculate Bazli-style trip earning breakdown
    if (newStatus === 'Delivered') {
      const distanceKm = +(2.0 + Math.random() * 2.5).toFixed(1);
      const basePay = partner.rateCard?.basePay || 35;
      const extraKm = Math.max(0, distanceKm - 2.0);
      const distancePay = Math.round(extraKm * (partner.rateCard?.perKmRate || 10));
      const surgePay = isPeakHourActive ? (partner.rateCard?.peakHourSurge || 15) : 0;
      const rainAllowance = isRainSurgeActive ? (partner.rateCard?.rainSurge || 25) : 0;
      const customerTip = Math.random() > 0.4 ? [15, 20, 30, 50][Math.floor(Math.random() * 4)] : 0;

      const totalTripEarning = basePay + distancePay + surgePay + rainAllowance + customerTip;

      const earningBreakdown: OrderEarningBreakdown = {
        orderId,
        basePay,
        distanceKm,
        distancePay,
        surgePay,
        rainAllowance,
        nightAllowance: 0,
        customerTip,
        totalEarning: totalTripEarning,
        timestamp: new Date().toISOString()
      };

      setLastDeliveredEarning(earningBreakdown);

      if (onAddDeliveryEarning) {
        onAddDeliveryEarning(partner.id, earningBreakdown);
      }
    }

    setLoadingOrderId(null);
  };

  const handlePartnerStatusSelect = (status: 'Available' | 'On Duty' | 'Delivering' | 'Offline') => {
    if (onToggleStatus) {
      onToggleStatus(partner.id, status);
    }
  };

  const handleExecutePayout = (amount: number, method: string, destination: string) => {
    if (onPartnerPayout) {
      onPartnerPayout(partner.id, amount, method, destination);
    }
  };

  return (
    <div className="space-y-6">

      {/* Admin Governance Banner or Partner Session Lock Bar */}
      {isAdminMode ? (
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 text-purple-200 border border-purple-800/60 p-3 px-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-black text-white">
                <span>Super-Admin Fleet Governance Mode</span>
                <span className="text-[9px] bg-purple-500/20 text-purple-300 font-mono font-bold px-2 py-0.5 rounded-full border border-purple-400/30">
                  FULL FLEET CONTROL
                </span>
              </div>
              <p className="text-[11px] text-purple-300/80">
                You are viewing the Delivery Portal with Super-Admin privileges. You can monitor all riders, assign orders, test dispatch radar, and oversee payouts.
              </p>
            </div>
          </div>
          {onLockDelivery && (
            <button
              onClick={onLockDelivery}
              className="px-3.5 py-1.5 bg-purple-800/80 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 border border-purple-600/50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Admin Oversight</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-slate-900/90 text-slate-300 border border-slate-700/60 p-3 px-4 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Authenticated Rider Session:</span>
            <strong className="text-white font-bold">{partner.name}</strong>
            <span className="text-slate-500 font-mono text-[11px]">({partner.phone})</span>
          </div>
          {onLockDelivery && (
            <button
              onClick={onLockDelivery}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock & Sign Out</span>
            </button>
          )}
        </div>
      )}
      
      {/* Top Banner & Bazli FastPay Wallet Header */}
      <div className="bg-gradient-to-br from-slate-950 via-sky-950 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-sky-800/40 relative overflow-hidden">
        
        {/* Glow background effects */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Partner Info & Duty Status */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <Bike className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-black">{partner.name}</h2>
                  <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-400/30 uppercase tracking-wide">
                    ✓ Verified Fleet
                  </span>
                </div>
                <p className="text-slate-300 text-xs font-medium">
                  {partner.vehicleType} (<span className="font-mono text-amber-300 font-bold">{partner.vehicleNumber}</span>) • {partner.phone} • Rating: ⭐ {partner.rating}
                </p>
              </div>
            </div>

            {/* Quick Status Switcher & Radar Simulator */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-300 font-bold">Shift Status:</span>
              {(['Available', 'On Duty', 'Offline'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => handlePartnerStatusSelect(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                    partner.currentStatus === st
                      ? 'bg-emerald-400 text-slate-950 shadow-sm font-black'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  ● {st}
                </button>
              ))}

              {onTriggerTestRadarPing && (
                <button
                  id="test-radar-ping-btn"
                  onClick={onTriggerTestRadarPing}
                  className="px-3 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all animate-pulse"
                  title="Simulate incoming customer order radar ping with 30s countdown and alert sound"
                >
                  <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
                  <span>Test Radar Ping</span>
                </button>
              )}

              {/* Real Mobile GPS Broadcaster Control */}
              <button
                onClick={() => setIsGpsBroadcasting(!isGpsBroadcasting)}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  isGpsBroadcasting
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border border-slate-700'
                }`}
                title="Broadcast actual mobile GPS coordinates to customer tracking maps"
              >
                <Radio className={`w-3.5 h-3.5 ${isGpsBroadcasting ? 'animate-pulse text-emerald-400' : 'text-slate-500'}`} />
                <span>
                  {isGpsBroadcasting
                    ? (gpsTelemetry
                        ? `GPS Live (${gpsTelemetry.lat.toFixed(3)}, ${gpsTelemetry.lng.toFixed(3)})`
                        : 'GPS Broadcasting')
                    : 'GPS Paused'}
                </span>
              </button>
            </div>
          </div>

          {/* Bazli FastPay Instant Payout Card */}
          <div className="bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-emerald-500/40 shadow-xl flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
            <div>
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <Zap className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">Bazli FastPay Wallet</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-amber-300 mt-0.5">
                ₹{(partner.walletBalance ?? 685).toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                UPI: <span className="font-mono text-slate-300 font-bold">{partner.upiId || 'Direct UPI'}</span>
              </span>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsCashoutModalOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-1.5 cursor-pointer transition-all transform active:scale-95"
              >
                <Zap className="w-4 h-4 text-slate-950 fill-current" />
                <span>Instant Cashout</span>
              </button>

              <span className="text-[9px] text-slate-400 text-center font-medium">
                ⚡ 0 Transfer Fee • 24/7 Instant
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Partner Switcher (Only visible in Super-Admin Fleet Governance Mode) */}
      {allPartners.length > 1 && onSelectPartner && isAdminMode && (
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-700">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">Active Fleet Partner Profile:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {allPartners.map(p => (
              <button
                key={p.id}
                onClick={() => onSelectPartner(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  p.id === partner.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{p.name}</span>
                <span className="text-[10px] opacity-75 font-mono">({p.vehicleType})</span>
              </button>
            ))}

            {onOpenRegisterModal && (
              <button
                onClick={onOpenRegisterModal}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>New Partner</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bazli Daily Target Bonanza (Rider Milestone Hub) */}
      <RiderMilestoneHub partner={partner} orders={orders} />

      {/* Surge & Weather Allowance Simulator Panel */}
      <div className="bg-slate-900 text-white p-4.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-2.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <div>
            <span className="font-extrabold text-white block">Real-Time Demand & Weather Surge Engine</span>
            <span className="text-[11px] text-slate-400">Bazli dynamically surges delivery pay during peak rush hours or rain</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsPeakHourActive(!isPeakHourActive)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              isPeakHourActive
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Peak Rush (+₹15/drop) {isPeakHourActive ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setIsRainSurgeActive(!isRainSurgeActive)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              isRainSurgeActive
                ? 'bg-sky-400 text-slate-950 font-black shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Rain Surge (+₹25/drop) {isRainSurgeActive ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Deliveries, Trip Passbook, Payout History, Rate Card) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('deliveries')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'deliveries'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Active Deliveries ({partnerOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('passbook')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'passbook'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Trip Earnings Passbook ({partner.earningsLedger?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'payouts'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Payout Settlements ({partner.payoutHistory?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('ratecard')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'ratecard'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Bazli Rate Card</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE DELIVERIES & QUEUE */}
      {activeTab === 'deliveries' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Last delivered celebration alert */}
          {lastDeliveredEarning && (
            <div className="bg-emerald-500 text-slate-950 p-4.5 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-emerald-400">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-950 text-emerald-400 flex items-center justify-center font-black">
                  ₹
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-950">
                    🎉 +₹{lastDeliveredEarning.totalEarning} Credited to Wallet! (Order #{lastDeliveredEarning.orderId})
                  </h4>
                  <p className="text-xs text-slate-900 font-medium">
                    Base: ₹{lastDeliveredEarning.basePay} • Distance ({lastDeliveredEarning.distanceKm}km): +₹{lastDeliveredEarning.distancePay}
                    {lastDeliveredEarning.surgePay > 0 && ` • Surge: +₹${lastDeliveredEarning.surgePay}`}
                    {lastDeliveredEarning.rainAllowance > 0 && ` • Rain: +₹${lastDeliveredEarning.rainAllowance}`}
                    {lastDeliveredEarning.customerTip > 0 && ` • Tip: +₹${lastDeliveredEarning.customerTip}`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCashoutModalOpen(true)}
                className="px-3.5 py-1.5 bg-slate-950 text-white font-black text-xs rounded-xl shadow-xs shrink-0 cursor-pointer"
              >
                Withdraw Now →
              </button>
            </div>
          )}

          {/* Unassigned orders dispatch pool */}
          {unassignedOrders.length > 0 && onAssignOrderToPartner && (
            <div className="bg-amber-50/90 border border-amber-200 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-black text-amber-950 uppercase tracking-wide">
                    Live Dispatch Queue ({unassignedOrders.length} Ready for Pickup)
                  </h4>
                </div>
                <span className="text-[10px] text-amber-800 font-black bg-amber-200/80 px-2 py-0.5 rounded-full">
                  Estimated Earning: ₹55 - ₹85 / drop
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {unassignedOrders.map(order => (
                  <div key={order.id} className="bg-white p-3.5 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-extrabold text-slate-900">Order #{order.id}</div>
                      <div className="text-[10px] text-slate-500">
                        {order.deliveryAddress.street}, {order.deliveryAddress.city} • ₹{order.finalAmount}
                      </div>
                    </div>
                    <button
                      onClick={() => onAssignOrderToPartner(order.id, partner.id, partner.name)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs cursor-pointer shadow-xs"
                    >
                      Claim Order
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Partner Orders */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center justify-between">
              <span>Your Assigned Deliveries ({partnerOrders.length})</span>
              <span className="text-xs text-slate-500 font-normal">Verify customer OTP upon dropoff</span>
            </h3>

            {partnerOrders.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
                <Truck className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700">No active delivery assignments</h4>
                <p className="text-xs text-slate-400">Claim an order from the queue above or wait for automatic dark-store dispatch.</p>
              </div>
            ) : (
              partnerOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4 hover:border-emerald-300 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-slate-900 text-sm sm:text-base">Order #{order.id}</span>
                        <span className="bg-sky-100 text-sky-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-sky-200">
                          {order.orderStatus}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Customer: {order.customerName} ({order.customerPhone})
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-emerald-700">Collect ₹{order.finalAmount}</span>
                      <span className="text-[10px] text-slate-400 block">
                        Mode: {order.paymentMethod} ({order.paymentStatus})
                      </span>
                    </div>
                  </div>

                  {/* Delivery Location & Direct Call */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Delivery Address:
                    </div>
                    <p className="text-slate-600 pl-4">
                      {order.deliveryAddress.fullName} — {order.deliveryAddress.street}, {order.deliveryAddress.city} ({order.deliveryAddress.pincode})
                    </p>
                    <div className="pl-4 pt-1 flex items-center space-x-2 text-[11px] text-emerald-700 font-bold">
                      <Phone className="w-3 h-3" />
                      <a href={`tel:${order.deliveryAddress.phone}`} className="hover:underline">
                        Call Customer ({order.deliveryAddress.phone})
                      </a>
                    </div>
                  </div>

                  {/* Delivery Workflow Steps */}
                  <div className="space-y-4 pt-1">
                    {/* STEP 1: STORE PICKUP HANDOVER VERIFICATION */}
                    {order.orderStatus !== 'Delivered' && (
                      <div className={`p-4 sm:p-5 rounded-2xl border-2 space-y-3.5 ${
                        order.sellerPickupConfirmed && order.deliveryPickupConfirmed
                          ? 'bg-sky-50/60 border-sky-300'
                          : 'bg-gradient-to-br from-amber-50 via-yellow-50/50 to-orange-50/40 border-amber-300 shadow-xs'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                              <Store className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                                <span>Step 1: Store Pickup Handover Code</span>
                                {order.sellerPickupConfirmed && order.deliveryPickupConfirmed && (
                                  <span className="text-[10px] bg-sky-200 text-sky-950 font-extrabold px-2 py-0.2 rounded-full">
                                    Package Collected
                                  </span>
                                )}
                              </h4>
                              <p className="text-[11px] text-slate-600">
                                Collect package from <strong>{order.sellerName}</strong>. Both you & seller must enter the same 4-digit code.
                              </p>
                            </div>
                          </div>

                          <span className="text-[10px] bg-amber-200/80 text-amber-950 font-extrabold px-2.5 py-1 rounded-full border border-amber-300 font-mono shrink-0">
                            Admin Dual Code Handover
                          </span>
                        </div>

                        {/* Simulated SMS Alert to Rider */}
                        <div className="bg-white/95 border border-amber-200 p-3 rounded-xl flex items-start gap-2.5 text-xs shadow-2xs">
                          <div className="w-7 h-7 rounded-lg bg-sky-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-2xs">
                            <Smartphone className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-extrabold text-slate-900 flex items-center justify-between gap-1">
                              <span>SMS to Rider Mobile (+91 {partner.phone})</span>
                              <span className="text-[9px] font-mono text-sky-800 bg-sky-100 px-2 py-0.2 rounded-full font-bold">
                                Bazli Admin Dispatch
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                              "Bazli Rider Alert: Pickup code for {order.sellerName} is <strong className="font-mono text-sm font-black text-amber-900 bg-amber-200 px-1.5 py-0.2 rounded">{order.pickupOtp}</strong>. Verify with store owner to collect order."
                            </p>
                          </div>
                        </div>

                        {/* Dual Status Tracker */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                            order.sellerPickupConfirmed
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                              : 'bg-white border-amber-300 text-amber-950'
                          }`}>
                            <div className="flex items-center gap-2">
                              <Store className="w-3.5 h-3.5 text-amber-600" />
                              <span className="font-bold">1. Merchant Code</span>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full font-mono ${
                              order.sellerPickupConfirmed ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                            }`}>
                              {order.sellerPickupConfirmed ? '✓ Store Verified' : '⏳ Pending Store'}
                            </span>
                          </div>

                          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                            order.deliveryPickupConfirmed
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                              : 'bg-white border-sky-300 text-sky-950'
                          }`}>
                            <div className="flex items-center gap-2">
                              <Bike className="w-3.5 h-3.5 text-sky-600" />
                              <span className="font-bold">2. Rider Code (You)</span>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full font-mono ${
                              order.deliveryPickupConfirmed ? 'bg-emerald-200 text-emerald-900' : 'bg-sky-200 text-sky-900'
                            }`}>
                              {order.deliveryPickupConfirmed ? '✓ Rider Verified' : '⏳ Action Required'}
                            </span>
                          </div>
                        </div>

                        {/* Input or Verified Confirmation */}
                        {order.sellerPickupConfirmed && order.deliveryPickupConfirmed ? (
                          <div className="bg-sky-100 border border-sky-300 p-3 rounded-xl flex items-center justify-between gap-2 text-xs text-sky-950 font-bold">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-sky-700 shrink-0" />
                              <span>Store Handover Complete! Both parties verified Code {order.pickupOtp}. Package collected.</span>
                            </div>
                            <span className="text-[10px] font-mono bg-sky-200 px-2 py-0.5 rounded text-sky-900">
                              Admin Updated
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-2 pt-1">
                            {order.deliveryPickupConfirmed ? (
                              <div className="bg-amber-100/80 border border-amber-300 p-3 rounded-xl text-xs text-amber-950 font-bold flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Check className="w-4 h-4 text-emerald-700" />
                                  <span>Rider Code Verified! Waiting for {order.sellerName} to enter handover code on Seller Portal.</span>
                                </div>
                                <span className="text-[10px] font-mono bg-amber-200 px-2 py-0.5 rounded font-bold">
                                  Waiting Store
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                                <div className="relative">
                                  <input
                                    type="text"
                                    maxLength={4}
                                    placeholder="Pickup Code"
                                    value={pickupCodeInputs[order.id] || ''}
                                    onChange={e => {
                                      const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                      setPickupCodeInputs({ ...pickupCodeInputs, [order.id]: val });
                                      if (pickupErrors[order.id]) {
                                        setPickupErrors({ ...pickupErrors, [order.id]: '' });
                                      }
                                    }}
                                    className="w-36 bg-white text-sm px-3.5 py-2.5 border-2 border-amber-400 rounded-xl font-mono font-black tracking-widest text-center text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setPickupCodeInputs({ ...pickupCodeInputs, [order.id]: order.pickupOtp });
                                  }}
                                  className="px-3 py-2 bg-amber-200/80 hover:bg-amber-200 text-amber-950 font-black text-xs rounded-xl border border-amber-300 cursor-pointer flex items-center gap-1 transition-all"
                                >
                                  <span>⚡ Autofill SMS Code ({order.pickupOtp})</span>
                                </button>

                                <button
                                  onClick={() => handleVerifyPickupSubmit(order.id)}
                                  disabled={loadingPickupId === order.id || !pickupCodeInputs[order.id]}
                                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-md cursor-pointer flex items-center gap-1.5 transition-all transform active:scale-95 shrink-0"
                                >
                                  {loadingPickupId === order.id ? (
                                    'Verifying Code...'
                                  ) : (
                                    <>
                                      <KeyRound className="w-4 h-4" />
                                      <span>Verify Store Pickup Code</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}

                            {pickupErrors[order.id] && (
                              <div className="text-xs text-rose-600 font-bold flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                                <span>{pickupErrors[order.id]}</span>
                              </div>
                            )}
                            {pickupSuccesses[order.id] && (
                              <div className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{pickupSuccesses[order.id]}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* STEP 2: OUT FOR DELIVERY BUTTON */}
                    {order.orderStatus !== 'Delivered' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStatusChange(order.id, 'Out for Delivery')}
                          disabled={
                            (!order.sellerPickupConfirmed || !order.deliveryPickupConfirmed) &&
                            order.orderStatus !== 'Picked Up' &&
                            order.orderStatus !== 'Out for Delivery'
                          }
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            order.orderStatus === 'Out for Delivery'
                              ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                              : 'bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white'
                          }`}
                        >
                          <Bike className="w-4 h-4 text-sky-400" />
                          <span>Step 2: Start Out for Delivery to Customer</span>
                          {order.orderStatus === 'Out for Delivery' && <Check className="w-3.5 h-3.5 text-slate-950" />}
                        </button>
                      </div>
                    )}

                    {/* Customer OTP Verification Box */}
                    {order.orderStatus !== 'Delivered' && (
                      <div className="bg-gradient-to-br from-emerald-50 via-teal-50/60 to-emerald-100/50 border-2 border-emerald-300 p-4 sm:p-5 rounded-2xl space-y-3 mt-2 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-2.5">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                              <KeyRound className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-emerald-950">Step 3: Customer Handover & OTP Verification</h4>
                              <p className="text-[11px] text-emerald-800">
                                Ask customer for the 4-digit code sent via SMS to <strong className="font-mono text-emerald-950">{order.customerPhone || order.deliveryAddress.phone || '+91 98765 43210'}</strong>
                              </p>
                            </div>
                          </div>

                          <span className="text-[10px] bg-emerald-200/70 text-emerald-900 font-extrabold px-2.5 py-1 rounded-full border border-emerald-300 font-mono shrink-0">
                            Instant Payout + Admin Update
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <input
                                type="text"
                                maxLength={4}
                                placeholder="4-Digit OTP"
                                value={otpInputs[order.id] || ''}
                                onChange={e => {
                                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                  setOtpInputs({ ...otpInputs, [order.id]: val });
                                  if (errorMsgs[order.id]) {
                                    setErrorMsgs({ ...errorMsgs, [order.id]: '' });
                                  }
                                }}
                                className="w-36 bg-white text-sm px-3.5 py-2.5 border-2 border-emerald-400 rounded-xl font-mono font-black tracking-widest text-center text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 shadow-inner"
                              />
                            </div>

                            <button
                              onClick={() => handleStatusChange(order.id, 'Delivered')}
                              disabled={loadingOrderId === order.id || !otpInputs[order.id]}
                              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black px-4 py-2.5 rounded-xl text-xs shadow-md hover:shadow-emerald-600/30 cursor-pointer flex items-center gap-1.5 transition-all transform active:scale-95"
                            >
                              {loadingOrderId === order.id ? (
                                'Verifying OTP...'
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Verify & Complete Delivery</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Interactive Customer Voice Simulation helper for easy test-drive in preview */}
                          <button
                            type="button"
                            onClick={() => {
                              setOtpInputs({ ...otpInputs, [order.id]: order.deliveryOtp });
                              setErrorMsgs({ ...errorMsgs, [order.id]: '' });
                            }}
                            className="text-[11px] bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300/80 px-3 py-2 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Simulate customer speaking the OTP received on their phone"
                          >
                            <Smartphone className="w-3.5 h-3.5 text-amber-700" />
                            <span>Customer says: <strong className="font-mono text-slate-950 font-black">{order.deliveryOtp}</strong> (Autofill)</span>
                          </button>
                        </div>

                        {errorMsgs[order.id] && (
                          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in shake duration-200">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>{errorMsgs[order.id]}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {order.orderStatus === 'Delivered' && (
                      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold p-4 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-md">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-white text-emerald-700 flex items-center justify-center font-black">
                            ✓
                          </div>
                          <div>
                            <span className="font-black text-sm block">Delivered & Verified via Customer OTP</span>
                            <span className="text-[11px] text-emerald-100 font-medium">
                              Customer confirmed receipt. Order status is now marked as "Delivered" in Admin Panel.
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-[11px] bg-emerald-950/50 text-emerald-200 border border-emerald-400/40 px-3 py-1 rounded-full text-center">
                          OTP: {order.deliveryOtp} Verified
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TRIP EARNINGS PASSBOOK (LEDGER) */}
      {activeTab === 'passbook' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Trip-by-Trip Earning Passbook</h3>
                <p className="text-xs text-slate-500">Transparent itemized calculation for every completed delivery</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-semibold block">Today's Deliveries Earning</span>
                <span className="text-xl font-black text-emerald-700">₹{(partner.todayEarnings ?? 465).toLocaleString()}</span>
              </div>
            </div>

            {(!partner.earningsLedger || partner.earningsLedger.length === 0) ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No trip records yet. Deliver orders to generate itemized earning slips!
              </div>
            ) : (
              <div className="space-y-3">
                {partner.earningsLedger.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition-all text-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900">Order #{item.orderId}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-emerald-700">+₹{item.totalEarning}</span>
                      </div>
                    </div>

                    {/* Breakdown Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded-lg font-bold">
                        Base Drop: ₹{item.basePay}
                      </span>
                      <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded-lg font-bold">
                        Distance ({item.distanceKm} km): +₹{item.distancePay}
                      </span>
                      {item.surgePay > 0 && (
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg font-bold">
                          ⚡ Peak Surge: +₹{item.surgePay}
                        </span>
                      )}
                      {item.rainAllowance > 0 && (
                        <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded-lg font-bold">
                          🌧️ Rain Bonus: +₹{item.rainAllowance}
                        </span>
                      )}
                      {item.customerTip > 0 && (
                        <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-lg font-black">
                          🎁 100% Tip: +₹{item.customerTip}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PAYOUT SETTLEMENT HISTORY */}
      {activeTab === 'payouts' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Bank & UPI Settlement History</h3>
                <p className="text-xs text-slate-500">Record of all instant cashouts and 12:00 AM automated daily rollouts</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsManageAccountModalOpen(true)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Building className="w-3.5 h-3.5 text-slate-600" />
                  <span>Manage Bank & UPI</span>
                </button>

                <button
                  onClick={() => setIsCashoutModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Instant Cashout (₹{partner.walletBalance || 0})</span>
                </button>
              </div>
            </div>

            {/* Linked Payout Beneficiary Card for Rider */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span className="font-extrabold text-xs text-slate-900">Active Payout Beneficiary</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    RazorpayX Ready
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsManageAccountModalOpen(true)}
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Account / UPI</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2.5 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] font-semibold block">Account Holder:</span>
                  <span className="font-bold text-slate-900">
                    {partner.payoutDetails?.accountHolderName || partner.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-semibold block">Payout Channel:</span>
                  <span className="font-bold text-slate-900">
                    {partner.payoutDetails?.payoutMode || 'UPI Instant'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-semibold block">Destination:</span>
                  <span className="font-mono font-black text-emerald-800 break-all">
                    {partner.payoutDetails?.upiId || (partner.payoutDetails?.accountNumber ? `A/C •••• ${partner.payoutDetails.accountNumber.slice(-4)} (${partner.payoutDetails.ifscCode})` : partner.upiId || (partner.phone ? `${partner.phone}@upi` : 'rider@upi'))}
                  </span>
                </div>
              </div>
            </div>

            {(!partner.payoutHistory || partner.payoutHistory.length === 0) ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No past payout records. Cashouts will appear here with official transaction vouchers.
              </div>
            ) : (
              <div className="space-y-3">
                {partner.payoutHistory.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900">{rec.id}</span>
                        <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                          ● {rec.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {rec.payoutMethod}
                        </span>
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        Destination: <strong className="text-slate-900 font-mono">{rec.destination}</strong> • UTR: <span className="font-mono text-slate-500">{rec.utrNumber}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Settled on {new Date(rec.timestamp).toLocaleString()} ({rec.ordersCovered} Deliveries Covered)
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <span className="text-lg font-black text-slate-900">₹{rec.amount.toLocaleString()}</span>
                      
                      <button
                        onClick={() => setSelectedSlipRecord(rec)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Receipt className="w-3 h-3 text-slate-600" />
                        <span>View Voucher</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: BAZLI OFFICIAL RATE CARD */}
      {activeTab === 'ratecard' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6 animate-in fade-in duration-150">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-900 text-[10px] font-black px-3 py-1 rounded-full uppercase border border-sky-200">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>Bazli Quick Commerce Fleet Pay Matrix</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 pt-1">
              Transparent Bazli Delivery Partner Rate Card
            </h3>
            <p className="text-xs text-slate-500">
              Zero commission deductions, 100% tip pass-through, and guaranteed per-drop compensation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-sm">
                <Bike className="w-4 h-4 text-emerald-600" />
                <span>Base Fare & Distance Slabs</span>
              </div>
              <div className="space-y-1 text-slate-600 text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>Base Drop (0 to 2.0 KM):</span>
                  <strong className="text-slate-900">₹35.00 fixed</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>Extra Distance (&gt; 2.0 KM):</span>
                  <strong className="text-slate-900">₹10.00 / KM</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Average Dark Store Dispatch Time:</span>
                  <strong className="text-slate-900">4-8 Minutes</strong>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-sm">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Surge & Weather Allowances</span>
              </div>
              <div className="space-y-1 text-slate-600 text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>Peak Rush (12-3 PM & 7-11 PM):</span>
                  <strong className="text-amber-700">+₹15.00 / drop</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>Monsoon / Rain Allowance:</span>
                  <strong className="text-sky-700">+₹25.00 / drop</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Night Shift (11 PM - 6 AM):</span>
                  <strong className="text-purple-700">+₹15.00 / drop</strong>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-sm">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Daily Milestone Bonanza</span>
              </div>
              <div className="space-y-1 text-slate-600 text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>Level 1 (5 Orders):</span>
                  <strong className="text-emerald-700">+₹75.00 cash</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>Level 2 (10 Orders):</span>
                  <strong className="text-emerald-700">+₹180.00 cash</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>Level 3 (16 Orders):</span>
                  <strong className="text-emerald-700">+₹350.00 cash</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Level 4 (22 Orders Ultra):</span>
                  <strong className="text-emerald-700">+₹650.00 cash</strong>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-sm">
                <Gift className="w-4 h-4 text-rose-500" />
                <span>100% Tips & Minimum Guarantee</span>
              </div>
              <div className="space-y-1 text-slate-600 text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>Customer Tips Commission:</span>
                  <strong className="text-emerald-700">0% (100% to Partner)</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>Minimum Shift Guarantee (8 Hrs):</span>
                  <strong className="text-slate-900">₹600.00 / Shift</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Instant Withdrawal Fee:</span>
                  <strong className="text-emerald-700">₹0.00 (Zero Fee)</strong>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Partner Registration Details Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <button
          onClick={() => setShowProfileDetails(!showProfileDetails)}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">
                Partner Profile & KYC Verification Details
              </span>
              <span className="text-[11px] text-slate-400">
                Aadhaar Card, PAN Card, Bank Passbook, Registered Mobile & Email
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-bold text-sky-600">
            <span>{showProfileDetails ? 'Hide Details' : 'View Full Details'}</span>
            {showProfileDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showProfileDetails && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Aadhaar Card UID</span>
                <span className="font-mono font-extrabold text-slate-900 block">{partner.aadhaarNumber || 'XXXX-XXXX-8912'}</span>
                <span className="text-[10px] text-emerald-600 font-bold">✓ UIDAI Document Verified</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">PAN Card Number</span>
                <span className="font-mono font-extrabold text-slate-900 block">{partner.panNumber || 'ABCPS9812K'}</span>
                <span className="text-[10px] text-emerald-600 font-bold">✓ NSDL Tax Verified</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Bank Passbook Linked</span>
                <span className="font-mono font-extrabold text-sky-700 block">{partner.bankAccountNumber || 'A/C-VERIFIED'}</span>
                <span className="text-[10px] text-slate-600 font-medium">{partner.bankName || 'HDFC Bank'} ({partner.ifscCode || 'HDFC0001245'})</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered Contact</span>
                <span className="font-extrabold text-slate-900 block font-mono">{partner.phone}</span>
                <span className="text-[10px] text-slate-500 truncate block">{partner.email}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200/60">
              <div>
                Operating Zone: <strong className="text-slate-900">{partner.operatingZoneName || 'Zone A - Central City'}</strong>
              </div>
              <div>
                KYC Status: <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">✓ 100% Verified (Aadhaar + PAN + Passbook)</span>
              </div>
              <div>
                Payout Method: <strong className="text-slate-900">{partner.upiId || 'Direct Bank Settlement'}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payout Cashout Modal */}
      <BazliPayoutModal
        isOpen={isCashoutModalOpen}
        onClose={() => setIsCashoutModalOpen(false)}
        partner={partner}
        onConfirmPayout={handleExecutePayout}
        onOpenManageAccount={() => {
          setIsCashoutModalOpen(false);
          setIsManageAccountModalOpen(true);
        }}
      />

      {/* Manage Bank / UPI Account Modal for Rider */}
      <ManagePayoutAccountModal
        isOpen={isManageAccountModalOpen}
        onClose={() => setIsManageAccountModalOpen(false)}
        entityType="deliveryPartner"
        entityName={partner.name}
        entityPhone={partner.phone || ''}
        accountHolderName={partner.payoutDetails?.accountHolderName || partner.name}
        initialDetails={partner.payoutDetails}
        onSaveDetails={(details) => {
          if (onUpdatePartnerPayoutDetails) {
            onUpdatePartnerPayoutDetails(partner.id, details);
          }
        }}
      />

      {/* Payout Slip / Tax Invoice Modal */}
      <BazliPayoutSlipModal
        isOpen={Boolean(selectedSlipRecord)}
        onClose={() => setSelectedSlipRecord(null)}
        record={selectedSlipRecord}
        partner={partner}
      />

      {/* Incoming Rider Order Radar / Ping Modal */}
      {activeDispatchPing && (activeDispatchPing.candidatePartnerId === partner.id || activeDispatchPing.candidatePartnerId === 'all') && (
        <RiderOrderRadarModal
          ping={activeDispatchPing}
          onAccept={(orderId) => {
            if (onAcceptDispatchPing) {
              onAcceptDispatchPing(orderId);
            } else if (onAssignOrderToPartner) {
              onAssignOrderToPartner(orderId, partner.id, `${partner.name} (${partner.vehicleType})`);
            }
          }}
          onDecline={(orderId, reason) => {
            if (onDeclineDispatchPing) {
              onDeclineDispatchPing(orderId, reason);
            }
          }}
          onTimeout={(orderId) => {
            if (onTimeoutDispatchPing) {
              onTimeoutDispatchPing(orderId);
            }
          }}
        />
      )}

    </div>
  );
};
