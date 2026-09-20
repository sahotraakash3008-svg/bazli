import React from 'react';
import { ArrowRight, Sparkles, Zap, ShieldCheck, ThumbsUp, Scale } from 'lucide-react';

interface HeroProps {
  onShopNow: () => void;
  onExploreDeals: () => void;
  onStartBargaining: () => void;
  headline?: string;
  headlineHighlight?: string;
  subheadline?: string;
  badge?: string;
  shopButtonText?: string;
  dealsButtonText?: string;
}

export const Hero: React.FC<HeroProps> = ({
  onShopNow,
  onExploreDeals,
  onStartBargaining,
  headline = 'Your Daily Needs,',
  headlineHighlight = '100% freshness your environment',
  subheadline = 'Fresh farm vegetables, dairy, snacks and daily essentials with Bazli live bargaining and instant dispatch.',
  badge = 'LIVE DARKSTORE NETWORK • 100% freshness your environment',
  shopButtonText = 'Shop Groceries ⚡',
  dealsButtonText = 'Explore Deals 🔥'
}) => {
  return (
    <div className="space-y-6">
      {/* Main Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a192f] via-[#0f2744] to-[#071322] text-white p-6 sm:p-12 lg:p-14 shadow-2xl border border-[#1e3a5f]">
        
        {/* Background decorative glowing elements */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-sky-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
            
            {/* Tagline Badge with Live Radar Pulse */}
            <div className="inline-flex items-center space-x-2 bg-[#061324]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#1f3f66] text-amber-200 text-xs font-semibold shadow-inner">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
              <span className="font-bold text-amber-300">{badge}</span>
            </div>

            {/* Exact Hero Heading & Subheading from Specification */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              {headline}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-freshness">
                {headlineHighlight}
              </span>
            </h1>

            <p className="text-slate-200/90 text-sm sm:text-base lg:text-lg max-w-xl font-normal leading-relaxed">
              {subheadline}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
              <button
                onClick={onShopNow}
                className="bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center space-x-2 text-sm sm:text-base cursor-pointer transform hover:-translate-y-0.5 border border-amber-300"
              >
                <span>{shopButtonText}</span>
                <ArrowRight className="w-5 h-5 text-slate-950" />
              </button>

              <button
                onClick={onExploreDeals}
                className="bg-[#0e2440]/90 hover:bg-[#143257] text-white font-bold px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl border border-[#22446d] transition-all text-sm sm:text-base cursor-pointer backdrop-blur-xs hover:border-amber-400/60"
              >
                {dealsButtonText}
              </button>
            </div>

            {/* Delivery Infrastructure Stats */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-200 font-medium">
              <span className="flex items-center gap-1.5 text-amber-300 font-bold bg-[#061224] px-2.5 py-1 rounded-lg border border-[#1b385c]">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> 8-12 Min Avg Dispatch
              </span>
              <span className="flex items-center gap-1.5 text-amber-200 font-bold bg-[#061224] px-2.5 py-1 rounded-lg border border-[#1b385c]">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> 100% Quality Assured
              </span>
            </div>
          </div>

          {/* Bargain Special Feature Highlight Card */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-b from-[#0d223c]/95 to-[#081729]/95 backdrop-blur-xl p-5 sm:p-7 rounded-3xl border border-[#244b7a] shadow-2xl relative overflow-hidden group hover:border-amber-400/50 transition-all">
              
              <div className="absolute top-3 right-3 bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider shadow-sm flex items-center gap-1">
                <Scale className="w-3 h-3" /> Live Bargain
              </div>

              <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold mb-3 shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>

              {/* Exact Bargaining content from spec */}
              <h3 className="text-xl sm:text-2xl font-black text-amber-300 mb-1.5">
                Why Pay More? Bargain & Save!
              </h3>
              
              <p className="text-slate-200/90 text-xs sm:text-sm leading-relaxed mb-4">
                Think the price can be better? Negotiate instant discounts with Bazli Bargain engine.
              </p>

              <div className="bg-[#050f1d] p-3 rounded-xl border border-[#18365a] mb-4 text-xs text-slate-200 space-y-1.5">
                <div className="font-bold flex justify-between">
                  <span className="text-slate-300">Product: Fortune Sunflower Oil</span>
                  <span className="text-slate-500 line-through">MRP ₹145</span>
                </div>
                <div className="flex justify-between text-white font-medium">
                  <span className="text-slate-300">Selling Price: ₹132</span>
                  <span className="text-amber-400 font-bold">Your Offer: ₹120</span>
                </div>
                <div className="text-[11px] text-amber-300 font-semibold pt-1 border-t border-[#18365a] flex items-center justify-between">
                  <span>Result: OFFER ACCEPTED! 🎉</span>
                  <span className="text-amber-300 font-bold">Saved ₹12 extra</span>
                </div>
              </div>

              <button
                onClick={onStartBargaining}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black py-2.5 sm:py-3 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 text-xs sm:text-sm cursor-pointer"
              >
                <span>Start Bargaining Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Trust Features Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Feature 1 */}
        <div className="bg-[#fbf9f5] p-4 sm:p-5 rounded-2xl border border-[#e8dfd1] shadow-xs flex items-start space-x-3.5 hover:border-amber-400 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 border border-amber-300">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Fast Delivery</h4>
            <p className="text-slate-600 text-xs mt-0.5 leading-snug">
              Get your everyday essentials delivered quickly.
            </p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="bg-[#fbf9f5] p-4 sm:p-5 rounded-2xl border border-[#e8dfd1] shadow-xs flex items-start space-x-3.5 hover:border-amber-400 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#0f2744] text-amber-300 flex items-center justify-center shrink-0 border border-[#22446d]">
            <ThumbsUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Fresh & Reliable</h4>
            <p className="text-slate-600 text-xs mt-0.5 leading-snug">
              Quality products from trusted sellers.
            </p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="bg-[#fbf9f5] p-4 sm:p-5 rounded-2xl border border-[#e8dfd1] shadow-xs flex items-start space-x-3.5 hover:border-amber-400 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center shrink-0 border border-orange-300">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Bargain & Save</h4>
            <p className="text-slate-600 text-xs mt-0.5 leading-snug">
              Make an offer and get a price you love.
            </p>
          </div>
        </div>

        {/* Feature 4 */}
        <div className="bg-[#fbf9f5] p-4 sm:p-5 rounded-2xl border border-[#e8dfd1] shadow-xs flex items-start space-x-3.5 hover:border-amber-400 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#0a192f] text-white flex items-center justify-center shrink-0 border border-[#1e3a5f]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Secure Payments</h4>
            <p className="text-slate-600 text-xs mt-0.5 leading-snug">
              Pay safely with trusted payment methods.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
