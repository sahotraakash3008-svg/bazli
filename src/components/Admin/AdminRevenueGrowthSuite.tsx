import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Sliders,
  Zap,
  CloudRain,
  Moon,
  Store,
  Truck,
  Sparkles,
  ShieldCheck,
  Check,
  ArrowUpRight,
  Receipt,
  Layers
} from 'lucide-react';
import { AppFeatureFlags, Order, Seller, DeliveryPartner } from '../../types';

interface AdminRevenueGrowthSuiteProps {
  orders: Order[];
  sellers: Seller[];
  deliveryPartners: DeliveryPartner[];
  featureFlags: AppFeatureFlags;
  onUpdateFeatureFlags?: (flags: Partial<AppFeatureFlags>) => void;
}

export const AdminRevenueGrowthSuite: React.FC<AdminRevenueGrowthSuiteProps> = ({
  orders,
  sellers,
  deliveryPartners,
  featureFlags,
  onUpdateFeatureFlags
}) => {
  const [platformFee, setPlatformFee] = useState<number>(featureFlags.platformFee ?? 0);
  const [commissionRate, setCommissionRate] = useState<number>(featureFlags.adminCommissionRate || 10);
  const [rainSurge, setRainSurge] = useState<boolean>(featureFlags.enableRainSurge || false);
  const [rainFee, setRainFee] = useState<number>(featureFlags.monsoonSurgeFee || 25);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  // Financial calculations
  const totalGMV = orders.reduce((acc, o) => acc + (o.finalAmount || 0), 0);
  const totalCommissionEarned = Math.round(totalGMV * (commissionRate / 100));
  const totalPlatformFees = orders.length * platformFee;
  const netEstimatedProfit = totalCommissionEarned + totalPlatformFees;

  const handleSaveSettings = () => {
    if (onUpdateFeatureFlags) {
      onUpdateFeatureFlags({
        platformFee,
        adminCommissionRate: commissionRate,
        enableRainSurge: rainSurge,
        monsoonSurgeFee: rainFee
      });
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6 my-6 text-stone-900">
      
      {/* 1. Executive Unit Economics & Net Profit Dashboard */}
      <div className="rounded-3xl bg-gradient-to-r from-stone-950 via-[#1c140d] to-amber-950 border-2 border-amber-500/80 p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full inline-block">
              ADMIN PROFIT ENGINE
            </span>
            <h3 className="text-xl font-black text-white mt-1">
              Bazli Platform Monetization & Margin Dashboard
            </h3>
          </div>
          <span className="text-xs text-stone-300 font-bold">
            Real-time Gross Margin: <strong className="text-emerald-400 font-mono text-sm">~16.4% Net</strong>
          </span>
        </div>

        {/* 4 Financial Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Gross GMV</span>
            <span className="text-xl font-black text-white font-mono">₹{totalGMV.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-stone-400 block mt-0.5">{orders.length} Total Orders</span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Seller Commissions</span>
            <span className="text-xl font-black text-amber-400 font-mono">₹{totalCommissionEarned.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-stone-400 block mt-0.5">At {commissionRate}% Standard Take</span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Platform / Tech Fees</span>
            <span className="text-xl font-black text-sky-400 font-mono">₹{totalPlatformFees.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-stone-400 block mt-0.5">₹{platformFee}/order Convenience Fee</span>
          </div>

          <div className="bg-emerald-500/20 border border-emerald-400/40 p-3.5 rounded-2xl">
            <span className="text-[10px] text-emerald-300 uppercase font-bold block">Admin Net Profit</span>
            <span className="text-xl font-black text-emerald-300 font-mono">₹{netEstimatedProfit.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-emerald-400/80 block mt-0.5">Direct Cashflow</span>
          </div>
        </div>
      </div>

      {/* 2. Real-time Pricing Controls & Surge Trigger */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-amber-600" />
            <h4 className="font-black text-base text-stone-900">
              Live Revenue & Surcharge Controls
            </h4>
          </div>
          {savedNotice && (
            <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Settings Updated
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. Seller Commission Slider */}
          <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-amber-600" /> Seller Commission %
              </span>
              <span className="font-black text-stone-950 text-sm font-mono bg-white px-2 py-0.5 rounded-lg border border-stone-300">
                {commissionRate}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={commissionRate}
              onChange={e => setCommissionRate(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <p className="text-[10px] text-stone-500">
              Set to 0% for special promo periods, 8-10% for everyday sustainable profit.
            </p>
          </div>

          {/* 2. Platform Handling Fee */}
          <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-sky-600" /> Platform Fee (Per Order)
              </span>
              <span className="font-black text-stone-950 text-sm font-mono bg-white px-2 py-0.5 rounded-lg border border-stone-300">
                ₹{platformFee}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={platformFee}
              onChange={e => setPlatformFee(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <p className="text-[10px] text-stone-500">
              Customer convenience charge covering servers and instant SMS/WhatsApp alerts.
            </p>
          </div>

          {/* 3. Monsoon & Bad Weather Surge Mode */}
          <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-2 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-indigo-600" /> Monsoon Surge (+₹{rainFee})
              </span>
              <button
                type="button"
                onClick={() => setRainSurge(!rainSurge)}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  rainSurge
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                }`}
              >
                {rainSurge ? 'Active ON 🌧️' : 'OFF'}
              </button>
            </div>
            <p className="text-[10px] text-stone-500">
              Automatically passes +₹{rainFee} extra surge compensation to riders during rain.
            </p>
          </div>

        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSaveSettings}
            className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Save & Apply Live Monetization Rules</span>
          </button>
        </div>

      </div>

    </div>
  );
};
