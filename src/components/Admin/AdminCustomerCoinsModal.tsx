import React, { useState } from 'react';
import { X, Sparkles, Coins, Gift, User, CheckCircle2 } from 'lucide-react';

interface AdminCustomerCoinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAwardCoins: (amount: number, reason: string) => void;
}

export const AdminCustomerCoinsModal: React.FC<AdminCustomerCoinsModalProps> = ({
  isOpen,
  onClose,
  onAwardCoins
}) => {
  const [amount, setAmount] = useState(150);
  const [reason, setReason] = useState('Loyalty Milestone Gift');
  const [customReason, setCustomReason] = useState('');

  if (!isOpen) return null;

  const handleGrant = () => {
    const finalReason = reason === 'Other' ? (customReason || 'Admin Credit') : reason;
    onAwardCoins(amount, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-amber-200 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Credit Customer BazliCoins</h3>
              <p className="text-amber-100 text-xs">Customer CRM & Goodwill Balance Booster</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-amber-800/60 hover:bg-amber-800 text-amber-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Coin Reward Amount
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 250, 500].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`py-2 rounded-xl font-black text-xs cursor-pointer transition-all border ${
                    amount === val
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-amber-50 text-slate-700 border-slate-200'
                  }`}
                >
                  +{val} Coins
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Custom Amount (₹1 coin = ₹1 discount value)
            </label>
            <div className="relative">
              <Coins className="w-4 h-4 text-amber-500 absolute left-3 top-3" />
              <input
                type="number"
                min="10"
                max="5000"
                value={amount}
                onChange={e => setAmount(Math.max(1, Number(e.target.value)))}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono font-black border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Credit Reason / Category
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50"
            >
              <option value="Loyalty Milestone Gift">Loyalty Milestone Gift</option>
              <option value="Bazli Welcome Bonus">Bazli Welcome Bonus</option>
              <option value="Delivery Delay Compensation">Delivery Delay Compensation</option>
              <option value="Festival Special Credit">Festival Special Credit</option>
              <option value="Other">Custom Reason</option>
            </select>
          </div>

          {reason === 'Other' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Specify Reason</label>
              <input
                type="text"
                placeholder="e.g. VIP Customer VIP perk"
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50"
              />
            </div>
          )}

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-950 font-medium">
            💡 Customer can redeem these coins at checkout for instant cash discounts on fresh grocery orders!
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGrant}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 font-black text-slate-950 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Credit +{amount} Coins</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
