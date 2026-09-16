import React, { useState } from 'react';
import { CustomerProfile, BazliVipPlan } from '../../types';
import { BAZLI_VIP_PLANS } from '../../data/initialData';
import {
  Crown,
  X,
  CheckCircle,
  Truck,
  Coins,
  Sun,
  ShieldAlert,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';

interface BazliPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerProfile;
  onActivatePass: (plan: BazliVipPlan) => void;
}

export const BazliPassModal: React.FC<BazliPassModalProps> = ({
  isOpen,
  onClose,
  customer,
  onActivatePass
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<'monthly' | 'quarterly' | 'annual'>('quarterly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activatedSuccess, setActivatedSuccess] = useState(false);

  if (!isOpen) return null;

  const isAlreadyVip = !!customer.isVipMember;
  const currentPlan = BAZLI_VIP_PLANS.find(p => p.id === selectedPlanId) || BAZLI_VIP_PLANS[1];

  const handleSubscribe = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onActivatePass(currentPlan);
      setIsProcessing(false);
      setActivatedSuccess(true);
      setTimeout(() => {
        setActivatedSuccess(false);
        onClose();
      }, 1600);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#fcfaf6] rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden shadow-2xl border border-amber-400/50 flex flex-col">
        {/* Header with VIP Gold Gradient */}
        <div className="p-5 bg-gradient-to-br from-[#0a192f] via-[#10243e] to-[#0a192f] text-white relative border-b border-amber-500/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-slate-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg font-black shrink-0">
              <Crown className="w-7 h-7 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-xl tracking-tight text-white">
                  BAZLI <span className="text-amber-400">VIP PASS</span>
                </h3>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                  PRO MEMBERSHIP
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Unlimited ₹0 Free Deliveries & 2X Cashback on every order!
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Active VIP Status Banner */}
          {isAlreadyVip && (
            <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <div>
                  <h5 className="font-bold text-xs text-emerald-950">You are a Bazli VIP Member!</h5>
                  <p className="text-[11px] text-emerald-800">
                    Total Savings: <strong className="font-mono">₹{customer.vipSavingsToDate || 580}</strong> • Active plan
                  </p>
                </div>
              </div>
              <span className="bg-emerald-200/80 text-emerald-950 font-black text-[10px] px-2 py-1 rounded-lg">
                ACTIVE
              </span>
            </div>
          )}

          {/* Perks Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-stone-800 uppercase tracking-wider">
              Exclusive VIP Benefits
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white p-3 rounded-2xl border border-[#ded2bc] flex items-start space-x-2.5 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h6 className="font-bold text-xs text-stone-900">₹0 Free Delivery</h6>
                  <p className="text-[10px] text-stone-500">On all orders above ₹99, no fee ever</p>
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-[#ded2bc] flex items-start space-x-2.5 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h6 className="font-bold text-xs text-stone-900">2X Coins Cashback</h6>
                  <p className="text-[10px] text-stone-500">Earn 10% Bazli coins on each order</p>
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-[#ded2bc] flex items-start space-x-2.5 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h6 className="font-bold text-xs text-stone-900">Priority Milk Slot</h6>
                  <p className="text-[10px] text-stone-500">6:30 AM early morning priority batch</p>
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-[#ded2bc] flex items-start space-x-2.5 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h6 className="font-bold text-xs text-stone-900">Zero Surge Fees</h6>
                  <p className="text-[10px] text-stone-500">No rain or peak night fee charges</p>
                </div>
              </div>
            </div>
          </div>

          {/* Membership Tier Cards */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-stone-800 uppercase tracking-wider">
              Select Membership Plan
            </h4>

            <div className="space-y-2">
              {BAZLI_VIP_PLANS.map(plan => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all relative ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-50 via-yellow-50/60 to-orange-50/40 border-amber-500 shadow-sm ring-2 ring-amber-400'
                        : 'bg-white border-[#ded2bc] hover:border-amber-300'
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-2.5 right-4 bg-amber-500 text-stone-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-2xs">
                        {plan.badge}
                      </span>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-amber-600 bg-amber-500 text-stone-950'
                              : 'border-stone-300'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-stone-950" />}
                        </div>
                        <div>
                          <h5 className="font-black text-xs text-stone-900">{plan.name}</h5>
                          <span className="text-[10px] text-stone-500">
                            Est. Savings: ₹{plan.savingsEstimate}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-black text-stone-950 font-mono">
                          ₹{plan.price}
                        </div>
                        <span className="text-[10px] text-amber-900 font-bold">
                          {plan.id === 'monthly'
                            ? '₹3.3/day'
                            : plan.id === 'quarterly'
                            ? '₹2.2/day'
                            : '₹1.3/day'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer with Subscribe CTA */}
        <div className="p-4 bg-white border-t border-[#ded2bc] space-y-2">
          {activatedSuccess ? (
            <div className="w-full py-3.5 bg-emerald-600 text-white font-black text-center rounded-2xl flex items-center justify-center gap-2 animate-bounce">
              <CheckCircle className="w-5 h-5" />
              <span>Bazli VIP Pass Activated Successfully! 🎉</span>
            </div>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="w-full bg-[#0a192f] hover:bg-[#132f54] text-amber-300 font-black py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer border border-[#1e3a5f]"
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>
                {isProcessing
                  ? 'Activating VIP Pass...'
                  : isAlreadyVip
                  ? `Extend VIP Pass for ₹${currentPlan.price}`
                  : `Get Bazli VIP for ₹${currentPlan.price}`}
              </span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          )}

          <p className="text-[10px] text-stone-400 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cancel anytime with 1-click • Instant zero delivery fee applied</span>
          </p>
        </div>
      </div>
    </div>
  );
};
