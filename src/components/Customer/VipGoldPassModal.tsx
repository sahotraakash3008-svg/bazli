import React, { useState } from 'react';
import {
  Crown,
  X,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Percent,
  Truck,
  Clock,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VipGoldPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAlreadyVip?: boolean;
  currentTier?: string;
  onSubscribeVip?: (plan: 'monthly' | 'quarterly') => void;
  onUpgradeToVip?: (plan: 'monthly' | 'quarterly') => void;
}

export const VipGoldPassModal: React.FC<VipGoldPassModalProps> = ({
  isOpen,
  onClose,
  isAlreadyVip = false,
  currentTier,
  onSubscribeVip,
  onUpgradeToVip
}) => {
  const isVipActive = isAlreadyVip || currentTier === 'VIP';
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly'>('monthly');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePurchase = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });
    } catch {
      // confetti optional
    }

    setIsSuccess(true);
    if (typeof onSubscribeVip === 'function') {
      onSubscribeVip(selectedPlan);
    }
    if (typeof onUpgradeToVip === 'function') {
      onUpgradeToVip(selectedPlan);
    }

    setTimeout(() => {
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-gradient-to-b from-slate-900 via-[#18140c] to-slate-950 border-2 border-amber-500/50 rounded-2xl sm:rounded-3xl w-full max-w-md max-h-[90dvh] sm:max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-white relative">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-3 sm:p-5 text-center border-b border-amber-500/20 relative shrink-0 bg-slate-900/60">
          <button
            onClick={onClose}
            className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close VIP modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30 text-slate-950 mb-1.5 sm:mb-2.5 animate-pulse">
            <Crown className="w-5 h-5 sm:w-8 sm:h-8 fill-current" />
          </div>

          <span className="px-2 sm:px-2.5 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full text-[8.5px] sm:text-[10px] font-black uppercase tracking-widest inline-block mb-1">
            BAZLI VIP GOLD PASS
          </span>

          <h3 className="text-base sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 leading-tight">
            Unlimited Free Delivery & Extra 15% OFF
          </h3>
          <p className="text-[10px] sm:text-xs text-amber-200/80 mt-0.5 sm:mt-1 max-w-xs mx-auto">
            10-min groceries & restaurant dining with exclusive VIP benefits
          </p>
        </div>

        {isSuccess ? (
          <div className="p-6 sm:p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-black text-amber-300">Welcome to VIP Gold! 👑</h4>
            <p className="text-xs sm:text-sm text-slate-300">
              Your VIP Membership is active! Unlimited FREE deliveries & 15% VIP discounts will be automatically applied to your orders.
            </p>
          </div>
        ) : (
          <>
            {/* Scrollable Content Body */}
            <div className="overflow-y-auto flex-1 p-3.5 sm:p-5 space-y-3.5 sm:space-y-4">
              {/* VIP Perks Grid */}
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                <div className="bg-slate-900/90 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-amber-500/20 space-y-0.5 sm:space-y-1">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                    <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <h5 className="text-[11px] sm:text-xs font-black text-white">Free Delivery</h5>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 leading-tight">No delivery fee on any order. Zero surge.</p>
                </div>

                <div className="bg-slate-900/90 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-amber-500/20 space-y-0.5 sm:space-y-1">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-emerald-400/20 text-emerald-400 flex items-center justify-center">
                    <Percent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <h5 className="text-[11px] sm:text-xs font-black text-white">Extra 15% OFF</h5>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 leading-tight">Instant discounts on food & essentials.</p>
                </div>

                <div className="bg-slate-900/90 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-amber-500/20 space-y-0.5 sm:space-y-1">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-sky-400/20 text-sky-400 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <h5 className="text-[11px] sm:text-xs font-black text-white">Priority Dispatch</h5>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 leading-tight">Instant top-priority rider allocation.</p>
                </div>

                <div className="bg-slate-900/90 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-amber-500/20 space-y-0.5 sm:space-y-1">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-purple-400/20 text-purple-400 flex items-center justify-center">
                    <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <h5 className="text-[11px] sm:text-xs font-black text-white">2X Coins</h5>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 leading-tight">Double loyalty points & cashback.</p>
                </div>
              </div>

              {/* Plan Choice */}
              <div className="space-y-2">
                <label className="text-[11px] sm:text-xs font-bold text-slate-300 block">Select VIP Pass Plan:</label>
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('monthly')}
                    className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-left border transition-all cursor-pointer relative ${
                      selectedPlan === 'monthly'
                        ? 'bg-amber-500/20 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[11px] sm:text-xs font-black text-white block">1 Month Pass</span>
                    <div className="flex items-baseline space-x-1 mt-0.5">
                      <span className="text-base sm:text-lg font-black text-amber-300">₹49</span>
                      <span className="text-[9px] sm:text-[10px] text-slate-500 line-through">₹199</span>
                    </div>
                    <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">Save ₹150</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlan('quarterly')}
                    className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-left border transition-all cursor-pointer relative ${
                      selectedPlan === 'quarterly'
                        ? 'bg-amber-500/20 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="absolute -top-2 right-2 px-1.5 py-0.2 bg-emerald-500 text-slate-950 font-black text-[8px] sm:text-[9px] rounded-full uppercase tracking-wider">
                      Best Value
                    </span>
                    <span className="text-[11px] sm:text-xs font-black text-white block">3 Months Pass</span>
                    <div className="flex items-baseline space-x-1 mt-0.5">
                      <span className="text-base sm:text-lg font-black text-amber-300">₹99</span>
                      <span className="text-[9px] sm:text-[10px] text-slate-500 line-through">₹499</span>
                    </div>
                    <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">₹33/mo only</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sticky Modal Footer with Action Button */}
            <div className="p-3 sm:p-4 bg-slate-950/95 border-t border-amber-500/20 backdrop-blur-sm shrink-0 space-y-1.5">
              <button
                type="button"
                onClick={handlePurchase}
                className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-98 text-slate-950 font-black rounded-xl sm:rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-xl shadow-amber-500/25 cursor-pointer transition-all uppercase tracking-wide"
              >
                <Crown className="w-4 h-4 fill-current" />
                <span>Activate VIP Pass ({selectedPlan === 'monthly' ? '₹49' : '₹99'})</span>
              </button>

              <p className="text-[9px] sm:text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant activation • 100% money-back guarantee</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
