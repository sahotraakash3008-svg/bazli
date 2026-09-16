import React, { useEffect, useState, useRef } from 'react';
import { DispatchPingPayload } from '../../types';
import {
  Zap,
  MapPin,
  Store,
  DollarSign,
  Clock,
  Volume2,
  VolumeX,
  XCircle,
  CheckCircle2,
  Navigation,
  Sparkles,
  PackageCheck
} from 'lucide-react';

interface RiderOrderRadarModalProps {
  ping: DispatchPingPayload;
  onAccept: (orderId: string) => void;
  onDecline: (orderId: string, reason?: string) => void;
  onTimeout: (orderId: string) => void;
}

export const RiderOrderRadarModal: React.FC<RiderOrderRadarModalProps> = ({
  ping,
  onAccept,
  onDecline,
  onTimeout
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    return Math.max(0, Math.ceil((ping.expiresAt - Date.now()) / 1000));
  });
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Synthesized Radar Alert Audio Beep
  const playRadarChime = () => {
    if (isSoundMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = audioContextRef.current || new AudioContextClass();
      audioContextRef.current = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15); // E6 note

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio context may be restricted by autoplay policy
    }
  };

  // Play sound on mount & every 3 seconds while countdown is active
  useEffect(() => {
    playRadarChime();
    const soundInterval = setInterval(() => {
      playRadarChime();
    }, 3000);

    return () => {
      clearInterval(soundInterval);
    };
  }, [isSoundMuted]);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((ping.expiresAt - Date.now()) / 1000));
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        onTimeout(ping.orderId);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [ping.expiresAt, ping.orderId, onTimeout]);

  const progressPercent = Math.min(100, Math.max(0, (secondsRemaining / 30) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="rider-order-radar-modal"
        className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl border-2 border-emerald-400/80 shadow-2xl shadow-emerald-500/20 overflow-hidden relative"
      >
        {/* Top Radar Pulse Header */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 text-white flex items-center justify-between overflow-hidden">
          {/* Animated ping wave */}
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-emerald-300/20 rounded-full animate-ping pointer-events-none" />

          <div className="flex items-center space-x-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
              <Zap className="w-6 h-6 fill-current text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight uppercase">Incoming Order Radar</h3>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full shadow-xs">
                  Rank #{ping.priorityRank} Priority
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                Matched with <span className="font-bold text-white">{ping.matchScore}% proximity algorithm score</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSoundMuted(!isSoundMuted)}
            className="p-2 rounded-xl bg-black/20 hover:bg-black/30 text-white transition-colors cursor-pointer border border-white/20 relative z-10"
            title={isSoundMuted ? 'Unmute alert sound' : 'Mute alert sound'}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-bounce" />}
          </button>
        </div>

        {/* 30-Second Countdown Progress Bar */}
        <div className="w-full bg-slate-800 h-2 relative">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Main Radar Card Body */}
        <div className="p-6 space-y-5">
          {/* Guaranteed Earnings Badge */}
          <div className="bg-gradient-to-r from-emerald-950/90 to-slate-900 border border-emerald-500/40 p-4 rounded-2xl flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" /> Guaranteed Trip Earning
              </span>
              <div className="text-3xl font-black text-amber-300 mt-0.5">
                ₹{ping.estimatedEarnings}
              </div>
              <span className="text-[10px] text-slate-400">
                Base Pay (₹35) + Distance (₹8) + Peak Rush Bonus (₹15)
              </span>
            </div>

            {/* Circular Timer Visual */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400 transition-all duration-300 stroke-current"
                  strokeWidth="3.5"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center font-black">
                <span className="text-lg leading-none text-white">{secondsRemaining}</span>
                <span className="text-[8px] text-slate-400 uppercase">sec</span>
              </div>
            </div>
          </div>

          {/* Route & Store / Customer Details */}
          <div className="space-y-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 text-xs">
            {/* Store / Pickup Point */}
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <Store className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-xs">
                    Pickup: {ping.order.sellerName}
                  </span>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md">
                    {ping.distanceToStoreKm} km away
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  Ready at merchant hub • Dual SMS Handover Code
                </p>
              </div>
            </div>

            {/* Divider with Distance Line */}
            <div className="pl-3.5 border-l-2 border-dashed border-slate-600 my-1 py-1">
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 pl-3">
                <Navigation className="w-2.5 h-2.5 text-sky-400" />
                <span>{ping.distanceStoreToCustomerKm} km delivery transit route</span>
              </span>
            </div>

            {/* Customer Drop Location */}
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-xs">
                    Drop: {ping.order.deliveryAddress.fullName}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-400/10 px-2 py-0.5 rounded-md">
                    {ping.order.deliveryAddress.city}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {ping.order.deliveryAddress.street}, {ping.order.deliveryAddress.pincode}
                </p>
              </div>
            </div>
          </div>

          {/* Items Summary & Payment Type */}
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <PackageCheck className="w-4 h-4 text-sky-400" />
              <span>
                <strong className="text-white">{ping.order.items.length} Items</strong> ({ping.order.items.map(i => i.productName).slice(0, 2).join(', ')}{ping.order.items.length > 2 ? '...' : ''})
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-medium">Payment Mode</span>
              <span className={`text-xs font-black ${
                ping.order.paymentMethod === 'Cash on Delivery'
                  ? 'text-amber-300'
                  : 'text-emerald-400'
              }`}>
                {ping.order.paymentMethod === 'Cash on Delivery'
                  ? `Collect ₹${ping.order.finalAmount} Cash`
                  : 'Prepaid (Online UPI)'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              id="decline-order-radar-btn"
              onClick={() => onDecline(ping.orderId, 'Passed by partner')}
              className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-2xl transition-colors flex items-center justify-center space-x-1.5 cursor-pointer border border-slate-700"
            >
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Pass / Decline</span>
            </button>

            <button
              id="accept-order-radar-btn"
              onClick={() => onAccept(ping.orderId)}
              className="sm:col-span-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center justify-center space-x-2 transition-all transform active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current text-slate-950" />
              <span>ACCEPT ORDER ({secondsRemaining}s)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
