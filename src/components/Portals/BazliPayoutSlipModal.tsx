import React from 'react';
import { DeliveryPartner, DeliveryPayoutRecord } from '../../types';
import {
  X,
  Receipt,
  Download,
  Share2,
  CheckCircle2,
  Building2,
  Clock,
  Sparkles,
  ShieldCheck,
  Zap,
  Printer
} from 'lucide-react';

interface BazliPayoutSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: DeliveryPayoutRecord | null;
  partner: DeliveryPartner;
}

export const BazliPayoutSlipModal: React.FC<BazliPayoutSlipModalProps> = ({
  isOpen,
  onClose,
  record,
  partner
}) => {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Receipt className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-black text-white">Delivery Payout Voucher</h3>
              <span className="text-[10px] text-slate-400 font-mono">ID: {record.id}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voucher Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center space-x-1.5">
                <img src="/bazli-logo.jpg?v=2" alt="Bazli" className="w-6 h-6 rounded-lg object-cover border border-emerald-600/30" referrerPolicy="no-referrer" />
                <span className="font-black text-slate-900 text-base">Bazli</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Bazli Quick Delivery Network Partner Settlement</span>
            </div>
            <div className="text-right">
              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2.5 py-1 rounded-full uppercase border border-emerald-300">
                ● {record.status}
              </span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-center space-y-1">
            <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">Net Amount Settled</span>
            <div className="text-3xl font-black text-emerald-900">₹{record.amount.toLocaleString()}</div>
            <span className="text-[11px] text-emerald-700 font-medium block">
              Credited directly to {record.payoutMethod}
            </span>
          </div>

          {/* Itemized Info Table */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Partner Name:</span>
              <span className="font-extrabold text-slate-900">{partner.name}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Partner ID:</span>
              <span className="font-mono font-bold text-slate-700">{partner.id}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Payout Method:</span>
              <span className="font-extrabold text-slate-900">{record.payoutMethod}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Account / VPA:</span>
              <span className="font-mono font-extrabold text-emerald-700 break-all">{record.destination}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">NPCI / Bank UTR:</span>
              <span className="font-mono font-extrabold text-slate-900">{record.utrNumber}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Estimated Orders Covered:</span>
              <span className="font-bold text-slate-800">{record.ordersCovered} Deliveries</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Platform Fee / Commission:</span>
              <span className="font-bold text-emerald-600">₹0.00 (100% Retained)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Settlement Date:</span>
              <span className="font-medium text-slate-700">{new Date(record.timestamp).toLocaleString()}</span>
            </div>
          </div>

          {/* Guarantee Footer */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-[10px] text-slate-500 space-y-1">
            <div className="font-bold text-slate-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Authorized System Generated Payout Slip
            </div>
            <p>
              This is an official transaction voucher under Bazli Quick Commerce Fleet Agreement. No signature required.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handlePrint}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Voucher</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
