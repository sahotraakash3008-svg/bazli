import React, { useState } from 'react';
import { X, Megaphone, Bell, Sparkles, Send } from 'lucide-react';

interface AdminBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcast: (message: string) => void;
}

export const AdminBroadcastModal: React.FC<AdminBroadcastModalProps> = ({
  isOpen,
  onClose,
  onBroadcast
}) => {
  const [message, setMessage] = useState('🌧️ Heavy Rain Alert: Fleet riders on active duty. ₹15 extra rain incentive added to partners!');

  if (!isOpen) return null;

  const handleSend = () => {
    if (!message.trim()) return;
    onBroadcast(message.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Broadcast Live Announcement</h3>
              <p className="text-slate-400 text-xs">Pushes real-time banner notice to all platform shoppers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Announcement Message
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-medium"
              placeholder="Type announcement here..."
            />
          </div>

          {/* Quick templates */}
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
              Quick Templates
            </span>
            <div className="space-y-1.5">
              {[
                '⚡ Flash Sale: 20% Off on Atta & Dal with live price bargaining!',
                '🌧️ Monsoon Surge: Express 15-min delivery active across all zones.',
                '🎉 Weekend Grocery Carnival: Extra 50 BazliCoins on orders above ₹199!'
              ].map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMessage(tmpl)}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-[11px] text-slate-700 hover:text-emerald-900 border border-slate-200 transition-colors cursor-pointer"
                >
                  {tmpl}
                </button>
              ))}
            </div>
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
              onClick={handleSend}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 font-black text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
