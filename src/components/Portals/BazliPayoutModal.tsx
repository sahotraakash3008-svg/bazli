import React, { useState } from 'react';
import { DeliveryPartner, DeliveryPayoutRecord } from '../../types';
import {
  X,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Clock,
  Sparkles,
  DollarSign,
  TrendingUp,
  Receipt,
  Download,
  Share2,
  AlertCircle,
  Edit3
} from 'lucide-react';

interface BazliPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: DeliveryPartner;
  onConfirmPayout: (amount: number, method: 'UPI Instant Cashout' | 'Bank Transfer (IMPS)', destination: string) => void;
  onOpenManageAccount?: () => void;
}

export const BazliPayoutModal: React.FC<BazliPayoutModalProps> = ({
  isOpen,
  onClose,
  partner,
  onConfirmPayout,
  onOpenManageAccount
}) => {
  const walletBal = partner.walletBalance || 0;
  const [withdrawAmount, setWithdrawAmount] = useState<number>(walletBal);
  const [payoutMethod, setPayoutMethod] = useState<'UPI' | 'Bank'>(
    partner.payoutDetails?.payoutMode === 'Bank Transfer' ? 'Bank' : 'UPI'
  );
  const safePartnerPhone = (partner.phone || '').replace(/\D/g, '').slice(-10);
  const [customUpi, setCustomUpi] = useState<string>(
    partner.payoutDetails?.upiId || partner.upiId || (safePartnerPhone ? `${safePartnerPhone}@upi` : 'rider@upi')
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successRecord, setSuccessRecord] = useState<DeliveryPayoutRecord | null>(null);

  if (!isOpen) return null;

  const handleQuickAmount = (amt: number) => {
    setWithdrawAmount(Math.min(amt, walletBal));
  };

  const handleWithdraw = () => {
    if (withdrawAmount <= 0 || withdrawAmount > walletBal) return;

    setIsProcessing(true);

    setTimeout(() => {
      const destination = payoutMethod === 'UPI' 
        ? customUpi 
        : `${partner.payoutDetails?.bankName || partner.bankName || 'HDFC Bank'} (A/C: ${partner.payoutDetails?.accountNumber ? `•••• ${partner.payoutDetails.accountNumber.slice(-4)}` : partner.bankAccountNumber || 'XXXX4819'})`;
      const utr = `UPI-NPCI-RZP-${Date.now().toString().slice(-8)}`;

      const newRecord: DeliveryPayoutRecord = {
        id: `PAY-BZL-RDR-${Date.now().toString().slice(-6)}`,
        partnerId: partner.id,
        amount: withdrawAmount,
        payoutMethod: payoutMethod === 'UPI' ? 'UPI Instant Cashout' : 'Bank Transfer (IMPS)',
        destination,
        utrNumber: utr,
        status: 'Success',
        ordersCovered: Math.max(1, Math.round(withdrawAmount / 65)),
        timestamp: new Date().toISOString(),
        notes: 'Instant rider withdrawal disbursed via Bazli FastPay (RazorpayX Connected)'
      };

      onConfirmPayout(
        withdrawAmount,
        payoutMethod === 'UPI' ? 'UPI Instant Cashout' : 'Bank Transfer (IMPS)',
        destination
      );

      setIsProcessing(false);
      setSuccessRecord(newRecord);
    }, 900);
  };

  const handleResetAndClose = () => {
    setSuccessRecord(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 bg-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-black uppercase text-amber-300 border border-amber-400/30">
                <span>Bazli FastPay • Instant Settlement</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Delivery Partner Instant Payout
              </h3>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {successRecord ? (
            /* SUCCESS CONFIRMATION RECEIPT SCREEN */
            <div className="space-y-5 animate-in zoom-in-95 duration-200 text-center py-2">
              <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-500 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Instant Transfer Successful
                </span>
                <h4 className="text-2xl font-black text-slate-900 pt-2">
                  ₹{successRecord.amount.toLocaleString()} Credited Instantly!
                </h4>
                <p className="text-xs text-slate-500">
                  Funds transferred directly to your destination account via NPCI IMPS/UPI network in 4 seconds.
                </p>
              </div>

              {/* Digital Payout Slip Card */}
              <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-200 text-left space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span className="font-extrabold text-slate-800">Transaction Summary</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{successRecord.id}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-semibold">Delivery Partner</span>
                    <span className="font-extrabold text-slate-900">{partner.name} ({partner.id})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Transfer Channel</span>
                    <span className="font-extrabold text-slate-900">{successRecord.payoutMethod}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Destination</span>
                    <span className="font-mono font-extrabold text-emerald-700 break-all">{successRecord.destination}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Bank UTR / Ref No.</span>
                    <span className="font-mono font-bold text-slate-700">{successRecord.utrNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Transfer Fee / TDS</span>
                    <span className="font-bold text-emerald-600">₹0 (100% Free)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Date & Time</span>
                    <span className="font-medium text-slate-600">{new Date(successRecord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-emerald-200/60 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Remaining Wallet Balance:</span>
                  <span className="font-black text-slate-900 text-sm">₹{Math.max(0, walletBal - successRecord.amount)}</span>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={handleResetAndClose}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-2xl text-xs shadow-md transition-all cursor-pointer"
                >
                  Done & Back to Deliveries
                </button>
              </div>
            </div>
          ) : (
            /* WITHDRAWAL FORM SCREEN */
            <>
              {/* Wallet Balance Highlight Banner */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4.5 rounded-2xl border border-slate-700/60 flex items-center justify-between shadow-md">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block uppercase tracking-wider">
                    Available Wallet Balance
                  </span>
                  <div className="flex items-baseline space-x-1.5 mt-0.5">
                    <span className="text-3xl font-black text-amber-400">₹{walletBal.toLocaleString()}</span>
                    <span className="text-xs text-emerald-400 font-bold">● Ready for 24/7 Withdrawal</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-400/30 inline-block">
                    Zero Transfer Fee
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">Daily 12:00 AM Auto-Roll</span>
                </div>
              </div>

              {/* Amount Selection */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Enter Withdrawal Amount:</span>
                  <span className="text-slate-400 font-normal text-[11px]">Min ₹50 • Max ₹{walletBal}</span>
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-slate-400">₹</span>
                  <input
                    type="number"
                    min={50}
                    max={walletBal}
                    value={withdrawAmount || ''}
                    onChange={e => setWithdrawAmount(Math.min(walletBal, Math.max(0, Number(e.target.value))))}
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-lg font-black text-slate-900 focus:bg-white focus:border-emerald-600 outline-none transition-all"
                    placeholder="Enter amount"
                  />
                </div>

                {/* Quick select pills */}
                <div className="flex items-center gap-2 pt-1">
                  {[200, 500, walletBal].map((amt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={amt <= 0 || amt > walletBal}
                      onClick={() => handleQuickAmount(amt)}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        withdrawAmount === amt
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      {amt === walletBal ? `All (₹${amt})` : `₹${amt}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payout Destination Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 block">
                    Select Payout Destination:
                  </label>
                  {onOpenManageAccount && (
                    <button
                      type="button"
                      onClick={onOpenManageAccount}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Manage Bank / UPI</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('UPI')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      payoutMethod === 'UPI'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-black text-xs text-slate-900">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Instant UPI ID</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Direct to GPay / PhonePe / Paytm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod('Bank')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      payoutMethod === 'Bank'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-black text-xs text-slate-900">
                      <Building2 className="w-3.5 h-3.5 text-sky-600" />
                      <span>Bank IMPS</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Verified Bank Account</span>
                  </button>
                </div>

                {payoutMethod === 'UPI' ? (
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-600 block">UPI Handle (VPA):</span>
                    <input
                      type="text"
                      value={customUpi}
                      onChange={e => setCustomUpi(e.target.value)}
                      placeholder="e.g. mobile@okhdfcbank"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-emerald-600"
                    />
                    <span className="text-[10px] text-emerald-700 font-medium block">
                      ✓ Instant settlement credited within 60 seconds.
                    </span>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered Bank Account</span>
                    <div className="font-extrabold text-slate-900">{partner.bankName || 'HDFC Bank'}</div>
                    <div className="font-mono text-slate-600 text-[11px]">
                      A/C: {partner.bankAccountNumber || 'XXXXXX4819'} • IFSC: {partner.ifscCode || 'HDFC0001245'}
                    </div>
                  </div>
                )}
              </div>

              {/* Bazli Guarantee Banner */}
              <div className="bg-emerald-50 border border-emerald-200/80 p-3 rounded-2xl flex items-center space-x-2.5 text-xs text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-[11px]">
                  <strong>100% Guaranteed Payout:</strong> Zero platform commission or convenience fees deducted. Full earnings reach your account.
                </div>
              </div>

              {/* Withdrawal Submit Button */}
              <button
                disabled={isProcessing || withdrawAmount <= 0 || withdrawAmount > walletBal}
                onClick={handleWithdraw}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 cursor-pointer transition-all"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Instant NPCI Transfer...</span>
                  </>
                ) : (
                  <>
                    <span>Withdraw ₹{withdrawAmount.toLocaleString()} to {payoutMethod}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
