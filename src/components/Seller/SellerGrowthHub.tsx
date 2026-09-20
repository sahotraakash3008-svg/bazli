import React, { useState } from 'react';
import {
  TrendingUp,
  Percent,
  ShieldCheck,
  Zap,
  ArrowRight,
  IndianRupee,
  CheckCircle2,
  Building,
  Store,
  Sparkles,
  Award,
  Wallet,
  Clock,
  Phone,
  MessageSquare
} from 'lucide-react';
import { Seller } from '../../types';

interface SellerGrowthHubProps {
  seller: Seller;
  onOpenStoreDigitization?: () => void;
  adminWhatsAppPhone?: string;
}

export const SellerGrowthHub: React.FC<SellerGrowthHubProps> = ({
  seller,
  onOpenStoreDigitization,
  adminWhatsAppPhone = '9871618126'
}) => {
  const [monthlySales, setMonthlySales] = useState<number>(100000); // 1 Lakh monthly sales

  // Commission calculations:
  // Competitor (Swiggy/Zomato/Blinkit): ~25% commission + 3% payment gateway = ~28%
  const competitorCommission = Math.round(monthlySales * 0.28);
  // Bazli: 0% promo for first 2 months (₹0 fee), followed by 10% standard platform fee
  const bazliPromoCommission = 0; // First 2 months
  const bazliStandardCommission = Math.round(monthlySales * 0.10);
  const monthlySavingsDuringPromo = competitorCommission - bazliPromoCommission;
  const monthlySavingsAfterPromo = competitorCommission - bazliStandardCommission;
  const annualSavings = (monthlySavingsDuringPromo * 2) + (monthlySavingsAfterPromo * 10);

  return (
    <div className="space-y-6 my-6">
      
      {/* 1. "0% Commission for First 2 Months (60 Days)" Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950 via-[#2a1308] to-emerald-950 border-2 border-amber-500/80 p-5 sm:p-7 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 font-black text-xs uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                SELLER ATTRACTION OFFER
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-black px-3 py-1 rounded-full">
                ⚡ 0% COMMISSION FOR FIRST 2 MONTHS (60 DAYS)
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Grow Your Local Store with <span className="text-amber-400">Bazli Hyperlocal Network</span>
            </h2>

            <p className="text-sm text-stone-300">
              Join 150+ local merchants and grocery store owners. Keep <strong>100% of your earnings for your first 2 months (60 days) with 0% platform commission</strong>! After the 2 months welcome window, Bazli automatically sets to our standard <strong>10% platform fee</strong>. Enjoy <strong>Zero Marketplace Listing Fees</strong>, and receive <strong>Daily Instant UPI Settlements</strong> directly to your bank account!
            </p>

            {/* 3 Pillar USPs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-black/30 border border-white/10 p-2.5 rounded-xl flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-white block">0% for 2 Months, then 10%</span>
                  <span className="text-[10px] text-stone-400">vs 28% on Swiggy/Zomato</span>
                </div>
              </div>

              <div className="bg-black/30 border border-white/10 p-2.5 rounded-xl flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-white block">Daily 11 PM Payout</span>
                  <span className="text-[10px] text-stone-400">Instant UPI Direct Credit</span>
                </div>
              </div>

              <div className="bg-black/30 border border-white/10 p-2.5 rounded-xl flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-white block">Free Store Digitization</span>
                  <span className="text-[10px] text-stone-400">We upload your full menu</span>
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-2.5">
            <a
              href={`https://wa.me/91${adminWhatsAppPhone}?text=Hi%20Bazli%20Admin%2C%20I%20want%20to%20claim%20the%202%20Months%200%25%20Commission%20Seller%20Onboarding%20Offer%20for%20my%20store%20${encodeURIComponent(seller.storeName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg hover:scale-105 transition-all text-center"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Claim 2-Month 0% Commission on WhatsApp</span>
            </a>

            <div className="text-center text-[11px] text-stone-400">
              ⚡ Instant Approval & 60-Day 100% Payout Window
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Commission & Profit Savings Calculator */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-sm text-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md inline-block mb-1">
              PROFIT CALCULATOR
            </span>
            <h3 className="text-lg font-black text-stone-900">
              See How Much Profit You Save on Bazli vs Big Apps
            </h3>
          </div>
          <span className="text-xs font-bold text-stone-500">
            Slide to adjust your estimated monthly sales
          </span>
        </div>

        {/* Range Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-stone-600">Monthly Store Sales Volume:</span>
            <span className="text-base font-black text-stone-950 font-mono bg-stone-100 px-3 py-1 rounded-xl border border-stone-300">
              ₹{monthlySales.toLocaleString('en-IN')} / month
            </span>
          </div>
          <input
            type="range"
            min="20000"
            max="1000000"
            step="10000"
            value={monthlySales}
            onChange={e => setMonthlySales(Number(e.target.value))}
            className="w-full h-2.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-[10px] text-stone-400 font-bold">
            <span>₹20,000 (Small Kirana)</span>
            <span>₹5,00,000 (Busy Supermarket)</span>
            <span>₹10,00,000+ (High Volume)</span>
          </div>
        </div>

        {/* Comparative Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* Swiggy/Zomato/Blinkit */}
          <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 space-y-2 text-rose-950">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-200 px-2 py-0.5 rounded">
              Competitor Platforms (28%)
            </span>
            <div className="text-2xl font-black text-rose-700 font-mono">
              ₹{competitorCommission.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-rose-900/80">
              Lost in hefty platform cuts (25% + gateway fees + delay in payments).
            </p>
          </div>

          {/* Bazli */}
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 space-y-2 text-emerald-950">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded">
              Bazli (0% 1st 2 Mos • then 10%)
            </span>
            <div className="text-2xl font-black text-emerald-700 font-mono">
              ₹{bazliStandardCommission.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-emerald-900/80">
              ₹0 fee during 2-month welcome promo, then flat 10% standard fee + instant UPI payouts.
            </p>
          </div>

          {/* Net Pocket Savings */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-stone-950 rounded-2xl p-4 space-y-1 shadow-md">
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/30 px-2 py-0.5 rounded inline-block">
              Your Extra Pocket Profit 💰
            </span>
            <div className="text-2xl font-black font-mono">
              +₹{monthlySavingsAfterPromo.toLocaleString('en-IN')}<span className="text-xs font-bold">/mo</span>
            </div>
            <p className="text-xs font-bold opacity-90">
              Includes 100% earnings in first 2 months + <strong>₹{annualSavings.toLocaleString('en-IN')} Extra Profit</strong> annually!
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
