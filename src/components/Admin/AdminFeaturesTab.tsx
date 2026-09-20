import React, { useState } from 'react';
import { AppFeatureFlags } from '../../types';
import {
  Zap,
  Sliders,
  Scale,
  Bike,
  Coins,
  CloudRain,
  Store,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Percent,
  IndianRupee,
  Lock,
  Save,
  RotateCcw
} from 'lucide-react';

interface AdminFeaturesTabProps {
  featureFlags: AppFeatureFlags;
  onUpdateFeatureFlags: (flags: Partial<AppFeatureFlags>) => void;
  onBroadcastBanner: (message: string) => void;
  adminWhatsAppPhone?: string;
}

export const AdminFeaturesTab: React.FC<AdminFeaturesTabProps> = ({
  featureFlags,
  onUpdateFeatureFlags,
  onBroadcastBanner,
  adminWhatsAppPhone = '9871618126'
}) => {
  const [flags, setFlags] = useState<AppFeatureFlags>(featureFlags);
  const [savedToast, setSavedToast] = useState(false);
  const [tickerText, setTickerText] = useState(featureFlags.announcementTickerText || '🎉 Mega Savings: Flat ₹50 OFF on orders above ₹499 with code BAZLI50 + 10-Minute Delivery!');

  const handleToggle = (key: keyof AppFeatureFlags) => {
    const updated = { ...flags, [key]: !flags[key] };
    setFlags(updated);
    onUpdateFeatureFlags({ [key]: updated[key] });
    triggerSaved();
  };

  const handleValueChange = (key: keyof AppFeatureFlags, val: any) => {
    const updated = { ...flags, [key]: val };
    setFlags(updated);
    onUpdateFeatureFlags({ [key]: val });
    triggerSaved();
  };

  const triggerSaved = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleBroadcastTicker = () => {
    onBroadcastBanner(tickerText);
    onUpdateFeatureFlags({
      announcementTickerText: tickerText,
      showAnnouncementTicker: true
    });
    triggerSaved();
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Save Status */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-2xl bg-amber-500/20 text-amber-600">
              <Zap className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-black text-slate-900">
              Store Feature Switchboard & Dynamic Engine
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Instantly turn live customer features on/off and fine-tune delivery, bargaining margin, coins, and surge logic.
          </p>
        </div>

        {savedToast && (
          <div className="px-4 py-2 bg-emerald-500 text-white font-bold text-xs rounded-2xl flex items-center gap-1.5 shadow-md animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Live on Store!</span>
          </div>
        )}
      </div>

      {/* Top Announcement Banner Marquee Studio */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Megaphone className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-black text-white">Live Store Top Announcement Ticker</h4>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-bold text-slate-300">Show Announcement Bar</span>
            <input
              id="feature-show-ticker-toggle"
              type="checkbox"
              checked={flags.showAnnouncementTicker}
              onChange={() => handleToggle('showAnnouncementTicker')}
              className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
            />
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-slate-400 font-bold">Broadcast Message Headline</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="feature-ticker-input"
              type="text"
              value={tickerText}
              onChange={e => setTickerText(e.target.value)}
              placeholder="e.g. ⚡ Flash Sale: 40% OFF on all Dairy & Veggies today with code HOLI2026!"
              className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              id="feature-broadcast-ticker-btn"
              onClick={handleBroadcastTicker}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Broadcast to Customer Store</span>
            </button>
          </div>
        </div>

        {/* Live Preview Box */}
        {flags.showAnnouncementTicker && (
          <div className="p-3 bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border border-amber-500/30 rounded-2xl text-center text-xs font-black text-amber-300">
            Preview: {tickerText}
          </div>
        )}
      </div>

      {/* Feature Flags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. AI Price Bargaining Engine */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">Bazli Price Bargaining Engine</h4>
                <p className="text-[11px] text-slate-500">Live price negotiation with Bazli store manager</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="feature-bargain-toggle"
                type="checkbox"
                checked={flags.enableAiBargaining}
                onChange={() => handleToggle('enableAiBargaining')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Bazli Bot Personality & Strictness</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Generous', 'Balanced', 'Strict'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleValueChange('bargainBotMode', mode)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      flags.bargainBotMode === mode
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <span className="font-bold block">💡 Margins & Limits:</span>
              <p>Generous = Accepts offers up to 25% OFF. Balanced = Offers counters. Strict = Protects store floor margin within 10-15%.</p>
            </div>
          </div>
        </div>

        {/* 2. Mandi Loose Weights & Custom Portioning */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">Mandi Weights & Portioning</h4>
                <p className="text-[11px] text-slate-500">Custom loose 50g, 100g, 250g, 500g, 1kg loose weighing</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="feature-mandi-toggle"
                type="checkbox"
                checked={flags.enableMandiWeights}
                onChange={() => handleToggle('enableMandiWeights')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <p className="leading-relaxed">
              When active, shoppers can fine-tune portion weights for vegetables, fruits, pulses, and dry spices using authentic Indian mandi steppers (e.g. 50g, 100g, 250g, 500g, 1 kg, 2 kg, 5 kg).
            </p>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-900 font-medium">
              ✓ Enabled by default for all vegetable, fruit, grocery, and loose spice categories.
            </div>
          </div>
        </div>

        {/* 3. 10-Minute Express Delivery & Free Threshold */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-sky-500/20 text-sky-600 flex items-center justify-center">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">10-Minute Express Delivery</h4>
                <p className="text-[11px] text-slate-500">Delivery fees, free thresholds & SLA</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="feature-express-toggle"
                type="checkbox"
                checked={flags.enableExpressDelivery}
                onChange={() => handleToggle('enableExpressDelivery')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Free Delivery Above (₹)</label>
              <input
                id="feature-free-threshold-input"
                type="number"
                value={flags.freeDeliveryThreshold ?? 129}
                onChange={e => handleValueChange('freeDeliveryThreshold', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Standard Delivery Fee (₹)</label>
              <input
                id="feature-std-fee-input"
                type="number"
                value={flags.standardDeliveryFee ?? 19}
                onChange={e => handleValueChange('standardDeliveryFee', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Platform Fee (₹) (Current: 0)</label>
              <input
                id="feature-platform-fee-input"
                type="number"
                min="0"
                value={flags.platformFee ?? 0}
                onChange={e => handleValueChange('platformFee', Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* 4. Monsoon / Rain Surge */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 text-indigo-600 flex items-center justify-center">
                <CloudRain className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">Monsoon / Rain Surge</h4>
                <p className="text-[11px] text-slate-500">Adds weather bonus for riders & customer notice</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="feature-rain-toggle"
                type="checkbox"
                checked={flags.enableRainSurge}
                onChange={() => handleToggle('enableRainSurge')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-700">Rider Rain Incentive Allowance</span>
              <span className="font-black text-indigo-600">+₹{flags.monsoonSurgeFee || 25} / drop</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Surge fees are passed directly to delivery partners braving heavy rains and traffic.
            </p>
          </div>
        </div>

        {/* 5. Bazli Coins Loyalty Cashback */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">Customer BazliCoins Rewards</h4>
                <p className="text-[11px] text-slate-500">Cashback coin generation on checkout</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="feature-coins-toggle"
                type="checkbox"
                checked={flags.enableCustomerCoins}
                onChange={() => handleToggle('enableCustomerCoins')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="space-y-2 text-xs">
            <label className="font-bold text-slate-700 flex justify-between">
              <span>Cashback Rate on Order Amount</span>
              <span className="text-amber-600 font-black">{flags.customerCoinCashbackPercent}% Cashback</span>
            </label>
            <input
              id="feature-coins-percent-range"
              type="range"
              min="1"
              max="15"
              step="1"
              value={flags.customerCoinCashbackPercent}
              onChange={e => handleValueChange('customerCoinCashbackPercent', Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* 6. Merchant & Rider Onboarding Controls */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">Merchant & Rider Onboarding</h4>
                <p className="text-[11px] text-slate-500">Public registration forms & WhatsApp 2FA</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
              <span className="font-bold text-slate-700">Allow 3rd-Party Seller Registrations</span>
              <input
                type="checkbox"
                checked={flags.enableSellerRegistration}
                onChange={() => handleToggle('enableSellerRegistration')}
                className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
              <span className="font-bold text-slate-700">Allow Delivery Partner Signups</span>
              <input
                type="checkbox"
                checked={flags.enableDeliveryPartnerRegistration}
                onChange={() => handleToggle('enableDeliveryPartnerRegistration')}
                className="w-4 h-4 rounded accent-sky-500 cursor-pointer"
              />
            </label>

            <div className="p-2.5 rounded-xl bg-slate-900 text-slate-300 text-[11px] flex items-center justify-between">
              <span>Admin 2FA WhatsApp:</span>
              <span className="text-emerald-400 font-bold">+{adminWhatsAppPhone}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
