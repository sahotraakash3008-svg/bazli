import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Scale, CheckCircle2, TrendingDown, HelpCircle } from 'lucide-react';
import { Product } from '../types';

interface BargainShowcaseProps {
  products: Product[];
  onBargainClick: (product: Product) => void;
}

export const BargainShowcase: React.FC<BargainShowcaseProps> = ({
  products,
  onBargainClick
}) => {
  const bargainableItems = products.filter(p => p.bargainingAllowed);
  const sampleProduct = bargainableItems[0] || products[0];

  return (
    <section className="bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-500 rounded-3xl p-6 sm:p-10 shadow-xl border border-amber-300 text-slate-950 space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left Heading & Copy */}
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center space-x-2 bg-slate-950 text-amber-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Exclusive Bazli Feature</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
            Why Pay More? Bargain & Save!
          </h2>

          <p className="text-slate-900 font-medium text-sm sm:text-base leading-relaxed">
            Think the price can be better? Make an offer on eligible products and get a deal you love.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-slate-900">
            <span className="flex items-center gap-1 bg-amber-300/80 px-3 py-1.5 rounded-xl border border-amber-500/40">
              <CheckCircle2 className="w-4 h-4 text-slate-950" /> Instant Bazli Seller Evaluation
            </span>
            <span className="flex items-center gap-1 bg-amber-300/80 px-3 py-1.5 rounded-xl border border-amber-500/40">
              <TrendingDown className="w-4 h-4 text-slate-950" /> Negotiate Exclusive Deals on Eligible Items
            </span>
          </div>
        </div>

        {/* Right CTA Box */}
        {sampleProduct && (
          <div className="bg-white p-5 rounded-2xl shadow-lg border border-amber-300 max-w-xs shrink-0 space-y-3 text-left">
            <div className="flex items-center space-x-3">
              <img src={sampleProduct.image} alt="" className="w-12 h-12 rounded-xl object-cover border" />
              <div>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded uppercase">
                  Bargain Eligible
                </span>
                <h4 className="font-bold text-slate-900 text-xs mt-0.5 line-clamp-1">{sampleProduct.name}</h4>
                <div className="text-xs font-black text-slate-800">MRP ₹{sampleProduct.mrp} → Selling ₹{sampleProduct.sellingPrice}</div>
              </div>
            </div>

            <button
              onClick={() => onBargainClick(sampleProduct)}
              className="w-full bg-slate-950 hover:bg-slate-900 text-amber-400 font-black py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
            >
              <span>Start Bargaining</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* How Bargaining Works in 3 Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-amber-900/15 pt-6">
        
        <div className="bg-amber-300/60 p-4 rounded-2xl border border-amber-500/30 flex items-start space-x-3">
          <div className="w-8 h-8 rounded-xl bg-slate-950 text-amber-400 font-black flex items-center justify-center text-sm shrink-0">
            1
          </div>
          <div>
            <h4 className="font-black text-slate-950 text-sm">Pick an Eligible Product</h4>
            <p className="text-slate-800 text-xs mt-0.5">Look for items tagged with "Bargain Eligible" across grocery categories.</p>
          </div>
        </div>

        <div className="bg-amber-300/60 p-4 rounded-2xl border border-amber-500/30 flex items-start space-x-3">
          <div className="w-8 h-8 rounded-xl bg-slate-950 text-amber-400 font-black flex items-center justify-center text-sm shrink-0">
            2
          </div>
          <div>
            <h4 className="font-black text-slate-950 text-sm">Make Your Custom Offer</h4>
            <p className="text-slate-800 text-xs mt-0.5">Enter your price offer based on your Loyalty Tier discount limits.</p>
          </div>
        </div>

        <div className="bg-amber-300/60 p-4 rounded-2xl border border-amber-500/30 flex items-start space-x-3">
          <div className="w-8 h-8 rounded-xl bg-slate-950 text-amber-400 font-black flex items-center justify-center text-sm shrink-0">
            3
          </div>
          <div>
            <h4 className="font-black text-slate-950 text-sm">Lock Price & Checkout</h4>
            <p className="text-slate-800 text-xs mt-0.5">Once accepted or counter agreed, price is locked in your cart for 10 mins!</p>
          </div>
        </div>

      </div>

    </section>
  );
};
